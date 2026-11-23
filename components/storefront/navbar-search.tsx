"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { Locale } from "@/lib/i18n";

export interface NavbarSearchProduct {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  familyFr: string;
  familyAr: string;
  image: string;
  minPriceDZD: number;
  classification?: string;
  isBestseller?: boolean;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400";

interface NavbarSearchProps {
  locale: Locale;
  products: NavbarSearchProduct[];
  variant: "desktop" | "mobile-panel";
  onCloseMobile?: () => void;
  onOpenChange?: (open: boolean) => void;
  forceClosed?: boolean;
}

export function NavbarSearch({
  locale,
  products,
  variant,
  onCloseMobile,
  onOpenChange,
  forceClosed,
}: NavbarSearchProps) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(variant === "mobile-panel");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateOpen = (next: boolean) => {
    setIsOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (forceClosed && isOpen) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }, [forceClosed, isOpen]);

  // Auto-focus when mobile search drawer opens
  useEffect(() => {
    if (variant === "mobile-panel") {
      inputRef.current?.focus();
    }
  }, [variant]);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    if (variant !== "desktop") return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant, onOpenChange]);

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmedQuery) {
      // Show bestsellers / featured quick suggestions before typing
      const prioritized = [
        ...products.filter((p) => p.isBestseller),
        ...products.filter((p) => !p.isBestseller),
      ];
      return prioritized.slice(0, 5);
    }

    return products
      .filter((p) => {
        const hay = [
          p.nameFr,
          p.nameAr,
          p.familyFr,
          p.familyAr,
          p.classification || "",
          p.slug,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(trimmedQuery);
      })
      .slice(0, 8);
  }, [products, trimmedQuery]);

  const handleSelectProduct = (slug: string) => {
    updateOpen(false);
    setQuery("");
    setActiveIndex(-1);
    onCloseMobile?.();
    router.push(`/${locale}/shop/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      updateOpen(false);
      setActiveIndex(-1);
      onCloseMobile?.();
      inputRef.current?.blur();
      return;
    }
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      updateOpen(true);
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (target) {
        handleSelectProduct(target.slug);
      }
    }
  };

  const renderResultsList = () => (
    <div className="divide-y divide-luxury-border/20">
      {/* Header label */}
      <div className="px-3.5 py-2 bg-luxury-secondary/40 flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-luxury-text-muted">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-luxury-accent" />
          {trimmedQuery
            ? isAr
              ? `نتائج البحث (${results.length})`
              : `Résultats (${results.length})`
            : isAr
            ? "عطور مقترحة"
            : "Suggestions Éline"}
        </span>
        <Link
          href={`/${locale}/shop`}
          onClick={() => {
            updateOpen(false);
            onCloseMobile?.();
          }}
          className="text-luxury-accent hover:underline inline-flex items-center gap-0.5 normal-case tracking-normal font-medium"
        >
          <span>{isAr ? "كل المتجر" : "Tout voir"}</span>
          <ArrowRight className="w-3 h-3 rtl:rotate-180" />
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="p-6 text-center text-xs text-luxury-text-muted">
          {isAr
            ? `لم يتم العثور على عطر يطابق "${query}"`
            : `Aucun parfum trouvé pour « ${query} »`}
        </div>
      ) : (
        <div className="max-h-[380px] overflow-y-auto overscroll-contain divide-y divide-luxury-border/15 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {results.map((product, idx) => {
            const displayName = isAr ? product.nameAr || product.nameFr : product.nameFr;
            const secondaryName = isAr ? product.nameFr : product.nameAr;
            const displayFamily = isAr ? product.familyAr : product.familyFr;
            const isHighlighted = idx === activeIndex;

            return (
              <Link
                key={product.id}
                href={`/${locale}/shop/${product.slug}`}
                onClick={() => {
                  updateOpen(false);
                  setQuery("");
                  setActiveIndex(-1);
                  onCloseMobile?.();
                }}
                className={`group flex items-center gap-3.5 p-2.5 sm:px-3.5 transition-colors ${
                  isHighlighted
                    ? "bg-luxury-secondary/70"
                    : "hover:bg-luxury-secondary/40"
                }`}
              >
                {/* Larger Product Thumbnail */}
                <div className="h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-[6px] overflow-hidden bg-luxury-secondary border border-luxury-border/30 shrink-0 shadow-2xs">
                  <img
                    src={product.image || FALLBACK_IMG}
                    alt={displayName}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_IMG) {
                        e.currentTarget.src = FALLBACK_IMG;
                      }
                    }}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Product Name & Family */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-serif text-sm sm:text-base font-semibold text-luxury-text truncate group-hover:text-luxury-accent transition-colors">
                      {displayName}
                    </p>
                    {product.classification && (
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-luxury-accent/15 text-luxury-accent text-[9.5px] font-bold shrink-0">
                        {product.classification}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-luxury-text-muted truncate mt-0.5">
                    {displayFamily}
                    {secondaryName && secondaryName !== displayName ? ` • ${secondaryName}` : ""}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-luxury-text-muted/60 group-hover:text-luxury-accent transition-colors shrink-0 rtl:rotate-180" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── MOBILE FULL-WIDTH SEARCH PANEL ───────────────────────────────────────
  if (variant === "mobile-panel") {
    return (
      <div ref={containerRef} className="md:hidden border-t border-luxury-border/30 bg-white px-3 py-2.5">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-luxury-text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isAr ? "ابحث عن عطرك المفضل..." : "Rechercher un parfum (ex: Oud)..."
              }
              className="w-full h-10 ps-9 pe-8 text-xs bg-luxury-secondary/50 border border-luxury-border/50 rounded-[5px] text-luxury-text placeholder:text-luxury-text-muted focus:outline-none focus:bg-white focus:border-luxury-accent focus:ring-1 focus:ring-luxury-accent transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute end-2.5 top-1/2 -translate-y-1/2 p-0.5 text-luxury-text-muted hover:text-luxury-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label={isAr ? "إغلاق البحث" : "Fermer la recherche"}
              className="h-10 px-2.5 rounded-[5px] border border-luxury-border/50 text-luxury-text-secondary hover:text-luxury-text hover:bg-luxury-secondary/50 text-xs font-medium shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Instant Results */}
        <div className="mt-2.5 rounded-[6px] border border-luxury-border/40 bg-white shadow-card overflow-hidden">
          {renderResultsList()}
        </div>
      </div>
    );
  }

  // ── DESKTOP INLINE NAVBAR SEARCH BAR + FLOATING DROPDOWN ─────────────────
  return (
    <div ref={containerRef} className="relative hidden md:block w-52 lg:w-64">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-luxury-text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => updateOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            updateOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isAr ? "ابحث عن عطر..." : "Rechercher un parfum..."}
          aria-label={isAr ? "البحث عن العطور" : "Rechercher un parfum"}
          className="w-full h-9 ps-9 pe-7 text-xs bg-luxury-secondary/50 border border-luxury-border/50 rounded-full text-luxury-text placeholder:text-luxury-text-muted focus:outline-none focus:bg-white focus:border-luxury-accent focus:ring-1 focus:ring-luxury-accent transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute end-2.5 top-1/2 -translate-y-1/2 p-0.5 text-luxury-text-muted hover:text-luxury-text cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live Dropdown Results */}
      {isOpen && (
        <div className="absolute end-0 top-[calc(100%+8px)] w-80 lg:w-96 rounded-[8px] border border-luxury-border/40 bg-white shadow-[0_14px_40px_-10px_rgba(0,0,0,0.16)] overflow-hidden z-50">
          {renderResultsList()}
        </div>
      )}
    </div>
  );
}
