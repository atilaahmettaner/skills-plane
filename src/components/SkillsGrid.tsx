"use client";

import { useState, useMemo } from "react";
import { Stack, SimpleGrid, TextInput, Group, Badge, Card, Box, Text, Button } from "@mantine/core";
import { IconSearch, IconArrowRight, IconPlus } from "@tabler/icons-react";
import { SkillCard } from "@/components/SkillCard";
import { CopyCommand } from "@/components/CopyCommand";
import { Database } from "@/lib/database.types";
import Link from "next/link";

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
                {/* Community Contribution CTA */}
                <Card
                    className="glass-card"
                    padding={40}
                    radius="lg"
                    component={Link}
                    href="/skills/new"
                    style={{
                        border: '1px solid rgba(34, 225, 254, 0.3)',
                        background: 'linear-gradient(135deg, rgba(34, 225, 254, 0.08) 0%, transparent 100%)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                    }}
                    onMouseEnter={(e: React.MouseEvent) => {
                        e.currentTarget.setAttribute('style', `
                            border: 1px solid rgba(34, 225, 254, 0.5);
                            background: linear-gradient(135deg, rgba(34, 225, 254, 0.08) 0%, transparent 100%);
                            cursor: pointer;
                            transition: transform 0.2s ease, border-color 0.2s ease;
                            transform: translateY(-4px);
                        `);
                    }}
                    onMouseLeave={(e: React.MouseEvent) => {
                        e.currentTarget.setAttribute('style', `
                            border: 1px solid rgba(34, 225, 254, 0.3);
                            background: linear-gradient(135deg, rgba(34, 225, 254, 0.08) 0%, transparent 100%);
                            cursor: pointer;
                            transition: transform 0.2s ease, border-color 0.2s ease;
                            transform: translateY(0);
                        `);
                    }}
                >
                    <Group justify="space-between" align="center">
                        <Group gap="xl">
                            <Box p={12} style={{ borderRadius: '12px', background: 'rgba(34, 225, 254, 0.15)' }}>
                                <IconPlus size={24} color="#22e1fe" />
                            </Box>
                            <Stack gap={4}>
                                <Text size="xl" fw={800} className="text-bright">Contribute Your First Skill</Text>
                                <Text className="text-dimmed" size="lg" style={{ maxWidth: 500 }}>
                                    Join the community and share your specialized agent skills with thousands of developers.
                                </Text>
                            </Stack>
                        </Group>
                        <Button variant="light" color="cyan" radius="md">Share Skill</Button>
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
