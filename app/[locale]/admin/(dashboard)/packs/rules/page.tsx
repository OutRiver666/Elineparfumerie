import React from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { getAdminCustomRules } from "@/lib/services/bundles.service";
import { PackRulesClient } from "@/components/admin/pack-rules-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Règles Packs Sur-Mesure | Studio Éline",
  description: "Configuration des paliers de remises et quotas pour les coffrets personnalisés",
};

interface PackRulesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPackRulesPage({ params }: PackRulesPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;
  const authInfo = await getEffectiveAdminPermissions(user?.email || "", simulatedRole);

  if (!authInfo.permissions.packs_manage && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="la gestion des règles de packs et remises"
        requiredPermissionNameAr="إدارة قواعد الباقات والتخفيضات"
      />
    );
  }

  const tiers = await getAdminCustomRules();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-outfit">
      <PackRulesClient tiers={tiers} locale={locale} />
    </div>
  );
}
