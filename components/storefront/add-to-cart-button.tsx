"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  productNameFr: string;
  productNameAr: string;
  size: string;
  classification?: "X2" | "X3" | "X4" | "X5" | "X6" | "X7" | "X8";
  unitPriceDZD: number;
  slug: string;
  locale: string;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  variantId,
  productNameFr,
  productNameAr,
  size,
  classification,
  unitPriceDZD,
  slug,
  locale,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (disabled) return;

    addItem({
      itemType: "single_product",
      productId,
      variantId,
      productNameFr,
      productNameAr,
      size,
      classification,
      quantity: 1,
      unitPriceDZD,
      slug,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || added}
      variant="default"
      size="lg"
      className="w-full gap-2 transition-all duration-300"
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          <span>
            {locale === "ar" ? "تمت الإضافة إلى السلة ✓" : "Ajouté au panier ✓"}
          </span>
        </>
      ) : disabled ? (
        <span>
          {locale === "ar" ? "غير متوفر" : "Rupture de stock"}
        </span>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          <span>
            {locale === "ar" ? "أضف إلى السلة" : "Ajouter au panier"}
          </span>
        </>
      )}
    </Button>
  );
}
