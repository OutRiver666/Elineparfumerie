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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  MapPin,
  Star,
  BarChart3,
  Inbox,
  Percent,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminSalesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSalesPage({ params }: AdminSalesPageProps) {
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
    <div className="space-y-6 sm:space-y-7 font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 text-amber-600" />
              {isAr ? "تحليلات المداخيل والتجارة" : "Analyses Financières & Marge"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "لوحة المداخيل والمبيعات" : "Tableau des Revenus & Ventes"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "متابعة دقيقة للأداء المالي، التوزيع الجغرافي للمبيعات وأكثر العطور طلباً."
              : "Suivi détaillé des flux COD, rentabilité par Wilaya et performance des extraits de parfum."}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">
              {isAr ? "إجمالي المبيعات" : "Volume Commandé"}
            </span>
            <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {formatPrice(analytics.orderedRevenueDZD, locale)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isAr ? "إجمالي الطلبيات المسجلة" : "Toutes commandes passées"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">
              {isAr ? "إجمالي الطلبيات" : "Nombre de Commandes"}
            </span>
            <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {analytics.totalOrdersCount}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isAr ? "مستوى الطلب على المتجر" : "Volume total de transactions"}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-800">
              {isAr ? "معدل التسليم الفعلي" : "Taux de Livraison"}
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-900 tracking-tight">
            {deliveryRate}%
          </p>
          <p className="text-[11px] text-emerald-700 mt-1">
            {analytics.deliveredOrdersCount} {isAr ? "طلبية مستلمة" : "colis livrés"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">
              {isAr ? "متوسط السلة" : "Panier Moyen"}
            </span>
            <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
              <Star className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {formatPrice(avgOrderValue, locale)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isAr ? "متوسط قيمة الطلب الواحد" : "Moyenne par panier client"}
          </p>
        </div>
      </div>

      {/* Revenue Pipeline Summary Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="p-5 pb-4 border-b border-zinc-100">
          <CardTitle className="text-base font-bold text-zinc-900">
            {isAr ? "قمع تحصيل المداخيل الفعلي (Cash Conversion)" : "Pipeline de Conversion des Revenus"}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "مراحل تحول الطلبات من حجز عبر الموقع إلى سيولة مالية مودعة."
              : "Cycle de vie des flux financiers depuis la commande jusqu'à l'encaissement définitif."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                labelFr: "Commandé",
                labelAr: "مطلوب",
                value: analytics.orderedRevenueDZD,
                desc: isAr ? "كل الطلبيات المسجلة عبر الموقع" : "Total des commandes passées",
                badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
              },
              {
                labelFr: "Confirmé",
                labelAr: "مؤكد",
                value: analytics.confirmedRevenueDZD,
                desc: isAr ? "تم الاتصال والتأكيد هاتفياً" : "Confirmé téléphoniquement",
                badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
              },
              {
                labelFr: "Livré",
                labelAr: "مسلّم",
                value: analytics.deliveredRevenueDZD,
                desc: isAr ? "تم تسليمه للزبائن" : "Remis au client",
                badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
              },
              {
                labelFr: "Encaissé (Cash)",
                labelAr: "محصل",
                value: analytics.collectedRevenueDZD,
                desc: isAr ? "أموال محصلة ومودعة" : "Cash récupéré du transporteur",
                badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
              },
            ].map((stage) => (
              <div key={stage.labelFr} className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-2 ${stage.badgeClass}`}>
                  {isAr ? stage.labelAr : stage.labelFr}
                </span>
                <p className="font-bold text-zinc-900 text-lg tracking-tight">
                  {formatPrice(stage.value, locale)}
                </p>
                <p className="text-zinc-400 text-xs mt-1 leading-snug">{stage.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two columns: Top Products + Top Wilayas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm font-bold text-zinc-900">
                {isAr ? "أكثر العطور مبيعاً" : "Parfums les Plus Vendus"}
              </CardTitle>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">Top 5</span>
          </CardHeader>

          <CardContent className="p-0">
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                <Inbox className="w-6 h-6 mx-auto mb-2 text-zinc-300" />
                {isAr ? "لا توجد مبيعات مسجلة حتى الآن" : "Aucune vente enregistrée pour l'instant"}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {topProducts.map((product, i) => (
                  <div key={product.name} className="flex items-center justify-between p-4 text-xs hover:bg-zinc-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-zinc-900">{product.name}</p>
                        <p className="text-zinc-400 text-[11px]">{product.size}</p>
                      </div>
                    </div>
                    <div className="text-right rtl:text-left">
                      <p className="font-bold text-zinc-900">
                        {formatPrice(product.revenue, locale)}
                      </p>
                      <p className="text-zinc-400 text-[11px]">
                        {product.sold} {isAr ? "وحدة" : "unités"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Wilayas */}
        <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-zinc-900">
                {isAr ? "الولايات الأكثر طلباً وتوليداً للمداخيل" : "Top Wilayas par Revenus"}
              </CardTitle>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">58 Wilayas</span>
          </CardHeader>

          <CardContent className="p-0">
            {topWilayas.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                <Inbox className="w-6 h-6 mx-auto mb-2 text-zinc-300" />
                {isAr ? "لا توجد طلبيات مسجلة حتى الآن" : "Aucune commande enregistrée pour l'instant"}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {topWilayas.map((wilaya, i) => {
                  const maxOrders = topWilayas[0]?.orders || 1;
                  const pct = Math.round((wilaya.orders / maxOrders) * 100);
                  return (
                    <div key={wilaya.code} className="p-4 text-xs hover:bg-zinc-50/60 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-bold text-zinc-900">
                            {wilaya.code} — {isAr ? wilaya.nameAr : wilaya.name}
                          </span>
                        </div>
                        <div className="text-right rtl:text-left">
                          <span className="font-bold text-zinc-900">
                            {formatPrice(wilaya.revenue, locale)}
                          </span>
                          <span className="ml-2 text-zinc-400">
                            ({wilaya.orders} {isAr ? "طلب" : "cmd"})
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
