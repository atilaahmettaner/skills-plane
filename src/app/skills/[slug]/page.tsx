import { Container, Title, Text, Badge, Group, Avatar, Paper, Stack, Box } from "@mantine/core";
import { getSkillBySlug } from "@/domain/skills/repository";
import { notFound } from "next/navigation";
import { Database } from "@/lib/database.types";
import { BackButton } from "@/components/BackButton";
import { CopyCommand } from "@/components/CopyCommand";
import { SkillEditor } from "@/components/SkillEditor";
import { DownloadSkillButton } from "@/components/DownloadSkillButton";
import { InstallSkillButton } from "@/components/InstallSkillButton";
import { InstallCommands } from "@/components/InstallCommands";

type SkillWithProfile = Database["public"]["Tables"]["skills"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const skill = await getSkillBySlug(slug) as SkillWithProfile | null;

    if (!skill) {
        notFound();
    }

    return (
        <Container size="md" py="xl">
            <BackButton />

            <Paper shadow="xs" p="xl" radius="md" withBorder>
                <Group justify="space-between" align="center" mb="xl">
                    <Stack gap={4}>
                        <Title order={1}>{skill.title}</Title>
                        <Group gap="xs">
                            <Avatar src={skill.profiles?.avatar_url} size="sm" radius="xl" />
                            <Text size="sm" c="dimmed">
                                By {skill.profiles?.full_name || "Unknown"}
                            </Text>
                            {skill.is_official && <Badge color="blue" variant="light">Official</Badge>}
                        </Group>
                    </Stack>
                    <Box>
                        <CopyCommand command={`npx skills-plane add ${skill.slug}`} />
                    </Box>
                </Group>

                <Text size="lg" mb="xl" className="text-dimmed">
                    {skill.description}
                </Text>

                {/* Installation Commands */}
                <InstallCommands slug={skill.slug} />

                {/* Action Buttons */}
                <Group gap="xs" mt="md" mb="xl">
                    <InstallSkillButton slug={skill.slug} content={skill.content || ""} />
                    <DownloadSkillButton slug={skill.slug} content={skill.content || ""} />
                </Group>

                <SkillEditor
                    value={skill.content || ""}
                    readOnly
                    style={{ height: 600 }}
                />
            </Paper>
        </Container>
    );
}
