"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Perfume, PerfumeVariant } from "@/lib/data/mock-perfumes";
import { Locale, getDictionary } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SizePicker } from "./size-picker";
import { formatPrice, formatBottleSize } from "@/lib/utils";
import { ShoppingBag, ArrowRight, Check, Droplets } from "lucide-react";
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

  if (!product) return null;

  const defaultVariant =
    product.variants.find((v) => v.size === "50ml") || product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<PerfumeVariant>(defaultVariant);
  const [selectedImage, setSelectedImage] = useState(0);

  const name = product.name[locale] || product.name.fr;
  const description = product.description[locale] || product.description.fr;
  const family = product.family[locale] || product.family.fr;

  const handleAddToCart = () => {
    toast.success(
      locale === "ar"
        ? `تمت إضافة ${name} (${formatBottleSize(selectedVariant.size)}) إلى السلة!`
        : `${name} (${formatBottleSize(selectedVariant.size)}) ajouté au panier !`
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {/* Left: Product Image */}
          <div className="relative aspect-[3/4] sm:aspect-auto w-full bg-luxury-secondary">
            <Image
              src={product.images[selectedImage] || product.images[0]}
              alt={name}
              fill
              unoptimized
              className="object-cover object-center"
            />
            {product.classification && (
              <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                <Badge
                  variant={(product.classification?.toLowerCase() as any) || "x4"}
                  className="text-xs px-2 py-0.5"
                >
                  {product.classification}
                </Badge>
              </div>
            )}
          </div>

          {/* Right: Details & Size Selector */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-[10px] text-luxury-text-muted uppercase tracking-wider mb-1">
                {family} • <span className="capitalize">{product.gender}</span>
              </div>

              <DialogTitle className="font-serif text-xl sm:text-2xl font-medium text-luxury-text mb-2">
                {name}
              </DialogTitle>

              {/* Dynamic Price */}
              <div className="flex items-baseline space-x-2 rtl:space-x-reverse mb-3">
                <span className="font-sans text-xl font-semibold text-luxury-text">
                  {formatPrice(selectedVariant.priceDZD, locale)}
                </span>
                <span className="text-xs text-luxury-text-muted">
                  ({formatBottleSize(selectedVariant.size)})
                </span>
              </div>

              <p className="text-xs text-luxury-text-secondary leading-relaxed line-clamp-3 mb-4 font-light">
                {description}
              </p>

              {/* Size Picker */}
              <div className="space-y-2 mb-4">
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
              <div className="pt-2 border-t border-luxury-border/30 text-[11px] text-luxury-text-secondary">
                <span className="font-semibold text-luxury-text block mb-1">
                  {dict.product.heartNotes}:
                </span>
                <p className="line-clamp-2">
                  {product.notes.heart[locale]?.join(", ") || product.notes.heart.fr.join(", ")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className="w-full text-xs"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                <span>{dict.product.addToCart}</span>
              </Button>

              <Link href={`/${locale}/shop/${product.slug}`} onClick={onClose} className="block w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs text-luxury-text-muted hover:text-luxury-text">
                  <span>{locale === "ar" ? "عرض الصفحة الكاملة للعطر" : "Voir tous les détails du parfum"}</span>
                  <ArrowRight className="w-3 h-3 ml-1 rtl:ml-0 rtl:mr-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
