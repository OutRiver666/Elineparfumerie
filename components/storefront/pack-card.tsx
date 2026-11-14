"use client";

import React from "react";
import Image from "next/image";
import { Locale } from "@/lib/i18n";
import { BundleItem } from "@/lib/services/bundles.service";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

interface PackCardProps {
  bundle: BundleItem;
  locale: Locale;
  addToCartLabel: string;
}

export function PackCard({ bundle, locale, addToCartLabel }: PackCardProps) {
  const { addItem } = useCart();
  const name = bundle.name[locale] || bundle.name.fr;
  const description = bundle.description[locale] || bundle.description.fr;
  const image = bundle.images[0] || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800";

  const handleAddToCart = () => {
    addItem({
      itemType: "predefined_bundle",
      bundleId: bundle.id,
      productNameFr: bundle.name.fr,
      productNameAr: bundle.name.ar,
      size: "Pack",
      unitPriceDZD: bundle.priceDZD,
      quantity: 1,
      slug: bundle.slug,
    });
    toast.success(
      locale === "ar"
        ? `تمت إضافة ${name} إلى سلة التسوق`
        : `${name} ajouté au panier avec succès`
    );
  };

  return (
    <div className="bg-luxury-secondary/50 rounded-[4px] overflow-hidden flex flex-col transition-all hover:bg-luxury-secondary">
      <div className="relative aspect-[16/9] w-full bg-luxury-surface">
        <Image src={image} alt={name} fill unoptimized className="object-cover" />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h4 className="font-serif text-xl font-medium text-luxury-text mb-2">
          {name}
        </h4>
        <p className="text-xs text-luxury-text-secondary leading-relaxed mb-4">
          {description}
        </p>

        <div className="space-y-1.5 mb-6 text-xs text-luxury-text font-medium">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-secondary">
            <Check className="h-3.5 w-3.5 text-luxury-accent" />
            <span>
              {locale === "ar"
                ? `${bundle.requiredBottlesCount} قوارير فاخرة في علبة هدايا ملكية`
                : `${bundle.requiredBottlesCount} flacons signature présentés dans leur coffret`}
            </span>
          </div>
          {bundle.discountPercentage && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-700 font-semibold">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {locale === "ar"
                  ? `تخفيض فوري ${bundle.discountPercentage}%`
                  : `Remise immédiate de ${bundle.discountPercentage}%`}
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-luxury-border/30">
          <div>
            <span className="font-sans text-base font-semibold text-luxury-text">
              {formatPrice(bundle.priceDZD, locale)}
            </span>
          </div>

          <Button size="sm" variant="default" onClick={handleAddToCart} className="gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{addToCartLabel}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
