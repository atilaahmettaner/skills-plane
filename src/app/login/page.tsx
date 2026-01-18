"use client";

import { Container, Title, Text, Button, Stack, Paper, TextInput, Divider } from "@mantine/core";
import { IconBrandGithub, IconMail } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleGithubLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });
        setLoading(false);

        if (error) {
            alert(error.message);
        } else {
            setMessage("Check your email for the login link!");
        }
    };

    if (message) {
        return (
            <Container size="xs" py={100}>
                <Paper shadow="md" p="xl" radius="md" withBorder>
                    <Stack align="center">
                        <Title order={3}>Check your email</Title>
                        <Text ta="center">{message}</Text>
                        <Button variant="subtle" onClick={() => setMessage("")}>
                            Back to login
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Container size="xs" py={100}>
            <Paper shadow="md" p="xl" radius="md" withBorder>
                <Stack align="center" gap="lg">
                    <Title order={2}>Welcome to Skills Plane</Title>
                    <Text c="dimmed" size="sm" ta="center">
                        Sign in to contribute your skills and rules to the community.
                    </Text>

                    <Button
                        fullWidth
                        size="lg"
                        variant="default"
                        leftSection={<IconBrandGithub size={20} />}
                        onClick={handleGithubLogin}
                    >
                        Sign in with GitHub
                    </Button>

                    <Divider label="Or continue with email" labelPosition="center" w="100%" />

                    <form onSubmit={handleEmailLogin} style={{ width: "100%" }}>
                        <Stack>
                            <TextInput
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.currentTarget.value)}
                                required
                            />
                            <Button
                                fullWidth
                                type="submit"
                                loading={loading}
                                leftSection={<IconMail size={20} />}
                            >
                                Send Magic Link
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </Paper>
        </Container>
    );
}
