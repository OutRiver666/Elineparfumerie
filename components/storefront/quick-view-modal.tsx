"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Perfume, PerfumeVariant } from "@/lib/data/mock-perfumes";
import { Locale, getDictionary } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SizePicker } from "./size-picker";
import { formatPrice, formatBottleSize } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: Perfume | null;
  isOpen: boolean;
  onClose: () => void;
  locale?: Locale;
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
  locale = "fr",
}: QuickViewModalProps) {
  const dict = getDictionary(locale);
  const { addItem } = useCart();

  const defaultVariant =
    product?.variants.find((v) => v.size === "50ml") || product?.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<PerfumeVariant | undefined>(
    defaultVariant
  );

  // Keep selectedVariant synced when product changes
  useEffect(() => {
    if (!product) return;
    const nextDefault =
      product.variants.find((v) => v.size === "50ml") || product.variants[0];
    setSelectedVariant(nextDefault);
  }, [product]);

  if (!product || !selectedVariant) return null;

  const name = product.name[locale] || product.name.fr;
  const description = product.description[locale] || product.description.fr;
  const family = product.family[locale] || product.family.fr;
  const coverImage =
    product.images?.[0] ||
    product.landingPageImages?.[0] ||
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000";
  const [imgSrc, setImgSrc] = useState(coverImage);
  useEffect(() => {
    setImgSrc(coverImage);
  }, [coverImage]);

  const handleAddToCart = () => {
    if (selectedVariant.stock <= 0) return;

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

    toast.success(
      locale === "ar"
        ? `تمت إضافة ${name} (${formatBottleSize(selectedVariant.size)}) إلى السلة ✓`
        : `${name} (${formatBottleSize(selectedVariant.size)}) ajouté au panier ✓`
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] max-w-2xl max-h-[86dvh] p-0 gap-0 overflow-hidden bg-white rounded-xl border border-luxury-border/30 flex flex-col"
      >
        {/* Always-visible, pinned Exit button across all mobile & desktop resolutions */}
        <button
          type="button"
          onClick={onClose}
          aria-label={locale === "ar" ? "إغلاق" : "Fermer"}
          className="absolute top-2.5 end-2.5 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-zinc-900 border border-zinc-200/90 shadow-md hover:bg-zinc-100 active:scale-95 transition-transform cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[2.25]" />
        </button>

        {/* Scrollable inner body so content never gets cut off and close button stays fixed */}
        <div className="overflow-y-auto overscroll-contain flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {/* Left / Top: Product Image (compact on phone so details & actions are immediately accessible) */}
            <div className="relative h-52 sm:h-auto sm:min-h-[380px] w-full bg-luxury-secondary shrink-0">
              <img
                src={imgSrc}
                alt={name}
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() =>
                  setImgSrc(
                    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000"
                  )
                }
                className="h-full w-full object-cover object-center"
              />
              {product.classification && (
                <div className="absolute top-3 start-3 z-10">
                  <Badge
                    variant={(product.classification?.toLowerCase() as any) || "x4"}
                    className="text-xs px-2 py-0.5 shadow-subtle"
                  >
                    {product.classification}
                  </Badge>
                </div>
              )}
            </div>

            {/* Right / Bottom: Details & Size Selector */}
            <div className="p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[10px] text-luxury-text-muted uppercase tracking-wider mb-1 pe-8 sm:pe-6">
                  {family} • <span className="capitalize">{product.gender}</span>
                </div>

                <DialogTitle className="font-serif text-lg sm:text-2xl font-medium text-luxury-text mb-1.5 sm:mb-2 pe-6 leading-snug">
                  {name}
                </DialogTitle>

                {/* Dynamic Price */}
                <div className="flex items-baseline gap-2 mb-2.5 sm:mb-3">
                  <span className="font-sans text-lg sm:text-xl font-semibold text-luxury-text">
                    {formatPrice(selectedVariant.priceDZD, locale)}
                  </span>
                  <span className="text-xs text-luxury-text-muted">
                    ({formatBottleSize(selectedVariant.size)})
                  </span>
                </div>

                <p className="text-xs text-luxury-text-secondary leading-relaxed line-clamp-3 mb-3.5 sm:mb-4 font-light">
                  {description}
                </p>

                {/* Size Picker */}
                <div className="space-y-1.5 sm:space-y-2 mb-3.5 sm:mb-4">
                  <span className="text-[10px] uppercase tracking-wider text-luxury-text font-semibold block">
                    {dict.product.bottleSize}
                  </span>
                  <SizePicker
                    variants={product.variants}
                    selectedVariantId={selectedVariant.id}
                    onSelectVariant={setSelectedVariant}
                    compact
                  />
                </div>

                {/* Key Notes */}
                {(product.notes.heart[locale]?.length > 0 || product.notes.heart.fr.length > 0) && (
                  <div className="pt-2 border-t border-luxury-border/30 text-[11px] text-luxury-text-secondary">
                    <span className="font-semibold text-luxury-text block mb-0.5">
                      {dict.product.heartNotes}:
                    </span>
                    <p className="line-clamp-2">
                      {product.notes.heart[locale]?.join(", ") || product.notes.heart.fr.join(", ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  disabled={selectedVariant.stock <= 0}
                  className="w-full h-10 sm:h-9 text-xs"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="w-3.5 h-3.5 me-1.5" />
                  <span>
                    {selectedVariant.stock <= 0
                      ? locale === "ar"
                        ? "غير متوفر حالياً"
                        : "Rupture de stock"
                      : dict.product.addToCart}
                  </span>
                </Button>

                <Link
                  href={`/${locale}/shop/${product.slug}`}
                  onClick={onClose}
                  className="block w-full"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-9 text-xs text-luxury-text-muted hover:text-luxury-text"
                  >
                    <span>
                      {locale === "ar"
                        ? "عرض الصفحة الكاملة للعطر"
                        : "Voir tous les détails du parfum"}
                    </span>
                    <ArrowRight className="w-3 h-3 ms-1 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
