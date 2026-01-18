"use client";

import { useState, useMemo } from "react";
import { Stack, SimpleGrid, TextInput, Group, Badge, Card, Box, Text } from "@mantine/core";
import { IconSearch, IconRocket, IconArrowRight } from "@tabler/icons-react";
import { SkillCard } from "@/components/SkillCard";
import { Database } from "@/lib/database.types";

type SkillWithProfile = Database["public"]["Tables"]["skills"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

interface SkillsGridProps {
    skills: SkillWithProfile[];
}

export function SkillsGrid({ skills }: SkillsGridProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSkills = useMemo(() => {
        if (!searchQuery.trim()) return skills;

        const query = searchQuery.toLowerCase();
        return skills.filter((skill) =>
            skill.title?.toLowerCase().includes(query) ||
            skill.description?.toLowerCase().includes(query) ||
            skill.slug?.toLowerCase().includes(query)
        );
    }, [skills, searchQuery]);

    return (
        <>
            {/* Search & Filter Section */}
            <Stack gap="xl" mt={40} mb={60}>
                <TextInput
                    placeholder={`Search ${skills.length} agent skills...`}
                    size="xl"
                    radius="md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={20} style={{ opacity: 0.5 }} />}
                    styles={{
                        input: {
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '18px'
                        }
                    }}
                />
            </Stack>

            {/* Featured Content & Grid */}
            <Stack gap="xl">
                {/* Featured Feature Card */}
                <Card
                    className="glass-card"
                    padding={40}
                    radius="lg"
                    style={{ border: '1px solid rgba(34, 225, 254, 0.2)', background: 'linear-gradient(135deg, rgba(34, 225, 254, 0.05) 0%, transparent 100%)' }}
                >
                    <Group justify="space-between" align="stretch">
                        <Group gap="xl">
                            <Box p={20} style={{ borderRadius: '16px', background: 'rgba(34, 225, 254, 0.1)' }}>
                                <IconRocket size={40} color="#22e1fe" />
                            </Box>
                            <Stack gap={4}>
                                <Group gap="xs">
                                    <Text size="xl" fw={700} className="text-bright">Workflow Builder</Text>
                                    <Badge size="xs" color="cyan" variant="filled">✓</Badge>
                                </Group>
                                <Text className="text-dimmed" size="lg" style={{ maxWidth: 400 }}>
                                    Visual orchestration for connecting multiple agents into a unified pipeline.
                                </Text>
                            </Stack>
                        </Group>
                        <IconArrowRight size={32} style={{ alignSelf: 'center' }} color="rgba(255,255,255,0.2)" />
                    </Group>
                </Card>

                {/* Skills Grid */}
                {filteredSkills.length > 0 ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                        {filteredSkills.map((skill) => (
                            <SkillCard key={skill.id} skill={skill} />
                        ))}
                    </SimpleGrid>
                ) : (
                    <Text ta="center" c="dimmed" py="xl">
                        No skills found matching &quot;{searchQuery}&quot;
                    </Text>
                )}
            </Stack>
        </>
    );
}
