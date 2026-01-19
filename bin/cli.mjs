#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { homedir, tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';

// Simple argument parsing
const args = process.argv.slice(2);
const command = args[0];
const source = args[1];
const flags = parseFlags(args.slice(2));

const API_BASE_URL = process.env.SKILLS_API_URL || 'https://skills-plane.vercel.app/api/v1';

async function main() {
    if (command !== 'install' && command !== 'add') {
        printUsage();
        process.exit(1);
    }

    if (!source) {
        console.error('Error: Please provide a skill slug or GitHub/local path.');
        printUsage();
        process.exit(1);
    }

    const installTarget = flags.target === 'claude' ? path.join('.claude', 'skills') : path.join('.agent', 'skills');
    const force = Boolean(flags.force);

    // If source looks like a git/local path, install from repo; otherwise use API slug flow
    if (isGitLike(source) || isLocalPath(source)) {
        await installFromRepoOrPath(source, { targetDir: installTarget, force });
        return;
    }

    await installFromApiSlug(source, installTarget, force);
}

async function installFromRepoOrPath(input, { targetDir, force }) {
    const { tempDir, cleanup } = await makeTempDir();
    let skillRoot;
    let skillName;
    let metadata = {
        source: input,
        sourceType: isLocalPath(input) ? 'local' : 'git',
        repoUrl: undefined,
        subpath: '',
        installedAt: new Date().toISOString(),
    };

    try {
        if (isLocalPath(input)) {
            const resolved = expandPath(input);
            await assertDirectory(resolved, 'Local path not found or not a directory');
            skillRoot = resolved;
            metadata.localPath = resolved;
        } else {
            const { repoUrl, subpath } = normalizeGitSource(input);
            metadata.repoUrl = repoUrl;
            metadata.subpath = subpath;
            const repoDir = path.join(tempDir, 'repo');
            await runGitClone(repoUrl, repoDir);
            skillRoot = subpath ? path.join(repoDir, subpath) : repoDir;
        }

        await assertFile(path.join(skillRoot, 'SKILL.md'), 'SKILL.md not found in the provided path');
        skillName = path.basename(skillRoot);

        const destDir = path.join(process.cwd(), targetDir, skillName);
        await ensureWritableTarget(destDir, { force });

        await fs.mkdir(path.dirname(destDir), { recursive: true });
        await fs.cp(skillRoot, destDir, { recursive: true, dereference: true });
        await writeMetadata(destDir, metadata);

        console.log(`\n✅ Installed '${skillName}' to ${destDir}`);
        console.log(`   Source: ${input}`);
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}\n`);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

async function installFromApiSlug(slug, targetDir, force) {
    console.log(`\n📦 Installing skill: ${slug}...`);
    console.log(`   Source: ${API_BASE_URL}/skills/${slug}`);

    try {
        const response = await fetch(`${API_BASE_URL}/skills/${slug}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Skill '${slug}' not found.`);
            }
            throw new Error(`Failed to fetch skill: ${response.statusText}`);
        }

        const data = await response.json();

        let files = [];
        if (data.files && typeof data.files === 'object' && Object.keys(data.files).length > 0) {
            // Support new JSONB structure
            files = Object.entries(data.files).map(([filename, content]) => ({
                filename,
                content: String(content || '')
            }));
        } else if (data.content) {
            // Support legacy string structure
            files = parseSkillFiles(data.content);
        }

        if (files.length === 0) {
            throw new Error('Skill content is empty.');
        }

        const target = path.join(targetDir, slug);
        await ensureWritableTarget(target, { force });
        console.log(`   Target: ${target}`);

        for (const file of files) {
            const filePath = path.join(target, file.filename);
            const dir = path.dirname(filePath);

            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(filePath, file.content);

            console.log(`   + Created ${file.filename}`);
        }

        await writeMetadata(target, {
            source: `${API_BASE_URL}/skills/${slug}`,
            sourceType: 'api',
            installedAt: new Date().toISOString(),
        });

        console.log(`\n✅ Skill '${slug}' installed successfully!\n`);

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

// --- Helper Functions (Duplicated from lib/skill-files.ts to avoid build steps) ---

const FILE_DELIMITER_REGEX = /^=== ([\w\-. /]+) ===$/;
const DEFAULT_SKILL_FILE = "SKILL.md";

function parseSkillFiles(content) {
    if (!content) return [];

    // Normalize line endings (handle both \r\n and \n)
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedContent.split("\n");
    const files = [];
    let currentFilename = null;
    let currentContent = [];

    // If the file doesn't start with a delimiter, assume it's the default file
    if (!FILE_DELIMITER_REGEX.test(lines[0])) {
        return [{ filename: DEFAULT_SKILL_FILE, content: content }];
    }

    for (const line of lines) {
        const match = line.match(FILE_DELIMITER_REGEX);
        if (match) {
            // Save previous file
            if (currentFilename) {
                files.push({
                    filename: currentFilename,
                    content: currentContent.join("\n").trim(),
                });
            }
            // Start new file
            currentFilename = match[1];
            currentContent = [];
        } else {
            if (currentFilename) {
                currentContent.push(line);
            }
        }
    }

    // Save last file
    if (currentFilename) {
        files.push({
            filename: currentFilename,
            content: currentContent.join("\n").trim(),
        });
    }

    return files;
}

function isGitLike(value) {
    return value.startsWith('git@') || value.startsWith('http://') || value.startsWith('https://') || value.endsWith('.git') || value.split('/').length >= 2;
}

function isLocalPath(value) {
    return value.startsWith('.') || value.startsWith('/') || value.startsWith('~');
}

function expandPath(value) {
    if (value.startsWith('~/')) {
        return path.join(homedir(), value.slice(2));
    }
    return path.resolve(value);
}

function normalizeGitSource(input) {
    if (input.startsWith('git@') || input.startsWith('http://') || input.startsWith('https://') || input.endsWith('.git')) {
        return { repoUrl: input, subpath: '' };
    }
    const parts = input.split('/');
    if (parts.length < 2) {
        throw new Error('Invalid source. Use owner/repo or full git URL.');
    }
    const repoUrl = `https://github.com/${parts[0]}/${parts[1]}`;
    const subpath = parts.length > 2 ? parts.slice(2).join('/') : '';
    return { repoUrl, subpath };
}

