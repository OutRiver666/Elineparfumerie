import React from "react";
import { Locale, getDictionary } from "@/lib/i18n";
import { CartClientPage } from "@/components/storefront/cart-client-page";

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const dict = getDictionary(locale);

  return (
    <CartClientPage
      locale={locale}
      dict={{
        cart: {
          title: dict.cart.title,
          emptyMessage: dict.cart.emptyMessage,
          continueShopping: dict.cart.continueShopping,
          checkout: dict.cart.checkout || "Commander",
        },
      }}
    />
  );
}
