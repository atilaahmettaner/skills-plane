"use client";

import { Button, Modal, Text, Group, CopyButton, Code, Stack, Divider, Box } from "@mantine/core";
import { IconTerminal, IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";
import { parseSkillFiles } from "@/lib/skill-files";

interface InstallSkillButtonProps {
    slug: string;
    content: string;
    githubUrl?: string; // Optional GitHub URL
}

export function InstallSkillButton({ slug, content, githubUrl }: InstallSkillButtonProps) {
    const [opened, setOpened] = useState(false);
    const files = parseSkillFiles(content);

    // GitHub command (if available)
    const githubCommand = githubUrl ? `npx add-skill ${githubUrl}` : null;

    // Platform command
    const platformCommand = `npx skills-plane add ${slug}`;

    const generateUnixScript = () => {
        let script = `# Install Skill: ${slug}\n`;
        script += `TARGET_DIR=".agent/skills/${slug}"\n`;
        script += `mkdir -p "$TARGET_DIR"\n\n`;

        files.forEach(file => {
            const dir = file.filename.includes('/') ? file.filename.substring(0, file.filename.lastIndexOf('/')) : '';
            if (dir) {
                script += `mkdir -p "$TARGET_DIR/${dir}"\n`;
            }
            script += `cat <<'EOF' > "$TARGET_DIR/${file.filename}"\n`;
            script += file.content + (file.content.endsWith('\n') ? '' : '\n');
            script += `EOF\n\n`;
        });

        script += `echo "✅ Skill installed to $TARGET_DIR"\n`;
        return script;
    };

    const script = generateUnixScript();

    return (
        <>
            <Button
                variant="default"
                size="sm"
                leftSection={<IconTerminal size={16} />}
                onClick={() => setOpened(true)}
            >
                Advanced Install
            </Button>

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title={<Group gap={8}><IconTerminal size={20} /> <Text fw={600}>Advanced Installation</Text></Group>}
                size="lg"
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        Manual installation script for <b>{slug}</b>. Run this in your project root:
                    </Text>

                    <Code block style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto' }}>
                        {script}
                    </Code>

                    <Group justify="flex-end">
                        <CopyButton value={script} timeout={2000}>
                            {({ copied, copy }) => (
                                <Button
                                    color={copied ? 'teal' : 'blue'}
                                    onClick={copy}
                                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                >
                                    {copied ? 'Copied Script' : 'Copy Script'}
                                </Button>
                            )}
                        </CopyButton>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
