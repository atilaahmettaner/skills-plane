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

/**
 * Parses files from the old delimiter-based string format
 */
export function parseSkillFilesFromDelimiterString(content: string): SkillFile[] {
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
            if (currentFilename) {
                files.push({
                    filename: currentFilename,
                    content: currentContent.join("\n").trim(),
                });
            }
            currentFilename = match[1];
            currentContent = [];
        } else {
            if (!currentFilename) {
                currentFilename = DEFAULT_SKILL_FILE;
            }
            currentContent.push(line);
        }
    }

    if (currentFilename) {
        files.push({
            filename: currentFilename,
            content: currentContent.join("\n").trim(),
        });
    }

    return files;
}

/**
 * Parses files from the new JSONB format
 */
export function parseSkillFilesFromJSON(filesJson: any): SkillFile[] {
    if (!filesJson || typeof filesJson !== 'object' || Array.isArray(filesJson)) {
        return [{ filename: DEFAULT_SKILL_FILE, content: DEFAULT_SKILL_CONTENT }];
    }

    const files: SkillFile[] = Object.entries(filesJson).map(([filename, content]) => ({
        filename,
        content: String(content)
    }));

    // Ensure SKILL.md is first
    const skillMdFiles = files.filter(f => f.filename === DEFAULT_SKILL_FILE);
    const otherFiles = files.filter(f => f.filename !== DEFAULT_SKILL_FILE);

    if (skillMdFiles.length === 0) {
        return [{ filename: DEFAULT_SKILL_FILE, content: DEFAULT_SKILL_CONTENT }, ...otherFiles];
    }

    return [...skillMdFiles, ...otherFiles];
}

/**
 * Main parser that handles both formats
 */
export function parseSkillFiles(content: string | any): SkillFile[] {
    if (typeof content === 'object' && content !== null) {
        return parseSkillFilesFromJSON(content);
    }

    if (typeof content === 'string' && (content.startsWith('{') || content.trim().startsWith('{'))) {
        try {
            return parseSkillFilesFromJSON(JSON.parse(content));
        } catch (e) {
            // Fallback to string parsing if JSON parsing fails
        }
    }

    return parseSkillFilesFromDelimiterString(String(content || ''));
}

/**
 * Serializes files to the new JSONB-ready object format
 */
export function serializeSkillFilesToJSON(files: SkillFile[]): Record<string, string> {
    const result: Record<string, string> = {};
    files.forEach(file => {
        result[file.filename] = file.content;
    });
    return result;
}

/**
 * Legacy serializer for backward compatibility if needed
 */
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
