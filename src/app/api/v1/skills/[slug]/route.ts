import { getSkillBySlug } from "@/domain/skills/repository";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const skill = await getSkillBySlug(slug);

        if (!skill) {
            return NextResponse.json(
                { error: "Skill not found" },
                { status: 404 }
            );
        }

        const { serializeSkillFiles, parseSkillFilesFromJSON } = await import("@/lib/skill-files");
        let content = skill.content;

        // Synthesize content for legacy CLI if it's missing but files exist
        if (!content && skill.files) {
            content = serializeSkillFiles(parseSkillFilesFromJSON(skill.files));
        }

        return NextResponse.json({
            slug: skill.slug,
            content: content,
            files: skill.files,
            title: skill.title,
            description: skill.description,
            version: "1.0.0",
        });
    } catch (error) {
        console.error("Error fetching skill:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
