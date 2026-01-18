"use client";

import { Container, Title, Text, Button, Stack, Paper, TextInput, Divider } from "@mantine/core";
import { IconBrandGithub, IconMail } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";

export default function LoginPage() {
    const handleGithubLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <Container size="xs" py={120}>
            <Paper className="glass-card" p={40} radius="lg" withBorder>
                <Stack align="center" gap="xl">
                    <Title order={2} size={32} fw={900} className="text-bright">
                        Join <span className="gradient-text">Skills Plane</span>
                    </Title>
                    <Text c="dimmed" size="md" ta="center" style={{ maxWidth: 300 }}>
                        Sign in with GitHub to contribute and share your skills with the community.
                    </Text>

                    <Button
                        fullWidth
                        size="lg"
                        variant="default"
                        leftSection={<IconBrandGithub size={22} color="#22e1fe" />}
                        onClick={handleGithubLogin}
                        styles={{
                            root: {
                                height: '56px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '16px'
                            }
                        }}
                    >
                        Continue with GitHub
                    </Button>

                    <Text size="xs" c="dimmed" ta="center">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </Text>
                </Stack>
            </Paper>
        </Container>
    );
}
