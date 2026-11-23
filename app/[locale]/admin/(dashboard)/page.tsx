import React from "react";
import Link from "next/link";
import { Locale, getDictionary } from "@/lib/i18n";
import { StatCard } from "@/components/admin/stat-card";
import { getRevenueAnalytics, getOrders } from "@/lib/services/orders.service";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Inbox,
  Plus,
  Lock,
  Banknote,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const dict = getDictionary(locale);
  const isAr = locale === "ar";

  // Check auth and permissions
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;
  const authInfo = await getEffectiveAdminPermissions(user?.email || "", simulatedRole);

  if (!authInfo.permissions.overview && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="le tableau de bord général"
        requiredPermissionNameAr="لوحة المؤشرات العامة"
      />
    );
  }

  // Live Revenue & Orders directly from Supabase
  const analytics = await getRevenueAnalytics();
  const orders = await getOrders();

  const newOrdersCount = orders.filter((o) => o.status === "new").length;
  const preparingOrdersCount = orders.filter((o) => o.status === "preparing").length;
  const shippedOrdersCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrdersCount = orders.filter(
    (o) => o.status === "cancelled" || o.status === "returned"
  ).length;

  const recentOrders = orders.slice(0, 6);

  const revenueMetrics = [
    {
      title: isAr ? "إجمالي الطلبات المسجلة" : "Volume Commandé Brut",
      value: formatPrice(analytics.orderedRevenueDZD, locale),
      subtitle: isAr ? "كل الطلبيات المسجلة عبر المتجر" : "Toutes commandes passées sur la boutique",
      trend: `${analytics.totalOrdersCount} cmd`,
      trendType: "neutral" as const,
      variant: "default" as const,
      icon: ShoppingBag,
    },
    {
      title: isAr ? "المبيعات المؤكدة هاتفياً" : "Chiffre d'Affaires Confirmé",
      value: formatPrice(analytics.confirmedRevenueDZD, locale),
      subtitle: isAr ? "طلبيات تم تأكيدها وجاهزة للإرسال" : "Confirmé au téléphone avec les clients",
      trend: "Validé",
      trendType: "positive" as const,
      variant: "default" as const,
      icon: TrendingUp,
    },
    {
      title: isAr ? "الطلبيات المسلّمة للزبائن" : "Revenu Livré aux Clients",
      value: formatPrice(analytics.deliveredRevenueDZD, locale),
      subtitle: isAr ? "طرود مستلمة بنجاح في الولايات" : "Colis remis en main propre (58 Wilayas)",
      trend: `${analytics.deliveredOrdersCount} livrées`,
      trendType: "positive" as const,
      variant: "highlight" as const,
      icon: CheckCircle2,
    },
    {
      title: isAr ? "الأموال المحصلة فعلياً (Cash)" : "Fonds Net Encaissés (Cash)",
      value: formatPrice(analytics.collectedRevenueDZD, locale),
      subtitle: isAr ? "مبالغ محصلة ومودعة في الحساب" : "Montant viré par les transporteurs",
      trend: "Encaissé",
      trendType: "positive" as const,
      variant: "accent" as const,
      icon: Banknote,
    },
  ];

  return (
    <div className="space-y-7 font-outfit">
      {/* Top Banner / Welcome with clean spacing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {isAr ? "متابعة الأداء الحي" : "Performance en Direct"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "لوحة المتابعة الشاملة" : "Vue Générale de l'Activité"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "متابعة فورية للمداخيل، الشحن عبر EcoTrack والطلبيات عبر 58 ولاية."
              : "Suivi en temps réel des encaissements COD, expéditions EcoTrack et livraisons."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/${locale}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              <span>{isAr ? "معاينة المتجر" : "Boutique"}</span>
            </Button>
          </Link>

          {authInfo.permissions.products_manage && (
            <Link href={`/${locale}/admin/products`}>
              <Button size="sm" className="gap-1.5 rounded-lg bg-zinc-900 text-white hover:bg-black shadow-xs">
                <Plus className="w-4 h-4" />
                <span>{isAr ? "إضافة عطر جديد" : "Créer un Parfum"}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 4 REVENUE STAT CARDS */}
      {authInfo.permissions.sales_analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {revenueMetrics.map((metric) => (
            <StatCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              trend={metric.trend}
              trendType={metric.trendType}
              variant={metric.variant}
              icon={metric.icon}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-600 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isAr
                ? "البيانات المالية والمداخيل اليومية محجوبة عن هذا الحساب (خاصة بالإدارة العليا)"
                : "Chiffre d'affaires & statistiques financières confidentielles masquées pour votre profil."}
            </span>
          </div>
          <span className="self-start sm:self-auto text-[10px] uppercase font-bold text-amber-800 px-2 py-0.5 rounded-full bg-amber-100/70 border border-amber-200/60 shrink-0">
            {isAr ? "وصول محمي" : "Accès Restreint"}
          </span>
        </div>
      )}

      {/* OPERATIONAL STATUS PIPELINE */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Link
          href={`/${locale}/admin/orders`}
          className="group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span>{isAr ? "طلبيات جديدة" : "Nouvelles"}</span>
            </div>
            {newOrdersCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">
              {newOrdersCount}
            </span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {isAr ? "بحاجة تأكيد" : "À confirmer"}
            </span>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/orders`}
          className="group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Package className="w-3.5 h-3.5" />
              </div>
              <span>{isAr ? "قيد التحضير" : "En Préparation"}</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">
              {preparingOrdersCount}
            </span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {isAr ? "في الورشة" : "En cours"}
            </span>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/orders`}
          className="group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 hover:border-purple-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span>{isAr ? "مع شركة التوصيل" : "En Livraison"}</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">
              {shippedOrdersCount}
            </span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {isAr ? "EcoTrack" : "En route"}
            </span>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/orders`}
          className="group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 hover:border-rose-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <span>{isAr ? "إلغاء / مرتجع" : "Annulées / Retours"}</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">
              {cancelledOrdersCount}
            </span>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              {isAr ? "متابعة" : "Incidents"}
            </span>
          </div>
        </Link>
      </div>

      {/* RECENT ORDERS CARD (Modern Shadcn Card) */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 pb-4 border-b border-zinc-100">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900">
              {isAr ? "أحدث طلبيات الدفع عند الاستلام (COD)" : "Dernières Commandes COD Récentes"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              {isAr
                ? "متابعة مباشرة للطلبيات، الزبائن والولايات في الوقت الفعلي."
                : "Flux des commandes reçues avec état de validation et livraison."}
            </CardDescription>
          </div>
          <Link href={`/${locale}/admin/orders`} className="self-start sm:self-auto shrink-0">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg">
              <span>{isAr ? "فتح إدارة الطلبيات" : "Gérer les commandes"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              <p className="font-semibold text-zinc-800 text-sm">
                {isAr ? "لا توجد طلبات جديدة حتى الآن" : "Aucune commande pour le moment"}
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {isAr
                  ? "ستظهر الطلبات هنا فور قيام الزبائن بإتمام عملية الشراء من المتجر."
                  : "Les commandes des clients s'afficheront ici en direct dès leur validation."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Recent Orders Cards (< md) */}
              <div className="md:hidden divide-y divide-zinc-100">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/${locale}/admin/orders`}
                    className="block p-4 space-y-2 hover:bg-zinc-50/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-zinc-900">
                        {order.reference}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === "new"
                            ? "bg-amber-50 text-amber-800 border border-amber-200/70"
                            : order.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                            : order.status === "preparing"
                            ? "bg-blue-50 text-blue-800 border border-blue-200/70"
                            : order.status === "shipped"
                            ? "bg-purple-50 text-purple-800 border border-purple-200/70"
                            : order.status === "delivered"
                            ? "bg-teal-50 text-teal-800 border border-teal-200/70"
                            : "bg-rose-50 text-rose-800 border border-rose-200/70"
                        }`}
                      >
                        {order.status === "new"
                          ? isAr ? "جديدة" : "Nouvelle"
                          : order.status === "confirmed"
                          ? isAr ? "مؤكدة" : "Confirmée"
                          : order.status === "preparing"
                          ? isAr ? "تحضير" : "Préparation"
                          : order.status === "shipped"
                          ? isAr ? "شحن" : "Expédiée"
                          : order.status === "delivered"
                          ? isAr ? "تم التسليم" : "Livrée"
                          : isAr ? "ملغاة" : "Annulée"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">{order.customer.name}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">{order.customer.phone}</p>
                      </div>
                      <span className="font-bold text-zinc-900 shrink-0">
                        {formatPrice(order.total, locale)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium truncate">
                        {order.wilaya}
                        {order.commune ? ` • ${order.commune}` : ""}
                      </span>
                      <span className="truncate text-zinc-400">
                        {order.items.map((i) => `${i.name}${i.size ? ` (${i.size})` : ""}`).join(", ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-zinc-50/80 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-100">
                  <tr>
                    <th className="py-3 px-4">Réf</th>
                    <th className="py-3 px-4">{isAr ? "الزبون" : "Client"}</th>
                    <th className="py-3 px-4">{isAr ? "الولاية والبلدية" : "Destination"}</th>
                    <th className="py-3 px-4">{isAr ? "المنتجات" : "Sélection"}</th>
                    <th className="py-3 px-4">{isAr ? "المبلغ" : "Total COD"}</th>
                    <th className="py-3 px-4">{isAr ? "الحالة" : "Statut"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                  {recentOrders.map((order) => {
                    const initials = order.customer.name
                      ? order.customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "CL";

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-zinc-50/70 transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900">
                          {order.reference}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 border-none bg-zinc-100">
                              <AvatarFallback className="bg-zinc-100 text-zinc-700 text-[10px] font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-zinc-900 leading-tight">
                                {order.customer.name}
                              </p>
                              <p className="text-[11px] text-zinc-400 font-mono">
                                {order.customer.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700">
                            {order.wilaya}
                            {order.commune ? ` • ${order.commune}` : ""}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 max-w-xs truncate">
                          {order.items
                            .map((i) => `${i.name}${i.size ? ` (${i.size})` : ""}`)
                            .join(", ")}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">
                          {formatPrice(order.total, locale)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight ${
                              order.status === "new"
                                ? "bg-amber-50 text-amber-800 border border-amber-200/70"
                                : order.status === "confirmed"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                                : order.status === "preparing"
                                ? "bg-blue-50 text-blue-800 border border-blue-200/70"
                                : order.status === "shipped"
                                ? "bg-purple-50 text-purple-800 border border-purple-200/70"
                                : order.status === "delivered"
                                ? "bg-teal-50 text-teal-800 border border-teal-200/70"
                                : "bg-rose-50 text-rose-800 border border-rose-200/70"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                order.status === "new"
                                  ? "bg-amber-500 animate-pulse"
                                  : order.status === "confirmed"
                                  ? "bg-emerald-500"
                                  : order.status === "preparing"
                                  ? "bg-blue-500"
                                  : order.status === "shipped"
                                  ? "bg-purple-500"
                                  : order.status === "delivered"
                                  ? "bg-teal-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {order.status === "new"
                              ? isAr ? "جديدة" : "Nouvelle"
                              : order.status === "confirmed"
                              ? isAr ? "مؤكدة" : "Confirmée"
                              : order.status === "preparing"
                              ? isAr ? "تحضير" : "Préparation"
                              : order.status === "shipped"
                              ? isAr ? "شحن" : "Expédiée"
                              : order.status === "delivered"
                              ? isAr ? "تم التسليم" : "Livrée"
                              : isAr ? "ملغاة" : "Annulée"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
