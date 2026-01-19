"use server";

import { createClient } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function createRule(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to create a rule.");
    }

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;

    const supabaseAdmin = createAdminClient();

    // @ts-ignore - Temporary bypass for type inference issue
    const { error } = await (supabaseAdmin.from("rules") as any).insert({
        title,
        slug,
        description,
        content,
        author_id: user.id,
    });

    if (error) {
        console.error("Error creating rule:", error);
        throw new Error("Failed to create rule: " + error.message);
    }

    revalidatePath("/rules");
    revalidatePath("/dashboard");
}

export async function deleteRule(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to delete a rule.");
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch to check ownership
    const { data: rule, error: fetchError } = await (supabaseAdmin.from("rules") as any)
        .select("author_id")
        .eq("id", id)
        .single();

    if (fetchError || !rule) {
        throw new Error("Rule not found.");
    }

    // 2. Verify ownership
    if (rule.author_id !== user.id) {
        throw new Error("You do not have permission to delete this rule.");
    }

    // 3. Delete
    const { error: deleteError } = await supabaseAdmin
        .from("rules")
        .delete()
        .eq("id", id);

    if (deleteError) {
        throw new Error("Failed to delete rule: " + deleteError.message);
    }

    revalidatePath("/rules");
    revalidatePath("/dashboard");
}
