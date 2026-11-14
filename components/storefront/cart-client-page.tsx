"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart, CartItem } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Package,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { CheckoutForm } from "./checkout-form";

interface CartClientPageProps {
  locale: Locale;
  dict: {
    cart: {
      title: string;
      emptyMessage: string;
      continueShopping: string;
      checkout: string;
    };
  };
}

export function CartClientPage({ locale, dict }: CartClientPageProps) {
  const { items, itemCount, subtotalDZD, removeItem, updateQuantity, clearCart } =
    useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    totalDZD: number;
    items: CartItem[];
  } | null>(null);

  // Delivery fee estimation
  const estimatedDelivery = 600;
  const estimatedTotal = subtotalDZD + estimatedDelivery;

  // 1. Success confirmation after completing checkout
  if (placedOrder) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 max-w-xl text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-luxury-text mb-3">
          {locale === "ar"
            ? "شكراً لطلبك ! تم تسجيل طلبيتك بنجاح"
            : "Merci pour votre commande !"}
        </h1>
        <p className="text-luxury-text-secondary mb-6 text-sm max-w-md mx-auto">
          {locale === "ar"
            ? "تم استلام طلبيتك بنجاح وسيتصل بك فريقنا هاتفياً قريباً لتأكيد موعد وتفاصيل التوصيل."
            : "Votre commande a été enregistrée avec succès. Notre équipe vous appellera très prochainement par téléphone pour confirmer votre commande et convenir de la date de livraison."}
        </p>

        {placedOrder.items && placedOrder.items.length > 0 && (
          <div className="p-5 bg-luxury-secondary/70 border border-luxury-border/40 rounded-[6px] text-left rtl:text-right max-w-md w-full mx-auto mb-8">
            <p className="text-xs uppercase tracking-wider font-semibold text-luxury-text mb-3 flex items-center justify-between border-b border-luxury-border/30 pb-2">
              <span>{locale === "ar" ? "المنتجات المطلوبة :" : "Produits commandés :"}</span>
              <span className="text-[11px] text-luxury-text-muted font-normal">
                {placedOrder.items.length} {locale === "ar" ? "عنصر" : (placedOrder.items.length > 1 ? "articles" : "article")}
              </span>
            </p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {placedOrder.items.map((p, idx) => (
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
              <span>
                {locale === "ar" ? "المجموع المطلوب عند الاستلام :" : "Total à régler à la livraison :"}
              </span>
              <span className="text-sm font-bold text-luxury-accent">
                {formatPrice(placedOrder.totalDZD, locale)}
              </span>
            </div>
          </div>
        )}

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

  // 2. Active checkout flow
  if (showCheckout) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        <button
          onClick={() => setShowCheckout(false)}
          className="flex items-center gap-2 text-xs text-luxury-text-muted hover:text-luxury-text mb-6 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>{locale === "ar" ? "العودة إلى السلة" : "Retour au panier"}</span>
        </button>
        <CheckoutForm
          locale={locale}
          onOrderSuccess={(info) => setPlacedOrder(info)}
        />
      </div>
    );
  }

  // 3. True empty cart
  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 max-w-4xl text-center">
        <div className="w-16 h-16 rounded-full bg-luxury-secondary mx-auto flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-luxury-text-muted" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-luxury-text mb-3">
          {locale === "ar" ? "سلة مشترياتك فارغة" : "Votre panier est vide"}
        </h1>
        <p className="text-luxury-text-secondary mb-8 max-w-sm mx-auto">
          {locale === "ar"
            ? "اكتشف عطورنا الفاخرة وأضف ما يعجبك إلى سلتك."
            : "Explorez notre catalogue de parfums de luxe et ajoutez vos favorites."}
        </p>
        <Link href={`/${locale}/shop`}>
          <Button size="lg" variant="default" className="gap-2">
            <span>
              {locale === "ar" ? "استعرض المتجر" : "Explorer la boutique"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        {/* Reassurance */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-luxury-text-muted">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-luxury-accent" />
            <span>
              {locale === "ar"
                ? "توصيل إلى 58 ولاية"
                : "Livraison dans toute l'Algérie"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-luxury-accent" />
            <span>
              {locale === "ar"
                ? "دفع نقداً عند الاستلام"
                : "Paiement à la livraison (COD)"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      {/* Page Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-luxury-text">
            {dict.cart.title}
          </h1>
          <p className="text-sm text-luxury-text-secondary mt-1">
            {itemCount}{" "}
            {locale === "ar"
              ? itemCount === 1
                ? "منتج في سلتك"
                : "منتجات في سلتك"
              : itemCount === 1
              ? "article dans votre panier"
              : "articles dans votre panier"}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-luxury-text-muted hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{locale === "ar" ? "إفراغ السلة" : "Vider le panier"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-luxury-border/30 rounded-[4px] p-4 flex gap-4"
            >
              {/* Product Icon */}
              <div className="w-16 h-16 rounded-[3px] bg-luxury-secondary/70 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-luxury-text-muted" />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-luxury-text text-sm leading-tight">
                      {locale === "ar"
                        ? item.productNameAr
                        : item.productNameFr}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-luxury-text-muted bg-luxury-secondary px-1.5 py-0.5 rounded-[2px]">
                        {item.size}
                      </span>
                      {item.classification && (
                        <span className="text-[10px] text-luxury-accent bg-luxury-accent/10 px-1.5 py-0.5 rounded-[2px] font-semibold">
                          {item.classification}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-luxury-text-muted hover:text-red-500 transition-colors p-1 shrink-0"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 border border-luxury-border/40 rounded-[3px] overflow-hidden">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.id, item.quantity - 1)
                          : removeItem(item.id)
                      }
                      className="p-1.5 hover:bg-luxury-secondary transition-colors text-luxury-text"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-luxury-text">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-luxury-secondary transition-colors text-luxury-text"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-luxury-text text-sm">
                      {formatPrice(item.unitPriceDZD * item.quantity, locale)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-luxury-text-muted">
                        {formatPrice(item.unitPriceDZD, locale)}{" "}
                        {locale === "ar" ? "× " : "× "}
                        {item.quantity}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <div className="pt-2">
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-1.5 text-xs text-luxury-text-muted hover:text-luxury-accent transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              <span>
                {locale === "ar"
                  ? "متابعة التسوق"
                  : "Continuer mes achats"}
              </span>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-luxury-border/30 rounded-[4px] p-6 sticky top-24">
            <h2 className="font-serif text-lg font-medium text-luxury-text mb-6">
              {locale === "ar" ? "ملخص الطلبية" : "Résumé de la commande"}
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-luxury-text-secondary">
                <span>
                  {locale === "ar" ? "المجموع الفرعي" : "Sous-total"}
                </span>
                <span>{formatPrice(subtotalDZD, locale)}</span>
              </div>
              <div className="flex items-start justify-between text-luxury-text-secondary">
                <span>
                  {locale === "ar" ? "رسوم التوصيل" : "Frais de livraison"}
                </span>
                <div className="text-right">
                  <span className="block">
                    {formatPrice(estimatedDelivery, locale)}
                  </span>
                  <span className="text-[10px] text-luxury-text-muted">
                    {locale === "ar"
                      ? "(تُحدد بعد إدخال الولاية)"
                      : "(selon la wilaya)"}
                  </span>
                </div>
              </div>
              <div className="border-t border-luxury-border/30 pt-3 flex items-center justify-between font-semibold text-luxury-text">
                <span>
                  {locale === "ar"
                    ? "المجموع المقدر"
                    : "Total estimé COD"}
                </span>
                <span>{formatPrice(estimatedTotal, locale)}</span>
              </div>
            </div>

            {/* COD Notice */}
            <div className="mt-4 p-3 bg-luxury-secondary/60 rounded-[3px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-luxury-accent shrink-0 mt-0.5" />
              <p className="text-[11px] text-luxury-text-secondary leading-relaxed">
                {locale === "ar"
                  ? "الدفع نقداً عند الاستلام فقط — لا يلزمك إدخال بطاقة بنكية"
                  : "Paiement en espèces à la livraison — aucune carte bancaire requise"}
              </p>
            </div>

            {/* Checkout CTA */}
            <Button
              onClick={() => setShowCheckout(true)}
              variant="default"
              size="lg"
              className="w-full mt-6 gap-2"
            >
              <span>
                {locale === "ar" ? "تأكيد الطلبية" : "Passer la commande"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Trust Signals */}
            <div className="mt-4 space-y-2 text-[10px] text-luxury-text-muted">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-luxury-accent" />
                <span>
                  {locale === "ar"
                    ? "توصيل إلى 58 ولاية جزائرية"
                    : "Livraison dans les 58 wilayas d'Algérie"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-luxury-accent" />
                <span>
                  {locale === "ar"
                    ? "طلبيتك تُعالج في يوم واحد"
                    : "Traitement de votre commande sous 24h"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
