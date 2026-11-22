"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, LogOut, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { Locale, getDictionary } from "@/lib/i18n";
import { adminLogout } from "@/lib/actions/auth";
import { setSimulatedRoleAction } from "@/lib/actions/team";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <header className="h-16 flex-shrink-0 bg-white border-b border-zinc-200/80 px-6 flex items-center justify-between sticky top-0 z-10 select-none font-outfit shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <h1 className="font-outfit text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
          {title || (isAr ? "لوحة الإدارة والمبيعات" : "Tableau de Bord & Ventes")}
        </h1>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {isAr ? "متصل بالنظام" : "Système en ligne"}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Simulator Selector (Accessible to Super Admin) */}
        {isRealOwner && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline text-[10px] uppercase font-bold text-amber-800">
              {isAr ? "معاينة:" : "Test rôle:"}
            </span>
            <select
              value={simulatedRole || "real_owner"}
              disabled={isSimulatingTransition}
              onChange={(e) => handleRoleSimulationChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-amber-900 border-none outline-none cursor-pointer focus:ring-0 py-0 pe-1"
            >
              <option value="real_owner">{isAr ? "👑 المدير العام (Super Admin)" : "👑 Super Admin"}</option>
              <option value="order_manager">{isAr ? "📞 مؤكد الطلبيات (Call Center)" : "📞 Confirmateur"}</option>
              <option value="catalog_manager">{isAr ? "🧴 مسير المنتجات والمخزون" : "🧴 Catalogue & Stock"}</option>
              <option value="vitrine_manager">{isAr ? "🎨 مسؤول الواجهة والآراء" : "🎨 Vitrine & Avis"}</option>
            </select>
          </div>
        )}

        {/* Language switch */}
        <Link
          href={switchLangHref}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 transition-colors"
        >
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span>{dict.nav.switchLang}</span>
        </Link>

        {/* User profile badge with Avatar */}
        <div className="flex items-center gap-2.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 px-2.5 py-1 rounded-lg">
          <Avatar className="h-7 w-7 border-none">
            <AvatarFallback
              className={
                userRole === "owner"
                  ? "bg-amber-600 text-white font-bold"
                  : "bg-zinc-900 text-white font-bold"
              }
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-start leading-tight">
            <p className="font-semibold text-xs text-zinc-900">
              {displayName}
            </p>
            <p className="text-[10px] text-zinc-400">
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
          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
