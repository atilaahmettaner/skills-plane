import { createAdminClient } from "@/lib/supabase-admin";
import { Database } from "@/lib/database.types";

type Workflow = Database["public"]["Tables"]["workflows"]["Row"];

export async function getWorkflowById(id: string): Promise<Workflow | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export async function getWorkflowBySlug(slug: string): Promise<Workflow | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("workflows")
        .select("*, profiles(username, avatar_url, full_name, is_verified)")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data;
}

export async function listWorkflows(options?: { authorId?: string }) {
    const supabase = createAdminClient();
    let query = supabase.from("workflows").select("*, profiles(username, avatar_url, full_name, is_verified)");

    if (options?.authorId) {
        query = query.eq("author_id", options.authorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}
