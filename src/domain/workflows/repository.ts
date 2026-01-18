import { createClient } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Workflow = Database["public"]["Tables"]["workflows"]["Row"];

export async function getWorkflowById(id: string): Promise<Workflow | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export async function getWorkflowBySlug(slug: string): Promise<Workflow | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data;
}

export async function listWorkflows(options?: { authorId?: string }) {
    const supabase = await createClient();
    let query = supabase.from("workflows").select("*, profiles(*)");

    if (options?.authorId) {
        query = query.eq("author_id", options.authorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}
