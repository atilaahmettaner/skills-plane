"use client";

import { Card, Text, Badge, Group, Avatar, Stack, Box } from "@mantine/core";
import { Database } from "@/lib/database.types";
import Link from "next/link";
import { IconArrowRight, IconUsers } from "@tabler/icons-react";

type SkillWithProfile = Database["public"]["Tables"]["skills"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

export function SkillCard({ skill }: { skill: SkillWithProfile }) {
    const isOrg = skill.profiles?.type === 'organization';

    return (
        <Card
            className="glass-card"
            padding="xl"
            radius="lg"
            component={Link}
            href={`/skills/${skill.slug}`}
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            <Box>
                <Group justify="flex-end" mb="xs">
                    <Stack gap={4} align="flex-end">
                        {skill.is_official && (
                            <Badge variant="outline" color="cyan" size="sm" styles={{ root: { border: '1px solid rgba(34, 225, 254, 0.3)', background: 'rgba(34, 225, 254, 0.05)' } }}>Official</Badge>
                        )}
                        <Text size="xs" className="text-dimmed" fw={600} opacity={0.5}>V.1.2</Text>
                    </Stack>
                </Group>

                <Group justify="space-between" wrap="nowrap" mb="xs">
                    <Text fw={700} size="lg" className="text-bright">
                        {skill.title}
                    </Text>
                    <IconArrowRight size={18} color="rgba(34, 225, 254, 0.5)" />
                </Group>

                <Text size="sm" className="text-dimmed" lineClamp={2} mb="xl" style={{ lineHeight: 1.6 }}>
                    {skill.description}
                </Text>
            </Box>

            <Group justify="space-between" mt="auto">
                <Group gap="xs">
                    <Avatar
                        src={skill.profiles?.avatar_url || ""}
                        size={16}
                        radius="xl"
                    />
                    <Text size="xs" className="text-dimmed" fw={600}>
                        {skill.profiles?.full_name}
                    </Text>
                    {skill.profiles?.is_verified && (
                        <Text color="cyan" size="xs">✓</Text>
                    )}
                </Group>

                <Group gap={4}>
                    <IconUsers size={14} color="rgba(255, 255, 255, 0.3)" />
                    <Text size="xs" className="text-dimmed">2.4k</Text>
                </Group>
            </Group>
        </Card>
    );
}
