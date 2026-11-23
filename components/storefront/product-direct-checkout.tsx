"use client";

import React, { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Perfume, PerfumeVariant } from "@/lib/data/mock-perfumes";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria-locations";
import {
  checkoutFormSchema,
  CheckoutFormValues,
} from "@/lib/validations/checkout.schema";
import { formatPrice, formatBottleSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { placeOrder } from "@/lib/actions/place-order";
import { Locale } from "@/lib/i18n";
import type { WilayaRateMap } from "@/types/settings";
import {
  MapPin,
  Phone,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Package,
  Minus,
  Plus,
  Zap,
} from "lucide-react";

interface ProductDirectCheckoutProps {
  product: Perfume;
  selectedVariant: PerfumeVariant;
  quantity: number;
  onQuantityChange?: (qty: number) => void;
  onVariantChange?: (variant: PerfumeVariant) => void;
  locale?: Locale;
  wilayaRateMap?: WilayaRateMap;
}

export function ProductDirectCheckout({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  onVariantChange,
  locale = "fr",
  wilayaRateMap,
}: ProductDirectCheckoutProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      alternatePhone: "",
      wilayaCode: "",
      communeName: "",
      deliveryAddress: "",
      deliveryNotes: "",
    },
  });

  const availableWilayas = React.useMemo(
    () =>
      ALGERIA_WILAYAS.map((w) => {
        const override = wilayaRateMap?.[w.code];
        return {
          ...w,
          deliveryFeeDZD:
            override !== undefined ? override.deliveryFeeDZD : w.deliveryFeeDZD,
          estimatedDays: override?.estimatedDays || "24h - 48h",
          isActive: override !== undefined ? override.isActive : true,
        };
      }).filter((w) => w.isActive),
    [wilayaRateMap]
  );

  const selectedWilayaCode = watch("wilayaCode");
  const selectedWilaya = availableWilayas.find(
    (w) => w.code === selectedWilayaCode
  );

  // Auto-reset commune when wilaya changes
  useEffect(() => {
    setValue("communeName", "");
  }, [selectedWilayaCode, setValue]);

  const deliveryFee = selectedWilaya ? selectedWilaya.deliveryFeeDZD : 600;
  const subtotal = selectedVariant.priceDZD * quantity;
  const totalDZD = subtotal + deliveryFee;

  const productName = locale === "ar" ? (product.name.ar || product.name.fr) : product.name.fr;

  const onSubmit = (data: CheckoutFormValues) => {
    startTransition(async () => {
      const payload = {
        customer: data,
        items: [
          {
            id: `${product.id}-${selectedVariant.id}`,
            itemType: "single_product" as const,
            productId: product.id,
            variantId: selectedVariant.id,
            quantity: quantity,
          },
        ],
      };

      try {
        const result = await placeOrder(payload);
        if (result.success) {
          setIsSuccess(true);
        } else {
          alert(
            result.error ||
              (locale === "ar"
                ? "حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مجدداً."
                : "Une erreur est survenue lors de l'enregistrement, veuillez réessayer.")
          );
        }
      } catch {
        alert(
          locale === "ar"
            ? "تعذر إتمام الطلب. يرجى التحقق من اتصالك والمحاولة مجدداً."
            : "Impossible de finaliser la commande. Vérifiez votre connexion et réessayez."
        );
      }
    });
  };

  // ─── 1. Success State (Confirmation sans code technique, avec récapitulatif produit)
  if (isSuccess) {
    return (
      <div className="bg-luxury-surface/80 border border-luxury-accent/30 rounded-[8px] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-luxury">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-serif text-3xl font-medium text-luxury-text mb-3">
          {locale === "ar"
            ? "شكراً لطلبك ! تم تسجيل طلبيتك بنجاح"
            : "Merci pour votre commande !"}
        </h2>
        <p className="text-luxury-text-secondary mb-6 text-sm max-w-md mx-auto">
          {locale === "ar"
            ? "تم استلام طلبيتك بنجاح وسيتصل بك فريقنا هاتفياً قريباً لتأكيد موعد وتفاصيل التوصيل إلى باب منزلك."
            : "Votre commande a été enregistrée avec succès. Notre équipe vous appellera très prochainement pour confirmer votre commande et convenir d'une date de livraison."}
        </p>

        {/* Détail du produit commandé */}
        <div className="p-5 bg-luxury-secondary/70 border border-luxury-border/40 rounded-[6px] text-left rtl:text-right max-w-md w-full mx-auto mb-8">
          <p className="text-xs uppercase tracking-wider font-semibold text-luxury-text mb-3 flex items-center justify-between border-b border-luxury-border/30 pb-2">
            <span>{locale === "ar" ? "المنتج المطلوب :" : "Produit commandé :"}</span>
            <span className="text-[11px] text-luxury-text-muted font-normal">
              1 {locale === "ar" ? "عنصر" : "article"}
            </span>
          </p>
          <div className="flex items-start justify-between gap-3 text-xs">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-luxury-text truncate">
                {productName}
              </p>
              <p className="text-[11px] text-luxury-text-muted mt-0.5">
                {quantity} × {formatBottleSize(selectedVariant.size)}{" "}
                {product.classification ? `• ${product.classification}` : ""}
              </p>
            </div>
            <span className="font-semibold text-luxury-text shrink-0 text-xs">
              {formatPrice(subtotal, locale)}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-luxury-border/30 flex items-center justify-between text-xs font-semibold text-luxury-accent">
            <span>
              {locale === "ar"
                ? "المجموع المطلوب عند الاستلام :"
                : "Total à régler à la livraison :"}
            </span>
            <span className="text-sm font-bold text-luxury-accent">
              {formatPrice(totalDZD, locale)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={`/${locale}`}>
            <Button variant="default" size="lg" className="w-full sm:w-auto">
              {locale === "ar" ? "العودة للرئيسية" : "Retour à l'accueil"}
            </Button>
          </Link>
          <Link href={`/${locale}/shop`}>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              {locale === "ar" ? "متابعة التسوق" : "Continuer mes achats"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── 2. Direct COD Checkout Form Section
  return (
    <div className="bg-gradient-to-br from-white via-luxury-surface/40 to-luxury-secondary/30 border border-luxury-border/60 rounded-[8px] p-6 sm:p-10 shadow-sm">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-accent/15 border border-luxury-accent/30 text-luxury-accent text-[11px] font-semibold uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5 fill-luxury-accent" />
          <span>
            {locale === "ar"
              ? "طلب سريع • الدفع عند الاستلام (COD)"
              : "Commande Express • Paiement à la Livraison"}
          </span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text mb-2">
          {locale === "ar"
            ? "اطلب مباشرة دون الحاجة للمرور بالسلة"
            : "Commandez directement sans passer par le panier"}
        </h3>
        <p className="text-xs sm:text-sm text-luxury-text-secondary">
          {locale === "ar"
            ? "املأ استمارة التوصيل السريعة أسفله، وسنتصل بك فوراً لتأكيد طلبك وتجهيز طردك."
            : "Remplissez simplement vos coordonnées de livraison ci-dessous. Paiement en espèces à la réception de votre flacon."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Fields (Left) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Nom & Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="direct_fullName"
                  className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
                >
                  {locale === "ar" ? "الاسم الكامل *" : "Nom & Prénom *"}
                </label>
                <input
                  id="direct_fullName"
                  type="text"
                  autoComplete="name"
                  placeholder={
                    locale === "ar" ? "مثال: أمين بن علي" : "ex: Amine Benali"
                  }
                  {...register("fullName")}
                  className={`w-full px-3.5 py-2.5 border rounded-[4px] text-sm bg-white text-luxury-text placeholder:text-luxury-text-muted focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors ${
                    errors.fullName
                      ? "border-red-400 focus:ring-red-400"
                      : "border-luxury-border/60 focus:border-luxury-accent"
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="direct_phone"
                  className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    {locale === "ar" ? "رقم الهاتف *" : "Téléphone *"}
                  </div>
                </label>
                <input
                  id="direct_phone"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  placeholder="05XX XX XX XX"
                  {...register("phone")}
                  className={`w-full px-3.5 py-2.5 border rounded-[4px] text-sm bg-white text-luxury-text placeholder:text-luxury-text-muted focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors ${
                    errors.phone
                      ? "border-red-400 focus:ring-red-400"
                      : "border-luxury-border/60 focus:border-luxury-accent"
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Wilaya & Commune */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="direct_wilayaCode"
                  className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {locale === "ar" ? "الولاية *" : "Wilaya *"}
                  </div>
                </label>
                <div className="relative">
                  <select
                    id="direct_wilayaCode"
                    {...register("wilayaCode")}
                    className={`w-full appearance-none px-3.5 py-2.5 border rounded-[4px] text-sm bg-white text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors ${
                      errors.wilayaCode
                        ? "border-red-400"
                        : "border-luxury-border/60"
                    }`}
                  >
                    <option value="">
                      {locale === "ar"
                        ? "اختر ولايتك..."
                        : "Sélectionner la wilaya..."}
                    </option>
                    {availableWilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} — {locale === "ar" ? w.name_ar : w.name_fr}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-text-muted pointer-events-none rtl:right-auto rtl:left-3" />
                </div>
                {errors.wilayaCode && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.wilayaCode.message}
                  </p>
                )}
                {selectedWilaya && (
                  <p className="text-[10px] text-luxury-accent mt-1 font-medium">
                    {selectedWilaya.deliveryFeeDZD === 0
                      ? locale === "ar"
                        ? `توصيل مجاني (${selectedWilaya.estimatedDays})`
                        : `Livraison gratuite (${selectedWilaya.estimatedDays})`
                      : locale === "ar"
                      ? `رسوم التوصيل: ${formatPrice(selectedWilaya.deliveryFeeDZD, locale)} (${selectedWilaya.estimatedDays})`
                      : `Livraison: ${formatPrice(selectedWilaya.deliveryFeeDZD, locale)} (${selectedWilaya.estimatedDays})`}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="direct_communeName"
                  className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
                >
                  {locale === "ar" ? "البلدية *" : "Commune *"}
                </label>
                <div className="relative">
                  <select
                    id="direct_communeName"
                    {...register("communeName")}
                    disabled={!selectedWilaya}
                    className={`w-full appearance-none px-3.5 py-2.5 border rounded-[4px] text-sm bg-white text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.communeName
                        ? "border-red-400"
                        : "border-luxury-border/60"
                    }`}
                  >
                    <option value="">
                      {locale === "ar"
                        ? "اختر البلدية..."
                        : "Sélectionner la commune..."}
                    </option>
                    {selectedWilaya?.communes.map((c, idx) => (
                      <option
                        key={`${c.fr}-${idx}`}
                        value={locale === "ar" ? (c.ar || c.fr) : c.fr}
                      >
                        {locale === "ar" ? (c.ar || c.fr) : c.fr}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-text-muted pointer-events-none rtl:right-auto rtl:left-3" />
                </div>
                {errors.communeName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.communeName.message}
                  </p>
                )}
              </div>
            </div>


            {/* Remarques optionnelles */}
            <div>
              <label
                htmlFor="direct_deliveryNotes"
                className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
              >
                {locale === "ar"
                  ? "ملاحظات إضافية للتوصيل (اختياري)"
                  : "Instructions de livraison (optionnel)"}
              </label>
              <input
                id="direct_deliveryNotes"
                type="text"
                placeholder={
                  locale === "ar"
                    ? "مثال: الاتصال قبل الوصول بنصف ساعة"
                    : "ex: Appeler 30 minutes avant de livrer"
                }
                {...register("deliveryNotes")}
                className="w-full px-3.5 py-2 border border-luxury-border/60 rounded-[4px] text-xs bg-white text-luxury-text placeholder:text-luxury-text-muted focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors"
              />
            </div>

            {/* Big Action Submit Button (Mobile & Desktop) */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                variant="default"
                disabled={isPending || selectedVariant.stock <= 0}
                className="w-full py-4 text-xs sm:text-sm uppercase tracking-wider font-bold shadow-luxury flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {locale === "ar"
                        ? "جاري تسجيل طلبك..."
                        : "Enregistrement de votre commande..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white shrink-0" />
                    <span>
                      {locale === "ar"
                        ? "تأكيد الطلب الآن"
                        : "Confirmer la Commande"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Product Recap & Bottle Selection Card (Right) */}
        <div className="lg:col-span-5 bg-white border border-luxury-border/50 rounded-[6px] p-5 shadow-xs space-y-4">
          <p className="text-xs uppercase tracking-wider font-semibold text-luxury-text border-b border-luxury-border/30 pb-2">
            {locale === "ar" ? "تفاصيل العطر المختار" : "Flacon sélectionné"}
          </p>

          <div className="flex gap-3.5 items-center">
            <div className="relative w-16 h-20 rounded-[4px] overflow-hidden bg-luxury-secondary shrink-0">
              <Image
                src={product.images[0]}
                alt={productName}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-serif font-semibold text-sm text-luxury-text truncate">
                {productName}
              </h4>
              <p className="text-[11px] text-luxury-text-muted mt-0.5">
                {product.family[locale] || product.family.fr} • {product.gender}
              </p>
              <p className="text-xs font-semibold text-luxury-accent mt-1">
                {formatPrice(selectedVariant.priceDZD, locale)}
              </p>
            </div>
          </div>

          {/* Bottle Size Selector in COD card */}
          {product.variants.length > 1 && onVariantChange && (
            <div className="space-y-1.5 pt-2 border-t border-luxury-border/30">
              <span className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-medium block">
                {locale === "ar" ? "تغيير الحجم :" : "Choisir la contenance :"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onVariantChange(v)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all cursor-pointer ${
                      v.id === selectedVariant.id
                        ? "bg-luxury-text text-white border-luxury-text font-bold"
                        : "bg-white text-luxury-text border-luxury-border/60 hover:border-luxury-accent"
                    }`}
                  >
                    {formatBottleSize(v.size)} ({formatPrice(v.priceDZD, locale)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls in COD card */}
          {onQuantityChange && (
            <div className="flex items-center justify-between pt-2 border-t border-luxury-border/30 text-xs">
              <span className="text-luxury-text-secondary font-medium">
                {locale === "ar" ? "الكمية :" : "Quantité :"}
              </span>
              <div className="flex items-center border border-luxury-border/60 rounded-[3px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="p-1 px-2 hover:bg-luxury-secondary text-luxury-text disabled:opacity-30 cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-7 text-center font-bold text-luxury-text">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(Math.min(selectedVariant.stock || 20, quantity + 1))}
                  className="p-1 px-2 hover:bg-luxury-secondary text-luxury-text disabled:opacity-30 cursor-pointer"
                  disabled={quantity >= selectedVariant.stock}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Cost breakdown */}
          <div className="space-y-2 pt-3 border-t border-luxury-border/30 text-xs text-luxury-text-secondary">
            <div className="flex items-center justify-between">
              <span>{locale === "ar" ? "سعر العطر :" : "Sous-total :"}</span>
              <span className="font-medium text-luxury-text">
                {formatPrice(subtotal, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{locale === "ar" ? "رسوم التوصيل :" : "Livraison :"}</span>
              <span className="font-medium text-luxury-text">
                {formatPrice(deliveryFee, locale)}
              </span>
            </div>
            <div className="pt-2 border-t border-luxury-border/30 flex items-center justify-between text-sm font-bold text-luxury-accent">
              <span>
                {locale === "ar" ? "المجموع المطلوب عند الاستلام :" : "Total à la livraison :"}
              </span>
              <span className="text-base text-luxury-accent">
                {formatPrice(totalDZD, locale)}
              </span>
            </div>
          </div>

          {/* Reassurance points */}
          <div className="pt-3 border-t border-luxury-border/30 space-y-2 text-[11px] text-luxury-text-muted">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-luxury-accent shrink-0" />
              <span>
                {locale === "ar"
                  ? "توصيل سريع ومضمون إلى 58 ولاية"
                  : "Livraison rapide dans toutes les wilayas"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-luxury-accent shrink-0" />
              <span>
                {locale === "ar"
                  ? "الدفع نقداً بعد استلام وفحص الطرد"
                  : "Paiement en espèces à la livraison (COD)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
