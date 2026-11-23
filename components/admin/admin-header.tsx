"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, LogOut, Loader2, Menu } from "lucide-react";
import { Locale, getDictionary } from "@/lib/i18n";
import { adminLogout } from "@/lib/actions/auth";
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
  onOpenMobileMenu?: () => void;
  newOrdersCount?: number;
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
  onOpenMobileMenu,
  newOrdersCount = 0,
}: AdminHeaderProps) {
  const pathname = usePathname() || "";
  const dict = getDictionary(locale);
  const isAr = locale === "ar";
  const [isLoggingOut, startTransition] = useTransition();

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
    <header className="h-14 sm:h-16 flex-shrink-0 bg-white border-b border-zinc-200/80 px-3 sm:px-6 flex items-center justify-between gap-2 sticky top-0 z-20 select-none font-outfit shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Button */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label={isAr ? "فتح القائمة" : "Ouvrir le menu"}
            className="lg:hidden relative p-2 -ms-1 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
            {newOrdersCount > 0 && (
              <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>
        )}

        <h1 className="font-outfit text-sm sm:text-base lg:text-lg font-bold text-zinc-900 tracking-tight truncate">
          {title || (isAr ? "لوحة الإدارة" : "Tableau de Bord")}
        </h1>
        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {isAr ? "متصل بالنظام" : "Système en ligne"}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Language switch */}
        <Link
          href={switchLangHref}
          className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 px-2 sm:px-2.5 py-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 transition-colors"
        >
          <Globe className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span>{dict.nav.switchLang}</span>
        </Link>

        {/* User profile badge with Avatar */}
        <div className="flex items-center gap-2 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 p-1 sm:px-2.5 sm:py-1 rounded-lg">
          <Avatar className="h-7 w-7 border-none shrink-0">
            <AvatarFallback
              className={
                userRole === "owner"
                  ? "bg-amber-600 text-white font-bold text-[11px]"
                  : "bg-zinc-900 text-white font-bold text-[11px]"
              }
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-start leading-tight max-w-[140px]">
            <p className="font-semibold text-xs text-zinc-900 truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-zinc-400 truncate">
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
          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
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
