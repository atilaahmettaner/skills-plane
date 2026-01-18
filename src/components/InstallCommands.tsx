"use client";

import { Stack, Text, Code, Group, CopyButton, Button, Box } from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";

interface InstallCommandsProps {
    slug: string;
    githubUrl?: string;
}

export function InstallCommands({ slug, githubUrl }: InstallCommandsProps) {
    const platformCommand = `npx skills-plane add ${slug}`;
    const githubCommand = githubUrl ? `npx add-skill ${githubUrl}` : null;

    return (
        <Stack gap="sm">
            <Text size="sm" fw={500} c="dimmed">
                Installation Commands:
            </Text>

            {/* GitHub Command */}
            {githubCommand && (
                <Box>
                    <Group gap="xs" wrap="nowrap">
                        <Code style={{ flex: 1, fontSize: '0.85rem' }}>
                            {githubCommand}
                        </Code>
                        <CopyButton value={githubCommand} timeout={2000}>
                            {({ copied, copy }) => (
                                <Button
                                    size="xs"
                                    variant="light"
                                    color={copied ? 'teal' : 'blue'}
                                    onClick={copy}
                                    leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            )}
                        </CopyButton>
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>
                        📦 Install from GitHub
                    </Text>
                </Box>
            )}

            {/* Platform Command */}
            <Box>
                <Group gap="xs" wrap="nowrap">
                    <Code style={{ flex: 1, fontSize: '0.85rem' }}>
                        {platformCommand}
                    </Code>
                    <CopyButton value={platformCommand} timeout={2000}>
                        {({ copied, copy }) => (
                            <Button
                                size="xs"
                                variant="light"
                                color={copied ? 'teal' : 'blue'}
                                onClick={copy}
                                leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        )}
                    </CopyButton>
                </Group>
                <Text size="xs" c="dimmed" mt={4}>
                    🚀 Install from Skills-Plane
                </Text>
            </Box>
        </Stack>
    );
}
