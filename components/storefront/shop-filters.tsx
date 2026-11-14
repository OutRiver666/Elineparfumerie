"use client";

import React, { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Perfume } from "@/lib/data/mock-perfumes";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Locale, getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
  initialProducts: Perfume[];
  initialSeason?: string;
  initialGender?: string;
  locale?: Locale;
}

export function ShopFilters({
  initialProducts,
  initialSeason = "all",
  initialGender = "all",
  locale = "fr",
}: ShopFiltersProps) {
  const dict = getDictionary(locale);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>(initialGender);
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>(initialSeason);
  const [selectedClassification, setSelectedClassification] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Synchronize state with URL search params changes
  React.useEffect(() => {
    if (initialSeason) setSelectedSeason(initialSeason);
  }, [initialSeason]);

  React.useEffect(() => {
    if (initialGender) setSelectedGender(initialGender);
  }, [initialGender]);

  // Extract available fragrance families
  const families = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      set.add(p.family[locale] || p.family.fr);
    });
    return Array.from(set);
  }, [initialProducts, locale]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameFr = product.name.fr.toLowerCase();
          const nameAr = product.name.ar.toLowerCase();
          const descFr = product.description.fr.toLowerCase();
          const descAr = product.description.ar.toLowerCase();
          const familyFr = product.family.fr.toLowerCase();
          const familyAr = product.family.ar.toLowerCase();

          const matches =
            nameFr.includes(q) ||
            nameAr.includes(q) ||
            descFr.includes(q) ||
            descAr.includes(q) ||
            familyFr.includes(q) ||
            familyAr.includes(q);

          if (!matches) return false;
        }

        // Gender filter
        if (selectedGender !== "all" && product.gender !== selectedGender) {
          return false;
        }

        // Family filter
        if (selectedFamily !== "all") {
          const productFamily = product.family[locale] || product.family.fr;
          if (productFamily !== selectedFamily) return false;
        }

        // Season filter
        if (selectedSeason !== "all") {
          if (!product.seasons.includes(selectedSeason as any)) return false;
        }

        // Classification filter (X4, X8, standard)
        if (selectedClassification !== "all") {
          if (selectedClassification === "standard") {
            if (product.classification) return false;
          } else if (product.classification !== selectedClassification) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const getStartingPrice = (p: Perfume) =>
          Math.min(...p.variants.map((v) => v.priceDZD));

        if (sortBy === "price-asc") {
          return getStartingPrice(a) - getStartingPrice(b);
        }
        if (sortBy === "price-desc") {
          return getStartingPrice(b) - getStartingPrice(a);
        }
        if (sortBy === "name") {
          const nameA = a.name[locale] || a.name.fr;
          const nameB = b.name[locale] || b.name.fr;
          return nameA.localeCompare(nameB);
        }
        // Default: featured first, then bestsellers
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    initialProducts,
    searchQuery,
    selectedGender,
    selectedFamily,
    selectedSeason,
    selectedClassification,
    sortBy,
    locale,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedGender !== "all" ||
    selectedFamily !== "all" ||
    selectedSeason !== "all" ||
    selectedClassification !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedGender("all");
    setSelectedFamily("all");
    setSelectedSeason("all");
    setSelectedClassification("all");
    setSortBy("featured");
  };

  return (
    <div className="space-y-8">
      {/* Search Bar & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.nav.searchPlaceholder}
            className="pl-10 pr-10 rtl:pl-10 rtl:pr-10 h-11 bg-luxury-secondary/70 focus-visible:bg-white text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-luxury-text-muted hover:text-luxury-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Mobile Trigger */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden text-xs flex items-center gap-1.5"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-luxury-accent" />
            <span>{locale === "ar" ? "تصفية المنتجات" : "Filtrer"}</span>
            {hasActiveFilters && (
              <span className="h-1.5 w-1.5 rounded-full bg-luxury-accent" />
            )}
          </Button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-luxury-text-muted hidden sm:inline">
              {dict.shop.sortBy}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-2.5 rounded-[4px] bg-luxury-secondary text-xs text-luxury-text font-medium border-0 focus:ring-1 focus:ring-luxury-accent cursor-pointer"
            >
              <option value="featured">{dict.shop.sortFeatured}</option>
              <option value="price-asc">{dict.shop.sortPriceAsc}</option>
              <option value="price-desc">{dict.shop.sortPriceDesc}</option>
              <option value="name">{locale === "ar" ? "الاسم أ-ي" : "Nom A-Z"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Filter Pills */}
      <div className={cn("space-y-4", mobileFiltersOpen ? "block" : "hidden lg:block")}>
        {/* Gender Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-luxury-text-muted w-24">
            {dict.shop.filterGender}:
          </span>
          {[
            { id: "all", label: dict.shop.allGenders },
            { id: "men", label: dict.shop.men },
            { id: "women", label: dict.shop.women },
            { id: "unisex", label: dict.shop.unisex },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedGender(item.id)}
              className={cn(
                "px-3 py-1 rounded-[3px] text-xs transition-colors font-medium",
                selectedGender === item.id
                  ? "bg-luxury-text text-white shadow-subtle"
                  : "bg-luxury-secondary text-luxury-text-secondary hover:bg-luxury-surface hover:text-luxury-text"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Olfactory Family Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-luxury-text-muted w-24">
            {dict.shop.filterFamily}:
          </span>
          <button
            onClick={() => setSelectedFamily("all")}
            className={cn(
              "px-3 py-1 rounded-[3px] text-xs transition-colors font-medium",
              selectedFamily === "all"
                ? "bg-luxury-text text-white shadow-subtle"
                : "bg-luxury-secondary text-luxury-text-secondary hover:bg-luxury-surface hover:text-luxury-text"
            )}
          >
            {dict.shop.allFamilies}
          </button>
          {families.map((fam) => (
            <button
              key={fam}
              onClick={() => setSelectedFamily(fam)}
              className={cn(
                "px-3 py-1 rounded-[3px] text-xs transition-colors font-medium",
                selectedFamily === fam
                  ? "bg-luxury-text text-white shadow-subtle"
                  : "bg-luxury-secondary text-luxury-text-secondary hover:bg-luxury-surface hover:text-luxury-text"
              )}
            >
              {fam}
            </button>
          ))}
        </div>

        {/* Season & Classification Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Seasons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-luxury-text-muted w-24">
              {dict.shop.filterSeason}:
            </span>
            {[
              { id: "all", label: dict.shop.allSeasons },
              { id: "spring", label: dict.shop.spring },
              { id: "summer", label: dict.shop.summer },
              { id: "autumn", label: dict.shop.autumn },
              { id: "winter", label: dict.shop.winter },
            ].map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={cn(
                  "px-2.5 py-1 rounded-[3px] text-[11px] transition-colors font-medium",
                  selectedSeason === season.id
                    ? "bg-luxury-text text-white"
                    : "bg-luxury-secondary text-luxury-text-secondary hover:bg-luxury-surface"
                )}
              >
                {season.label}
              </button>
            ))}
          </div>

          {/* Classification: X2 to X8 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-luxury-text-muted">
              {dict.shop.classification}:
            </span>
            <button
              onClick={() => setSelectedClassification("all")}
              className={cn(
                "px-2.5 py-1 rounded-[3px] text-[11px] font-medium transition-colors",
                selectedClassification === "all"
                  ? "bg-luxury-text text-white"
                  : "bg-luxury-secondary text-luxury-text-secondary"
              )}
            >
              {locale === "ar" ? "الكل" : "Tous"}
            </button>
            {(["X2", "X3", "X4", "X5", "X6", "X7", "X8"] as const).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClassification(cls)}
                className={cn(
                  "px-2.5 py-1 rounded-[3px] text-[11px] font-semibold transition-colors",
                  selectedClassification === cls
                    ? "bg-amber-300 text-amber-950 font-bold shadow-xs"
                    : "bg-luxury-secondary text-luxury-text hover:bg-amber-100"
                )}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters Button if any active */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between text-xs text-luxury-text-muted border-t border-luxury-border/30">
            <span>
              {filteredProducts.length} {locale === "ar" ? "عطور تطابق بحثك" : "créations trouvées"}
            </span>
            <button
              onClick={clearAllFilters}
              className="text-luxury-accent hover:underline flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>{locale === "ar" ? "مسح جميع الفلاتر" : "Réinitialiser les filtres"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Seasonal Filter Indicator Banner */}
      {selectedSeason !== "all" && (
        <div className="bg-luxury-surface border border-luxury-border/40 rounded-[4px] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
            <span className="text-luxury-accent font-semibold uppercase text-[10px] tracking-wider">
              {locale === "ar" ? "الفصل المحدد:" : "Sélection de Saison :"}
            </span>
            <span className="font-serif font-semibold text-luxury-text capitalize">
              {selectedSeason === "spring"
                ? locale === "ar" ? "الربيع" : "Printemps"
                : selectedSeason === "summer"
                ? locale === "ar" ? "الصيف" : "Été"
                : selectedSeason === "autumn"
                ? locale === "ar" ? "الخريف" : "Automne"
                : locale === "ar" ? "الشتاء" : "Hiver"}
            </span>
            <span className="text-luxury-text-muted text-[11px]">
              ({filteredProducts.length} {locale === "ar" ? "عطور متوافقة" : "parfum(s) trouvé(s)"})
            </span>
          </div>
          <button
            onClick={() => setSelectedSeason("all")}
            className="text-xs text-luxury-accent hover:underline flex items-center gap-1 font-medium"
          >
            <X className="h-3 w-3" />
            <span>{locale === "ar" ? "عرض كل الفصول" : "Afficher toutes les saisons"}</span>
          </button>
        </div>
      )}

      {/* Product Grid Results */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pt-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-luxury-secondary/40 rounded-[6px] space-y-3">
          <p className="font-serif text-lg font-medium text-luxury-text">
            {locale === "ar" ? "لم نجد أي عطر يطابق اختياراتك" : "Aucun parfum ne correspond à vos critères"}
          </p>
          <p className="text-xs text-luxury-text-secondary max-w-sm mx-auto">
            {locale === "ar"
              ? "جرّب تغيير كلمات البحث أو مسح بعض الفلاتر لاستكشاف المزيد من الإبداعات."
              : "Essayez d'ajuster votre recherche ou de réinitialiser certains filtres pour découvrir nos autres créations."}
          </p>
          <Button variant="secondary" size="sm" onClick={clearAllFilters}>
            {locale === "ar" ? "إظهار كل العطور" : "Voir tous les parfums"}
          </Button>
        </div>
      )}
    </div>
  );
}
