import { createClient } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Skill = Database["public"]["Tables"]["skills"]["Row"];

export async function getSkillById(id: string): Promise<Skill | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("skills")
        .select("*, profiles(*)")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data;
}

export async function listSkills(options?: { authorId?: string; search?: string }) {
    const supabase = await createClient();
    let query = supabase.from("skills").select("*, profiles(*)");

    if (options?.authorId) {
        query = query.eq("author_id", options.authorId);
    }

    if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%,slug.ilike.%${options.search}%`);
    }

    // Default sorting - official first, then newest
    query = query.order('is_official', { ascending: false })
        .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
}
