"use server";

import { createClient } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to update your profile.");
    }

    const username = formData.get("username") as string;
    const full_name = formData.get("full_name") as string;
    const avatar_url = formData.get("avatar_url") as string;

    const supabaseAdmin = createAdminClient();

    // In 'profiles', the record ID is the user ID. 
    // Manual ownership check: We ensure we only update the record WHERE id = authenticated user's id.
    const { error } = await (supabaseAdmin.from("profiles") as any).update({
        username,
        full_name,
        avatar_url,
        updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    if (error) {
        console.error("Error updating profile:", error);
        throw new Error("Failed to update profile: " + error.message);
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");
}
