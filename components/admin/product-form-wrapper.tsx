"use client";

import React from "react";
import { ProductFormClient } from "@/components/admin/product-form-client";
import { createProduct, updateProduct } from "@/lib/actions/products";

type FragranceFamily = { id: string; name_fr: string; name_ar: string };

interface ProductFormWrapperProps {
  locale: string;
  families: FragranceFamily[];
  mode: "create" | "edit";
  initialData?: any;
  productId?: string;
}

export function ProductFormWrapper({
  locale,
  families,
  mode,
  initialData,
  productId,
}: ProductFormWrapperProps) {
  const action = async (formData: FormData, loc: string) => {
    if (mode === "create") {
      return createProduct(formData, loc);
    } else {
      return updateProduct(productId!, formData, loc);
    }
  };

  return (
    <ProductFormClient
      locale={locale}
      families={families}
      action={action}
      initialData={initialData}
      mode={mode}
    />
  );
}
