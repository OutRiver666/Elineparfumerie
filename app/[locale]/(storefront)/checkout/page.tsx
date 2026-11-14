import React from "react";
import { Locale } from "@/lib/i18n";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const resolved = await params;
  const locale = (resolved.locale === "ar" ? "ar" : "fr") as Locale;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      <Link
        href={`/${locale}/cart`}
        className="inline-flex items-center gap-2 text-xs text-luxury-text-muted hover:text-luxury-text mb-6 transition-colors"
      >
        <ChevronRight className={`w-4 h-4 ${locale === "ar" ? "" : "rotate-180"}`} />
        <span>{locale === "ar" ? "العودة إلى السلة" : "Retour au panier"}</span>
      </Link>
      <CheckoutForm locale={locale} />
    </div>
  );
}
