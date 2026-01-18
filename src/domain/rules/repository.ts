import { createClient } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Rule = Database["public"]["Tables"]["rules"]["Row"];

export async function getRuleById(id: string): Promise<Rule | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("rules")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export async function getRuleBySlug(slug: string): Promise<Rule | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("rules")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data;
}

export async function listRules(options?: { authorId?: string }) {
    const supabase = await createClient();
    let query = supabase.from("rules").select("*, profiles(*)");

    if (options?.authorId) {
        query = query.eq("author_id", options.authorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}
