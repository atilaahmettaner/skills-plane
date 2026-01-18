import { Container, Title, Text, Button, Group, Stack, SimpleGrid, Badge, Box, TextInput, Card, Avatar, AvatarGroup } from "@mantine/core";
import { IconRocket, IconSearch, IconUpload, IconCopy, IconArrowRight } from "@tabler/icons-react";
import { listSkills } from "@/domain/skills/repository";
import { SkillCard } from "@/components/SkillCard";
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
          <Group
            gap="xs"
            px="md"
            py={8}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Text ff="monospace" size="sm" c="cyan">npx</Text>
            <Text ff="monospace" size="sm">skills-plane search</Text>
            <IconCopy size={14} style={{ cursor: 'pointer', opacity: 0.5 }} />
          </Group>

          <Group mt="md">
            <Button
              size="lg"
              radius="md"
              px={40}
              variant="filled"
              color="cyan"
              leftSection={<IconSearch size={20} />}
              styles={{ root: { height: '54px' } }}
            >
              Browse Skills
            </Button>
            <Button
              size="lg"
              radius="md"
              px={40}
              variant="outline"
              color="gray"
              leftSection={<IconUpload size={20} />}
              styles={{ root: { height: '54px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)' } }}
            >
              Submit Skill
            </Button>
          </Group>
        </Stack>

        {/* Search & Filter Section */}
        <Stack gap="xl" mt={40} mb={60}>
          <TextInput
            placeholder="Search 2,400+ agent skills..."
            size="xl"
            radius="md"
            leftSection={<IconSearch size={20} style={{ opacity: 0.5 }} />}
            styles={{
              input: {
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '18px'
              }
            }}
          />

          <Group gap="sm">
            <Badge size="lg" radius="md" color="cyan" variant="filled" style={{ height: '36px' }}>All Categories</Badge>
            <Badge size="lg" radius="md" variant="outline" color="gray" style={{ height: '36px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)', color: 'rgba(255, 255, 255, 0.7)' }}>Web Browsing</Badge>
            <Badge size="lg" radius="md" variant="outline" color="gray" style={{ height: '36px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)', color: 'rgba(255, 255, 255, 0.7)' }}>Finance</Badge>
            <Badge size="lg" radius="md" variant="outline" color="gray" style={{ height: '36px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)', color: 'rgba(255, 255, 255, 0.7)' }}>Coding</Badge>
          </Group>
        </Stack>

        {/* Featured Content & Grid */}
        <Stack gap="xl">
          {/* Featured Feature Card (Mock for now) */}
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
                  <Group gap="xs" mt="md">
                    <AvatarGroup>
                      <Avatar src="" />
                      <Avatar src="" />
                      <Avatar src="" />
                    </AvatarGroup>
                    <Text size="xs" className="text-dimmed" fw={600}>8.2k builders active</Text>
                  </Group>
                </Stack>
              </Group>
              <IconArrowRight size={32} style={{ alignSelf: 'center' }} color="rgba(255,255,255,0.2)" />
            </Group>
          </Card>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {skills?.map((skill: any) => (
              <SkillCard key={skill.id} skill={skill as SkillWithProfile} />
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
