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
      title: locale === "ar" ? "نظرة عامة" : "OVERVIEW",
      items: [
        {
          label: locale === "ar" ? "لوحة المؤشرات" : "Tableau de Bord",
          href: `/${locale}/admin`,
          icon: LayoutDashboard,
          permissionKey: "overview",
        },
      ],
    },
    {
      title: locale === "ar" ? "المبيعات" : "SALES",
      items: [
        {
          label: locale === "ar" ? "الطلبيات" : "Commandes",
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
      title: locale === "ar" ? "دليل المنتجات" : "CATALOG",
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
      title: locale === "ar" ? "الباقات والعروض" : "PACKS",
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
      title: locale === "ar" ? "المخزون والورشة" : "INVENTORY & PRODUCTION",
      items: [
        {
          label: locale === "ar" ? "الزيوت والكحول ومواد التعبئة" : "Matières & Packaging",
          href: `/${locale}/admin/inventory`,
          icon: Boxes,
          permissionKey: "inventory_production",
        },
        {
          label: locale === "ar" ? "التركيب ودفعات الإنتاج" : "Formulations & Batches",
          href: `/${locale}/admin/production`,
          icon: FlaskConical,
          permissionKey: "inventory_production",
        },
      ],
    },
    {
      title: locale === "ar" ? "واجهة المتجر" : "VITRINE & CONTENU",
      items: [
        {
          label: locale === "ar" ? "تخصيص الواجهة والصور" : "Visuels & Bannières (Hero)",
          href: `/${locale}/admin/ui-controller`,
          icon: SlidersHorizontal,
          permissionKey: "ui_controller",
        },
      ],
    },
    {
      title: locale === "ar" ? "الإعدادات والفريق" : "SETTINGS & TEAM",
      items: [
        {
          label: locale === "ar" ? "فريق العمل والصلاحيات" : "Équipe & Rôles (RBAC)",
          href: `/${locale}/admin/team`,
          icon: Users,
          permissionKey: "settings_team",
        },
        {
          label: locale === "ar" ? "تسعيرة الولايات والتهيئة" : "Livraison & Paramètres",
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
    <aside className="w-64 flex-shrink-0 bg-white border-r border-luxury-border/30 h-screen sticky top-0 flex flex-col z-20 select-none">
      {/* Brand Logo in Admin (Fixed at top) */}
      <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-luxury-border/30 bg-white">
        <Link href={`/${locale}`} className="group flex items-baseline space-x-2 rtl:space-x-reverse">
          <span className="font-serif text-lg tracking-[0.18em] font-medium text-luxury-text uppercase">
            Éline
          </span>
          <span className="text-[9px] uppercase tracking-widest text-luxury-accent font-semibold">
            {locale === "ar" ? "الإدارة" : "Studio"}
          </span>
        </Link>
      </div>

      {/* Navigation Group list (Scrolls inside sidebar if needed) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h5 className="px-3 text-[10px] uppercase tracking-wider text-luxury-text-muted font-semibold">
              {group.title}
            </h5>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-[4px] text-xs font-medium transition-colors",
                      isActive
                        ? "bg-luxury-secondary text-luxury-text font-semibold"
                        : "text-luxury-text-secondary hover:bg-luxury-secondary/60 hover:text-luxury-text"
                    )}
                  >
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                      <Icon className={cn("h-4 w-4", isActive ? "text-luxury-accent" : "text-luxury-text-muted")} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        title={
                          (item as any).newCount && (item as any).newCount > 0
                            ? locale === "ar"
                              ? `${(item as any).newCount} طلبية جديدة للتأكيد (من أصل ${item.badge})`
                              : `${(item as any).newCount} nouvelle(s) commande(s) à traiter (sur ${item.badge} au total)`
                            : locale === "ar"
                            ? `${item.badge} طلبية إجمالية`
                            : `${item.badge} commandes au total`
                        }
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold text-white transition-all shadow-xs",
                          (item as any).isNewBadge
                            ? "bg-amber-500 ring-2 ring-amber-300/40 animate-pulse"
                            : "bg-luxury-accent"
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

      {/* Storefront return link (Fixed at bottom) */}
      <div className="p-4 border-t border-luxury-border/30 flex-shrink-0 bg-white">
        <Link
          href={`/${locale}`}
          className="flex items-center justify-between px-3 py-2 text-xs text-luxury-text-secondary hover:text-luxury-text rounded-[4px] bg-luxury-secondary/50 hover:bg-luxury-secondary transition-colors"
        >
          <span>{locale === "ar" ? "العودة إلى المتجر" : "Voir la boutique"}</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
        </Link>
      </div>
    </aside>
  );
}
