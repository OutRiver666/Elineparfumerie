import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { getOrders } from "@/lib/services/orders.service";
import { OrdersManagerClient } from "@/components/admin/orders-manager-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";
import { ShoppingBag, Truck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminOrdersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminOrdersPage({ params }: AdminOrdersPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const isAr = locale === "ar";

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
    <div className="space-y-6 font-outfit">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <ShoppingBag className="w-3 h-3 text-amber-600" />
              {isAr ? "متابعة الطلبيات واللوجستيك" : "Gestion & Suivi Logistique"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "طلبيات الدفع عند الاستلام (COD)" : "Commandes COD & Expéditions"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "تأكيد الطلبيات، الربط المباشر مع EcoTrack ومتابعة التوصيل عبر 58 ولاية."
              : "Validation téléphonique, création des colis EcoTrack et synchronisation des statuts."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-200/80 text-zinc-700 shadow-xs">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            <span>EcoTrack Connecté</span>
          </span>
        </div>
      </div>

      {/* Interactive Orders Pipeline & List */}
      <OrdersManagerClient initialOrders={orders} locale={locale} />
    </div>
  );
}
