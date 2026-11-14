import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { getProductBySlug, getProducts } from "@/lib/services/products.service";
import { ProductDetailsClient } from "@/components/storefront/product-details-client";
import { ProductCard } from "@/components/storefront/product-card";
import { ArrowLeft } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const slug = resolved.slug;

  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  // Related perfumes in the same fragrance family or other creations
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-20">
      {/* Back button */}
      <div>
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-luxury-text-muted hover:text-luxury-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{locale === "ar" ? "العودة إلى المتجر" : "Retour à la boutique"}</span>
        </Link>
      </div>

      {/* Main Product Showcase Client Component */}
      <ProductDetailsClient product={product} locale={locale} />

      {/* Related Products Recommendations */}
      <div className="pt-14 border-t border-luxury-border/30">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "تشكيلات مكملة" : "Accords Complémentaires"}
          </span>
          <h3 className="font-serif text-2xl font-medium text-luxury-text">
            {locale === "ar" ? "عطور أخرى قد تروق لذوقك" : "Vous Aimerez Aussi"}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}
