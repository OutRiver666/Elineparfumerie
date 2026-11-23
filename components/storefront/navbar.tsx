"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ShieldCheck, Search, X } from "lucide-react";
import { CartIconBadge } from "@/components/storefront/cart-icon-badge";
import { NavbarSearch, NavbarSearchProduct } from "@/components/storefront/navbar-search";
import { Locale, getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface NavbarProps {
  locale?: Locale;
  products?: NavbarSearchProduct[];
}

export function Navbar({ locale = "fr", products = [] }: NavbarProps) {
  const pathname = usePathname() || "";
  const dict = getDictionary(locale);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const isSearchActive = mobileSearchOpen || desktopSearchOpen;

  const nextLocale: Locale = locale === "fr" ? "ar" : "fr";
  const switchLangHref = pathname.startsWith(`/${locale}`)
    ? pathname.replace(`/${locale}`, `/${nextLocale}`)
    : `/${nextLocale}${pathname}`;

  const desktopNavLinks = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/shop`, label: dict.nav.shop },
    { href: `/${locale}/packs`, label: dict.nav.packs },
    { href: `/${locale}/packs/builder`, label: dict.nav.buildPack, highlight: true },
  ];

  const mobileNavLinks = [
    { href: `/${locale}/shop`, label: dict.nav.shop },
    { href: `/${locale}/packs`, label: dict.nav.packs },
    { href: `/${locale}/packs/builder`, label: dict.nav.buildPack, highlight: true },
  ];

  return (
    <>
      {/* Full-page soft blur backdrop when search is open (desktop or mobile) */}
      {isSearchActive && (
        <div
          aria-hidden="true"
          onClick={() => {
            setMobileSearchOpen(false);
            setDesktopSearchOpen(false);
          }}
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-sm transition-opacity duration-200"
        />
      )}

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md transition-all duration-200 border-b border-luxury-border/30">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-luxury-secondary py-1.5 px-4 text-center text-[10.5px] sm:text-[11px] text-luxury-text-secondary tracking-wide border-b border-luxury-border/40">
        <div className="container mx-auto flex items-center justify-center space-x-2 rtl:space-x-reverse">
          <ShieldCheck className="w-3.5 h-3.5 text-luxury-accent inline-block shrink-0" />
          <span className="sm:hidden">
            {locale === "ar"
              ? "توصيل إلى 58 ولاية • الدفع عند الاستلام"
              : "Livraison 58 Wilayas d'Algérie • Paiement à la livraison"}
          </span>
          <span className="hidden sm:inline">{dict.nav.freeShippingNotice}</span>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Mobile: Language Switcher Button (shows opposite language: AR when fr, FR when ar) */}
          <div className="flex items-center md:hidden">
            <Link
              href={switchLangHref}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-luxury-border/70 bg-luxury-secondary/50 hover:bg-luxury-secondary transition-all active:scale-95"
              title={locale === "fr" ? "Passer en Arabe (العربية)" : "Passer en Français"}
            >
              <Globe className="h-3.5 w-3.5 text-luxury-accent shrink-0" />
              <span className="text-xs font-bold tracking-wider text-luxury-accent uppercase">
                {locale === "fr" ? "AR" : "FR"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links - Left */}
          <nav className="hidden md:flex items-center space-x-7 rtl:space-x-reverse">
            {desktopNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs uppercase tracking-wider transition-colors duration-200 font-medium py-1 relative",
                  link.highlight
                    ? "text-luxury-accent hover:text-luxury-accent-hover font-semibold"
                    : "text-luxury-text-secondary hover:text-luxury-text",
                  (pathname === link.href || (link.href !== `/${locale}` && pathname.startsWith(link.href))) &&
                    "text-luxury-text font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-luxury-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Luxury Brand Logo / Title */}
          <div className="text-center">
            <Link href={`/${locale}`} className="group inline-block">
              <span className="block font-serif text-2xl sm:text-3xl tracking-[0.2em] font-medium text-luxury-text uppercase group-hover:text-luxury-accent transition-colors">
                Éline
              </span>
              <span className="block text-[8.5px] sm:text-[9px] tracking-[0.35em] text-luxury-text-muted uppercase -mt-1 font-sans">
                Parfumerie
              </span>
            </Link>
          </div>

          {/* Right Action Icons: Search, Language (Desktop), Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Product Search Bar - Desktop */}
            <NavbarSearch
              locale={locale}
              products={products}
              variant="desktop"
              onOpenChange={setDesktopSearchOpen}
              forceClosed={!desktopSearchOpen}
            />

            {/* Mobile Search Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label={locale === "ar" ? "بحث عن عطر" : "Rechercher un parfum"}
              className={cn(
                "md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border transition-colors cursor-pointer",
                mobileSearchOpen
                  ? "bg-luxury-accent text-white border-luxury-accent"
                  : "bg-luxury-secondary/50 text-luxury-text border-luxury-border/60 hover:bg-luxury-secondary"
              )}
            >
              {mobileSearchOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>

            {/* Language Switcher - Desktop */}
            <Link
              href={switchLangHref}
              className="hidden md:inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs uppercase tracking-wider text-luxury-text-secondary hover:text-luxury-text px-2.5 py-1 rounded-[4px] hover:bg-luxury-secondary transition-colors"
              title="Changer de langue / تغيير اللغة"
            >
              <Globe className="h-3.5 w-3.5 text-luxury-accent" />
              <span>{dict.nav.switchLang}</span>
            </Link>

            {/* Cart Button — live count from CartContext */}
            <CartIconBadge locale={locale} />
          </div>
        </div>

        {/* Mobile Expandable Product Search Bar */}
        {mobileSearchOpen && (
          <NavbarSearch
            locale={locale}
            products={products}
            variant="mobile-panel"
            onCloseMobile={() => setMobileSearchOpen(false)}
          />
        )}

        {/* Mobile Sub-Navigation Bar: Under the logo in the same bar */}
        <div className="md:hidden border-t border-luxury-border/30 py-2 px-1">
          <nav className="flex items-center justify-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar">
            {mobileNavLinks.map((link, idx) => {
              const isActive =
                link.href === `/${locale}/packs`
                  ? pathname === `/${locale}/packs`
                  : pathname.startsWith(link.href);

              return (
                <React.Fragment key={link.href}>
                  {idx > 0 && (
                    <span className="text-luxury-border/60 text-[10px] select-none shrink-0">
                      •
                    </span>
                  )}
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-150 py-1 px-2 whitespace-nowrap rounded-[3px]",
                      link.highlight
                        ? isActive
                          ? "bg-luxury-accent text-white font-bold shadow-xs"
                          : "text-luxury-accent hover:text-luxury-accent-hover font-semibold bg-luxury-accent/10 border border-luxury-accent/30"
                        : isActive
                        ? "text-luxury-accent font-semibold bg-luxury-secondary"
                        : "text-luxury-text-secondary hover:text-luxury-text font-medium"
                    )}
                  >
                    {link.label}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
    </>
  );
}
