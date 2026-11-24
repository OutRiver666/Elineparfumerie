"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Perfume, PerfumeVariant } from "@/lib/data/mock-perfumes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SizePicker } from "./size-picker";
import { QuickViewModal } from "./quick-view-modal";
import { formatPrice } from "@/lib/utils";
import { Locale, getDictionary } from "@/lib/i18n";
import { ShoppingBag, Eye, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

const FALLBACK_PERFUME_IMAGE =
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000";

interface ProductCardProps {
  product: Perfume;
  locale?: Locale;
}

export function ProductCard({ product, locale = "fr" }: ProductCardProps) {
  const dict = getDictionary(locale);
  const { addItem } = useCart();

  const defaultVariant =
    product.variants.find((v) => v.size === "50ml") || product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<PerfumeVariant>(defaultVariant);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  // Build ordered candidate image list with automatic fallback on broken links
  const imageCandidates = useMemo(() => {
    const raw = [
      ...(Array.isArray(product.images) ? product.images : []),
      ...(Array.isArray(product.landingPageImages) ? product.landingPageImages : []),
      FALLBACK_PERFUME_IMAGE,
    ];
    return raw
      .filter((src): src is string => typeof src === "string" && src.trim().length > 0)
      .map((src) => src.trim());
  }, [product.images, product.landingPageImages]);

  const [imgIdx, setImgIdx] = useState(0);
  useEffect(() => {
    setImgIdx(0);
  }, [imageCandidates[0]]);

  const currentImgSrc = imageCandidates[imgIdx] || FALLBACK_PERFUME_IMAGE;

  const name = product.name[locale] || product.name.fr;
  const family = product.family[locale] || product.family.fr;

  const genderLabel =
    product.gender === "men"
      ? dict.shop.men
      : product.gender === "women"
      ? dict.shop.women
      : dict.shop.unisex;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedVariant.stock <= 0 || added) return;

    addItem({
      itemType: "single_product",
      productId: product.id,
      variantId: selectedVariant.id,
      productNameFr: product.name.fr,
      productNameAr: product.name.ar,
      size: selectedVariant.size,
      classification: product.classification,
      quantity: 1,
      unitPriceDZD: selectedVariant.priceDZD,
      slug: product.slug,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    toast.success(
      locale === "ar"
        ? `تمت إضافة ${name} (${selectedVariant.size}) إلى سلتك ✓`
        : `${name} (${selectedVariant.size}) ajouté au panier ✓`,
      { duration: 2500 }
    );
  };

  return (
    <div className="group flex flex-col transition-all duration-300">
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--theme-card-radius,6px)] bg-luxury-secondary border border-luxury-border/30">
        <Link href={`/${locale}/shop/${product.slug}`} className="block h-full w-full">
          <img
            src={currentImgSrc}
            alt={name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => {
              if (imgIdx < imageCandidates.length - 1) {
                setImgIdx((prev) => prev + 1);
              }
            }}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex flex-col gap-1 z-10">
          {product.classification && (
            <Badge
              variant={(product.classification?.toLowerCase() as any) || "x4"}
              className="shadow-subtle"
            >
              {product.classification}
            </Badge>
          )}
          {product.isBestseller && (
            <Badge variant="accent" className="shadow-subtle">
              {locale === "ar" ? "الأكثر طلباً" : "Bestseller"}
            </Badge>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="w-full bg-luxury-bg/95 text-luxury-text hover:bg-luxury-bg border border-luxury-border/40 text-[11px] font-medium shadow-floating"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            {dict.shop.viewDetails}
          </Button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="pt-3.5 pb-2 flex flex-col flex-grow">
        {/* Category & Gender */}
        <div className="flex items-center justify-between text-[11px] text-luxury-text-muted mb-1">
          <span className="uppercase tracking-wider">{family}</span>
          <span className="capitalize">{genderLabel}</span>
        </div>

        {/* Fragrance Name */}
        <Link
          href={`/${locale}/shop/${product.slug}`}
          className="font-serif text-base sm:text-lg font-medium text-luxury-text hover:text-luxury-accent transition-colors line-clamp-1 mb-2"
        >
          {name}
        </Link>

        {/* Bottle Sizes Pills */}
        <div className="mb-3">
          <SizePicker
            variants={product.variants}
            selectedVariantId={selectedVariant.id}
            onSelectVariant={setSelectedVariant}
            compact
          />
        </div>

        {/* Price & Quick-Add */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-sans text-sm font-semibold text-luxury-text tracking-tight">
            {formatPrice(selectedVariant.priceDZD, locale)}
          </span>

          <Button
            size="sm"
            variant="secondary"
            disabled={selectedVariant.stock <= 0}
            className={`h-8 px-2.5 text-[10px] transition-all duration-200 ${
              added
                ? "!bg-emerald-100 !text-emerald-700 !border-emerald-300"
                : selectedVariant.stock <= 0
                ? "opacity-40 cursor-not-allowed"
                : "text-luxury-text hover:bg-luxury-text hover:text-white"
            }`}
            onClick={handleQuickAdd}
            title={dict.product.addToCart}
          >
            {added ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
            )}
            <span>
              {added
                ? "✓"
                : selectedVariant.stock <= 0
                ? locale === "ar" ? "نفد" : "Épuisé"
                : dict.shop.quickAdd}
            </span>
          </Button>
        </div>
      </div>

      {/* Quick View Modal — mounted lazily only when opened to avoid mobile lag */}
      {quickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          locale={locale}
        />
      )}
    </div>
  );
}
