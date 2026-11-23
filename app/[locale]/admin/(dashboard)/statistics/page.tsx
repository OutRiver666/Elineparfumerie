import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";
import { getDashboardStatistics } from "@/lib/services/statistics.service";
import { StatisticsDashboardClient } from "@/components/admin/statistics-dashboard-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminStatisticsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminStatisticsPage({
  params,
}: AdminStatisticsPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;
  const authInfo = await getEffectiveAdminPermissions(user?.email || "", simulatedRole);

  if (!authInfo.permissions.sales_analytics && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="les statistiques avancées et le suivi du cash flow"
        requiredPermissionNameAr="الإحصائيات المتقدمة وتحليلات التدفق النقدي"
      />
    );
  }

  const statisticsData = await getDashboardStatistics();

  return <StatisticsDashboardClient data={statisticsData} locale={locale} />;
}
