import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTeamMembers, getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { TeamManagerClient } from "@/components/admin/team-manager-client";
import { AccessDenied } from "@/components/admin/access-denied";
import { Users, ShieldCheck } from "lucide-react";

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
    <div className="space-y-6 sm:space-y-7 font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              {isAr ? "التحكم في الأذونات والصلاحيات" : "Sécurité & Contrôle des Accès (RBAC)"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-zinc-800" />
            <span>{isAr ? "إدارة الفريق والأدوار الإدارية" : "Gestion de l'Équipe & Rôles"}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
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
