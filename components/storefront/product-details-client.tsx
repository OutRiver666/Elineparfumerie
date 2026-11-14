"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Perfume, PerfumeVariant } from "@/lib/data/mock-perfumes";
import { Locale, getDictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SizePicker } from "./size-picker";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductDirectCheckout } from "./product-direct-checkout";
import { formatPrice, formatBottleSize } from "@/lib/utils";
import {
  Truck,
  ShieldCheck,
  Sparkles,
  Minus,
  Plus,
  Check,
  Droplets,
  Zap,
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

  const scrollToDirectCheckout = () => {
    directCheckoutRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Default to 50ml or first variant
  const defaultVariant =
    product.variants.find((v) => v.size === "50ml") || product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<PerfumeVariant>(defaultVariant);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const name = product.name[locale] || product.name.fr;
  const description = product.description[locale] || product.description.fr;
  const family = product.family[locale] || product.family.fr;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      {/* 1. PRODUCT GALLERY (LEFT) */}
      <div className="space-y-4">
        <div className="relative aspect-[4/5] w-full rounded-[6px] overflow-hidden bg-luxury-secondary shadow-luxury">
          <Image
            src={product.images[selectedImage] || product.images[0]}
            alt={name}
            fill
            unoptimized
            priority
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

      {/* 3. DIRECT COD ONE-CLICK CHECKOUT SECTION */}
      <div
        ref={directCheckoutRef}
        id="direct-checkout"
        className="col-span-1 lg:col-span-2 scroll-mt-24 pt-4"
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
