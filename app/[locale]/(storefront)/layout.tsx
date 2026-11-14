import React from "react";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { Locale } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart-context";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function StorefrontLayout({
  children,
  params,
}: StorefrontLayoutProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </div>
    </CartProvider>
  );
}
