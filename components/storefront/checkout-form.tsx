"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart, CartItem } from "@/lib/cart-context";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria-locations";
import {
  checkoutFormSchema,
  CheckoutFormValues,
} from "@/lib/validations/checkout.schema";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Truck,
  Phone,
  MapPin,
  FileText,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Package,
} from "lucide-react";
import { placeOrder } from "@/lib/actions/place-order";
import { Locale } from "@/lib/i18n";
import type { WilayaRateMap } from "@/types/settings";

interface CheckoutFormProps {
  locale: Locale;
  wilayaRateMap?: WilayaRateMap;
  onOrderSuccess?: (info: { orderId: string; totalDZD: number; items: CartItem[] }) => void;
}

type CheckoutStep = "form" | "confirming" | "success";

export function CheckoutForm({ locale, wilayaRateMap, onOrderSuccess }: CheckoutFormProps) {
  const { items, subtotalDZD, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("form");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderedProducts, setOrderedProducts] = useState<CartItem[]>([]);
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
  React.useEffect(() => {
    setValue("communeName", "");
  }, [selectedWilayaCode, setValue]);

  const deliveryFee = selectedWilaya ? selectedWilaya.deliveryFeeDZD : 600;
  const totalDZD = subtotalDZD + deliveryFee;

  const onSubmit = (data: CheckoutFormValues) => {
    startTransition(async () => {
      setStep("confirming");

      const payload = {
        customer: data,
        items: items.map((item) => ({
          id: item.id,
          itemType: item.itemType,
          productId: item.productId,
          variantId: item.variantId,
          bundleId: item.bundleId,
          quantity: item.quantity,
          customSelections: item.customSelections,
        })),
      };

      try {
        const result = await placeOrder(payload);
        if (result.success && result.orderId) {
          const finalTotal = result.totalDZD || totalDZD;
          const capturedItems = [...items];
          setOrderId(result.orderId);
          setOrderTotal(finalTotal);
          setOrderedProducts(capturedItems);
          if (onOrderSuccess) {
            onOrderSuccess({
              orderId: result.orderId,
              totalDZD: finalTotal,
              items: capturedItems,
            });
          }
          clearCart();
          setStep("success");
        } else {
          setStep("form");
          alert(
            result.error ||
              (locale === "ar"
                ? "حدث خطأ، يرجى المحاولة مجدداً"
                : "Une erreur est survenue, veuillez réessayer")
          );
        }
      } catch {
        setStep("form");
        alert(
          locale === "ar"
            ? "تعذر إتمام الطلب. يرجى التحقق من اتصالك والمحاولة مجدداً."
            : "Impossible de finaliser la commande. Vérifiez votre connexion et réessayez."
        );
      }
    });
  };

  // ─── Success State ────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-luxury-text mb-3">
          {locale === "ar"
            ? "شكراً لطلبك ! تم تسجيل طلبيتك بنجاح"
            : "Merci pour votre commande !"}
        </h2>
        <p className="text-luxury-text-secondary mb-2 text-sm max-w-md mx-auto">
          {locale === "ar"
            ? "تم تسجيل طلبيتك بنجاح. سنتصل بك هاتفياً قريباً لتأكيد التفاصيل وموعد التوصيل."
            : "Votre commande a été enregistrée avec succès. Notre équipe vous appellera prochainement pour confirmer votre commande et convenir d'une date de livraison."}
        </p>

        {orderedProducts.length > 0 && (
          <div className="mt-6 mb-6 p-5 bg-luxury-secondary/70 border border-luxury-border/40 rounded-[6px] text-left rtl:text-right max-w-md mx-auto">
            <p className="text-xs uppercase tracking-wider font-semibold text-luxury-text mb-3 flex items-center justify-between border-b border-luxury-border/30 pb-2">
              <span>{locale === "ar" ? "المنتجات المطلوبة :" : "Produits commandés :"}</span>
              <span className="text-[11px] text-luxury-text-muted font-normal">
                {orderedProducts.length} {locale === "ar" ? "عنصر" : (orderedProducts.length > 1 ? "articles" : "article")}
              </span>
            </p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {orderedProducts.map((p, idx) => (
                <div key={p.id || idx} className="flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-luxury-text truncate">
                      {locale === "ar" ? (p.productNameAr || p.productNameFr) : p.productNameFr}
                    </p>
                    <p className="text-[11px] text-luxury-text-muted mt-0.5">
                      {p.quantity} × {p.size} {p.classification ? `• ${p.classification}` : ""}
                    </p>
                    {p.customSelections && p.customSelections.length > 0 && (
                      <p className="text-[10px] text-luxury-accent mt-1 leading-snug">
                        {p.customSelections
                          .map((s) => (locale === "ar" ? (s.productNameAr || s.productNameFr) : s.productNameFr))
                          .join(" + ")}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-luxury-text shrink-0 text-xs">
                    {formatPrice(p.unitPriceDZD * p.quantity, locale)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-luxury-border/30 flex items-center justify-between text-xs font-semibold text-luxury-accent">
              <span>{locale === "ar" ? "المجموع المطلوب عند الاستلام :" : "Total à régler à la livraison :"}</span>
              <span className="text-sm font-bold text-luxury-accent">
                {formatPrice(orderTotal, locale)}
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <a href={`/${locale}`}>
            <Button variant="default" size="lg">
              {locale === "ar" ? "العودة للرئيسية" : "Retour à l'accueil"}
            </Button>
          </a>
          <a href={`/${locale}/shop`}>
            <Button variant="secondary" size="lg">
              {locale === "ar" ? "متابعة التسوق" : "Continuer mes achats"}
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // ─── Confirming (Loading) State ────────────────────────────────────────────
  if (step === "confirming") {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <Loader2 className="w-10 h-10 text-luxury-accent animate-spin mx-auto mb-4" />
        <p className="text-luxury-text-secondary">
          {locale === "ar"
            ? "جارٍ تسجيل طلبيتك، يرجى الانتظار..."
            : "Enregistrement de votre commande en cours..."}
        </p>
      </div>
    );
  }

  // ─── Main Form ────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Checkout Form */}
      <div className="lg:col-span-2">
        <h2 className="font-serif text-2xl font-medium text-luxury-text mb-6">
          {locale === "ar" ? "معلومات التوصيل" : "Informations de livraison"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Nom & Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
              >
                {locale === "ar" ? "الاسم الكامل *" : "Nom & Prénom *"}
              </label>
              <input
                id="fullName"
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
                htmlFor="phone"
                className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
              >
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  {locale === "ar" ? "رقم الهاتف *" : "Téléphone *"}
                </div>
              </label>
              <input
                id="phone"
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

          {/* Wilaya + Commune */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="wilayaCode"
                className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {locale === "ar" ? "الولاية *" : "Wilaya *"}
                </div>
              </label>
              <div className="relative">
                <select
                  id="wilayaCode"
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
                      {w.code} —{" "}
                      {locale === "ar" ? w.name_ar : w.name_fr}
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
                htmlFor="communeName"
                className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
              >
                {locale === "ar" ? "البلدية *" : "Commune *"}
              </label>
              <div className="relative">
                <select
                  id="communeName"
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
                  {selectedWilaya?.communes.map((c) => (
                    <option
                      key={locale === "ar" ? c.ar : c.fr}
                      value={locale === "ar" ? c.ar : c.fr}
                    >
                      {locale === "ar" ? c.ar : c.fr}
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


          {/* Notes */}
          <div>
            <label
              htmlFor="deliveryNotes"
              className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-luxury-text-muted" />
                {locale === "ar"
                  ? "ملاحظات للتوصيل (اختياري)"
                  : "Notes de livraison (optionnel)"}
              </div>
            </label>
            <textarea
              id="deliveryNotes"
              rows={2}
              placeholder={
                locale === "ar"
                  ? "مثال: متاح للاتصال بعد 18 ساعة، أمام المستشفى..."
                  : "ex: Disponible après 18h, en face de l'hôpital..."
              }
              {...register("deliveryNotes")}
              className="w-full px-3.5 py-2.5 border border-luxury-border/60 rounded-[4px] text-sm bg-white text-luxury-text placeholder:text-luxury-text-muted focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors resize-none"
            />
          </div>

          {/* COD Reminder */}
          <div className="flex items-start gap-3 p-4 bg-luxury-secondary/60 border border-luxury-border/30 rounded-[4px]">
            <ShieldCheck className="w-5 h-5 text-luxury-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-luxury-text">
                {locale === "ar"
                  ? "الدفع نقداً عند الاستلام (COD)"
                  : "Paiement à la livraison (COD)"}
              </p>
              <p className="text-xs text-luxury-text-secondary mt-0.5">
                {locale === "ar"
                  ? "لن تتم محاسبتك حتى تستلم طلبيتك. لا نقبل أي تحويلات بنكية مسبقة."
                  : "Vous ne payez qu'à la réception de votre colis. Aucun virement bancaire n'est demandé."}
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={isPending}
            className="w-full gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {locale === "ar" ? "جارٍ التسجيل..." : "Enregistrement..."}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {locale === "ar"
                    ? "تأكيد الطلبية"
                    : "Confirmer la commande"}
                </span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-6 sticky top-24">
          <h3 className="font-serif text-base font-medium text-luxury-text mb-4">
            {locale === "ar" ? "مراجعة الطلبية" : "Récapitulatif"}
          </h3>

          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-2 text-xs">
                <div className="w-8 h-8 rounded-[2px] bg-luxury-secondary/70 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-luxury-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-luxury-text leading-tight truncate">
                    {locale === "ar" ? item.productNameAr : item.productNameFr}
                  </p>
                  <p className="text-luxury-text-muted">
                    {item.size} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold text-luxury-text shrink-0">
                  {formatPrice(item.unitPriceDZD * item.quantity, locale)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-luxury-border/30 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-luxury-text-secondary">
              <span>{locale === "ar" ? "المجموع الفرعي" : "Sous-total"}</span>
              <span>{formatPrice(subtotalDZD, locale)}</span>
            </div>
            <div className="flex justify-between text-luxury-text-secondary">
              <span>
                {locale === "ar" ? "التوصيل" : "Livraison"}
              </span>
              <span>
                {selectedWilaya
                  ? formatPrice(deliveryFee, locale)
                  : locale === "ar"
                  ? "يُحدد بعد الولاية"
                  : "selon wilaya"}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-luxury-text border-t border-luxury-border/30 pt-2 mt-2 text-sm">
              <span>{locale === "ar" ? "المجموع" : "Total COD"}</span>
              <span>{formatPrice(totalDZD, locale)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          {selectedWilaya && (
            <div className="mt-4 p-3 bg-luxury-secondary/50 rounded-[3px]">
              <div className="flex items-center gap-1.5 text-[10px] text-luxury-text-secondary">
                <Truck className="w-3.5 h-3.5 text-luxury-accent" />
                <span>
                  {locale === "ar"
                    ? `ولاية: ${selectedWilaya.name_ar} — رسوم التوصيل: ${formatPrice(selectedWilaya.deliveryFeeDZD, locale)}`
                    : `Wilaya: ${selectedWilaya.name_fr} — Livraison: ${formatPrice(selectedWilaya.deliveryFeeDZD, locale)}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
