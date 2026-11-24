import React from "react";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { Locale } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart-context";
import { getStoreSettings } from "@/lib/services/settings.service";
import { getProducts } from "@/lib/services/products.service";
import { getStorefrontContent } from "@/lib/services/storefront-content.service";
import {
  resolveStorefrontThemeId,
  STOREFRONT_THEME_MAP,
} from "@/lib/themes/storefront-themes";
import type { NavbarSearchProduct } from "@/components/storefront/navbar-search";

export const dynamic = "force-dynamic";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function StorefrontLayout({
  children,
  params,
}: StorefrontLayoutProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const [storeSettings, products, storefrontContent] = await Promise.all([
    getStoreSettings(),
    getProducts(),
    getStorefrontContent(),
  ]);

  const activeThemeId = resolveStorefrontThemeId(storefrontContent.themeId);
  const activeTheme = STOREFRONT_THEME_MAP[activeThemeId];

  const searchableProducts: NavbarSearchProduct[] = products.map((p) => {
    const prices = p.variants.map((v) => v.priceDZD).filter((n) => n > 0);
    return {
      id: p.id,
      slug: p.slug,
      nameFr: p.name.fr,
      nameAr: p.name.ar,
      familyFr: p.family.fr,
      familyAr: p.family.ar,
      image: p.images?.[0] || p.landingPageImages?.[0] || "",
      minPriceDZD: prices.length > 0 ? Math.min(...prices) : 0,
      classification: p.classification,
      isBestseller: p.isBestseller,
    };
  });

  return (
    <CartProvider>
      <div
        className="storefront-theme flex min-h-screen flex-col bg-luxury-bg text-luxury-text transition-colors duration-300"
        data-theme={activeThemeId}
        data-theme-mode={activeTheme.mode}
      >
        <Navbar locale={locale} products={searchableProducts} themeId={activeThemeId} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} settings={storeSettings} themeId={activeThemeId} />
      </div>
    </CartProvider>
  );
}
