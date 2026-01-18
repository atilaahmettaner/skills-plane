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

        return NextResponse.json({
            slug: skill.slug,
            content: skill.content,
            title: skill.title,
            description: skill.description,
            version: "1.0.0", // Todo: Add versioning to DB
        });
    } catch (error) {
        console.error("Error fetching skill:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
