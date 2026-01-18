"use client";

import { TextInput, Textarea, Button, Stack, Title, Card, Text, Divider, Group, Alert, Box } from "@mantine/core";
import { createSkill } from "@/domain/skills/actions";
import { useState } from "react";
import { IconSend, IconBrandGithub, IconDownload } from "@tabler/icons-react";
import { SkillEditor } from "./SkillEditor";
import { DEFAULT_SKILL_CONTENT, DEFAULT_SKILL_FILE, serializeSkillFilesToJSON, parseSkillFiles } from "@/lib/skill-files";

export function SkillForm() {
    const [loading, setLoading] = useState(false);
    const [fetchingGithub, setFetchingGithub] = useState(false);
    const [githubUrl, setGithubUrl] = useState("");
    const [githubError, setGithubError] = useState<string | null>(null);
    const [githubSuccess, setGithubSuccess] = useState<string | null>(null);
    const [availableSkills, setAvailableSkills] = useState<Array<{ name: string; path: string; category?: string }>>([]);
    const [repoStructure, setRepoStructure] = useState<any>(null);
    const [content, setContent] = useState<any>(() => ({
        [DEFAULT_SKILL_FILE]: `---
name: My New Skill
description: A brief description of what this skill does.
version: 1.0.0
---

# User Instructions

1. Add your clear, step-by-step instructions here.
2. Explain how the agent should think when using this skill.
`,
        "rules/AGENTS.md": "# AI Behavior Rules\n\n- Role: Senior Software Engineer\n- Tone: Professional, concise\n- Constraints: No deprecated APIs",
        "scripts/deploy.sh": "#!/bin/bash\n# Helper scripts for the agent to run\necho 'Initializing skill environment...'",
        "tests/verify.md": "# Verification Steps\n\n- [ ] Test case 1: ...\n- [ ] Test case 2: ..."
    }));

    // Validate GitHub URL and show repository structure
    const handleFetchGithub = async () => {
        if (!githubUrl.trim()) {
            setGithubError("Please enter a GitHub URL");
            return;
        }

        setFetchingGithub(true);
        setGithubError(null);
        setGithubSuccess(null);

        try {
            const response = await fetch('/api/v1/skills/fetch-github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl, validateOnly: true }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to validate repository');
            }

            // Repository validated successfully
            if (data.validated) {
                setGithubUrl(data.githubUrl); // Use normalized URL
                setGithubSuccess(data.message || '✓ Repository validated successfully!');

                // Show structure if available
                if (data.structure && data.structure.length > 0) {
                    setAvailableSkills(data.structure);
                } else {
                    setAvailableSkills([]);
                }
                setRepoStructure(data);
                return;
            }

            // Check if multiple skills are available (old flow)
            if (data.multipleSkills) {
                setAvailableSkills(data.skills);
                setGithubUrl(data.githubUrl); // Use normalized URL
                setRepoStructure(data);
                setGithubSuccess(`✓ Repository validated! Found ${data.skills.length} items.`);
                return;
            }

            // Single skill or root level content
            setGithubUrl(data.githubUrl); // Use normalized URL
            setRepoStructure(data);
            setGithubSuccess(data.message || '✓ Repository follows add-skill standard!');
            setAvailableSkills([]);

            // Auto-fill form fields if metadata is available
            if (data.meta) {
                const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
                const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
                const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;

                if (titleInput && data.meta.name) titleInput.value = data.meta.name;
                if (descInput && data.meta.description) descInput.value = data.meta.description;
                if (slugInput && data.meta.name) {
                    slugInput.value = data.meta.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                }
            }
        } catch (error: any) {
            setGithubError(error.message);
            setRepoStructure(null);
        } finally {
            setFetchingGithub(false);
        }
    };

    const [formError, setFormError] = useState<string | null>(null);

    const [isDirty, setIsDirty] = useState(false);

    // We wrap the server action to handle loading state
    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setFormError(null);
        try {
            // If githubUrl is provided and content wasn't modified by user,
            // we clear the content so the server knows to fetch it from GitHub
            if (githubUrl && !isDirty) {
                formData.set("content", "");
            }
            await createSkill(formData);
        } catch (error: any) {
            setFormError(error.message || "Error submitting skill. Check console.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="glass-card" padding={40} radius="lg">
            <Stack gap="xl">
                <Title order={3} size="h4" className="text-bright">Skill Details</Title>
                <form action={handleSubmit}>
                    <Stack gap="md">
                        {/* GitHub Import Section - Move to top */}
                        <Stack gap="sm">
                            <Text size="sm" fw={600} className="text-bright">
                                📦 Import from GitHub (Recommended)
                            </Text>
                            <Group gap="xs" align="flex-start">
                                <TextInput
                                    placeholder="https://github.com/owner/repo"
                                    value={githubUrl}
                                    onChange={(e) => {
                                        setGithubUrl(e.target.value);
                                        setGithubError(null);
                                        setGithubSuccess(null);
                                        setAvailableSkills([]);
                                    }}
                                    leftSection={<IconBrandGithub size={18} color="#22e1fe" />}
                                    style={{ flex: 1 }}
                                    error={githubError}
                                    styles={{
                                        input: {
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            height: '46px'
                                        }
                                    }}
                                />
                                <Button
                                    variant="filled"
                                    color="gray"
                                    onClick={handleFetchGithub}
                                    loading={fetchingGithub}
                                    leftSection={<IconDownload size={18} />}
                                    styles={{ root: { height: '46px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' } }}
                                >
                                    Validate
                                </Button>
                            </Group>

                            {/* Success message */}
                            {githubSuccess && (
                                <Alert color="green" variant="light">
                                    {githubSuccess}
                                </Alert>
                            )}

                            {/* Show available skills if multiple found */}
                            {availableSkills.length > 0 && (
                                <Stack gap="md">
                                    <Text size="sm" c="dimmed">
                                        Repository structure:
                                    </Text>

                                    {/* Group by category */}
                                    {(() => {
                                        const grouped = availableSkills.reduce((acc, skill) => {
                                            const category = skill.category || 'other';
                                            if (!acc[category]) acc[category] = [];
                                            acc[category].push(skill);
                                            return acc;
                                        }, {} as Record<string, typeof availableSkills>);

                                        return Object.entries(grouped).map(([category, items]) => (
                                            <Stack key={category} gap="xs">
                                                <Text size="sm" fw={500} tt="capitalize" c="blue">
                                                    📁 {category} ({items.length} items)
                                                </Text>
                                                {items.map((skill) => (
                                                    <Text key={skill.path} size="sm" pl="md" c="dimmed">
                                                        → {skill.name}
                                                    </Text>
                                                ))}
                                            </Stack>
                                        ));
                                    })()}
                                </Stack>
                            )}

                            {githubError && (
                                <Alert color="red" variant="light">
                                    {githubError}
                                </Alert>
                            )}
                        </Stack>

                        <Divider label={githubUrl ? "Additional Info (Optional)" : "OR create manually"} labelPosition="center" my="md" />

                        <TextInput
                            name="title"
                            label="Skill Title"
                            placeholder="e.g., React Performance Hooks"
                            description={githubUrl ? "Leave empty to use repository name" : undefined}
                            required={!githubUrl}
                            styles={{
                                label: { color: 'var(--mantine-color-white)', fontWeight: 600, fontSize: '13px', marginBottom: '4px' },
                                description: { color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '8px' },
                                input: {
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    height: '46px'
                                }
                            }}
                        />
                        <TextInput
                            name="slug"
                            label="Slug"
                            description={githubUrl ? "Leave empty to auto-generate from title/repo" : "Unique URL identifier (lowercase, hyphens only)"}
                            placeholder="react-performance-hooks"
                            required={!githubUrl}
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                e.target.value = val;
                            }}
                            styles={{
                                label: { color: 'var(--mantine-color-white)', fontWeight: 600, fontSize: '13px', marginBottom: '4px' },
                                description: { color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '8px' },
                                input: {
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    height: '46px'
                                }
                            }}
                        />
                        <Textarea
                            name="description"
                            label="Short Description"
                            placeholder="Brief summary of what this skill does..."
                            description={githubUrl ? "Optional - will be fetched from GitHub if empty" : undefined}
                            rows={3}
                            styles={{
                                label: { color: 'var(--mantine-color-white)', fontWeight: 600, fontSize: '13px', marginBottom: '4px' },
                                description: { color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '8px' },
                                input: {
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        />

                        <Divider my="sm" style={{ opacity: 0.1 }} />

                        <Stack gap={10}>
                            <Stack gap={4}>
                                <Text component="label" size="sm" fw={600} className="text-bright">
                                    Skill Content {githubUrl && "(Optional)"}
                                </Text>
                                <Text size="xs" className="text-dimmed">
                                    {githubUrl
                                        ? "Content will be fetched from GitHub URL. You can override it here if needed."
                                        : "Standardized folder structure enabled. Organize rules, scripts and tests."}
                                </Text>
                            </Stack>
                            <Box
                                p={4}
                                style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <SkillEditor
                                    value={content}
                                    onChange={(val) => {
                                        setContent(val);
                                        setIsDirty(true);
                                    }}
                                />
                            </Box>
                            {/* Hidden input to pass files and github_url to Server Action */}
                            <input type="hidden" name="files" value={JSON.stringify(content)} />
                            <input type="hidden" name="github_url" value={githubUrl} />
                        </Stack>

                        {formError && (
                            <Alert color="red" variant="light" title="Submission Error">
                                {formError}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            radius="md"
                            color="cyan"
                            loading={loading}
                            leftSection={<IconSend size={20} />}
                            disabled={!githubUrl && !content}
                            styles={{ root: { height: '54px' } }}
                        >
                            Submit Skill
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </Card>
    );
}