async function makeTempDir() {
    const dir = await fs.mkdtemp(path.join(tmpdir(), 'skills-plane-'));
    return {
        tempDir: dir,
        cleanup: async () => {
            try {
                await fs.rm(dir, { recursive: true, force: true });
            } catch {
                // ignore cleanup errors
            }
        }
    };
}

async function runGitClone(repoUrl, destination) {
    await fs.mkdir(destination, { recursive: true });
    await new Promise((resolve, reject) => {
        execFile('git', ['clone', '--depth', '1', '--quiet', repoUrl, destination], (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Failed to clone repository: ${stderr?.toString() || error.message}`));
                return;
            }
            resolve();
        });
    });
}

async function assertDirectory(dirPath, message) {
    try {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
            throw new Error(message);
        }
    } catch {
        throw new Error(message);
    }
}

async function assertFile(filePath, message) {
    try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) {
            throw new Error(message);
        }
    } catch {
        throw new Error(message);
    }
}

async function ensureWritableTarget(destDir, { force }) {
    try {
        await fs.access(destDir);
        if (!force) {
            throw new Error(`Target ${destDir} already exists. Re-run with --force to overwrite.`);
        }
        await fs.rm(destDir, { recursive: true, force: true });
    } catch (error) {
        // If access failed because it doesn't exist, this is fine
        if (error && error.code === 'ENOENT') {
            return;
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Unable to prepare target directory.');
    }
}

async function writeMetadata(destDir, metadata) {
    const metaPath = path.join(destDir, '.skills-plane.json');
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
}

function parseFlags(flagArgs) {
    const out = {};
    for (const item of flagArgs) {
        if (item === '--force') {
            out.force = true;
            continue;
        }
        if (item.startsWith('--target=')) {
            const value = item.split('=')[1];
            if (value === 'agent' || value === 'claude') {
                out.target = value;
            }
        }
    }
    return out;
}

function printUsage() {
    console.log('Usage:');
    console.log('  npx skills-plane install <slug>');
    console.log('  npx skills-plane install <owner/repo[/subpath]> [--target=agent|claude] [--force]');
    console.log('Alias: npx skills-plane add <...>');
}

main();
