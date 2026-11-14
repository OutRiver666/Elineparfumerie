import React from "react";
import Link from "next/link";
import { Locale, getDictionary } from "@/lib/i18n";
import { StatCard } from "@/components/admin/stat-card";
import { getRevenueAnalytics, getOrders } from "@/lib/services/orders.service";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const cancelledOrdersCount = orders.filter(
    (o) => o.status === "cancelled" || o.status === "returned"
  ).length;

  const recentOrders = orders.slice(0, 5);

  const revenueMetrics = [
    {
      title: locale === "ar" ? "إجمالي الطلبات (Ordered)" : "Revenu Commandé",
      value: formatPrice(analytics.orderedRevenueDZD, locale),
      subtitle: locale === "ar" ? "كل الطلبيات المسجلة عبر الموقع" : "Volume brut des commandes passées",
      trend: `${analytics.totalOrdersCount} cmd`,
      variant: "default" as const,
    },
    {
      title: locale === "ar" ? "المبيعات المؤكدة (Confirmed)" : "Revenu Confirmé",
      value: formatPrice(analytics.confirmedRevenueDZD, locale),
      subtitle: locale === "ar" ? "تم التحقق منها هاتفياً وجاهزة للشحن" : "Confirmé au téléphone avec les clients",
      trend: "Validation",
      variant: "default" as const,
    },
    {
      title: locale === "ar" ? "الطلبات المسلّمة (Delivered)" : "Revenu Livré",
      value: formatPrice(analytics.deliveredRevenueDZD, locale),
      subtitle: locale === "ar" ? "استلمها الزبائن في الولايات" : "Colis remis en main propre aux clients",
      trend: `${analytics.deliveredOrdersCount} livrées`,
      variant: "highlight" as const,
    },
    {
      title: locale === "ar" ? "المبالغ المحصلة (Collected)" : "Fonds Encaissés (Cash)",
      value: formatPrice(analytics.collectedRevenueDZD, locale),
      subtitle: locale === "ar" ? "أموال محصلة ومودعة فعلياً" : "Montant net viré par les transporteurs",
      trend: "Encaissé",
      variant: "accent" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "مؤشرات الأداء المالي والتشغيلي" : "Performance Commerciale & Logistique"}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
            {locale === "ar" ? "لوحة المتابعة الشاملة" : "Vue Générale de l'Activité"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {authInfo.permissions.products_manage && (
            <Link href={`/${locale}/admin/products`}>
              <Button variant="default" size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{locale === "ar" ? "إضافة عطر جديد" : "Créer un parfum"}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 4 REVENUE STAT CARDS (Ordered / Confirmed / Delivered / Collected) - Filtered by sales_analytics */}
      {authInfo.permissions.sales_analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueMetrics.map((metric) => (
            <StatCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              trend={metric.trend}
              variant={metric.variant}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-[4px] bg-luxury-secondary/60 border border-luxury-border/40 flex items-center justify-between text-xs text-luxury-text-secondary">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-luxury-accent shrink-0" />
            <span>
              {locale === "ar"
                ? "البيانات المالية والمداخيل اليومية محجوبة عن هذا الحساب (خاصة بالإدارة العليا)"
                : "Chiffre d'affaires & statistiques financières confidentielles masquées pour votre profil."}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-luxury-accent px-2 py-0.5 rounded bg-luxury-secondary">
            {locale === "ar" ? "أمان مالي" : "Accès Restreint"}
          </span>
        </div>
      )}

      {/* OPERATIONAL STATUS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-muted text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{locale === "ar" ? "طلبيات جديدة" : "Nouvelles Commandes"}</span>
          </div>
          <span className="text-xl font-semibold text-luxury-text">{newOrdersCount}</span>
        </div>

        <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-muted text-xs mb-1">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span>{locale === "ar" ? "قيد التحضير في الورشة" : "En Préparation"}</span>
          </div>
          <span className="text-xl font-semibold text-luxury-text">{preparingOrdersCount}</span>
        </div>

        <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-muted text-xs mb-1">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            <span>{locale === "ar" ? "مع شركة التوصيل" : "En Cours de Livraison"}</span>
          </div>
          <span className="text-xl font-semibold text-luxury-text">{shippedOrdersCount}</span>
        </div>

        <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-muted text-xs mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span>{locale === "ar" ? "ملغاة أو مرتجعة" : "Annulées / Retours"}</span>
          </div>
          <span className="text-xl font-semibold text-luxury-text">{cancelledOrdersCount}</span>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-[4px] border border-luxury-border/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-lg font-medium text-luxury-text">
              {locale === "ar" ? "أحدث الطلبيات المسجلة" : "Dernières Commandes COD"}
            </h3>
            <p className="text-xs text-luxury-text-secondary">
              {locale === "ar" ? "متابعة فورية للحالة والتسليم في الولايات" : "Flux temps réel des commandes à traiter"}
            </p>
          </div>
          <Link href={`/${locale}/admin/orders`}>
            <Button variant="ghost" size="sm" className="text-xs">
              <span>{locale === "ar" ? "عرض كل الطلبيات" : "Voir toutes les commandes"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 rtl:ml-0 rtl:mr-1" />
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-luxury-text-muted text-xs">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-luxury-border" />
            <p className="font-medium text-luxury-text text-sm">
              {locale === "ar" ? "لا توجد طلبات جديدة حتى الآن" : "Aucune commande pour le moment"}
            </p>
            <p className="text-xs text-luxury-text-muted mt-1">
              {locale === "ar"
                ? "ستظهر الطلبات هنا فور قيام الزبائن بإتمام عملية الشراء من المتجر."
                : "Les commandes des clients s'afficheront ici en direct dès leur validation."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-luxury-secondary/60 text-luxury-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Réf</th>
                  <th className="py-2.5 px-3">{locale === "ar" ? "الزبون" : "Client"}</th>
                  <th className="py-2.5 px-3">{locale === "ar" ? "الولاية" : "Wilaya"}</th>
                  <th className="py-2.5 px-3">{locale === "ar" ? "المنتجات" : "Sélection"}</th>
                  <th className="py-2.5 px-3">{locale === "ar" ? "المبلغ" : "Total"}</th>
                  <th className="py-2.5 px-3">{locale === "ar" ? "الحالة" : "Statut"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/30 text-luxury-text">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-luxury-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-semibold font-mono">{order.reference}</td>
                    <td className="py-3 px-3 font-medium">{order.customer.name}</td>
                    <td className="py-3 px-3 text-luxury-text-secondary">
                      {order.wilaya} — {order.commune}
                    </td>
                    <td className="py-3 px-3 text-luxury-text-secondary max-w-xs truncate">
                      {order.items.map((i) => `${i.name} (${i.size})`).join(", ")}
                    </td>
                    <td className="py-3 px-3 font-semibold">{formatPrice(order.total, locale)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-[3px] text-[10px] font-semibold ${
                          order.status === "confirmed"
                            ? "bg-amber-100 text-amber-900"
                            : order.status === "preparing"
                            ? "bg-blue-100 text-blue-900"
                            : order.status === "shipped"
                            ? "bg-purple-100 text-purple-900"
                            : order.status === "delivered"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
