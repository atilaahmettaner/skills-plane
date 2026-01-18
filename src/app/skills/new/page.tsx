import { Container, Box, Title, Stack, Text } from "@mantine/core";
import { SkillForm } from "@/components/SkillForm";
import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function NewSkillPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <Box style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            <div className="hero-glow" />

            <Container size="sm" py={80}>
                <Stack align="center" mb={40} gap="xs">
                    <Title order={1} size={48} fw={900}>
                        Submit a <span className="gradient-text">Skill</span>
                    </Title>
                    <Text c="dimmed" size="lg" style={{ textAlign: "center" }}>
                        Contribute your intelligence to the global marketplace.
                    </Text>
                </Stack>

                <SkillForm />
            </Container>
        </Box>
    );
}
