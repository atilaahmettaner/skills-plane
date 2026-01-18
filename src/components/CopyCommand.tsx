"use client";

import { Group, Text, Tooltip } from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Group
            gap="xs"
            px="md"
            py={8}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
            }}
            onClick={handleCopy}
        >
            <Text ff="monospace" size="sm" c="cyan">{command.split(' ')[0]}</Text>
            <Text ff="monospace" size="sm">{command.split(' ').slice(1).join(' ')}</Text>
            <Tooltip label={copied ? "Copied!" : "Copy"} withArrow>
                {copied ? (
                    <IconCheck size={14} color="#22e1fe" />
                ) : (
                    <IconCopy size={14} style={{ opacity: 0.5 }} />
                )}
            </Tooltip>
        </Group>
    );
}
