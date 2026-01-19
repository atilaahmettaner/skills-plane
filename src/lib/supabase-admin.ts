import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

/**
 * CAUTION: This client uses the Supabase service role key, which bypasses all Row Level Security (RLS) policies.
 * Only use this on the server (Server Components, Server Actions, API Routes) and NEVER expose the service role key to the client.
 */
export function createAdminClient() {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            db: {
                schema: "public",
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }

    );
}
