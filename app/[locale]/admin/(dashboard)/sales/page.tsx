import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { getRevenueAnalytics, getOrders } from "@/lib/services/orders.service";
import { formatPrice } from "@/lib/utils";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria-locations";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  MapPin,
  Star,
  BarChart3,
  Inbox,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminSalesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSalesPage({ params }: AdminSalesPageProps) {
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

  if (!authInfo.permissions.sales_analytics && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="les rapports de ventes et le chiffre d'affaires financier"
        requiredPermissionNameAr="التقارير المالية والمداخيل وأرقام المبيعات"
      />
    );
  }

  const analytics = await getRevenueAnalytics();
  const orders = await getOrders();

  // Dynamically calculate Wilaya breakdown from live orders
  const wilayaRevenueMap = new Map<string, { count: number; revenue: number }>();
  // Dynamically calculate Product breakdown from live order items
  const productRevenueMap = new Map<string, { count: number; revenue: number; size: string }>();

  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "returned") continue;

    // Aggregate by wilaya
    const existingW = wilayaRevenueMap.get(o.wilaya) || { count: 0, revenue: 0 };
    wilayaRevenueMap.set(o.wilaya, {
      count: existingW.count + 1,
      revenue: existingW.revenue + o.total,
    });

    // Aggregate by product
    for (const item of o.items) {
      const existingP = productRevenueMap.get(item.name) || { count: 0, revenue: 0, size: item.size };
      productRevenueMap.set(item.name, {
        count: existingP.count + item.qty,
        revenue: existingP.revenue + (item.unitPrice * item.qty),
        size: item.size,
      });
    }
  }

  // Sort top wilayas
  const topWilayas = Array.from(wilayaRevenueMap.entries())
    .map(([code, stats]) => {
      const wInfo = ALGERIA_WILAYAS.find((w) => w.code === code);
      return {
        code,
        name: wInfo?.name_fr || `Wilaya ${code}`,
        nameAr: wInfo?.name_ar || `ولاية ${code}`,
        orders: stats.count,
        revenue: stats.revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sort top products
  const topProducts = Array.from(productRevenueMap.entries())
    .map(([name, stats]) => ({
      name,
      size: stats.size,
      sold: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const avgOrderValue = analytics.totalOrdersCount > 0
    ? Math.round(analytics.orderedRevenueDZD / analytics.totalOrdersCount)
    : 0;

  const deliveryRate = analytics.totalOrdersCount > 0
    ? Math.round((analytics.deliveredOrdersCount / analytics.totalOrdersCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
          {locale === "ar" ? "تقارير الأعمال" : "Rapports & Analyses"}
        </span>
        <h2 className="font-serif text-2xl font-medium text-luxury-text">
          {locale === "ar" ? "لوحة المداخيل والمبيعات" : "Tableau des Revenus & Ventes"}
        </h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            labelFr: "Revenu Commandé",
            labelAr: "إجمالي المبيعات",
            value: formatPrice(analytics.orderedRevenueDZD, locale),
            icon: DollarSign,
          },
          {
            labelFr: "Commandes Reçues",
            labelAr: "إجمالي الطلبيات",
            value: analytics.totalOrdersCount.toString(),
            icon: ShoppingBag,
          },
          {
            labelFr: "Taux de Livraison",
            labelAr: "معدل التسليم الفعلي",
            value: `${deliveryRate}%`,
            icon: TrendingUp,
          },
          {
            labelFr: "Panier Moyen",
            labelAr: "متوسط قيمة الطلب",
            value: formatPrice(avgOrderValue, locale),
            icon: Star,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.labelFr}
              className="bg-white border border-luxury-border/30 rounded-[4px] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted">
                  {locale === "ar" ? kpi.labelAr : kpi.labelFr}
                </p>
                <div className="w-7 h-7 rounded-full bg-luxury-secondary flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-luxury-accent" />
                </div>
              </div>
              <p className="text-xl font-semibold text-luxury-text">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Pipeline Summary */}
      <div className="bg-white border border-luxury-border/30 rounded-[4px] p-5">
        <h3 className="font-serif text-sm font-medium text-luxury-text mb-4">
          {locale === "ar" ? "قمع المداخيل الفعلي" : "Pipeline de Revenus Réel"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              labelFr: "Commandé",
              labelAr: "مطلوب",
              value: analytics.orderedRevenueDZD,
              desc: locale === "ar" ? "كل الطلبيات المسجلة عبر الموقع" : "Total des commandes passées",
              color: "bg-blue-100 text-blue-800",
            },
            {
              labelFr: "Confirmé",
              labelAr: "مؤكد",
              value: analytics.confirmedRevenueDZD,
              desc: locale === "ar" ? "تم الاتصال والتأكيد هاتفياً" : "Confirmé téléphoniquement",
              color: "bg-amber-100 text-amber-800",
            },
            {
              labelFr: "Livré",
              labelAr: "مسلم",
              value: analytics.deliveredRevenueDZD,
              desc: locale === "ar" ? "تم تسليمه للزبائن" : "Remis au client",
              color: "bg-purple-100 text-purple-800",
            },
            {
              labelFr: "Encaissé",
              labelAr: "محصل",
              value: analytics.collectedRevenueDZD,
              desc: locale === "ar" ? "أموال محصلة ومودعة" : "Cash récupéré du transporteur",
              color: "bg-emerald-100 text-emerald-800",
            },
          ].map((stage) => (
            <div key={stage.labelFr} className="text-xs">
              <span className={`inline-block px-2 py-0.5 rounded-[2px] text-[10px] font-semibold mb-2 ${stage.color}`}>
                {locale === "ar" ? stage.labelAr : stage.labelFr}
              </span>
              <p className="font-semibold text-luxury-text text-base">
                {formatPrice(stage.value, locale)}
              </p>
              <p className="text-luxury-text-muted leading-tight mt-0.5">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Top Products + Top Wilayas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-white border border-luxury-border/30 rounded-[4px] overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-luxury-border/20">
            <Star className="w-4 h-4 text-luxury-accent" />
            <h3 className="font-medium text-luxury-text text-sm">
              {locale === "ar" ? "أكثر العطور مبيعاً" : "Parfums les Plus Vendus"}
            </h3>
          </div>
          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-luxury-text-muted text-xs">
              <Inbox className="w-6 h-6 mx-auto mb-2 text-luxury-border" />
              {locale === "ar" ? "لا توجد مبيعات مسجلة حتى الآن" : "Aucune vente enregistrée pour l'instant"}
            </div>
          ) : (
            <div className="divide-y divide-luxury-border/20">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center justify-between p-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-luxury-secondary text-luxury-text-muted text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-luxury-text">{product.name}</p>
                      <p className="text-luxury-text-muted">{product.size}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-luxury-text">
                      {formatPrice(product.revenue, locale)}
                    </p>
                    <p className="text-luxury-text-muted">
                      {product.sold} {locale === "ar" ? "وحدة" : "unités"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Wilayas */}
        <div className="bg-white border border-luxury-border/30 rounded-[4px] overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-luxury-border/20">
            <MapPin className="w-4 h-4 text-luxury-accent" />
            <h3 className="font-medium text-luxury-text text-sm">
              {locale === "ar" ? "الولايات الأكثر نشاطاً" : "Top Wilayas par Revenus"}
            </h3>
          </div>
          {topWilayas.length === 0 ? (
            <div className="p-8 text-center text-luxury-text-muted text-xs">
              <Inbox className="w-6 h-6 mx-auto mb-2 text-luxury-border" />
              {locale === "ar" ? "لا توجد طلبيات مسجلة حتى الآن" : "Aucune commande enregistrée pour l'instant"}
            </div>
          ) : (
            <div className="divide-y divide-luxury-border/20">
              {topWilayas.map((wilaya, i) => {
                const maxOrders = topWilayas[0]?.orders || 1;
                const pct = Math.round((wilaya.orders / maxOrders) * 100);
                return (
                  <div key={wilaya.code} className="p-4 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-luxury-secondary text-luxury-text-muted text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium text-luxury-text">
                          {wilaya.code} — {locale === "ar" ? wilaya.nameAr : wilaya.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-luxury-text">
                          {formatPrice(wilaya.revenue, locale)}
                        </span>
                        <span className="ml-2 text-luxury-text-muted">
                          ({wilaya.orders} {locale === "ar" ? "طلب" : "cmd"})
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 bg-luxury-secondary/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-luxury-accent/60 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
