export type SkillFile = {
    filename: string;
    content: string;
};

export const DEFAULT_SKILL_FILE = "SKILL.md";
export const DEFAULT_SKILL_CONTENT = `# My Skill

Describe what this skill does and how the agent should use it.

## Instructions

- Step 1: ...
`;

const FILE_DELIMITER_REGEX = /^=== ([\w\-. /]+) ===$/;
const FILE_DELIMITER_TEMPLATE = (filename: string) => `=== ${filename} ===`;

export function parseSkillFiles(content: string): SkillFile[] {
    if (!content || !content.trim()) {
        return [{ filename: DEFAULT_SKILL_FILE, content: DEFAULT_SKILL_CONTENT }];
    }

    const lines = content.split("\n");
    const files: SkillFile[] = [];
    let currentFilename: string | null = null;
    let currentContent: string[] = [];

    // If the file doesn't start with a delimiter, initialize with SKILL.md
    if (!FILE_DELIMITER_REGEX.test(lines[0])) {
        currentFilename = DEFAULT_SKILL_FILE;
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
            // If we are at the very beginning and no currentFilename (shouldn't happen with the logic above), set to SKILL.md
            if (!currentFilename) {
                currentFilename = DEFAULT_SKILL_FILE;
            }
            currentContent.push(line);
        }
    }

    // Save last file
    if (currentFilename) {
        files.push({
            filename: currentFilename,
            content: currentContent.join("\n").trim(),
        });
    }

    // Cleanup: Merge multiple SKILL.md if they somehow appeared, and ensure SKILL.md is first
    const skillMdFiles = files.filter(f => f.filename === DEFAULT_SKILL_FILE);
    const otherFiles = files.filter(f => f.filename !== DEFAULT_SKILL_FILE);

    const finalFiles: SkillFile[] = [];

    if (skillMdFiles.length > 0) {
        finalFiles.push({
            filename: DEFAULT_SKILL_FILE,
            content: skillMdFiles.map(f => f.content).join("\n\n")
        });
    } else {
        finalFiles.push({ filename: DEFAULT_SKILL_FILE, content: DEFAULT_SKILL_CONTENT });
    }

    finalFiles.push(...otherFiles);

    return finalFiles;
}

export function serializeSkillFiles(files: SkillFile[]): string {
    return files
        .map(
            (file) =>
                `${FILE_DELIMITER_TEMPLATE(file.filename)}\n${file.content}\n`
        )
        .join("\n");
}

export function getLanguageFromFilename(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "js":
        case "jsx":
            return "javascript";
        case "ts":
        case "tsx":
            return "typescript";
        case "json":
            return "json";
        case "md":
            return "markdown";
        case "css":
            return "css";
        case "html":
            return "html";
        case "py":
            return "python";
        case "sql":
            return "sql";
        case "yaml":
        case "yml":
            return "yaml";
        default:
            return "plaintext";
    }
}

export function validateFilename(
    filename: string,
    existingFilenames: string[]
): "empty" | "duplicate" | "invalid" | null {
    if (!filename || !filename.trim()) return "empty";
    if (existingFilenames.includes(filename)) return "duplicate";
    if (!/^[\w\-. /]+$/.test(filename)) return "invalid";
    return null;
}

export function suggestFilename(existingFilenames: string[]): string {
    let counter = 1;
    let name = `file${counter}.md`;
    while (existingFilenames.includes(name)) {
        counter++;
        name = `file${counter}.md`;
    }
    return name;
}
