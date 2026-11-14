import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTeamMembers, getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { TeamManagerClient } from "@/components/admin/team-manager-client";
import { AccessDenied } from "@/components/admin/access-denied";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminTeamPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminTeamPage({ params }: AdminTeamPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const isAr = locale === "ar";

  // Check current admin user session
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email || "";

  // Check simulation cookie
  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;

  // Retrieve effective permissions
  const authInfo = await getEffectiveAdminPermissions(userEmail, simulatedRole);

  // Strict Permission check: must have settings_team permission or be owner
  if (!authInfo.isOwner && !authInfo.permissions.settings_team) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="la gestion de l'équipe et des permissions administrateurs"
        requiredPermissionNameAr="إدارة الفريق وتعديل صلاحيات المشرفين"
      />
    );
  }

  const rawTeamMembers = await getTeamMembers(userEmail);
  // Security: Never leak passwords or credential secrets to client components
  const sanitizedMembers = rawTeamMembers.map(({ temporaryPassword, ...safe }) => safe);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/30">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {isAr ? "التحكم في الأذونات والصلاحيات" : "Sécurité & Contrôle des Accès (RBAC)"}
          </span>
          <h2 className="font-serif text-2xl font-medium text-luxury-text flex items-center gap-2">
            <Users className="w-5 h-5 text-luxury-accent" />
            <span>{isAr ? "إدارة الفريق والأدوار الإدارية" : "Gestion de l'Équipe & Rôles"}</span>
          </h2>
          <p className="text-xs text-luxury-text-secondary mt-1">
            {isAr
              ? "تحكّم في ما يمكن لكل موظف أو مؤكد طلبيات رؤيته والقيام به في لوحة الإدارة."
              : "Contrôlez avec précision les modules et données visibles par chaque membre du personnel."}
          </p>
        </div>
      </div>

      {/* Interactive Team Manager */}
      <TeamManagerClient
        initialMembers={sanitizedMembers}
        locale={locale}
        currentAdminEmail={userEmail}
        isSimulating={authInfo.isSimulating}
        simulatedRole={simulatedRole}
      />
    </div>
  );
}
