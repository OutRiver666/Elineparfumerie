import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Locale, getDictionary } from "@/lib/i18n";
import { getCollections } from "@/lib/services/collections.service";
import { ArrowRight } from "lucide-react";

interface CollectionsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CollectionsPage({ params }: CollectionsPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const dict = getDictionary(locale);

  const collections = await getCollections();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-2">
          {locale === "ar" ? "تشكيلات حصرية" : "Sillages & Inspirations"}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-luxury-text mb-3">
          {dict.nav.collections}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-text-secondary leading-relaxed font-light">
          {locale === "ar"
            ? "استكشف مجموعاتنا العطرية المصنفة بحسب المواسم وطبيعة المناسبات، لتجد العطر الذي يعبر بدقة عن حضورك."
            : "Explorez nos univers thématiques composés autour de terroirs précieux, d'accords saisonniers et de concentrations intenses."}
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.map((col) => {
          const name = col.name[locale] || col.name.fr;
          const subtitle = col.subtitle[locale] || col.subtitle.fr;
          const description = col.description[locale] || col.description.fr;

          return (
            <Link
              key={col.id}
              href={`/${locale}/collections/${col.slug}`}
              className="group flex flex-col bg-luxury-secondary/40 rounded-[6px] overflow-hidden hover:bg-luxury-secondary transition-all"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-luxury-surface">
                <Image
                  src={col.image}
                  alt={name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                {col.tag && (
                  <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 px-2.5 py-1 rounded-[3px] bg-white/95 text-[10px] uppercase tracking-wider font-semibold text-luxury-accent shadow-subtle">
                    {col.tag}
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-semibold mb-1">
                  {subtitle}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-luxury-text mb-2">
                  {name}
                </h3>
                <p className="text-xs text-luxury-text-secondary leading-relaxed line-clamp-2 mb-4 font-light">
                  {description}
                </p>

                <div className="mt-auto pt-2 flex items-center text-xs font-medium text-luxury-text group-hover:text-luxury-accent transition-colors">
                  <span>{locale === "ar" ? "استكشف المجموعة" : "Découvrir la sélection"}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:ml-0 rtl:mr-1.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
