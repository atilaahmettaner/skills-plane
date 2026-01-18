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
        <Stack gap="md" mb="xl">
            <Text size="sm" fw={600} className="text-bright">
                Choose how to install this skill:
            </Text>

            {/* Option 1: Vercel standard */}
            <Box p="md" style={{ borderRadius: '8px', border: githubUrl ? '1px solid rgba(34, 225, 254, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: githubUrl ? 'rgba(34, 225, 254, 0.03)' : 'rgba(255, 255, 255, 0.01)' }}>
                <Stack gap="xs">
                    <Group justify="space-between">
                        <Text size="sm" fw={700} c={githubUrl ? "cyan" : "dimmed"}>Vercel Standard</Text>
                        {githubUrl && <Text size="xs" c="cyan" fw={500} style={{ opacity: 0.8 }}>Recommended</Text>}
                    </Group>
                    <Text size="xs" c="dimmed">Best for general AI agents. Installs the skill using the universal add-skill protocol.</Text>
                    {githubUrl ? (
                        <Group gap="xs" wrap="nowrap" mt={4}>
                            <Code style={{ flex: 1, fontSize: '0.81rem', background: 'rgba(0,0,0,0.3)', color: '#fff' }}>
                                {`npx add-skill ${githubUrl}`}
                            </Code>
                            <CopyButton value={`npx add-skill ${githubUrl}`} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Button
                                        size="xs"
                                        variant="filled"
                                        color={copied ? 'teal' : 'cyan'}
                                        onClick={copy}
                                        leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                )}
                            </CopyButton>
                        </Group>
                    ) : (
                        <Text size="xs" fs="italic" c="dimmed" mt={4}>
                            GitHub repository not linked for this skill. Vercel standard requires a URL source.
                        </Text>
                    )}
                </Stack>
            </Box>


            {/* Option 2: Skills-Plane Platform CLI */}
            <Box p="md" style={{ borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <Stack gap="xs">
                    <Text size="sm" fw={700} className="text-bright">Skills-Plane CLI</Text>
                    <Text size="xs" c="dimmed">Optimized for our ecosystem. Provides deep integration and better asset management.</Text>
                    <Group gap="xs" wrap="nowrap" mt={4}>
                        <Code style={{ flex: 1, fontSize: '0.81rem', background: 'rgba(0,0,0,0.3)', color: '#fff' }}>
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
                </Stack>
            </Box>

        </Stack>
    );
}
