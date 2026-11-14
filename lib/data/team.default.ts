import { AdminMember } from "@/types/admin-role";

/**
 * Fresh start: no hardcoded sample admins.
 * Administrators are dynamically populated from Supabase profiles or created via the dashboard.
 */
export const DEFAULT_TEAM_MEMBERS: AdminMember[] = [];
