import { NextResponse } from "next/server";
import { serializeSkillFiles, type SkillFile } from "@/lib/skill-files";

export async function POST(request: Request) {
    try {
        const { githubUrl, skillPath, validateOnly } = await request.json();

        if (!githubUrl) {
            return NextResponse.json(
                { error: "GitHub URL is required" },
                { status: 400 }
            );
        }

        // Parse GitHub URL - support various formats
        const urlPatterns = [
            /github\.com\/([^\/]+)\/([^\/]+)/,
            /github\.com\/([^\/]+)\/([^\/]+)\.git/,
            /^([^\/]+)\/([^\/]+)$/  // Support "owner/repo" format
        ];
        
        let owner: string | null = null;
        let repo: string | null = null;
        
        for (const pattern of urlPatterns) {
            const match = githubUrl.match(pattern);
            if (match) {
                owner = match[1];
                repo = match[2].replace(/\.git$/, '');
                break;
            }
        }
        
        if (!owner || !repo) {
            return NextResponse.json(
                { error: "Invalid GitHub URL format. Use: github.com/owner/repo or owner/repo" },
                { status: 400 }
            );
        }

        // GitHub API headers for better rate limiting
        const githubHeaders: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Skills-Plane-App'
        };

        // Add GitHub token if available
        if (process.env.GITHUB_TOKEN) {
            githubHeaders['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // If validateOnly mode, use a lightweight check (no API calls!)
        if (validateOnly) {
            // Try to fetch README.md or SKILL.md using raw.githubusercontent.com (no rate limit!)
            let branch = 'main';
            let foundFile = false;
            
            // Try common branches
            for (const testBranch of ['main', 'master']) {
                try {
                    const testUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${testBranch}/README.md`;
                    const response = await fetch(testUrl, { method: 'HEAD' });
                    if (response.ok) {
                        branch = testBranch;
                        foundFile = true;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!foundFile) {
                return NextResponse.json(
                    { error: "Repository not found or inaccessible. Please ensure it's public." },
                    { status: 404 }
                );
            }
            
            // Quick structure check using raw URLs (no API rate limit!)
            const commonPaths = [
                'skills/',
                'rules/',
                'workflows/',
                'scripts/'
            ];
            
            const foundStructure: any[] = [];
            
            // Check for skills directory by trying to fetch a common file
            try {
                const skillsCheckUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/skills/README.md`;
                const skillsResponse = await fetch(skillsCheckUrl, { method: 'HEAD' });
                if (skillsResponse.ok) {
                    foundStructure.push({
                        name: 'skills',
                        path: 'skills',
                        category: 'skills',
                        type: 'directory'
                    });
                }
            } catch (e) {
                // No skills directory
            }
            
            return NextResponse.json({
                success: true,
                validated: true,
                githubUrl: `https://github.com/${owner}/${repo}`,
                owner,
                repo,
                branch,
                message: "Repository validated! Click Submit to save.",
                structure: foundStructure.length > 0 ? foundStructure : undefined
            });
        }

        // Get default branch from repository info (only if not validateOnly)
        let branch = 'main';
        try {
            const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
            const repoResponse = await fetch(repoInfoUrl, { headers: githubHeaders });
            
            if (!repoResponse.ok) {
                if (repoResponse.status === 404) {
                    return NextResponse.json(
                        { error: "Repository not found. Please check the repository name and make sure it's public." },
                        { status: 404 }
                    );
                }
                if (repoResponse.status === 403) {
                    return NextResponse.json(
                        { error: "GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN." },
                        { status: 429 }
                    );
                }
                throw new Error(`GitHub API error: ${repoResponse.status}`);
            }
            
            const repoData = await repoResponse.json();
            branch = repoData.default_branch || 'main';
        } catch (e: any) {
            console.error('Error fetching repository info:', e);
            // Try with default branches if repo info fails
            const branches = ['main', 'master'];
            let foundBranch = false;
            
            for (const b of branches) {
                try {
                    const testUrl = `https://api.github.com/repos/${owner}/${repo}/contents?ref=${b}`;
                    const testResponse = await fetch(testUrl, { headers: githubHeaders });
                    if (testResponse.ok) {
                        branch = b;
                        foundBranch = true;
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }
            
            if (!foundBranch) {
                return NextResponse.json(
                    { error: "Repository not found or inaccessible. Please ensure the repository is public." },
                    { status: 404 }
                );
            }
        }

        // If skillPath is provided, fetch that specific skill
        if (skillPath) {
            // Special case: merge all skills
            if (skillPath === '__ALL__') {
                return await fetchAllSkillsMerged(owner, repo, branch, githubHeaders);
            }
            return await fetchSpecificSkill(owner, repo, branch, skillPath, githubHeaders);
        }

        // Use Git Tree API to get all files in one request (much more efficient!)
        try {
            const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
            const treeResponse = await fetch(treeUrl, { headers: githubHeaders });
            
            if (treeResponse.ok) {
                const treeData = await treeResponse.json();
                
                // Check if there's a SKILL.md or README.md in root
                const rootSkillFile = treeData.tree.find((item: any) => 
                    item.path === 'SKILL.md' || item.path === 'README.md'
                );
                
                if (rootSkillFile) {
                    const contentUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${rootSkillFile.path}`;
                    const contentResponse = await fetch(contentUrl);
                    if (contentResponse.ok) {
                        const content = await contentResponse.text();
                        return await buildSkillResponseFromTree(owner, repo, branch, '', content, rootSkillFile.path, treeData.tree, githubHeaders);
                    }
                }
                
                // Check for skills/ directory
                const skillsItems = treeData.tree.filter((item: any) => 
                    item.path.startsWith('skills/') && item.type === 'tree'
                );
                
                if (skillsItems.length > 0) {
                    // Extract unique skill directories
                    const skillDirs = new Set<string>();
                    skillsItems.forEach((item: any) => {
                        const parts = item.path.split('/');
                        if (parts.length >= 2) {
                            skillDirs.add(parts[1]); // Get the skill name
                        }
                    });
                    
                    const skillItems = Array.from(skillDirs).map(name => ({
                        name,
                        path: `skills/${name}`,
                        category: 'skills'
                    }));
                    
                    return NextResponse.json({
                        multipleSkills: true,
                        skills: skillItems,
                        githubUrl: `https://github.com/${owner}/${repo}`,
                    });
                }
                
                // Check for other directories (rules, workflows, etc.)
                const otherDirs = ['rules', 'workflows', 'scripts', 'references'];
                const foundItems: any[] = [];
                
                for (const dirName of otherDirs) {
                    const dirItems = treeData.tree.filter((item: any) => 
                        item.path.startsWith(`${dirName}/`) && item.type === 'tree'
                    );
                    
                    if (dirItems.length > 0) {
                        const subDirs = new Set<string>();
                        dirItems.forEach((item: any) => {
                            const parts = item.path.split('/');
                            if (parts.length >= 2 && parts[0] === dirName) {
                                subDirs.add(parts[1]);
                            }
                        });
                        
                        subDirs.forEach(name => {
                            foundItems.push({
                                name,
                                path: `${dirName}/${name}`,
                                category: dirName
                            });
                        });
                    }
                }
                
                if (foundItems.length > 0) {
                    return NextResponse.json({
                        multipleSkills: true,
                        skills: foundItems,
                        githubUrl: `https://github.com/${owner}/${repo}`,
                    });
                }
            }
        } catch (e) {
            console.error('Error using Tree API:', e);
        }

        // Fallback: Check if there's a SKILL.md or README.md in root using raw content
        try {
            let rootSkillUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/SKILL.md`;
            let rootResponse = await fetch(rootSkillUrl);
            let filename = 'SKILL.md';
            
            if (!rootResponse.ok) {
                rootSkillUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
                rootResponse = await fetch(rootSkillUrl);
                filename = 'README.md';
            }
            
            if (rootResponse.ok) {
                const skillContent = await rootResponse.text();
                // For fallback, fetch tree to get other files
                const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
                const treeResponse = await fetch(treeUrl, { headers: githubHeaders });
                const treeData = treeResponse.ok ? await treeResponse.json() : { tree: [] };
                
                return await buildSkillResponseFromTree(owner, repo, branch, '', skillContent, filename, treeData.tree, githubHeaders);
            }
        } catch (e) {
            // Continue
        }

        return NextResponse.json(
            { error: "No SKILL.md found in repository" },
            { status: 404 }
        );

    } catch (error) {
        console.error("Error fetching from GitHub:", error);
        return NextResponse.json(
            { error: "Failed to fetch skill from GitHub" },
            { status: 500 }
        );
    }
}

async function fetchSpecificSkill(owner: string, repo: string, branch: string, skillPath: string, githubHeaders: HeadersInit) {
    try {
        // Try SKILL.md first
        let skillMdUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${skillPath}/SKILL.md`;
        let response = await fetch(skillMdUrl);

        // If SKILL.md not found, try README.md
        if (!response.ok) {
            skillMdUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${skillPath}/README.md`;
            response = await fetch(skillMdUrl);
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: `SKILL.md or README.md not found in ${skillPath}` },
                { status: 404 }
            );
        }

        const skillContent = await response.text();
        const filename = skillMdUrl.includes('SKILL.md') ? 'SKILL.md' : 'README.md';
        
        // Use Tree API to get all files efficiently
        try {
            const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
            const treeResponse = await fetch(treeUrl, { headers: githubHeaders });
            
            if (treeResponse.ok) {
                const treeData = await treeResponse.json();
                return await buildSkillResponseFromTree(owner, repo, branch, skillPath, skillContent, filename, treeData.tree, githubHeaders);
            }
        } catch (e) {
            // Fallback to old method
        }
        
        return await buildSkillResponse(owner, repo, branch, skillPath, skillContent, filename, githubHeaders);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch skill" },
            { status: 500 }
        );
    }
}

// New efficient method using Git Tree API
async function buildSkillResponseFromTree(
    owner: string, 
    repo: string, 
    branch: string, 
    basePath: string, 
    skillContent: string, 
    mainFilename: string,
    treeItems: any[],
    githubHeaders: HeadersInit
) {
    const files: SkillFile[] = [
        { filename: mainFilename, content: skillContent }
    ];

    // Filter files that belong to this skill path
    const relevantFiles = treeItems.filter((item: any) => {
        if (item.type !== 'blob') return false; // Only files, not directories
        
        const path = item.path;
        
        // Skip binary files
        const binaryExtensions = ['.zip', '.jar', '.tar', '.gz', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.exe', '.bin', '.woff', '.woff2', '.ttf', '.eot'];
        if (binaryExtensions.some(ext => path.toLowerCase().endsWith(ext))) return false;
        
        // If basePath is provided, only include files from that path
        if (basePath) {
            return path.startsWith(`${basePath}/`) && path !== `${basePath}/${mainFilename}`;
        }
        
        // For root level, exclude common directories we don't want
        const excludeDirs = ['.github/', 'packages/', 'node_modules/', 'dist/', 'build/', 'skills/'];
        return !excludeDirs.some(dir => path.startsWith(dir));
    });

    // Fetch content for relevant files (in parallel!)
    const fetchPromises = relevantFiles.slice(0, 50).map(async (item: any) => { // Limit to 50 files
        try {
            const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
            const response = await fetch(fileUrl);
            if (response.ok) {
                const content = await response.text();
                const relativePath = basePath 
                    ? item.path.replace(`${basePath}/`, '')
                    : item.path;
                return { filename: relativePath, content };
            }
        } catch (e) {
            // Skip on error
        }
        return null;
    });

    const fetchedFiles = await Promise.all(fetchPromises);
    fetchedFiles.forEach(file => {
        if (file) files.push(file);
    });

    const serializedContent = serializeSkillFiles(files);

    return NextResponse.json({
        success: true,
        content: serializedContent,
        githubUrl: `https://github.com/${owner}/${repo}`,
        owner,
        repo,
    });
}

async function buildSkillResponse(owner: string, repo: string, branch: string, basePath: string, skillContent: string, mainFilename: string = 'SKILL.md', githubHeaders: HeadersInit) {
    const files: SkillFile[] = [
        { filename: mainFilename, content: skillContent }
    ];

    // Fetch ALL files from the skill directory recursively
    const fetchedPaths = new Set([mainFilename]); // Track what we've already fetched
    
    try {
        // Get all files in the skill directory
        const skillDirPath = basePath || '.';
        const dirUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${skillDirPath}?ref=${branch}`;
        const dirResponse = await fetch(dirUrl, { headers: githubHeaders });
        
        if (dirResponse.ok) {
            const dirData = await dirResponse.json();
            
            // Process all items in the directory
            for (const item of dirData) {
                if (item.type === 'file') {
                    // Skip if we already have this file
                    if (fetchedPaths.has(item.name)) continue;
                    
                    // Skip binary files
                    const binaryExtensions = ['.zip', '.jar', '.tar', '.gz', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.exe', '.bin', '.woff', '.woff2', '.ttf', '.eot'];
                    const isBinary = binaryExtensions.some(ext => item.name.toLowerCase().endsWith(ext));
                    if (isBinary) continue;
                    
                    try {
                        const fileUrl = item.download_url;
                        const fileResponse = await fetch(fileUrl);
                        if (fileResponse.ok) {
                            const content = await fileResponse.text();
                            files.push({ filename: item.name, content });
                            fetchedPaths.add(item.name);
                        }
                    } catch (e) {
                        // Skip if can't fetch file
                    }
                } else if (item.type === 'dir') {
                    // Recursively fetch files from subdirectories
                    await fetchDirectoryRecursive(
                        owner, 
                        repo, 
                        branch, 
                        basePath ? `${basePath}/${item.name}` : item.name,
                        item.name,
                        files,
                        fetchedPaths,
                        githubHeaders
                    );
                }
            }
        }
    } catch (e) {
        // Continue with what we have
    }

    // Serialize files
    const serializedContent = serializeSkillFiles(files);

    return NextResponse.json({
        success: true,
        content: serializedContent,
        githubUrl: `https://github.com/${owner}/${repo}`,
        owner,
        repo,
    });
}

// Helper function to recursively fetch directory contents
async function fetchDirectoryRecursive(
    owner: string,
    repo: string,
    branch: string,
    fullPath: string,
    relativePath: string,
    files: SkillFile[],
    fetchedPaths: Set<string>,
    githubHeaders: HeadersInit
) {
    try {
        const dirUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${fullPath}?ref=${branch}`;
        const dirResponse = await fetch(dirUrl, { headers: githubHeaders });
        
        if (!dirResponse.ok) return;
        
        const dirData = await dirResponse.json();
        
        for (const item of dirData) {
            const itemRelativePath = `${relativePath}/${item.name}`;
            
            if (item.type === 'file') {
                // Skip if already fetched
                if (fetchedPaths.has(itemRelativePath)) continue;
                
                // Skip binary files (zip, jar, png, jpg, etc.)
                const binaryExtensions = ['.zip', '.jar', '.tar', '.gz', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.exe', '.bin', '.woff', '.woff2', '.ttf', '.eot'];
                const isBinary = binaryExtensions.some(ext => item.name.toLowerCase().endsWith(ext));
                if (isBinary) continue;
                
                try {
                    const fileUrl = item.download_url;
                    const fileResponse = await fetch(fileUrl);
                    if (fileResponse.ok) {
                        const content = await fileResponse.text();
                        files.push({ 
                            filename: itemRelativePath, 
                            content 
                        });
                        fetchedPaths.add(itemRelativePath);
                    }
                } catch (e) {
                    // Skip if can't fetch file
                }
            } else if (item.type === 'dir') {
                // Recursively fetch subdirectory
                await fetchDirectoryRecursive(
                    owner,
                    repo,
                    branch,
                    `${fullPath}/${item.name}`,
                    itemRelativePath,
                    files,
                    fetchedPaths,
                    githubHeaders
                );
            }
        }
    } catch (e) {
        // Skip if can't read directory
    }
}

async function fetchAllSkillsMerged(owner: string, repo: string, branch: string, githubHeaders: HeadersInit) {
    try {
        // Use Tree API to get all files in one efficient call
        const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        const treeResponse = await fetch(treeUrl, { headers: githubHeaders });

        if (!treeResponse.ok) {
            return NextResponse.json(
                { error: "Failed to fetch repository tree" },
                { status: 404 }
            );
        }

        const treeData = await treeResponse.json();
        
        // Find all files in skills/ directory
        const skillFiles = treeData.tree.filter((item: any) => 
            item.type === 'blob' && 
            item.path.startsWith('skills/') &&
            !item.path.endsWith('.zip') &&
            !item.path.endsWith('.jar') &&
            !item.path.endsWith('.png') &&
            !item.path.endsWith('.jpg')
        );

        if (skillFiles.length === 0) {
            return NextResponse.json(
                { error: "No files found in skills/ directory" },
                { status: 404 }
            );
        }

        // Fetch all files in parallel (limited to 100)
        const allFiles: SkillFile[] = [];
        const filesToFetch = skillFiles.slice(0, 100);
        
        const fetchPromises = filesToFetch.map(async (item: any) => {
            try {
                const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
                const response = await fetch(fileUrl);
                if (response.ok) {
                    const content = await response.text();
                    // Remove 'skills/' prefix to get relative path
                    const relativePath = item.path.replace('skills/', '');
                    return { filename: relativePath, content };
                }
            } catch (e) {
                // Skip on error
            }
            return null;
        });

        const fetchedFiles = await Promise.all(fetchPromises);
        fetchedFiles.forEach(file => {
            if (file) allFiles.push(file);
        });

        if (allFiles.length === 0) {
            return NextResponse.json(
                { error: "Failed to fetch skill files" },
                { status: 500 }
            );
        }

        const serializedContent = serializeSkillFiles(allFiles);

        return NextResponse.json({
            success: true,
            content: serializedContent,
            githubUrl: `https://github.com/${owner}/${repo}`,
            owner,
            repo,
        });
    } catch (error) {
        console.error('Error in fetchAllSkillsMerged:', error);
        return NextResponse.json(
            { error: "Failed to fetch and merge skills" },
            { status: 500 }
        );
    }
}
