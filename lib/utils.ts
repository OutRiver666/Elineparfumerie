import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format monetary values into Algerian Dinars (DZD)
 * Supports French (e.g., "4 500 DZD") and Arabic (e.g., "4,500 د.ج")
 */
export function formatPrice(amount: number, locale: "fr" | "ar" = "fr"): string {
  const formattedNumber = new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  if (locale === "ar") {
    return `${formattedNumber} د.ج`;
  }
  return `${formattedNumber} DZD`;
}

/**
 * Format bottle sizes
 */
export function formatBottleSize(size: string): string {
  if (size.endsWith("ml")) return size;
  return `${size}ml`;
}
