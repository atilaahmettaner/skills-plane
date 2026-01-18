"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSkill(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to create a skill.");
    }

    let title = formData.get("title") as string;
    let slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const githubUrl = formData.get("github_url") as string | null;

    // If GitHub URL provided but no title/slug, extract from URL
    if (githubUrl && (!title || !slug)) {
        const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            const repoName = match[2].replace(/\.git$/, '');

            // Auto-generate title if empty
            if (!title) {
                title = repoName
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }

            // Auto-generate slug if empty
            if (!slug) {
                slug = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            }
        }
    }

    // Server-side slug sanitization
    if (slug) {
        slug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    // Validation: Either GitHub URL or content must be provided
    if (!githubUrl && !content) {
        throw new Error("Either GitHub URL or content must be provided");
    }

    // Title and slug are required
    if (!title || !slug) {
        throw new Error("Title and slug are required");
    }

    const { error } = await supabase.from("skills").insert({
        title,
        slug,
        description: description || null,
        content: content || null,
        github_url: githubUrl || null,
        author_id: user.id,
        is_official: false, // User submissions are unofficial by default
    });

    if (error) {
        console.error("Error creating skill:", error);
        if (error.code === '23505') { // Postgres unique constraint violation
            throw new Error(`The slug "${slug}" is already taken. Please choose a different slug.`);
        }
        throw new Error("Failed to create skill: " + error.message);
    }

    revalidatePath("/");
    redirect("/");
}
