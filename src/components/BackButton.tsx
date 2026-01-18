"use client";

import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export function BackButton() {
    return (
        <Button
            component={Link}
            href="/"
            variant="subtle"
            size="xs"
            leftSection={<IconArrowLeft size={16} />}
            mb="md"
            c="dimmed"
        >
            Back to Skills
        </Button>
    );
}
