"use server";

import { createClient } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase-admin";
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
    const content = formData.get("content") as string | null;
    const filesStr = formData.get("files") as string | null;
    const githubUrl = formData.get("github_url") as string | null;

    let files: any = {};
    if (filesStr) {
        try {
            files = JSON.parse(filesStr);
        } catch (e) {
            console.error("Failed to parse files JSON:", e);
        }
    } else if (content) {
        // Fallback for transition
        const { parseSkillFiles, serializeSkillFilesToJSON } = await import("@/lib/skill-files");
        files = serializeSkillFilesToJSON(parseSkillFiles(content));
    }

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

    // Validation: Either GitHub URL or files must be provided
    if (!githubUrl && Object.keys(files).length === 0) {
        throw new Error("Either GitHub URL or skill content must be provided");
    }

    // Title and slug are required
    if (!title || !slug) {
        throw new Error("Title and slug are required");
    }

    const supabaseAdmin = createAdminClient();

    // @ts-ignore - Temporary bypass for type inference issue with service role client
    const { error } = await (supabaseAdmin.from("skills") as any).insert({
        title,
        slug,
        description: description || null,
        files: files,
        content: content || null,
        github_url: githubUrl || null,
        author_id: user.id,
        is_official: false,
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

export async function deleteSkill(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to delete a skill.");
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch the skill to check ownership
    const { data: skill, error: fetchError } = await (supabaseAdmin.from("skills") as any)
        .select("author_id")
        .eq("id", id)
        .single();


    if (fetchError || !skill) {
        throw new Error("Skill not found.");
    }

    // 2. Verify ownership
    if (skill.author_id !== user.id) {
        throw new Error("You do not have permission to delete this skill.");
    }

    // 3. Execute deletion
    const { error: deleteError } = await supabaseAdmin
        .from("skills")
        .delete()
        .eq("id", id);

    if (deleteError) {
        throw new Error("Failed to delete skill: " + deleteError.message);
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
}

export async function updateSkill(id: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to update a skill.");
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch the skill to check ownership
    const { data: skill, error: fetchError } = await (supabaseAdmin.from("skills") as any)
        .select("author_id")
        .eq("id", id)
        .single();


    if (fetchError || !skill) {
        throw new Error("Skill not found.");
    }

    // 2. Verify ownership
    if (skill.author_id !== user.id) {
        throw new Error("You do not have permission to update this skill.");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string | null;
    const githubUrl = formData.get("github_url") as string | null;

    // 3. Execute update
    // @ts-ignore - Temporary bypass for type inference issue
    const { error: updateError } = await (supabaseAdmin.from("skills") as any).update({
        title,
        description: description || null,
        content: content || null,
        github_url: githubUrl || null,
        updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (updateError) {
        throw new Error("Failed to update skill: " + updateError.message);
    }

    revalidatePath("/");
    revalidatePath(`/skills/${id}`); // Assuming we might navigate to ID or Slug
    revalidatePath("/dashboard");
}

