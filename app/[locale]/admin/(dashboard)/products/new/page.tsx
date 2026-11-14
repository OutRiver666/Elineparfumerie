import React from "react";
import { Locale } from "@/lib/i18n";
import { getFragranceFamilies } from "@/lib/actions/products";
import { ProductFormWrapper } from "@/components/admin/product-form-wrapper";

interface NewProductPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewProductPage({ params }: NewProductPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  const families = await getFragranceFamilies();

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
          {locale === "ar" ? "إضافة منتج" : "Nouveau Produit"}
        </span>
        <h2 className="font-serif text-2xl font-medium text-luxury-text">
          {locale === "ar" ? "إضافة عطر جديد" : "Créer un nouveau parfum"}
        </h2>
      </div>

      <ProductFormWrapper
        locale={locale}
        families={families}
        mode="create"
      />
    </div>
  );
}
