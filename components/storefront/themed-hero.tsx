import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Locale } from "@/lib/i18n";
import { HeroSectionContent } from "@/types/storefront-content";
import { StorefrontThemeId } from "@/lib/themes/storefront-themes";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Droplets } from "lucide-react";

interface ThemedHeroProps {
  themeId: StorefrontThemeId;
  hero: HeroSectionContent;
  locale: Locale;
}

function formatHref(link: string, locale: Locale): string {
  if (!link) return `/${locale}/shop`;
  if (link.startsWith("http://") || link.startsWith("https://")) return link;
  if (link.startsWith(`/${locale}/`) || link === `/${locale}`) return link;
  return `/${locale}${link.startsWith("/") ? link : `/${link}`}`;
}

export function ThemedHero({ themeId, hero, locale }: ThemedHeroProps) {
  const isAr = locale === "ar";
  const badge = isAr ? hero.badgeAr : hero.badgeFr;
  const title = isAr ? hero.titleAr : hero.titleFr;
  const subtitle = isAr ? hero.subtitleAr : hero.subtitleFr;
  const primaryText = isAr ? hero.primaryBtnTextAr : hero.primaryBtnTextFr;
  const primaryHref = formatHref(hero.primaryBtnLink, locale);
  const secondaryText = isAr ? hero.secondaryBtnTextAr : hero.secondaryBtnTextFr;
  const secondaryHref = formatHref(hero.secondaryBtnLink, locale);
  const floatTop = isAr ? hero.floatingBadgeTopAr : hero.floatingBadgeTopFr;
  const floatTitle = isAr ? hero.floatingBadgeTitleAr : hero.floatingBadgeTitleFr;
  const floatSub = isAr ? hero.floatingBadgeSubAr : hero.floatingBadgeSubFr;

  const trustStats = [
    {
      value: "58",
      label: isAr ? "ولاية مغطاة" : "Wilayas livrées",
    },
    {
      value: "COD",
      label: isAr ? "الدفع عند الاستلام" : "Paiement réception",
    },
    {
      value: "25–100ml",
      label: isAr ? "أحجام متعددة" : "Formats au choix",
    },
  ];

  // ── 2. AZUR RIVIERA (Light Blue, Dark Navy Blue & White) ──────────────────
  if (themeId === "azur-riviera") {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#EFF6FF] to-[#DBEAFE]/90">
        {/* Subtle coastal sky-blue radial light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-16 -left-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="container mx-auto px-4 sm:px-6 pt-14 pb-16 lg:pt-20 lg:pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-200 text-[#1D78D8] text-[11px] uppercase tracking-widest font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>{badge}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#0A1E3F] tracking-tight leading-[1.1]">
                {title}
              </h1>

              <p className="text-sm sm:text-base text-[#3B567A] max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {subtitle}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link href={primaryHref} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full bg-[#0A1E3F] hover:bg-[#102E5E] text-white shadow-md px-8"
                  >
                    <span>{primaryText}</span>
                    <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                  </Button>
                </Link>
                <Link href={secondaryHref} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-[#1D78D8]/40 bg-white/80 hover:bg-sky-50 text-[#0A1E3F] px-7"
                  >
                    <span>{secondaryText}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Framed Coastal Showcase */}
            <div className="lg:col-span-6 relative max-w-md mx-auto lg:max-w-none w-full">
              <div className="relative p-3 rounded-[28px] bg-white/80 border border-sky-200/80 shadow-[0_24px_60px_-20px_rgba(10,30,63,0.18)] backdrop-blur-sm">
                <div className="relative aspect-[4/5] sm:aspect-[5/5] rounded-[20px] overflow-hidden bg-[#0A1E3F]">
                  <Image
                    src={hero.imageUrl}
                    alt={title}
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1E3F]/55 via-transparent to-sky-400/10" />
                </div>

                {/* Floating Crisp White & Navy Signature Pill Card */}
                <div className="absolute -bottom-4 start-6 end-6 sm:end-auto sm:max-w-[260px] bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-lg">
                  <span className="text-[10px] uppercase tracking-widest text-[#1D78D8] font-bold block mb-0.5">
                    {floatTop}
                  </span>
                  <p className="font-serif text-base font-semibold text-[#0A1E3F]">{floatTitle}</p>
                  <span className="text-[11px] text-[#3B567A] block mt-0.5">{floatSub}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Deep Navy Blue Trust Strip */}
        <div className="bg-[#0A1E3F] text-white border-t border-sky-400/20">
          <div className="container mx-auto px-4 sm:px-6 py-4 grid grid-cols-3 gap-4 text-center">
            {trustStats.map((st, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="font-serif text-base sm:text-lg font-semibold text-sky-300 block">
                  {st.value}
                </span>
                <span className="text-[10px] sm:text-xs text-blue-100/80 tracking-wide">
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── 3. OUD NOIR (Cinematic Dark Nocturne) ─────────────────────────────────
  if (themeId === "oud-noir") {
    return (
      <section className="relative min-h-[86vh] flex items-center justify-center overflow-hidden bg-[#09090B]">
        {/* Full-Bleed Atmospheric Background Image */}
        <Image
          src={hero.imageUrl}
          alt={title}
          fill
          priority
          className="object-cover object-center opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/80 via-[#09090B]/55 to-[#09090B]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(212,175,106,0.18), transparent 62%)",
          }}
        />

        {/* Gold Architectural Hairline Frame */}
        <div className="pointer-events-none absolute inset-4 sm:inset-8 border border-[#D4AF6A]/25" />

        <div className="container mx-auto px-6 py-24 relative z-10 text-center max-w-3xl space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#D4AF6A]/40 bg-[#09090B]/60 backdrop-blur-md text-[#D4AF6A] text-[10px] uppercase tracking-[0.28em] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#F5F0E6] tracking-[0.06em] leading-[1.15]">
            {title}
          </h1>

          <div className="w-16 h-px bg-[#D4AF6A]/60 mx-auto" />

          <p className="text-sm sm:text-base text-[#C8BFB2] max-w-xl mx-auto leading-relaxed font-light">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={primaryHref} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#D4AF6A] hover:bg-[#C39B53] text-[#09090B] font-bold tracking-[0.18em] px-9"
              >
                <span>{primaryText}</span>
                <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
              </Button>
            </Link>
            <Link href={secondaryHref} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-[#D4AF6A]/50 text-[#F5F0E6] hover:bg-[#D4AF6A]/15 tracking-[0.15em] px-8"
              >
                <span>{secondaryText}</span>
              </Button>
            </Link>
          </div>

          {/* Floating Dark Glass Signature Bar */}
          <div className="pt-8 grid grid-cols-3 gap-4 max-w-xl mx-auto border-t border-[#D4AF6A]/20">
            {trustStats.map((st, idx) => (
              <div key={idx} className="pt-4">
                <span className="font-serif text-lg text-[#D4AF6A] block">{st.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#A89F92]">
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── 4. ROSE DE GRASSE (Arched Couture Salon) ──────────────────────────────
  if (themeId === "rose-de-grasse") {
    return (
      <section className="relative overflow-hidden bg-[#FDF8F6] border-b border-luxury-border/50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#F3D7D0]/50 blur-3xl"
        />
        <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-start">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F6E9E5] border border-[#E5C9C1] text-[#88364C] text-[11px] uppercase tracking-[0.2em] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#2A181D] leading-[1.12] tracking-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-[#7A565F] max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {subtitle}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link href={primaryHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-[#88364C] hover:bg-[#70283C] text-white px-8 shadow-sm"
                >
                  <span>{primaryText}</span>
                  <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href={secondaryHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-[#88364C]/35 text-[#2A181D] hover:bg-[#F6E9E5] px-7"
                >
                  <span>{secondaryText}</span>
                </Button>
              </Link>
            </div>

            <div className="pt-5 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#7A565F]">
              {trustStats.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-serif text-base font-semibold text-[#88364C]">
                    {st.value}
                  </span>
                  <span className="text-[11px]">{st.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Iconic Couture Arched Frame */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[390px]">
              <div className="p-3 rounded-t-full rounded-b-[28px] border border-[#88364C]/25 bg-white/70 shadow-[0_24px_50px_-20px_rgba(136,54,76,0.18)]">
                <div className="relative aspect-[3/4] w-full rounded-t-full rounded-b-[20px] overflow-hidden bg-[#F6E9E5]">
                  <Image
                    src={hero.imageUrl}
                    alt={title}
                    fill
                    priority
                    className="object-cover object-center"
                  />
                </div>
              </div>

              <div className="absolute -bottom-4 -start-4 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-[#EAD4CE] shadow-md max-w-[230px]">
                <span className="text-[10px] uppercase tracking-widest text-[#88364C] font-bold block">
                  {floatTop}
                </span>
                <p className="font-serif text-sm font-semibold text-[#2A181D] mt-0.5">
                  {floatTitle}
                </p>
                <span className="text-[11px] text-[#7A565F] block">{floatSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── 5. ÉMERAUDE IMPÉRIALE (Royal Emerald & Burnished Gold Pavilion) ───────
  if (themeId === "emeraude-imperiale") {
    return (
      <section className="relative overflow-hidden bg-[#0C2A22] text-[#FBF8F1]">
        {/* Double Gold Hairline Frame */}
        <div className="pointer-events-none absolute inset-4 sm:inset-7 border border-[#C5A059]/35" />
        <div className="pointer-events-none absolute inset-5.5 sm:inset-9 border border-[#C5A059]/15 hidden sm:block" />

        <div className="container mx-auto px-6 sm:px-10 py-18 lg:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-[#C5A059]/45 bg-[#081F19] text-[#DFC07D] text-[10px] uppercase tracking-[0.24em] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{badge}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#FBF8F1] leading-[1.1]">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-[#C8D8D1] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              {subtitle}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href={primaryHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#B28E49] text-[#0C2A22] font-bold tracking-widest px-8"
                >
                  <span>{primaryText}</span>
                  <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href={secondaryHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-[#C5A059]/50 text-[#FBF8F1] hover:bg-[#C5A059]/15 px-7"
                >
                  <span>{secondaryText}</span>
                </Button>
              </Link>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-[#C5A059]/25">
              {trustStats.map((st, idx) => (
                <div key={idx} className="pt-3">
                  <span className="font-serif text-xl font-semibold text-[#DFC07D] block">
                    {st.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#A9C0B7]">
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 max-w-sm mx-auto lg:max-w-none w-full">
            <div className="relative p-2.5 border border-[#C5A059]/55 bg-[#081F19]">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={hero.imageUrl}
                  alt={title}
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>
              <div className="mt-2.5 px-3 py-2.5 bg-[#0F352B] border border-[#C5A059]/30 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[#DFC07D] block">
                    {floatTop}
                  </span>
                  <p className="font-serif text-sm font-semibold text-[#FBF8F1]">{floatTitle}</p>
                </div>
                <span className="text-[10px] text-[#C8D8D1] font-mono">{floatSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── 6. SAHARA AMBRE (Warm Sculptural Asymmetric Editorial) ────────────────
  if (themeId === "sahara-ambre") {
    return (
      <section className="relative overflow-hidden bg-[#FBF6EE] py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Asymmetric Left Visual Panel */}
          <div className="lg:col-span-6 relative min-h-[420px] lg:min-h-[540px] rounded-[24px] overflow-hidden shadow-luxury">
            <Image
              src={hero.imageUrl}
              alt={title}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A11]/75 via-[#2C1A11]/15 to-transparent" />
            <div className="absolute bottom-6 inset-x-6 flex items-end justify-between gap-4 text-[#FBF6EE]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#F2B880] font-bold block">
                  {floatTop}
                </span>
                <p className="font-serif text-xl font-medium mt-0.5">{floatTitle}</p>
                <span className="text-xs text-[#FBF6EE]/80">{floatSub}</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-[#B85328] text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                Extrait
              </span>
            </div>
          </div>

          {/* Right Sculptural Warm Card */}
          <div className="lg:col-span-6 rounded-[24px] bg-[#F3E9DB] border border-[#E2D0BB] p-8 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#B85328]/12 text-[#B85328] text-[11px] uppercase tracking-widest font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#2C1A11] leading-[1.12]">
                {title}
              </h1>

              <p className="text-sm sm:text-base text-[#785644] leading-relaxed">{subtitle}</p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link href={primaryHref} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#B85328] hover:bg-[#98411C] text-white rounded-xl px-7"
                  >
                    <span>{primaryText}</span>
                    <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                  </Button>
                </Link>
                <Link href={secondaryHref} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-[#2C1A11]/25 text-[#2C1A11] hover:bg-[#2C1A11] hover:text-white rounded-xl px-6"
                  >
                    <span>{secondaryText}</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E2D0BB]">
              {trustStats.map((st, idx) => (
                <div key={idx} className="rounded-xl bg-[#FBF6EE] p-3 text-center border border-[#E2D0BB]/80">
                  <span className="font-serif text-base sm:text-lg font-semibold text-[#B85328] block">
                    {st.value}
                  </span>
                  <span className="text-[10px] text-[#785644]">{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── 7. MONOCHROME ÉDITORIAL (High-Fashion Magazine Grid — 0px sharp) ──────
  if (themeId === "monochrome-editorial") {
    return (
      <section className="bg-white text-[#09090B] border-b border-black">
        <div className="container mx-auto px-4 sm:px-6 pt-10 pb-14 space-y-8">
          {/* Masthead Top Row */}
          <div className="border-y border-black py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.2em]">
            <span>{badge}</span>
            <span className="text-zinc-500">ALGER • HAUTE PARFUMERIE • N°08</span>
          </div>

          {/* Monumental Display Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-[1.03] text-[#09090B]">
            {title}
          </h1>

          {/* 12-Col Runway Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 border border-black">
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-e border-black bg-[#FAFAFA]">
              <div className="space-y-6">
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">{subtitle}</p>

                <div className="divide-y divide-black/15 border-y border-black/15 text-xs font-mono">
                  {trustStats.map((st, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <span className="text-zinc-400">0{idx + 1}</span>
                      <span className="uppercase tracking-wider text-zinc-700">{st.label}</span>
                      <span className="font-bold text-black">{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={primaryHref} className="flex-1">
                  <Button
                    size="lg"
                    className="w-full rounded-none bg-black hover:bg-zinc-800 text-white tracking-[0.2em]"
                  >
                    <span>{primaryText}</span>
                    <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                  </Button>
                </Link>
                <Link href={secondaryHref} className="flex-1">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-none border-black text-black hover:bg-black hover:text-white tracking-[0.16em]"
                  >
                    <span>{secondaryText}</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[480px] bg-black overflow-hidden">
              <Image
                src={hero.imageUrl}
                alt={title}
                fill
                priority
                className="object-cover object-center grayscale-[20%] contrast-[1.05]"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/85 text-white px-6 py-3.5 flex items-center justify-between text-xs font-mono">
                <span className="uppercase tracking-widest">{floatTitle}</span>
                <span className="text-zinc-400">{floatSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── 8. MIDNIGHT SAPPHIRE (Deep Night Blue & Luminous Ice-Blue Glow) ───────
  if (themeId === "midnight-sapphire") {
    return (
      <section className="relative min-h-[84vh] flex items-center overflow-hidden bg-[#061124] text-[#F1F5F9]">
        {/* Celestial Blue Radial Aura */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-10 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/20 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#38BDF8]/10 blur-[100px]"
        />

        <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0E1F3D]/80 border border-sky-400/30 text-[#93C5FD] text-[11px] uppercase tracking-[0.2em] font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{badge}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-[1.14]">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-[#A5BBD8] max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {subtitle}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link href={primaryHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-lg bg-[#58A6FF] hover:bg-[#3B8BEB] text-[#061124] font-bold px-8 shadow-[0_0_30px_-5px_rgba(88,166,255,0.5)]"
                >
                  <span>{primaryText}</span>
                  <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href={secondaryHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-lg border-sky-400/35 bg-[#0E1F3D]/60 text-white hover:bg-[#17315E] px-7"
                >
                  <span>{secondaryText}</span>
                </Button>
              </Link>
            </div>

            <div className="pt-5 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
              {trustStats.map((st, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[#0E1F3D]/70 border border-sky-400/15 p-3 backdrop-blur-md text-center"
                >
                  <span className="font-serif text-base text-[#93C5FD] block">{st.value}</span>
                  <span className="text-[10px] text-[#A5BBD8]">{st.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 relative max-w-md mx-auto lg:max-w-none w-full">
            <div className="relative p-3 rounded-2xl bg-[#0E1F3D]/70 border border-sky-400/25 backdrop-blur-xl shadow-[0_30px_70px_-20px_rgba(56,189,248,0.28)]">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#08152C]">
                <Image
                  src={hero.imageUrl}
                  alt={title}
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061124]/70 via-transparent to-sky-400/10" />
              </div>

              <div className="absolute bottom-6 start-6 end-6 sm:end-auto sm:max-w-[240px] rounded-xl bg-[#061124]/90 backdrop-blur-xl border border-sky-400/30 p-4">
                <span className="text-[10px] uppercase tracking-widest text-sky-400 font-semibold block">
                  {floatTop}
                </span>
                <p className="font-serif text-sm text-white mt-0.5">{floatTitle}</p>
                <span className="text-[11px] text-[#A5BBD8] block mt-0.5">{floatSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── 1. ATELIER IVOIRE (Default Classic Split) ─────────────────────────────
  return (
    <section className="relative min-h-[82vh] flex items-center justify-center bg-luxury-secondary/60 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Text Column */}
        <div className="space-y-6 text-center lg:text-left rtl:lg:text-right z-10">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-[3px] bg-luxury-surface text-luxury-accent text-[11px] uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-luxury-text tracking-tight leading-[1.15]">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-luxury-text-secondary max-w-lg leading-relaxed font-sans font-light">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start rtl:lg:justify-start gap-4">
            <Link href={primaryHref}>
              <Button size="lg" variant="default" className="w-full sm:w-auto">
                <span>{primaryText}</span>
                <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
              </Button>
            </Link>
            <Link href={secondaryHref}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <span>{secondaryText}</span>
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center lg:justify-start rtl:lg:justify-start space-x-6 rtl:space-x-reverse text-xs text-luxury-text-muted">
            <div>
              <span className="font-semibold text-luxury-text block text-sm">58 Wilayas</span>
              <span>{isAr ? "توصيل آمن" : "Livraison suivie"}</span>
            </div>
            <div className="h-6 w-px bg-luxury-border" />
            <div>
              <span className="font-semibold text-luxury-text block text-sm">COD</span>
              <span>{isAr ? "الدفع عند الاستلام" : "Règlement à réception"}</span>
            </div>
            <div className="h-6 w-px bg-luxury-border" />
            <div>
              <span className="font-semibold text-luxury-text block text-sm">25ml — 100ml</span>
              <span>{isAr ? "أحجام مستقلة" : "Formats ajustables"}</span>
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
          <div className="absolute bottom-6 left-6 rtl:left-auto rtl:right-6 bg-luxury-bg/95 backdrop-blur-md p-4 rounded-[4px] shadow-floating max-w-[220px]">
            <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
              {floatTop}
            </span>
            <p className="font-serif text-sm font-medium text-luxury-text">{floatTitle}</p>
            <span className="text-[11px] text-luxury-text-secondary block mt-0.5">{floatSub}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
