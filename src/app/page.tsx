import { Container, Title, Text, Stack, Badge, Box } from "@mantine/core";
import { listSkills } from "@/domain/skills/repository";
import { CopyCommand } from "@/components/CopyCommand";
import { HeroButtons } from "@/components/HeroButtons";
import { SkillsGrid } from "@/components/SkillsGrid";
import { Database } from "@/lib/database.types";

type SkillWithProfile = Database["public"]["Tables"]["skills"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const skills = await listSkills();

  return (
    <Box style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="hero-glow" />

      <Container size="lg" py="xl">
        {/* Hero Section */}
        <Stack align="center" gap="xl" py={80}>
          <Badge
            variant="outline"
            color="cyan"
            size="lg"
            radius="xl"
            styles={{ root: { borderWidth: '1px', textTransform: 'uppercase', letterSpacing: '1px' } }}
          >
            ✧ Community-driven intelligence
          </Badge>

          <Title
            order={1}
            size={72}
            style={{
              textAlign: "center",
              fontWeight: 900,
              lineHeight: 1.1,
              maxWidth: 800
            }}
          >
            The Global Library of <span className="gradient-text">Intelligence</span>
          </Title>

          <Text
            size="xl"
            className="text-dimmed"
            style={{ textAlign: "center", maxWidth: 550, lineHeight: 1.6 }}
          >
            A massive open-source marketplace to discover agent skills and build complex autonomous workflows.
          </Text>

          {/* CLI Box */}
          <CopyCommand command="npx skills-plane search" />

          <HeroButtons />
        </Stack>

        <SkillsGrid skills={(skills || []) as SkillWithProfile[]} />
      </Container>
    </Box>
  );
}
