"use client";

import { Button, ButtonProps, ElementProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

interface CreateSkillButtonProps extends ButtonProps, ElementProps<"a", keyof ButtonProps> {
    label?: string;
    href?: string;
}

export function CreateSkillButton({
    label = "Create New Skill",
    href = "/skills/new",
    ...props
}: CreateSkillButtonProps) {
    return (
        <Button
            component={Link}
            href={href}
            leftSection={<IconPlus size={16} />}
            {...props}
        >
            {label}
        </Button>
    );
}
