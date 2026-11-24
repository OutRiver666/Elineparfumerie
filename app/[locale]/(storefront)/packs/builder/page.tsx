import React from "react";
import { Locale, getDictionary } from "@/lib/i18n";
import { getProducts } from "@/lib/services/products.service";
import { getCustomTiers } from "@/lib/services/bundles.service";
import { PackBuilderClient } from "@/components/storefront/pack-builder-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BuilderPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PackBuilderPage({ params }: BuilderPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const dict = getDictionary(locale);

  const [products, customTiers] = await Promise.all([
    getProducts(),
    getCustomTiers(),
  ]);

  return (
    <PackBuilderClient
      products={products}
      customTiers={customTiers}
      locale={locale}
      dict={dict}
    />
  );
}
