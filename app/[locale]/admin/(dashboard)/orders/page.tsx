import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { getOrders } from "@/lib/services/orders.service";
import { OrdersManagerClient } from "@/components/admin/orders-manager-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminOrdersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminOrdersPage({ params }: AdminOrdersPageProps) {
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

  if (!authInfo.permissions.orders_view && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="la gestion des commandes et du fichier clients"
        requiredPermissionNameAr="إدارة وقائمة طلبيات الزبائن"
      />
    );
  }

  const orders = await getOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/30">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "لوحة الإدارة والتحكم" : "Gestion & Suivi Logistique"}
          </span>
          <h2 className="font-serif text-2xl font-medium text-luxury-text">
            {locale === "ar" ? "طلبيات الدفع عند الاستلام (COD)" : "Commandes COD En Temps Réel"}
          </h2>
        </div>
      </div>

      {/* Interactive Orders Pipeline & List */}
      <OrdersManagerClient initialOrders={orders} locale={locale} />
    </div>
  );
}
