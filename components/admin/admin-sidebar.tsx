"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  FlaskConical,
  Boxes,
  Tag,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Locale } from "@/lib/i18n";
import { AdminPermissions, AdminPermissionKey } from "@/types/admin-role";

interface AdminSidebarProps {
  locale?: Locale;
  ordersCount?: number;
  newOrdersCount?: number;
  permissions?: AdminPermissions;
  userRole?: string;
}

export function AdminSidebar({
  locale = "fr",
  ordersCount = 0,
  newOrdersCount = 0,
  permissions,
  userRole = "owner",
}: AdminSidebarProps) {
  const pathname = usePathname() || "";
  const isOwner = userRole === "owner";

  const allNavigationGroups: {
    title: string;
    items: {
      label: string;
      href: string;
      icon: any;
      permissionKey?: AdminPermissionKey;
      badge?: string;
      isNewBadge?: boolean;
      newCount?: number;
    }[];
  }[] = [
    {
      title: locale === "ar" ? "نظرة عامة" : "Tableau de Bord",
      items: [
        {
          label: locale === "ar" ? "المؤشرات العامة" : "Vue Générale",
          href: `/${locale}/admin`,
          icon: LayoutDashboard,
          permissionKey: "overview",
        },
      ],
    },
    {
      title: locale === "ar" ? "المبيعات والطلبيات" : "Ventes & Logistique",
      items: [
        {
          label: locale === "ar" ? "الطلبيات" : "Commandes COD",
          href: `/${locale}/admin/orders`,
          icon: ShoppingBag,
          permissionKey: "orders_view",
          badge: ordersCount > 0 ? String(ordersCount) : undefined,
          isNewBadge: newOrdersCount > 0,
          newCount: newOrdersCount,
        },
        {
          label: locale === "ar" ? "المداخيل والتقارير" : "Revenus & Rapports",
          href: `/${locale}/admin/sales`,
          icon: TrendingUp,
          permissionKey: "sales_analytics",
        },
      ],
    },
    {
      title: locale === "ar" ? "الكتالوج والعطور" : "Catalogue & Parfums",
      items: [
        {
          label: locale === "ar" ? "العطور والأسعار" : "Parfums & Tarifs",
          href: `/${locale}/admin/products`,
          icon: Package,
          permissionKey: "products_view",
        },
        {
          label: locale === "ar" ? "المجموعات والتصنيفات" : "Collections & Familles",
          href: `/${locale}/admin/catalog/collections`,
          icon: Layers,
          permissionKey: "packs_manage",
        },
      ],
    },
    {
      title: locale === "ar" ? "الباقات والعروض" : "Offres & Packs",
      items: [
        {
          label: locale === "ar" ? "الباقات الجاهزة" : "Packs Prédéfinis",
          href: `/${locale}/admin/packs`,
          icon: Boxes,
          permissionKey: "packs_manage",
        },
        {
          label: locale === "ar" ? "قواعد الباقات المخصصة" : "Règles Packs Sur-Mesure",
          href: `/${locale}/admin/packs/rules`,
          icon: Tag,
          permissionKey: "packs_manage",
        },
      ],
    },
    {
      title: locale === "ar" ? "المخزون والورشة" : "Atelier & Stocks",
      items: [
        {
          label: locale === "ar" ? "الزيوت والكحول والعبوات" : "Matières & Packaging",
          href: `/${locale}/admin/inventory`,
          icon: Boxes,
          permissionKey: "inventory_production",
        },
        {
          label: locale === "ar" ? "التركيب ودفعات الإنتاج" : "Formulations & Lots",
          href: `/${locale}/admin/production`,
          icon: FlaskConical,
          permissionKey: "inventory_production",
        },
      ],
    },
    {
      title: locale === "ar" ? "تخصيص المتجر" : "Vitrine & Médias",
      items: [
        {
          label: locale === "ar" ? "صور الواجهة والبنرات" : "Visuels & Bannières Hero",
          href: `/${locale}/admin/ui-controller`,
          icon: SlidersHorizontal,
          permissionKey: "ui_controller",
        },
      ],
    },
    {
      title: locale === "ar" ? "الإعدادات والفريق" : "Équipe & Système",
      items: [
        {
          label: locale === "ar" ? "فريق العمل والصلاحيات" : "Équipe & Rôles (RBAC)",
          href: `/${locale}/admin/team`,
          icon: Users,
          permissionKey: "settings_team",
        },
        {
          label: locale === "ar" ? "تسعيرة الولايات والشحن" : "Livraison & Paramètres",
          href: `/${locale}/admin/settings`,
          icon: Settings,
          permissionKey: "settings_team",
        },
      ],
    },
  ];

  // Filter groups according to permissions
  const navigationGroups = allNavigationGroups
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        if (isOwner) return true;
        if (!item.permissionKey) return true;
        if (!permissions) return false;
        return Boolean(permissions[item.permissionKey]);
      });
      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-zinc-200/80 h-screen sticky top-0 flex flex-col z-20 select-none font-outfit">
      {/* Brand Logo in Admin */}
      <div className="h-16 flex-shrink-0 flex items-center px-5 border-b border-zinc-200/80 bg-white">
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-amber-200 font-serif font-bold text-sm shadow-xs group-hover:bg-black transition-colors">
            É
          </div>
          <div className="flex flex-col">
            <span className="font-outfit text-sm font-bold tracking-tight text-zinc-900 group-hover:text-black">
              Éline Parfumerie
            </span>
            <span className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">
              {locale === "ar" ? "لوحة الإدارة المركزية" : "Studio Admin"}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Group list */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h5 className="px-3 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              {group.title}
            </h5>
            <div className="space-y-0.5 pt-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-zinc-900 text-white font-semibold shadow-xs"
                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-amber-300" : "text-zinc-400 group-hover:text-zinc-600"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-xs",
                          (item as any).isNewBadge
                            ? "bg-amber-500 text-white ring-2 ring-amber-400/30 animate-pulse"
                            : isActive
                            ? "bg-white/20 text-white"
                            : "bg-zinc-100 text-zinc-700"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Storefront return link */}
      <div className="p-3 border-t border-zinc-200/80 flex-shrink-0 bg-white">
        <Link
          href={`/${locale}`}
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 rounded-lg bg-zinc-50 border border-zinc-200/60 hover:bg-zinc-100/80 transition-all"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {locale === "ar" ? "زيارة المتجر المباشر" : "Voir la boutique"}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
        </Link>
      </div>
    </aside>
  );
}
