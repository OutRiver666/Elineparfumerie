import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * Privileged server-only Supabase client using service-role credentials.
 * NEVER import or invoke this file from client components or browser contexts.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
