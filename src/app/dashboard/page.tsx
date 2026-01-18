import { Container, Title, Text, Group, Button, Paper, SimpleGrid, Badge, Stack } from "@mantine/core";
import { createClient } from "@/lib/supabase";
import { listSkills } from "@/domain/skills/repository";
import { redirect } from "next/navigation";
import { IconRocket } from "@tabler/icons-react";
import { SkillCard } from "@/components/SkillCard";
import { CreateSkillButton } from "@/components/CreateSkillButton";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const mySkills = await listSkills({ authorId: user.id });

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2}>My Dashboard</Title>
                    <Text c="dimmed">Manage your contributions to the Skills Plane.</Text>
                </div>
                <CreateSkillButton />
            </Group>

            {mySkills && mySkills.length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                    {mySkills.map((skill: any) => (
                        <SkillCard key={skill.id} skill={skill} />
                    ))}
                </SimpleGrid>
            ) : (
                <Paper withBorder p="xl" radius="md" ta="center">
                    <Stack align="center" gap="md">
                        <IconRocket size={48} color="var(--mantine-color-gray-4)" />
                        <Title order={4}>No skills yet</Title>
                        <Text c="dimmed" maw={400} mx="auto">
                            You haven't submitted any skills yet. Share your best agent prompts and workflows with the world!
                        </Text>
                        <CreateSkillButton label="Create your first Skill" variant="light" />
                    </Stack>
                </Paper>
            )}
        </Container>
    );
}
