"use server";

import { createClient } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function createWorkflow(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to create a workflow.");
    }

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;

    const supabaseAdmin = createAdminClient();

    // @ts-ignore - Temporary bypass for type inference issue
    const { error } = await (supabaseAdmin.from("workflows") as any).insert({
        title,
        slug,
        description,
        content,
        author_id: user.id,
    });

    if (error) {
        console.error("Error creating workflow:", error);
        throw new Error("Failed to create workflow: " + error.message);
    }

    revalidatePath("/workflows");
    revalidatePath("/dashboard");
}

export async function deleteWorkflow(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to delete a workflow.");
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch to check ownership
    const { data: workflow, error: fetchError } = await (supabaseAdmin.from("workflows") as any)
        .select("author_id")
        .eq("id", id)
        .single();

    if (fetchError || !workflow) {
        throw new Error("Workflow not found.");
    }

    // 2. Verify ownership
    if (workflow.author_id !== user.id) {
        throw new Error("You do not have permission to delete this workflow.");
    }

    // 3. Delete
    const { error: deleteError } = await supabaseAdmin
        .from("workflows")
        .delete()
        .eq("id", id);

    if (deleteError) {
        throw new Error("Failed to delete workflow: " + deleteError.message);
    }

    revalidatePath("/workflows");
    revalidatePath("/dashboard");
}
