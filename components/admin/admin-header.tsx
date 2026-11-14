"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, LogOut, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { Locale, getDictionary } from "@/lib/i18n";
import { adminLogout } from "@/lib/actions/auth";
import { setSimulatedRoleAction } from "@/lib/actions/team";

interface AdminHeaderProps {
  locale?: Locale;
  title?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  isSimulating?: boolean;
  simulatedRole?: string | null;
  isRealOwner?: boolean;
}

export function AdminHeader({
  locale = "fr",
  title,
  userEmail,
  userName,
  userRole = "owner",
  isSimulating = false,
  simulatedRole = null,
  isRealOwner = true,
}: AdminHeaderProps) {
  const pathname = usePathname() || "";
  const dict = getDictionary(locale);
  const isAr = locale === "ar";
  const [isLoggingOut, startTransition] = useTransition();
  const [isSimulatingTransition, startSimTransition] = useTransition();

  const nextLocale: Locale = locale === "fr" ? "ar" : "fr";
  const switchLangHref = pathname.startsWith(`/${locale}`)
    ? pathname.replace(`/${locale}`, `/${nextLocale}`)
    : `/${nextLocale}${pathname}`;

  const displayName = userName || userEmail?.split("@")[0] || (isAr ? "المدير" : "Admin");
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogout(locale);
    });
  };

  const handleRoleSimulationChange = (newRole: string) => {
    startSimTransition(async () => {
      await setSimulatedRoleAction(newRole === "real_owner" ? null : newRole, locale);
      window.location.reload();
    });
  };

  const roleLabel =
    isAr
      ? userRole === "owner"
        ? "المدير العام"
        : userRole === "order_manager"
        ? "مؤكد الطلبيات"
        : userRole === "catalog_manager"
        ? "مسير الكتالوج"
        : userRole === "vitrine_manager"
        ? "مسؤول الواجهة"
        : "صلاحيات مخصصة"
      : userRole === "owner"
      ? "Super Admin"
      : userRole === "order_manager"
      ? "Confirmateur"
      : userRole === "catalog_manager"
      ? "Catalogue & Stock"
      : userRole === "vitrine_manager"
      ? "Vitrine & Avis"
      : "Rôle Personnalisé";

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-luxury-border/30 px-6 flex items-center justify-between sticky top-0 z-10 select-none">
      <div>
        <h1 className="font-serif text-lg font-medium text-luxury-text">
          {title || (isAr ? "لوحة الإدارة والمبيعات" : "Tableau de Bord & Ventes")}
        </h1>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3 rtl:space-x-reverse">
        {/* Role Simulator Selector (Accessible to Super Admin) */}
        {isRealOwner && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-amber-500/10 border border-amber-500/30 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline text-[10px] uppercase font-semibold text-amber-800">
              {isAr ? "معاينة الدور:" : "Tester le rôle:"}
            </span>
            <select
              value={simulatedRole || "real_owner"}
              disabled={isSimulatingTransition}
              onChange={(e) => handleRoleSimulationChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-amber-900 border-none outline-none cursor-pointer focus:ring-0 py-0 pe-2"
            >
              <option value="real_owner">{isAr ? "👑 المدير العام (Super Admin)" : "👑 Réel (Super Admin)"}</option>
              <option value="order_manager">{isAr ? "📞 مؤكد الطلبيات (Call Center)" : "📞 Confirmateur Commandes"}</option>
              <option value="catalog_manager">{isAr ? "🧴 مسير المنتجات والمخزون" : "🧴 Gestionnaire Catalogue"}</option>
              <option value="vitrine_manager">{isAr ? "🎨 مسؤول الواجهة والآراء" : "🎨 Modérateur Vitrine"}</option>
            </select>
          </div>
        )}

        {/* Language switch */}
        <Link
          href={switchLangHref}
          className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs uppercase tracking-wider text-luxury-text-secondary hover:text-luxury-text px-2.5 py-1 rounded-[4px] bg-luxury-secondary/70 transition-colors"
        >
          <Globe className="h-3.5 w-3.5 text-luxury-accent" />
          <span>{dict.nav.switchLang}</span>
        </Link>

        {/* User badge */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-luxury-text bg-luxury-secondary/40 px-2.5 py-1 rounded-[4px]">
          <div
            className={`h-7 w-7 rounded-full text-white flex items-center justify-center font-semibold text-[11px] ${
              userRole === "owner" ? "bg-amber-600" : "bg-luxury-text"
            }`}
          >
            {initials}
          </div>
          <div className="hidden sm:block text-start">
            <p className="font-medium text-[12px] leading-tight text-luxury-text">
              {displayName}
            </p>
            <p className="text-[10px] text-luxury-text-muted">
              {roleLabel}
              {isSimulating && (
                <span className="ms-1 text-amber-700 font-bold">
                  {isAr ? "(معاينة)" : "(Test)"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={isAr ? "تسجيل الخروج" : "Déconnexion"}
          className="p-2 text-luxury-text-muted hover:text-red-600 hover:bg-red-50 rounded-[4px] transition-colors"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
