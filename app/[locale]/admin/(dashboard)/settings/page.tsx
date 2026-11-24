import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";
import {
  getStoreSettings,
  getWilayaDeliveryRates,
} from "@/lib/services/settings.service";
import { getAllCarriersPublic } from "@/lib/services/carriers.service";
import { SettingsManagerClient } from "@/components/admin/settings-manager-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  // Check auth and permissions
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;
  const authInfo = await getEffectiveAdminPermissions(user?.email || "", simulatedRole);

  if (!authInfo.permissions.settings_team && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="les paramètres de la boutique et les tarifs de livraison"
        requiredPermissionNameAr="إعدادات المتجر وتسعيرات التوصيل"
      />
    );
  }

  const [settings, wilayaRates, carriers] = await Promise.all([
    getStoreSettings(),
    getWilayaDeliveryRates(),
    getAllCarriersPublic(),
  ]);

  return (
    <SettingsManagerClient
      locale={locale}
      initialSettings={settings}
      initialWilayaRates={wilayaRates}
      initialCarriers={carriers}
    />
  );
}
