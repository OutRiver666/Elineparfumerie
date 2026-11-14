import React from "react";
import { notFound } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { getFragranceFamilies, getProductForEdit } from "@/lib/actions/products";
import { ProductFormWrapper } from "@/components/admin/product-form-wrapper";

interface EditProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const productId = resolved.id;

  const [product, families] = await Promise.all([
    getProductForEdit(productId),
    getFragranceFamilies(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
          {locale === "ar" ? "تعديل المنتج" : "Modifier le produit"}
        </span>
        <h2 className="font-serif text-2xl font-medium text-luxury-text">
          {locale === "ar" ? product.name_ar : product.name_fr}
        </h2>
      </div>

      <ProductFormWrapper
        locale={locale}
        families={families}
        initialData={product}
        productId={productId}
        mode="edit"
      />
    </div>
  );
}
