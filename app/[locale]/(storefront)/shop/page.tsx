import React from "react";
import { Locale, getDictionary } from "@/lib/i18n";
import { getProducts } from "@/lib/services/products.service";
import { ShopFilters } from "@/components/storefront/shop-filters";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ season?: string; gender?: string; family?: string }>;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const locale = (resolvedParams.locale as Locale) || "fr";
  const dict = getDictionary(locale);

  // Fetch all published products from backend service
  const allProducts = await getProducts();
  const initialSeason = resolvedSearchParams.season || "all";
  const initialGender = resolvedSearchParams.gender || "all";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      {/* Editorial Header */}
      <div className="max-w-2xl mb-10">
        <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-2">
          {dict.shop.subtitle}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-luxury-text mb-3">
          {dict.shop.title}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-text-secondary leading-relaxed font-light">
          {locale === "ar"
            ? "اكتشف خلاصاتنا العطرية الفاخرة، المصنوعة بحرفية عالية بنسب تركيز متفاوتة وأحجام متعددة تلائم كل اللحظات والمناسبات."
            : "Chaque composition est le fruit d'une macération précise et d'ingrédients nobles. Choisissez votre sillage et votre contenance idéale."}
        </p>
      </div>

      {/* Interactive Filters, Live Search, Sort & Product Grid */}
      <ShopFilters
        initialProducts={allProducts}
        initialSeason={initialSeason}
        initialGender={initialGender}
        locale={locale}
      />
    </div>
  );
}
