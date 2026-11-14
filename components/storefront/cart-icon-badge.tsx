"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag } from "lucide-react";

interface CartIconBadgeProps {
  locale: string;
}

export function CartIconBadge({ locale }: CartIconBadgeProps) {
  const { itemCount } = useCart();

  return (
    <Link
      href={`/${locale}/cart`}
      className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-luxury-secondary transition-colors"
      aria-label={locale === "ar" ? "سلة المشتريات" : "Panier"}
    >
      <ShoppingBag className="w-5 h-5 text-luxury-text" />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 rtl:-left-0.5 rtl:right-auto min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-luxury-accent text-white text-[9px] font-bold px-[3px] leading-none">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
