"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Perfume, PerfumeVariant, LandingPageMode } from "@/types/perfume";
import { Locale, getDictionary } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { SizePicker } from "./size-picker";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductDirectCheckout } from "./product-direct-checkout";
import { formatPrice, formatBottleSize } from "@/lib/utils";
import {
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  Check,
  Droplets,
  Zap,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

interface ProductDetailsClientProps {
  product: Perfume;
  locale?: Locale;
}

export function ProductDetailsClient({
  product,
  locale = "fr",
}: ProductDetailsClientProps) {
  const dict = getDictionary(locale);
  const directCheckoutRef = useRef<HTMLDivElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(true);

  const landingImages = (product.landingPageImages || []).filter(Boolean);
  const effectiveMode: LandingPageMode =
    landingImages.length > 0 ? product.landingPageMode || "standard" : "standard";
  const hasLandingSection =
    effectiveMode === "landing_only" || effectiveMode === "both";

  const scrollToDirectCheckout = () => {
    directCheckoutRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Hide floating sticky order button once the COD form is visible in the viewport
  useEffect(() => {
    if (!hasLandingSection || !directCheckoutRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCta(!entry.isIntersecting);
      },
      { threshold: 0.12 }
    );
    observer.observe(directCheckoutRef.current);
    return () => observer.disconnect();
  }, [hasLandingSection]);

  // Default to 50ml or first variant
  const defaultVariant =
    product.variants.find((v) => v.size === "50ml") || product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<PerfumeVariant>(defaultVariant);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const name = product.name[locale] || product.name.fr;
  const description = product.description[locale] || product.description.fr;
  const family = product.family[locale] || product.family.fr;

  // Phone-first edge-to-edge stacked landing images block (zero gap, natural aspect ratio)
  const renderLandingImagesSection = () => (
    <section
      aria-label={locale === "ar" ? "عرض العطر" : "Présentation du parfum"}
      className="w-full bg-luxury-surface/40"
    >
      <div className="w-full sm:max-w-2xl md:max-w-3xl sm:mx-auto sm:py-6">
        <div className="flex flex-col gap-0 w-full overflow-hidden sm:rounded-[6px] sm:shadow-luxury bg-white">
          {landingImages.map((imgUrl, idx) => (
            <img
              key={`${imgUrl}-${idx}`}
              src={imgUrl}
              alt={`${name} — ${idx + 1}`}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              className="block w-full h-auto max-w-full m-0 p-0 select-none"
            />
          ))}
        </div>
      </div>
    </section>
  );

  // Standard 2-column product details block (Gallery + Info/Variants/Notes)
  const renderStandardDetailsGrid = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      {/* 1. PRODUCT GALLERY (LEFT) */}
      <div className="space-y-4">
        <div className="relative aspect-[4/5] w-full rounded-[6px] overflow-hidden bg-luxury-secondary shadow-luxury">
          <Image
            src={product.images[selectedImage] || product.images[0]}
            alt={name}
            fill
            unoptimized
            priority={effectiveMode === "standard"}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-all duration-300"
          />

          {/* Classification & Best Seller Badges */}
          <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex flex-col gap-1.5 z-10">
            {product.classification && (
              <Badge
                variant={(product.classification?.toLowerCase() as any) || "x4"}
                className="text-xs px-2.5 py-1 shadow-subtle"
              >
                {product.classification}
              </Badge>
            )}
            {product.isBestseller && (
              <Badge variant="accent" className="text-xs px-2.5 py-1 shadow-subtle">
                {locale === "ar" ? "الأكثر طلباً" : "Bestseller"}
              </Badge>
            )}
          </div>
        </div>

        {/* Thumbnail Selector */}
        {product.images.length > 1 && (
          <div className="flex gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(idx)}
                className={`relative h-20 w-20 rounded-[4px] overflow-hidden bg-luxury-secondary transition-all ${
                  selectedImage === idx
                    ? "ring-2 ring-luxury-accent opacity-100"
                    : "opacity-60 hover:opacity-100"
                }`}
                title={`Photo ${idx + 1}`}
              >
                <Image src={img} alt={`${name} vue ${idx + 1}`} fill unoptimized className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. PRODUCT SPECIFICATIONS & ACTIONS (RIGHT) */}
      <div className="space-y-6">
        <div>
          {/* Metadata chips */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-luxury-text-muted mb-2">
            <span className="uppercase tracking-wider font-medium">{family}</span>
            <span>•</span>
            <span className="capitalize">{product.gender}</span>
            {product.classification && (
              <>
                <span>•</span>
                <span className="font-semibold text-luxury-accent">
                  {locale === "ar" ? `تصنيف ${product.classification}` : `Édition ${product.classification}`}
                </span>
              </>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-luxury-text mb-3">
            {name}
          </h1>

          {/* DYNAMIC PRICE DISPLAY */}
          <div className="flex items-baseline space-x-3 rtl:space-x-reverse pt-1">
            <span className="font-sans text-3xl sm:text-4xl font-semibold text-luxury-text tracking-tight">
              {formatPrice(selectedVariant.priceDZD, locale)}
            </span>
            <span className="text-xs text-luxury-text-muted font-medium">
              ({formatBottleSize(selectedVariant.size)})
            </span>
            {selectedVariant.compareAtPriceDZD && (
              <span className="text-sm text-luxury-text-muted line-through">
                {formatPrice(selectedVariant.compareAtPriceDZD, locale)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-luxury-text-muted block mt-1">
            SKU: {selectedVariant.sku}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-luxury-text-secondary leading-relaxed font-light">
          {description}
        </p>

        {/* BOTTLE SIZE SELECTOR */}
        <div className="pt-4 pb-2 border-t border-luxury-border/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-luxury-text uppercase tracking-wider text-[11px]">
              {dict.product.bottleSize}
            </span>
            <span className="text-luxury-text-muted">
              {selectedVariant.stock > 0 ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {dict.shop.inStock} ({selectedVariant.stock})
                </span>
              ) : (
                <span className="text-red-700 font-medium">{dict.shop.outOfStock}</span>
              )}
            </span>
          </div>

          {/* Size picker */}
          <SizePicker
            variants={product.variants}
            selectedVariantId={selectedVariant.id}
            onSelectVariant={setSelectedVariant}
          />
        </div>

        {/* QUANTITY, ADD TO CART & ACHAT RAPIDE CTA */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-3">
            {/* Quantity stepper */}
            <div className="flex items-center h-11 rounded-[4px] bg-luxury-secondary px-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 text-luxury-text hover:text-luxury-accent transition-colors disabled:opacity-30 cursor-pointer"
                disabled={quantity <= 1}
                aria-label="Diminuer la quantité"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-semibold text-luxury-text">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(selectedVariant.stock || 20, quantity + 1))}
                className="p-1.5 text-luxury-text hover:text-luxury-accent transition-colors disabled:opacity-30 cursor-pointer"
                disabled={quantity >= selectedVariant.stock}
                aria-label="Augmenter la quantité"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart — wired to CartContext */}
            <div className="flex-1">
              <AddToCartButton
                productId={product.id}
                variantId={selectedVariant.id}
                productNameFr={product.name.fr}
                productNameAr={product.name.ar}
                size={selectedVariant.size}
                classification={product.classification}
                unitPriceDZD={selectedVariant.priceDZD * quantity}
                slug={product.slug}
                locale={locale}
                disabled={selectedVariant.stock <= 0}
              />
            </div>
          </div>

          {/* Bouton Achat Rapide (Paiement à la livraison direct sans panier) */}
          <button
            type="button"
            onClick={scrollToDirectCheckout}
            disabled={selectedVariant.stock <= 0}
            className="w-full h-11 rounded-[4px] bg-luxury-accent hover:bg-luxury-accent-hover active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-subtle cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-white shrink-0" />
            <span>
              {locale === "ar"
                ? " شراء سريع (الدفع عند الاستلام)"
                : " Achat Rapide "}
            </span>
          </button>
        </div>

        {/* ALGERIA DELIVERY & COD PILLARS */}
        <div className="p-4 rounded-[4px] bg-luxury-surface/70 space-y-2.5 text-xs text-luxury-text-secondary">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Truck className="w-4 h-4 text-luxury-accent flex-shrink-0" />
            <span>{dict.product.deliveryInfo}</span>
          </div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <ShieldCheck className="w-4 h-4 text-luxury-accent flex-shrink-0" />
            <span>{dict.product.guaranteedQuality}</span>
          </div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Droplets className="w-4 h-4 text-luxury-accent flex-shrink-0" />
            <span>{dict.product.concentrationDesc}</span>
          </div>
        </div>

        {/* OLFACTORY PYRAMID (NOTES) */}
        <div className="pt-6 border-t border-luxury-border/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-luxury-text">
              {dict.product.olfactoryPyramid}
            </h4>
            <span className="text-[10px] uppercase tracking-wider text-luxury-accent font-semibold">
              {product.classification ? `Classification ${product.classification}` : "Extrait"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Top Notes */}
            <div className="p-3.5 rounded-[3px] bg-luxury-secondary/70">
              <span className="text-[10px] uppercase tracking-wider text-luxury-accent font-semibold block mb-1">
                {dict.product.topNotes}
              </span>
              <p className="text-luxury-text leading-snug">
                {product.notes.top[locale]?.join(" • ") || product.notes.top.fr.join(" • ")}
              </p>
            </div>

            {/* Heart Notes */}
            <div className="p-3.5 rounded-[3px] bg-luxury-secondary/70">
              <span className="text-[10px] uppercase tracking-wider text-luxury-accent font-semibold block mb-1">
                {dict.product.heartNotes}
              </span>
              <p className="text-luxury-text leading-snug">
                {product.notes.heart[locale]?.join(" • ") || product.notes.heart.fr.join(" • ")}
              </p>
            </div>

            {/* Base Notes */}
            <div className="p-3.5 rounded-[3px] bg-luxury-secondary/70">
              <span className="text-[10px] uppercase tracking-wider text-luxury-accent font-semibold block mb-1">
                {dict.product.baseNotes}
              </span>
              <p className="text-luxury-text leading-snug">
                {product.notes.base[locale]?.join(" • ") || product.notes.base.fr.join(" • ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Sticky floating order button for landing modes (auto-hides when COD form is visible)
  const renderStickyOrderBar = () => {
    if (!hasLandingSection || !showStickyCta || selectedVariant.stock <= 0) return null;
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-luxury-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-serif font-semibold text-luxury-text truncate">
              {name}
            </p>
            <p className="text-sm font-bold text-luxury-accent leading-tight">
              {formatPrice(selectedVariant.priceDZD, locale)}
              <span className="text-[10px] font-normal text-luxury-text-muted ms-1">
                ({formatBottleSize(selectedVariant.size)})
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToDirectCheckout}
            className="shrink-0 h-11 px-5 sm:px-6 rounded-[4px] bg-luxury-accent hover:bg-luxury-accent-hover active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-subtle cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white shrink-0" />
            <span>{locale === "ar" ? "اطلب الآن" : "Commander"}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // ── MODE 1: LANDING IMAGES ONLY (+ COD FORM AT THE END) ──────────────────
  if (effectiveMode === "landing_only") {
    return (
      <div className="w-full pb-20 sm:pb-16">
        {renderLandingImagesSection()}

        {/* Direct COD Checkout right after the landing images */}
        <div
          ref={directCheckoutRef}
          id="direct-checkout"
          className="container mx-auto max-w-4xl px-3 sm:px-6 pt-6 sm:pt-10 scroll-mt-20"
        >
          <ProductDirectCheckout
            product={product}
            selectedVariant={selectedVariant}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onVariantChange={setSelectedVariant}
            locale={locale}
          />
        </div>

        {/* Subtle return to shop link at the bottom */}
        <div className="text-center pt-8">
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-luxury-text-muted hover:text-luxury-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{locale === "ar" ? "تصفح باقي العطور في المتجر" : "Découvrir toute la boutique"}</span>
          </Link>
        </div>

        {renderStickyOrderBar()}
      </div>
    );
  }

  // ── MODE 2: BOTH (LANDING IMAGES FIRST -> NORMAL DETAILS -> COD FORM) ────
  if (effectiveMode === "both") {
    return (
      <div className="w-full pb-16 sm:pb-8">
        {/* 1. Edge-to-edge phone-optimized Landing Images first */}
        {renderLandingImagesSection()}

        {/* 2. Normal Product Details + COD Form */}
        <div className="container mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
          {renderStandardDetailsGrid()}

          <div
            ref={directCheckoutRef}
            id="direct-checkout"
            className="scroll-mt-24 pt-2"
          >
            <ProductDirectCheckout
              product={product}
              selectedVariant={selectedVariant}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onVariantChange={setSelectedVariant}
              locale={locale}
            />
          </div>
        </div>

        {renderStickyOrderBar()}
      </div>
    );
  }

  // ── MODE 3: STANDARD PRODUCT DETAILS ONLY (DEFAULT) ──────────────────────
  return (
    <div className="space-y-12">
      {renderStandardDetailsGrid()}

      {/* 3. DIRECT COD ONE-CLICK CHECKOUT SECTION */}
      <div
        ref={directCheckoutRef}
        id="direct-checkout"
        className="scroll-mt-24 pt-4"
      >
        <ProductDirectCheckout
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onVariantChange={setSelectedVariant}
          locale={locale}
        />
      </div>
    </div>
  );
}
