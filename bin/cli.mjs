#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple argument parsing
const args = process.argv.slice(2);
const command = args[0];
const slug = args[1];

const API_BASE_URL = process.env.SKILLS_API_URL || 'http://localhost:3000/api/v1';

async function main() {
    if (command !== 'install' && command !== 'add') {
        console.log('Usage: npx skills-plane install <slug>');
        console.log('Alias: npx skills-plane add <slug>');
        process.exit(1);
    }

    if (!slug) {
        console.error('Error: Please provide a skill slug.');
        console.log('Usage: npx skills-plane install <slug>');
        process.exit(1);
    }

    console.log(`\n📦 Installing skill: ${slug}...`);
    console.log(`   Source: ${API_BASE_URL}/skills/${slug}`);

    try {
        // 1. Fetch Skill Data
        const response = await fetch(`${API_BASE_URL}/skills/${slug}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Skill '${slug}' not found.`);
            }
            throw new Error(`Failed to fetch skill: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.content) {
            throw new Error('Skill content is empty.');
        }

        // 2. Parse Content
        const files = parseSkillFiles(data.content);

        // 3. Write Files
        const targetDir = path.join('.agent', 'skills', slug);

        console.log(`   Target: ${targetDir}`);

        for (const file of files) {
            const filePath = path.join(targetDir, file.filename);
            const dir = path.dirname(filePath);

            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(filePath, file.content);

            console.log(`   + Created ${file.filename}`);
        }

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

main();
