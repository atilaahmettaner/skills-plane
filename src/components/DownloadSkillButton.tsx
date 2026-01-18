"use client";

import { Button, Tooltip } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import JSZip from "jszip";
import { parseSkillFiles } from "@/lib/skill-files";
import { useState } from "react";

interface DownloadSkillButtonProps {
    slug: string;
    content: string | any;
}

export function DownloadSkillButton({ slug, content }: DownloadSkillButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const files = parseSkillFiles(content);
            const zip = new JSZip();

            // Create a root folder matching the slug
            const root = zip.folder(slug);
            if (!root) throw new Error("Failed to create zip folder");

            files.forEach((file) => {
                root.file(file.filename, file.content);
            });

            const blob = await zip.generateAsync({ type: "blob" });

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate zip", error);
            alert("Failed to download skill. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip label="Download as ZIP (Source Code)">
            <Button
                variant="default"
                leftSection={<IconDownload size={16} />}
                onClick={handleDownload}
                loading={loading}
            >
                Download ZIP
            </Button>
        </Tooltip>
    );
}
