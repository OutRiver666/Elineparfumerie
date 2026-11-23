import React from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Locale } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getOrderCounts } from "@/lib/services/orders.service";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardLayout({
  children,
  params,
}: AdminDashboardLayoutProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  // Strict server-side authentication check: must be logged in to view dashboard
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  // Check simulation cookie (for Super Admin role testing)
  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;

  // Retrieve effective permissions and active role
  const authInfo = await getEffectiveAdminPermissions(user.email || "", simulatedRole);

  if (!authInfo.member.isActive) {
    redirect(`/${locale}/admin/login?error=deactivated`);
  }

  // Live order counts for sidebar badge
  const orderCounts = await getOrderCounts();

  return (
    <AdminShell
      locale={locale}
      ordersCount={orderCounts.total}
      newOrdersCount={orderCounts.newOrders}
      permissions={authInfo.permissions}
      userRole={authInfo.role}
      userEmail={user.email}
      userName={authInfo.member.fullName}
      isSimulating={authInfo.isSimulating}
      simulatedRole={simulatedRole}
      isRealOwner={authInfo.isRealOwner}
    >
      {children}
    </AdminShell>
  );
}
