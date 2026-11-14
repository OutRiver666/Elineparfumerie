"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { Perfume, PerfumeVariant } from "@/lib/data/mock-perfumes";
import { CustomTierRule } from "@/lib/services/bundles.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Check, Plus, Trash2, ArrowRight, Sparkles, Box, ShoppingBag, Tag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";

interface PackBuilderClientProps {
  products: Perfume[];
  customTiers?: CustomTierRule[];
  locale: Locale;
  dict: any;
}

const DEFAULT_TIERS: CustomTierRule[] = [
  {
    id: "default-2",
    slug: "duo-2-flacons",
    name: { fr: "Coffret Duo (2 Flacons)", ar: "باقة الثنائي (2 عطور)" },
    description: { fr: "2 flacons au choix avec 10% de remise", ar: "عطرين من اختيارك مع تخفيض 10%" },
    requiredBottlesCount: 2,
    discountPercentage: 10,
    allowedSizes: ["25ml", "30ml", "50ml", "80ml", "100ml"],
    images: [],
    isActive: true,
  },
  {
    id: "default-3",
    slug: "trio-3-flacons",
    name: { fr: "Coffret Trio Signature (3 Flacons)", ar: "باقة الثلاثي المميزة (3 عطور)" },
    description: { fr: "3 flacons au choix avec 15% de remise", ar: "3 عطور من اختيارك مع تخفيض 15%" },
    requiredBottlesCount: 3,
    discountPercentage: 15,
    allowedSizes: ["25ml", "30ml", "50ml", "80ml", "100ml"],
    images: [],
    isActive: true,
  },
  {
    id: "default-4",
    slug: "quatuor-4-flacons",
    name: { fr: "Coffret Quatuor Prestige (4 Flacons)", ar: "باقة الرباعي الملكية (4 عطور)" },
    description: { fr: "4 flacons au choix avec 20% de remise", ar: "4 عطور من اختيارك مع تخفيض 20%" },
    requiredBottlesCount: 4,
    discountPercentage: 20,
    allowedSizes: ["25ml", "30ml", "50ml", "80ml", "100ml"],
    images: [],
    isActive: true,
  },
];

