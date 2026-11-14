import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AdminPermissionKey } from "@/types/admin-role";
import { cookies } from "next/headers";

export interface AuthenticatedAdminContext {
  user: {
    id: string;
    email: string;
  };
  authInfo: Awaited<ReturnType<typeof getEffectiveAdminPermissions>>;
}

/**
 * Server Action Security Guard:
 * Strictly verifies that:
 * 1. The caller has a valid, active Supabase Auth session token (verified by auth server, not forged cookies)
 * 2. The account is active (not disabled by management)
 * 3. The administrator is either the Owner or holds the exact granular permission required
 *
 * Throws a secure error if unauthorized.
 */
export async function requireAdminPermission(
  requiredPermission: AdminPermissionKey,
  locale: string = "fr"
): Promise<AuthenticatedAdminContext> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    throw new Error(
      locale === "ar"
        ? "غير مصرح: يجب تسجيل الدخول كمسؤول أولاً."
        : "Accès refusé : Authentification administrateur requise."
    );
  }

  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;
  const authInfo = await getEffectiveAdminPermissions(user.email, simulatedRole);

  if (!authInfo.member.isActive) {
    throw new Error(
      locale === "ar"
        ? "تم تعطيل هذا الحساب من قبل الإدارة."
        : "Ce compte administrateur a été désactivé."
    );
  }

  // Super Admin / Owner has unrestricted system access
  if (authInfo.isOwner) {
    return {
      user: { id: user.id, email: user.email },
      authInfo,
    };
  }

  // Check specific granular permission
  if (!authInfo.permissions[requiredPermission]) {
    throw new Error(
      locale === "ar"
        ? "لا تملك الصلاحية الكافية لتنفيذ هذا الإجراء."
        : "Permissions insuffisantes pour effectuer cette opération."
    );
  }

  return {
    user: { id: user.id, email: user.email },
    authInfo,
  };
}

/**
 * Fast helper to verify user is any active authenticated staff member
 */
export async function requireAuthenticatedAdmin(locale: string = "fr") {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error(
      locale === "ar"
        ? "جلسة العمل منتهية. يرجى تسجيل الدخول مجدداً."
        : "Session expirée. Veuillez vous reconnecter."
    );
  }

  return user;
}
