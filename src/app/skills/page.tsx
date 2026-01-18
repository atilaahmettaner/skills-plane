import { Container, Title, Text, Stack, Box, TextInput, Group } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { listSkills } from "@/domain/skills/repository";
import { SkillsGrid } from "@/components/SkillsGrid";
import { Database } from "@/lib/database.types";

type SkillWithProfile = Database["public"]["Tables"]["skills"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

export const dynamic = "force-dynamic";

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const skills = await listSkills({ search: q });

  return (
    <Box style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div className="hero-glow" style={{ top: '-10%', left: '20%', opacity: 0.15 }} />

      <Container size="lg" py={60}>
        <Stack gap="xl">
          <Box py={40}>
            <Title order={1} size={48} mb="sm">
              Discover <span className="gradient-text">Skills</span>
            </Title>
            <Text size="lg" className="text-dimmed" maw={600}>
              Browse the global collection of community-contributed intelligence, rules, and automated workflows.
            </Text>
          </Box>

          <Box
            p="md"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <form action="/skills" method="GET">
              <TextInput
                name="q"
                defaultValue={q}
                placeholder="Search skills, authors, or keywords..."
                size="lg"
                leftSection={<IconSearch size={20} />}
                variant="unstyled"
                styles={{
                  input: {
                    fontSize: '18px',
                    color: 'var(--mantine-color-white)',
                    '&::placeholder': { color: 'rgba(255,255,255,0.4)' }
                  }
                }}
              />
            </form>
          </Box>

          <Box mt="xl">
            <Group justify="space-between" mb="lg">
              <Text fw={600} className="text-bright">
                {q ? `Search results for "${q}"` : 'All Available Skills'}
              </Text>
              <Text size="sm" className="text-dimmed">
                Showing {skills?.length || 0} items
              </Text>
            </Group>

            <SkillsGrid skills={(skills || []) as SkillWithProfile[]} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