export function PackBuilderClient({
  products,
  customTiers = [],
  locale,
  dict,
}: PackBuilderClientProps) {
  const router = useRouter();
  const { addItem } = useCart();

  // Active custom tiers from database
  const activeTiers = customTiers.length > 0 ? customTiers : DEFAULT_TIERS;
  const initialTier =
    activeTiers.find((t) => t.requiredBottlesCount === 3) || activeTiers[0];

  const [selectedTier, setSelectedTier] = useState<CustomTierRule>(initialTier);
  const REQUIRED_SLOTS = selectedTier.requiredBottlesCount;
  const discountPercentage = selectedTier.discountPercentage;

  const [selectedItems, setSelectedItems] = useState<
    { perfume: Perfume; variant: PerfumeVariant }[]
  >([]);

  // Calculate pricing & discount
  const rawSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.variant.priceDZD,
    0
  );
  const bundleDiscount = Math.round((rawSubtotal * discountPercentage) / 100);
  const finalPackPrice = rawSubtotal - bundleDiscount;

  // Change tier handler
  const handleSelectTier = (tier: CustomTierRule) => {
    setSelectedTier(tier);
    // If current selections exceed new tier count, slice them
    if (selectedItems.length > tier.requiredBottlesCount) {
      setSelectedItems(selectedItems.slice(0, tier.requiredBottlesCount));
    }
  };

  const handleAddSlot = (perfume: Perfume) => {
    if (selectedItems.length >= REQUIRED_SLOTS) {
      toast.error(
        locale === "ar"
          ? `لقد اخترت الحد الأقصى (${REQUIRED_SLOTS} عطور). أزل عطراً لتغييره.`
          : `Votre coffret est déjà complet (${REQUIRED_SLOTS} flacons). Retirez-en un pour changer.`
      );
      return;
    }
    const variant =
      perfume.variants.find((v) => v.size === "50ml") || perfume.variants[0];

    setSelectedItems([...selectedItems, { perfume, variant }]);
    toast.success(
      locale === "ar"
        ? `تمت إضافة ${perfume.name[locale]} إلى باقتك`
        : `${perfume.name[locale]} ajouté au coffret`
    );
  };

  const handleRemoveSlot = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index: number, newVariant: PerfumeVariant) => {
    const updated = [...selectedItems];
    updated[index].variant = newVariant;
    setSelectedItems(updated);
  };

  const handleAddToCart = () => {
    if (selectedItems.length !== REQUIRED_SLOTS) return;

    const selections = selectedItems.map((item) => ({
      productId: item.perfume.id,
      variantId: item.variant.id,
      productNameFr: item.perfume.name.fr,
      productNameAr: item.perfume.name.ar,
      size: item.variant.size,
      priceDZD: item.variant.priceDZD,
    }));

    addItem({
      itemType: "custom_bundle",
      productNameFr: selectedTier.name.fr,
      productNameAr: selectedTier.name.ar,
      size: `${REQUIRED_SLOTS} Flacons`,
      unitPriceDZD: finalPackPrice,
      quantity: 1,
      customSelections: selections,
    });

    toast.success(
      locale === "ar"
        ? "تمت إضافة باقتك المخصصة إلى سلة التسوق!"
        : "Votre coffret sur-mesure a été ajouté au panier !"
    );

    router.push(`/${locale}/cart`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="max-w-2xl mb-8">
        <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-[3px] bg-luxury-secondary text-luxury-accent text-[11px] uppercase tracking-wider font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{dict.packs.customTitle}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-luxury-text mb-2">
          {dict.packs.buildYourOwn}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-text-secondary leading-relaxed">
          {locale === "ar"
            ? "اختر صيغة باقتك، حدد عطورك وسعاتها المفضلة، واستمتع بتخفيض فوري مع تغليف هدايا ملكي مجاني."
            : "Choisissez votre formule de coffret, composez vos fragrances et contenances au choix, et profitez d'une remise exclusive immédiate."}
        </p>
      </div>

      {/* Dynamic Tier Selectors (Configured in Admin Dashboard) */}
      <div className="mb-10 bg-white p-4 sm:p-5 rounded-[6px] border border-luxury-border/40 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-luxury-accent font-semibold flex items-center space-x-1.5 rtl:space-x-reverse">
            <Tag className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "اختر صيغة الصندوق:" : "Sélectionnez votre formule:"}</span>
          </span>
          <span className="text-xs text-luxury-text-muted">
            {locale === "ar"
              ? `الخصم الحالي: -${discountPercentage}%`
              : `Remise active: -${discountPercentage}%`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activeTiers.map((tier) => {
            const isSelected = selectedTier.id === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleSelectTier(tier)}
                className={`p-3.5 rounded-[4px] border text-left rtl:text-right transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-luxury-text text-white border-luxury-text shadow-sm"
                    : "bg-luxury-surface text-luxury-text border-luxury-border/40 hover:bg-luxury-secondary/40"
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-serif text-xs font-semibold">
                      {tier.name[locale]}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] block mt-0.5 ${
                      isSelected ? "text-luxury-secondary" : "text-luxury-text-muted"
                    }`}
                  >
                    {tier.requiredBottlesCount} {locale === "ar" ? "قوارير" : "flacons"}
                  </span>
                </div>

                <Badge
                  className={`text-[11px] font-bold border-0 ${
                    isSelected
                      ? "bg-luxury-accent text-white"
                      : "bg-luxury-accent/15 text-luxury-accent"
                  }`}
                >
                  -{tier.discountPercentage}%
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Product Selector Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-luxury-border/30">
            <h3 className="font-serif text-lg font-medium text-luxury-text">
              {dict.packs.selectFragrances}
            </h3>
            <span className="text-xs text-luxury-text-muted font-medium">
              {selectedItems.length}/{REQUIRED_SLOTS} {dict.packs.includedBottles}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((perfume) => {
              const name = perfume.name[locale] || perfume.name.fr;
              const family = perfume.family[locale] || perfume.family.fr;
              const defaultVariant =
                perfume.variants.find((v) => v.size === "50ml") ||
                perfume.variants[0];

              return (
                <div
                  key={perfume.id}
                  className="p-4 rounded-[4px] bg-luxury-secondary/50 flex space-x-4 rtl:space-x-reverse items-center justify-between hover:bg-luxury-secondary transition-colors"
                >
                  <div className="relative h-16 w-16 rounded-[3px] overflow-hidden bg-luxury-surface flex-shrink-0">
                    <Image
                      src={
                        perfume.images[0] ||
                        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600"
                      }
                      alt={name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
                    <h4 className="font-serif text-sm font-medium text-luxury-text truncate">
                      {name}
                    </h4>
                    <p className="text-[11px] text-luxury-text-muted truncate">
                      {family}
                    </p>
                    {defaultVariant && (
                      <p className="text-xs font-semibold text-luxury-text mt-1">
                        {formatPrice(defaultVariant.priceDZD, locale)}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAddSlot(perfume)}
                    disabled={selectedItems.length >= REQUIRED_SLOTS}
                    className="h-8 w-8 p-0 rounded-full shrink-0"
                    title="Ajouter au pack"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pack Configuration Summary */}
        <div className="bg-luxury-surface rounded-[6px] p-6 space-y-6 sticky top-24 border border-luxury-border/30">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Box className="w-5 h-5 text-luxury-accent" />
            <h3 className="font-serif text-lg font-medium text-luxury-text">
              {locale === "ar" ? "تشكيلة الصندوق" : "Votre Coffret"}
            </h3>
          </div>

          {/* Slots list */}
          <div className="space-y-3">
            {Array.from({ length: REQUIRED_SLOTS }).map((_, slotIdx) => {
              const item = selectedItems[slotIdx];

              if (!item) {
                return (
                  <div
                    key={slotIdx}
                    className="p-4 rounded-[4px] border-2 border-dashed border-luxury-border/50 flex items-center justify-center text-center h-20 text-xs text-luxury-text-muted bg-white/50"
                  >
                    <span>
                      {locale === "ar"
                        ? `قارورة ${slotIdx + 1} (فارغة)`
                        : `Flacon ${slotIdx + 1} (Non sélectionné)`}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={slotIdx}
                  className="p-3 rounded-[4px] bg-white border border-luxury-border/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xs font-semibold text-luxury-text truncate max-w-[170px]">
                      {item.perfume.name[locale]}
                    </span>
                    <button
                      onClick={() => handleRemoveSlot(slotIdx)}
                      className="text-luxury-text-muted hover:text-red-600 transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Bottle size picker inside slot */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      {item.perfume.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleSizeChange(slotIdx, v)}
                          className={`text-[9px] px-1.5 py-0.5 rounded-[2px] font-medium transition-colors ${
                            v.id === item.variant.id
                              ? "bg-luxury-text text-white"
                              : "bg-luxury-secondary text-luxury-text-secondary hover:bg-luxury-surface"
                          }`}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-luxury-text">
                      {formatPrice(item.variant.priceDZD, locale)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing summary */}
          <div className="pt-4 border-t border-luxury-border/40 space-y-2 text-xs">
            <div className="flex justify-between text-luxury-text-secondary">
              <span>{dict.cart.subtotal}</span>
              <span>{formatPrice(rawSubtotal, locale)}</span>
            </div>

            {selectedItems.length === REQUIRED_SLOTS && (
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>
                  {dict.packs.packSavings} (-{discountPercentage}%)
                </span>
                <span>-{formatPrice(bundleDiscount, locale)}</span>
              </div>
            )}

            <div className="flex justify-between font-serif text-base font-semibold text-luxury-text pt-2 border-t border-luxury-border/40">
              <span>{dict.cart.total}</span>
              <span>
                {formatPrice(
                  selectedItems.length === REQUIRED_SLOTS
                    ? finalPackPrice
                    : rawSubtotal,
                  locale
                )}
              </span>
            </div>
          </div>

          {/* Add Pack to Cart CTA */}
          <Button
            size="lg"
            variant={selectedItems.length === REQUIRED_SLOTS ? "accent" : "secondary"}
            className="w-full text-xs"
            disabled={selectedItems.length !== REQUIRED_SLOTS}
            onClick={handleAddToCart}
          >
            {selectedItems.length === REQUIRED_SLOTS ? (
              <span className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse">
                <ShoppingBag className="w-4 h-4" />
                <span>{dict.product.addToCart}</span>
              </span>
            ) : (
              <span>
                {locale === "ar"
                  ? `اختر ${REQUIRED_SLOTS - selectedItems.length} عطور إضافية`
                  : `Sélectionnez encore ${REQUIRED_SLOTS - selectedItems.length} flacon(s)`}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
