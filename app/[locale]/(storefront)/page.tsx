import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Locale, getDictionary } from "@/lib/i18n";
import { getProducts } from "@/lib/services/products.service";
import { getCollections } from "@/lib/services/collections.service";
import { ProductCard } from "@/components/storefront/product-card";
import { SeasonsGrid } from "@/components/storefront/seasons-grid";
import { Button } from "@/components/ui/button";
import { getStorefrontContent } from "@/lib/services/storefront-content.service";
import { getTestimonials } from "@/lib/services/testimonials.service";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import {
  ArrowRight,
  Sparkles,
  Droplets,
  ShieldCheck,
  Box,
  Star,
  Quote,
  Instagram,
  CheckCircle2,
} from "lucide-react";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const dict = getDictionary(locale);

  const allProducts = await getProducts();
  const featuredPerfumes = allProducts.slice(0, 4);
  const bestSellers = allProducts.filter((p) => p.isBestseller);
  const collections = await getCollections();
  const storefrontContent = await getStorefrontContent();
  const hero = storefrontContent.hero;
  const gender = storefrontContent.gender;
  const collectionsContent = storefrontContent.collections;
  const customPackContent = storefrontContent.customPack;
  const realTestimonials = await getTestimonials();
  const perfumesList = allProducts.map((p) => ({
    nameFr: p.name.fr,
    nameAr: p.name.ar,
  }));

  const formatLocalizedHref = (link?: string) => {
    if (!link) return `/${locale}`;
    if (link.startsWith("http://") || link.startsWith("https://")) return link;
    if (link.startsWith(`/${locale}/`) || link === `/${locale}`) return link;
    return `/${locale}${link.startsWith("/") ? link : `/${link}`}`;
  };

  const isValidImageSrc = (src?: string | null): boolean => {
    if (!src || typeof src !== "string") return false;
    const s = src.trim();
    if (!s) return false;
    if (s.startsWith("/")) return true;
    if (s.startsWith("http://") || s.startsWith("https://")) {
      try {
        new URL(s);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const instagramShots = [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
      alt: "Flacon Oud Royal en atelier",
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600",
      alt: "Coffret trio luxe",
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600",
      alt: "Imperial Santal sur marbre",
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600",
      alt: "Fleur de Soie et pétales",
    },
  ];

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[82vh] flex items-center justify-center bg-luxury-secondary/60 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text Column */}
          <div className="space-y-6 text-center lg:text-left rtl:lg:text-right z-10">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-[3px] bg-luxury-surface text-luxury-accent text-[11px] uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === "ar" ? hero.badgeAr : hero.badgeFr}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-luxury-text tracking-tight leading-[1.15]">
              {locale === "ar" ? hero.titleAr : hero.titleFr}
            </h1>

            <p className="text-sm sm:text-base text-luxury-text-secondary max-w-lg leading-relaxed font-sans font-light">
              {locale === "ar" ? hero.subtitleAr : hero.subtitleFr}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start rtl:lg:justify-start gap-4">
              <Link href={hero.primaryBtnLink.startsWith("http") ? hero.primaryBtnLink : `/${locale}${hero.primaryBtnLink.startsWith("/") ? hero.primaryBtnLink : `/${hero.primaryBtnLink}`}`}>
                <Button size="lg" variant="default" className="w-full sm:w-auto">
                  <span>{locale === "ar" ? hero.primaryBtnTextAr : hero.primaryBtnTextFr}</span>
                  <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                </Button>
              </Link>
              <Link href={hero.secondaryBtnLink.startsWith("http") ? hero.secondaryBtnLink : `/${locale}${hero.secondaryBtnLink.startsWith("/") ? hero.secondaryBtnLink : `/${hero.secondaryBtnLink}`}`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <span>{locale === "ar" ? hero.secondaryBtnTextAr : hero.secondaryBtnTextFr}</span>
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center lg:justify-start rtl:lg:justify-start space-x-6 rtl:space-x-reverse text-xs text-luxury-text-muted">
              <div>
                <span className="font-semibold text-luxury-text block text-sm">58 Wilayas</span>
                <span>{locale === "ar" ? "توصيل آمن" : "Livraison suivie"}</span>
              </div>
              <div className="h-6 w-px bg-luxury-border" />
              <div>
                <span className="font-semibold text-luxury-text block text-sm">COD</span>
                <span>{locale === "ar" ? "الدفع عند الاستلام" : "Règlement à réception"}</span>
              </div>
              <div className="h-6 w-px bg-luxury-border" />
              <div>
                <span className="font-semibold text-luxury-text block text-sm">25ml — 100ml</span>
                <span>{locale === "ar" ? "أحجام مستقلة" : "Formats ajustables"}</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none">
            <div className="absolute inset-0 rounded-[6px] overflow-hidden bg-luxury-surface">
              <Image
                src={hero.imageUrl}
                alt="Éline Parfumerie Haute Joaillerie Olfactive"
                fill
                priority
                className="object-cover object-center"
              />
            </div>
            {/* Subtle floating badge */}
            <div className="absolute bottom-6 left-6 rtl:left-auto rtl:right-6 bg-white/95 backdrop-blur-md p-4 rounded-[4px] shadow-floating max-w-[220px]">
              <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
                {locale === "ar" ? hero.floatingBadgeTopAr : hero.floatingBadgeTopFr}
              </span>
              <p className="font-serif text-sm font-medium text-luxury-text">
                {locale === "ar" ? hero.floatingBadgeTitleAr : hero.floatingBadgeTitleFr}
              </p>
              <span className="text-[11px] text-luxury-text-secondary block mt-0.5">
                {locale === "ar" ? hero.floatingBadgeSubAr : hero.floatingBadgeSubFr}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY GENDER */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-2">
            {locale === "ar" ? gender.headerTagAr : gender.headerTagFr}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
            {locale === "ar" ? gender.headerTitleAr : gender.headerTitleFr}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Men */}
          <Link
            href={gender.men.link.startsWith("http") ? gender.men.link : `/${locale}${gender.men.link.startsWith("/") ? gender.men.link : `/${gender.men.link}`}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-[4px] bg-luxury-secondary flex items-end p-8"
          >
            <Image
              src={gender.men.imageUrl}
              alt="Parfums Pour Homme"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="relative z-10 text-white">
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold block">
                {locale === "ar" ? gender.men.tagAr : gender.men.tagFr}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mt-1">
                {locale === "ar" ? gender.men.titleAr : gender.men.titleFr}
              </h3>
              <p className="text-xs text-white/80 mt-1">
                {locale === "ar" ? gender.men.subtitleAr : gender.men.subtitleFr}
              </p>
            </div>
          </Link>

          {/* Women */}
          <Link
            href={gender.women.link.startsWith("http") ? gender.women.link : `/${locale}${gender.women.link.startsWith("/") ? gender.women.link : `/${gender.women.link}`}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-[4px] bg-luxury-secondary flex items-end p-8"
          >
            <Image
              src={gender.women.imageUrl}
              alt="Parfums Pour Femme"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="relative z-10 text-white">
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold block">
                {locale === "ar" ? gender.women.tagAr : gender.women.tagFr}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mt-1">
                {locale === "ar" ? gender.women.titleAr : gender.women.titleFr}
              </h3>
              <p className="text-xs text-white/80 mt-1">
                {locale === "ar" ? gender.women.subtitleAr : gender.women.subtitleFr}
              </p>
            </div>
          </Link>

          {/* Unisex */}
          <Link
            href={gender.unisex.link.startsWith("http") ? gender.unisex.link : `/${locale}${gender.unisex.link.startsWith("/") ? gender.unisex.link : `/${gender.unisex.link}`}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-[4px] bg-luxury-secondary flex items-end p-8"
          >
            <Image
              src={gender.unisex.imageUrl}
              alt="Parfums Mixtes Unisexe"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="relative z-10 text-white">
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold block">
                {locale === "ar" ? gender.unisex.tagAr : gender.unisex.tagFr}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mt-1">
                {locale === "ar" ? gender.unisex.titleAr : gender.unisex.titleFr}
              </h3>
              <p className="text-xs text-white/80 mt-1">
                {locale === "ar" ? gender.unisex.subtitleAr : gender.unisex.subtitleFr}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED PERFUMES */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-luxury-border/30">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
              {locale === "ar" ? "مختارات حصرية" : "Sélection Maître-Parfumeur"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
              {locale === "ar" ? "عطور استثنائية موصى بها" : "Créations Remarquables"}
            </h2>
          </div>
          <Link href={`/${locale}/shop`} className="mt-4 sm:mt-0">
            <Button variant="ghost" size="sm" className="text-xs">
              <span>{locale === "ar" ? "مشاهدة الكل" : "Découvrir tout le catalogue"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:ml-0 rtl:mr-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredPerfumes.map((perfume) => (
            <ProductCard key={perfume.id} product={perfume} locale={locale} />
          ))}
        </div>
      </section>

      {/* 4. THE 4 SEASONS OLFACTORY HARMONIES */}
      <SeasonsGrid products={allProducts} locale={locale} customContent={storefrontContent.seasons} />

      {/* 5. SEASONAL COLLECTIONS SHOWCASE */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-luxury-border/30">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
              {locale === "ar" ? collectionsContent.headerTagAr : collectionsContent.headerTagFr}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
              {locale === "ar" ? collectionsContent.headerTitleAr : collectionsContent.headerTitleFr}
            </h2>
          </div>
          <Link href={formatLocalizedHref(collectionsContent.linkUrl || "/collections")}>
            <Button variant="ghost" size="sm" className="text-xs">
              <span>{locale === "ar" ? collectionsContent.linkTextAr : collectionsContent.linkTextFr}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:ml-0 rtl:mr-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[collectionsContent?.card1, collectionsContent?.card2].filter(Boolean).map((card, idx) => (
            <Link
              key={idx}
              href={formatLocalizedHref(card.linkUrl || "/collections")}
              className="group relative rounded-[6px] overflow-hidden bg-luxury-surface min-h-[320px] flex items-end p-8"
            >
              {isValidImageSrc(card.imageUrl) ? (
                <Image
                  src={card.imageUrl.trim()}
                  alt={locale === "ar" ? card.titleAr : card.titleFr}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold">
                  {locale === "ar" ? card.tagAr : card.tagFr}
                </span>
                <h3 className="font-serif text-2xl font-medium">
                  {locale === "ar" ? card.titleAr : card.titleFr}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 max-w-md pt-1">
                  {locale === "ar" ? card.descriptionAr : card.descriptionFr}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. CUSTOM PACK PROMOTIONAL SECTION */}
      <section className="bg-luxury-surface py-20">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left rtl:lg:text-right">
            <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-[3px] bg-white text-luxury-accent text-[11px] uppercase tracking-wider font-semibold">
              <Box className="w-3.5 h-3.5" />
              <span>{locale === "ar" ? customPackContent?.badgeAr : customPackContent?.badgeFr}</span>
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-luxury-text leading-tight">
              {locale === "ar" ? customPackContent?.titleAr : customPackContent?.titleFr}
            </h2>

            <p className="text-sm text-luxury-text-secondary leading-relaxed max-w-md">
              {locale === "ar" ? customPackContent?.descriptionAr : customPackContent?.descriptionFr}
            </p>

            <div className="space-y-3 pt-2 text-xs text-luxury-text-secondary">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-luxury-text text-white text-[10px] font-bold">1</span>
                <span>{locale === "ar" ? customPackContent?.step1Ar : customPackContent?.step1Fr}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-luxury-text text-white text-[10px] font-bold">2</span>
                <span>{locale === "ar" ? customPackContent?.step2Ar : customPackContent?.step2Fr}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-luxury-text text-white text-[10px] font-bold">3</span>
                <span>{locale === "ar" ? customPackContent?.step3Ar : customPackContent?.step3Fr}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link href={formatLocalizedHref(customPackContent?.btnLink || "/packs/builder")}>
                <Button size="lg" variant="accent">
                  <span>{locale === "ar" ? customPackContent?.btnTextAr : customPackContent?.btnTextFr}</span>
                  <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full rounded-[6px] overflow-hidden bg-luxury-secondary shadow-luxury">
            {isValidImageSrc(customPackContent?.imageUrl) ? (
              <Image
                src={customPackContent.imageUrl.trim()}
                alt={locale === "ar" ? customPackContent.titleAr : customPackContent.titleFr}
                fill
                className="object-cover object-center"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-luxury-secondary" />
            )}
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-2">
            {locale === "ar" ? "الأكثر طلباً" : "Incontournables"}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
            {locale === "ar" ? "عطور أثبتت جدارتها ونالت إعجاب زبائننا" : "Les Créations Plébiscitées"}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {bestSellers.map((perfume) => (
            <ProductCard key={perfume.id} product={perfume} locale={locale} />
          ))}
        </div>
      </section>

      {/* 7. REAL CUSTOMER TESTIMONIALS & REVIEWS */}
      <TestimonialsSection
        initialTestimonials={realTestimonials}
        locale={locale}
        perfumesList={perfumesList}
      />

      {/* 8. ATELIER INSTAGRAM & SOCIAL GALLERY */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs uppercase tracking-widest text-luxury-accent font-semibold mb-2">
            <Instagram className="w-3.5 h-3.5" />
            <span>@elineparfumerie</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
            {locale === "ar" ? "من ورشتنا إلى حضوركم الراقي" : "L'Atelier au Quotidien"}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {instagramShots.map((shot) => (
            <div
              key={shot.id}
              className="relative aspect-square rounded-[4px] overflow-hidden bg-luxury-secondary group"
            >
              <Image
                src={shot.img}
                alt={shot.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Instagram className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. ARTISANAL COMMITMENT PILLARS */}
      <section className="container mx-auto px-4 sm:px-6 pb-8">
        <div className="p-10 sm:p-14 rounded-[6px] bg-luxury-secondary/80 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-serif font-medium text-luxury-accent">100%</div>
            <h4 className="font-serif text-base font-medium text-luxury-text">
              {locale === "ar" ? "تركيزات نقية" : "Huiles Concentrées Pures"}
            </h4>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              {locale === "ar"
                ? "زيوت خام غير مخففة يتم وزنها ومزجها بدقة بالغة."
                : "Matières premières d'exception formulées avec précision."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-serif font-medium text-luxury-accent">X4 & X8</div>
            <h4 className="font-serif text-base font-medium text-luxury-text">
              {locale === "ar" ? "تصنيفات احترافية" : "Classifications Spéciales"}
            </h4>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              {locale === "ar"
                ? "خيارات مخصصة تلبي رغبات الباحثين عن قوة الفوحان والثبات."
                : "Formulations haut de gamme offrant une projection et une tenue exceptionnelles."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-serif font-medium text-luxury-accent">58</div>
            <h4 className="font-serif text-base font-medium text-luxury-text">
              {locale === "ar" ? "تغطية كامل التراب الوطني" : "Wilayas Couvertes"}
            </h4>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              {locale === "ar"
                ? "توصيل سريع حتى باب المنزل مع الدفع نقداً عند استلام طلبيتك."
                : "Livraison à domicile rapide avec paiement à réception en espèces."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
