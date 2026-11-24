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
import { ThemedHero } from "@/components/storefront/themed-hero";
import { resolveStorefrontThemeId } from "@/lib/themes/storefront-themes";
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

export const dynamic = "force-dynamic";

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
  const activeThemeId = resolveStorefrontThemeId(storefrontContent.themeId);
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

  // Theme-specific UI layout tokens for non-hero sections
  const genderCardRadius =
    activeThemeId === "rose-de-grasse"
      ? "rounded-t-[140px] rounded-b-[20px] border border-luxury-border/70"
      : activeThemeId === "monochrome-editorial"
      ? "rounded-none border border-black"
      : activeThemeId === "azur-riviera"
      ? "rounded-2xl border-2 border-sky-100 shadow-sm"
      : activeThemeId === "oud-noir"
      ? "rounded-[4px] border border-[#D4AF6A]/25"
      : activeThemeId === "emeraude-imperiale"
      ? "rounded-[4px] border border-[#C5A059]/35"
      : activeThemeId === "midnight-sapphire"
      ? "rounded-xl border border-sky-400/20"
      : activeThemeId === "sahara-ambre"
      ? "rounded-2xl border border-[#E2D0BB]"
      : "rounded-[4px]";

  const collectionCardRadius =
    activeThemeId === "monochrome-editorial"
      ? "rounded-none border border-black"
      : activeThemeId === "rose-de-grasse"
      ? "rounded-[24px]"
      : activeThemeId === "azur-riviera" || activeThemeId === "sahara-ambre"
      ? "rounded-2xl"
      : activeThemeId === "midnight-sapphire"
      ? "rounded-xl border border-sky-400/20"
      : activeThemeId === "oud-noir"
      ? "rounded-[4px] border border-[#D4AF6A]/25"
      : "rounded-[6px]";

  const isMonochrome = activeThemeId === "monochrome-editorial";
  const isAzur = activeThemeId === "azur-riviera";
  const isEmerald = activeThemeId === "emeraude-imperiale";
  const isOudNoir = activeThemeId === "oud-noir";
  const isMidnight = activeThemeId === "midnight-sapphire";

  return (
    <div className="space-y-24">
      {/* 1. DYNAMIC THEMED HERO SECTION */}
      <ThemedHero themeId={activeThemeId} hero={hero} locale={locale} />

      {/* 2. SHOP BY GENDER */}
      <section className="container mx-auto px-4 sm:px-6">
        <div
          className={
            isMonochrome
              ? "flex flex-col sm:flex-row sm:items-end justify-between border-b border-black pb-4 mb-10 gap-2"
              : "text-center max-w-xl mx-auto mb-12"
          }
        >
          <div>
            <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-2">
              {isMonochrome ? "01 / " : ""}
              {locale === "ar" ? gender.headerTagAr : gender.headerTagFr}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
              {locale === "ar" ? gender.headerTitleAr : gender.headerTitleFr}
            </h2>
          </div>
          {isMonochrome && (
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              HOMME • FEMME • MIXTE
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Men */}
          <Link
            href={gender.men.link.startsWith("http") ? gender.men.link : `/${locale}${gender.men.link.startsWith("/") ? gender.men.link : `/${gender.men.link}`}`}
            className={`group relative aspect-[3/4] overflow-hidden bg-luxury-secondary flex items-end p-8 ${genderCardRadius}`}
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
            className={`group relative aspect-[3/4] overflow-hidden bg-luxury-secondary flex items-end p-8 ${genderCardRadius}`}
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
            className={`group relative aspect-[3/4] overflow-hidden bg-luxury-secondary flex items-end p-8 ${genderCardRadius}`}
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
        <div
          className={`flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b ${
            isMonochrome ? "border-black" : "border-luxury-border/40"
          }`}
        >
          <div>
            <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
              {isMonochrome ? "02 / " : ""}
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
        <div
          className={`flex items-center justify-between mb-8 pb-3 border-b ${
            isMonochrome ? "border-black" : "border-luxury-border/40"
          }`}
        >
          <div>
            <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
              {isMonochrome ? "03 / " : ""}
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
              className={`group relative overflow-hidden bg-luxury-surface min-h-[320px] flex items-end p-8 ${collectionCardRadius}`}
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

      {/* 5. CUSTOM PACK PROMOTIONAL SECTION (Theme-Adapted Showcase) */}
      <section
        className={
          isAzur
            ? "bg-[#0A1E3F] text-white py-20 border-y border-sky-400/20"
            : isEmerald
            ? "bg-[#0C2A22] text-[#FBF8F1] py-20 border-y border-[#C5A059]/30"
            : isOudNoir
            ? "bg-[#141316] py-20 border-y border-[#D4AF6A]/20"
            : isMidnight
            ? "bg-[#0E1F3D] py-20 border-y border-sky-400/20"
            : isMonochrome
            ? "bg-white py-20 border-y border-black"
            : "bg-luxury-surface py-20"
        }
      >
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left rtl:lg:text-right">
            <span
              className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1 text-[11px] uppercase tracking-wider font-semibold ${
                isAzur
                  ? "rounded-full bg-sky-400/15 text-sky-300 border border-sky-400/30"
                  : isEmerald
                  ? "rounded-[3px] bg-[#081F19] text-[#DFC07D] border border-[#C5A059]/40"
                  : isMonochrome
                  ? "rounded-none bg-black text-white"
                  : "rounded-[var(--theme-btn-radius,4px)] bg-luxury-bg text-luxury-accent border border-luxury-border/50"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{locale === "ar" ? customPackContent?.badgeAr : customPackContent?.badgeFr}</span>
            </span>

            <h2
              className={`font-serif text-3xl sm:text-4xl font-medium leading-tight ${
                isAzur || isEmerald ? "text-white" : "text-luxury-text"
              }`}
            >
              {locale === "ar" ? customPackContent?.titleAr : customPackContent?.titleFr}
            </h2>

            <p
              className={`text-sm leading-relaxed max-w-md ${
                isAzur
                  ? "text-blue-100/80"
                  : isEmerald
                  ? "text-[#C8D8D1]"
                  : "text-luxury-text-secondary"
              }`}
            >
              {locale === "ar" ? customPackContent?.descriptionAr : customPackContent?.descriptionFr}
            </p>

            <div
              className={`space-y-3 pt-2 text-xs ${
                isAzur
                  ? "text-blue-100/90"
                  : isEmerald
                  ? "text-[#D9E5DF]"
                  : "text-luxury-text-secondary"
              }`}
            >
              {[
                locale === "ar" ? customPackContent?.step1Ar : customPackContent?.step1Fr,
                locale === "ar" ? customPackContent?.step2Ar : customPackContent?.step2Fr,
                locale === "ar" ? customPackContent?.step3Ar : customPackContent?.step3Fr,
              ].map((stepText, idx) => (
                <div key={idx} className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                      isAzur
                        ? "bg-sky-400 text-[#0A1E3F]"
                        : isEmerald
                        ? "bg-[#C5A059] text-[#0C2A22]"
                        : "bg-luxury-text text-luxury-bg"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>{stepText}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href={formatLocalizedHref(customPackContent?.btnLink || "/packs/builder")}>
                <Button
                  size="lg"
                  variant={isAzur || isEmerald ? "default" : "accent"}
                  className={
                    isAzur
                      ? "bg-sky-400 hover:bg-sky-300 text-[#0A1E3F] font-bold rounded-full px-8"
                      : isEmerald
                      ? "bg-[#C5A059] hover:bg-[#B28E49] text-[#0C2A22] font-bold px-8"
                      : undefined
                  }
                >
                  <span>{locale === "ar" ? customPackContent?.btnTextAr : customPackContent?.btnTextFr}</span>
                  <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div
            className={`relative aspect-[4/3] w-full overflow-hidden bg-luxury-secondary shadow-luxury ${
              isMonochrome
                ? "rounded-none border border-black"
                : isAzur
                ? "rounded-2xl border-2 border-sky-400/25"
                : isEmerald
                ? "rounded-[4px] border border-[#C5A059]/45"
                : "rounded-[var(--theme-card-radius,6px)]"
            }`}
          >
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
        <div
          className={
            isMonochrome
              ? "flex items-end justify-between border-b border-black pb-4 mb-10"
              : "text-center max-w-xl mx-auto mb-12"
          }
        >
          <div>
            <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-2">
              {isMonochrome ? "04 / " : ""}
              {locale === "ar" ? "الأكثر طلباً" : "Incontournables"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
              {locale === "ar" ? "عطور أثبتت جدارتها ونالت إعجاب زبائننا" : "Les Créations Plébiscitées"}
            </h2>
          </div>
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
              className="relative aspect-square rounded-[var(--theme-card-radius,6px)] overflow-hidden bg-luxury-secondary group"
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
        <div
          className={`p-10 sm:p-14 grid grid-cols-1 md:grid-cols-3 gap-8 text-center ${
            isMonochrome
              ? "rounded-none border border-black bg-white"
              : isAzur
              ? "rounded-2xl bg-[#EFF6FF] border border-sky-200/80"
              : isOudNoir
              ? "rounded-[4px] bg-[#141316] border border-[#D4AF6A]/20"
              : isMidnight
              ? "rounded-xl bg-[#0E1F3D] border border-sky-400/20"
              : "rounded-[var(--theme-card-radius,6px)] bg-luxury-secondary/80 border border-luxury-border/40"
          }`}
        >
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
