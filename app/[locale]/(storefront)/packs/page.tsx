import React from "react";
import Link from "next/link";
import { Locale, getDictionary } from "@/lib/i18n";
import { getBundles } from "@/lib/services/bundles.service";
import { PackCard } from "@/components/storefront/pack-card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Package } from "lucide-react";

interface PacksPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PacksPage({ params }: PacksPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const dict = getDictionary(locale);

  const bundles = await getBundles();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-2">
          {dict.packs.subtitle}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-luxury-text mb-3">
          {dict.packs.title}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-text-secondary leading-relaxed">
          {locale === "ar"
            ? "استمتع بباقاتنا الجاهزة أو قم بتصميم باقتك الخاصة باختيار عطورك وسعاتك المفضلة."
            : "Découvrez nos coffrets signatures prêts à offrir ou créez votre propre sélection personnalisée dans notre atelier."}
        </p>
      </div>

      {/* Build Your Own Pack Banner */}
      <div className="p-8 sm:p-12 rounded-[6px] bg-luxury-surface grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-0.5 rounded-[3px] bg-white text-luxury-accent text-[10px] uppercase tracking-wider font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>{dict.packs.customTitle}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
            {dict.packs.buildYourOwn}
          </h2>
          <p className="text-xs sm:text-sm text-luxury-text-secondary max-w-lg leading-relaxed">
            {locale === "ar"
              ? "تحكم بالكامل في عطور باقتك: اختر 3 عطور من رغبتك وسعة القوارير واحصل على خصم 15% فوري."
              : "Composez votre coffret de 3 parfums en toute liberté. Choisissez les fragrances et les formats exacts avec 15% de remise immédiate."}
          </p>
        </div>
        <div className="text-center md:text-right rtl:md:text-left">
          <Link href={`/${locale}/packs/builder`}>
            <Button size="lg" variant="accent">
              <span>{locale === "ar" ? "ابدأ التصميم الآن" : "Composer mon pack"}</span>
              <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Predefined Packs Showcase */}
      <div className="space-y-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "تشكيلات جاهزة للشحن" : "Prêts à offrir"}
          </span>
          <h3 className="font-serif text-2xl font-medium text-luxury-text">
            {dict.packs.predefinedTitle}
          </h3>
        </div>

        {bundles.length === 0 ? (
          <div className="bg-luxury-secondary/30 rounded-[4px] p-12 text-center">
            <Package className="w-8 h-8 text-luxury-text-muted mx-auto mb-2" />
            <p className="text-luxury-text font-medium text-sm">
              {locale === "ar" ? "لا توجد باقات جاهزة حالياً" : "Aucun coffret disponible pour le moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bundles.map((bundle) => (
              <PackCard
                key={bundle.id}
                bundle={bundle}
                locale={locale}
                addToCartLabel={dict.product.addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
