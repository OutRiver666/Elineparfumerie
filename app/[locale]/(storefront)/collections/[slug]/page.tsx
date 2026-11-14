import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { getCollectionBySlug } from "@/lib/services/collections.service";
import { ProductCard } from "@/components/storefront/product-card";
import { ArrowLeft } from "lucide-react";

interface CollectionDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const slug = resolved.slug;

  const { collection, products } = await getCollectionBySlug(slug);
  if (!collection) {
    notFound();
  }

  const name = collection.name[locale] || collection.name.fr;
  const subtitle = collection.subtitle[locale] || collection.subtitle.fr;
  const description = collection.description[locale] || collection.description.fr;

  return (
    <div className="space-y-16 py-10">
      {/* 1. HERO BANNER */}
      <div className="container mx-auto px-4 sm:px-6">
        <Link
          href={`/${locale}/collections`}
          className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-luxury-text-muted hover:text-luxury-text transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{locale === "ar" ? "كل المجموعات" : "Toutes les collections"}</span>
        </Link>

        <div className="relative rounded-[6px] overflow-hidden bg-luxury-secondary min-h-[340px] flex items-end p-8 sm:p-12">
          <Image
            src={collection.image}
            alt={name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="relative z-10 max-w-2xl text-white space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold block">
              {subtitle}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight">
              {name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light pt-1">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* 2. ASSIGNED PRODUCTS GRID */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-luxury-border/30 text-xs">
          <span className="uppercase tracking-wider text-luxury-text-muted font-medium">
            {locale === "ar" ? "قائمة العطور المشمولة" : "Flacons Sélectionnés"}
          </span>
          <span className="text-luxury-text font-semibold">
            {products.length} {locale === "ar" ? "عطور" : "créations"}
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-luxury-text-muted">
            {locale === "ar" ? "لا توجد عطور حالياً في هذه المجموعة" : "Aucun parfum dans cette collection pour le moment."}
          </div>
        )}
      </div>
    </div>
  );
}
