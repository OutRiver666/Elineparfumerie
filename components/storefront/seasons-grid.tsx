import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Locale } from "@/lib/i18n";
import { Perfume } from "@/types/perfume";
import { ArrowRight, Sparkles, Sun, CloudRain, Flame, Snowflake } from "lucide-react";

import { SeasonSectionContent } from "@/types/storefront-content";

interface SeasonsGridProps {
  products: Perfume[];
  locale?: Locale;
  customContent?: SeasonSectionContent;
}

interface SeasonData {
  key: "spring" | "summer" | "autumn" | "winter";
  nameFr: string;
  nameAr: string;
  subtitleFr: string;
  subtitleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  accordsFr: string;
  accordsAr: string;
  image: string;
  badgeFr: string;
  badgeAr: string;
  accentColor: string;
  icon: React.ElementType;
}

const SEASONS: SeasonData[] = [
  {
    key: "winter",
    nameFr: "Hiver",
    nameAr: "الشتاء",
    subtitleFr: "Sillage Majestueux, Oud & Ambre",
    subtitleAr: "فوحان مهيب، عود ملكي وعنبر أسود دافئ",
    descriptionFr: "Bois de oud royal X8, ambre gris envoûtant, cuir impérial et sillage captivant.",
    descriptionAr: "عود كمبودي ملكي مكثف، عنبر أصيل وجلود فاخرة تدوم طويلاً.",
    accordsFr: "Oud Royal • Ambre Gris • Cuir",
    accordsAr: "عود ملكي • عنبر أصيل • جلد ناعم",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&q=80&w=1000",
    badgeFr: "Intensité X4 & X8",
    badgeAr: "تركيز مكثف وثبات عالي",
    accentColor: "from-indigo-600/25 to-amber-700/10",
    icon: Snowflake,
  },
  {
    key: "autumn",
    nameFr: "Automne",
    nameAr: "الخريف",
    subtitleFr: "Bois Précieux & Épices Envoûtantes",
    subtitleAr: "دفء الأخشاب والتوابل الشرقية الساحرة",
    descriptionFr: "Santal crémeux, cardamome noire, fève tonka et feuilles d'ambre dorées.",
    descriptionAr: "خشب الصندل النبيل، هيل شرقي معتق ودفء شاعري للمساء.",
    accordsFr: "Santal • Cardamome • Cèdre",
    accordsAr: "صندل • هيل • خشب الأرز",
    image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=1000",
    badgeFr: "Épices & Accords Boisés",
    badgeAr: "توابل وأخشاب نبيلة",
    accentColor: "from-amber-600/25 to-yellow-600/10",
    icon: Flame,
  },
  {
    key: "spring",
    nameFr: "Printemps",
    nameAr: "الربيع",
    subtitleFr: "Éclosion Florale & Renaissance",
    subtitleAr: "عبير الأزهار والنضارة المتجددة",
    descriptionFr: "Fraîcheur délicate de néroli lumineux, pivoines soyeuses et rosée matinale.",
    descriptionAr: "نفحات زهرية رقيقة مع نيرولي كالابريا وندى الصباح العذب.",
    accordsFr: "Néroli • Pivoine • Rosée",
    accordsAr: "نيرولي • بيوني • ندى الزهور",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000",
    badgeFr: "Sillage Floral & Délicat",
    badgeAr: "عبير زهري منعش",
    accentColor: "from-rose-500/20 to-amber-500/10",
    icon: Sparkles,
  },
  {
    key: "summer",
    nameFr: "Été",
    nameAr: "الصيف",
    subtitleFr: "Fraîcheur Solaire & Brise Azurée",
    subtitleAr: "انتعاش الحمضيات ونسيم البحر الأبيض",
    descriptionFr: "Agrumes pétillants de Méditerranée, embruns marins et légèreté absolue.",
    descriptionAr: "حمضيات إيطالية متألقة، رذاذ البحر الأبيض الصافي وأناقة صيفية.",
    accordsFr: "Bergamote • Cédrat • Brise Marine",
    accordsAr: "برغموت • ليمون • نسيم البحر",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000",
    badgeFr: "Vigueur & Agrumes Solaires",
    badgeAr: "طاقة وحمضيات متألقة",
    accentColor: "from-sky-500/20 to-amber-500/10",
    icon: Sun,
  },
];

export function SeasonsGrid({ products = [], locale = "fr", customContent }: SeasonsGridProps) {
  // Count how many perfumes match each season
  const getSeasonCount = (seasonKey: string) => {
    return products.filter((p) => p.seasons?.includes(seasonKey as any)).length;
  };

  const headerTag =
    (locale === "ar" ? customContent?.headerTagAr : customContent?.headerTagFr) ||
    (locale === "ar" ? "دليل الفصول والأجواء" : "LES 4 SAISONS OLFACTIVES");

  const headerTitle =
    (locale === "ar" ? customContent?.headerTitleAr : customContent?.headerTitleFr) ||
    (locale === "ar" ? "اختر عطرك حسب فصول السنة" : "Harmonies & Sillages par Saison");

  return (
    <section className="container mx-auto px-4 sm:px-6 py-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 pb-4 border-b border-luxury-border/30 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-[3px] bg-luxury-secondary text-luxury-accent text-[11px] uppercase tracking-widest font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{headerTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-luxury-text">
            {headerTitle}
          </h2>
          <p className="text-xs sm:text-sm text-luxury-text-secondary mt-1 max-w-xl font-light">
            {locale === "ar"
              ? "تتغير كيمياء العطر باختلاف درجات الحرارة والرطوبة. اكتشف ابتكاراتنا المصممة لتتألق في كل فصل من فصول العام."
              : "La diffusion d'un parfum évolue selon la température et l'atmosphère. Explorez nos créations pensées pour sublimer chaque période de l'année."}
          </p>
        </div>

        <Link
          href={`/${locale}/shop`}
          className="text-xs text-luxury-accent hover:underline flex items-center space-x-1 rtl:space-x-reverse self-start md:self-end font-medium"
        >
          <span>{locale === "ar" ? "كل العطور المتوفرة" : "Tout le catalogue"}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </Link>
      </div>

      {/* 4 Seasons Luxury Grid: 2 columns on phone (2 under 2 cards), 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {SEASONS.map((season) => {
          const count = getSeasonCount(season.key);
          const Icon = season.icon;
          const card = customContent?.[season.key];
          const bgImg = card?.imageUrl || season.image;
          const badgeText =
            (locale === "ar" ? card?.badgeAr : card?.badgeFr) ||
            (locale === "ar" ? season.badgeAr : season.badgeFr);
          const subtitleText =
            (locale === "ar" ? card?.subtitleAr : card?.subtitleFr) ||
            (locale === "ar" ? season.subtitleAr : season.subtitleFr);
          const descriptionText =
            (locale === "ar" ? card?.descriptionAr : card?.descriptionFr) ||
            (locale === "ar" ? season.descriptionAr : season.descriptionFr);
          const accordsText =
            (locale === "ar" ? card?.accordsAr : card?.accordsFr) ||
            (locale === "ar" ? season.accordsAr : season.accordsFr);

          return (
            <Link
              key={season.key}
              href={`/${locale}/shop?season=${season.key}`}
              className="group relative aspect-[3/4] sm:aspect-[4/5] rounded-[6px] overflow-hidden bg-luxury-surface flex flex-col justify-between p-3.5 sm:p-5 md:p-6 shadow-subtle hover:shadow-card transition-all duration-500 border border-luxury-border/30 hover:border-luxury-accent/60"
            >
              {/* Seasonal Background Image */}
              <Image
                src={bgImg}
                alt={locale === "ar" ? season.nameAr : season.nameFr}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                unoptimized
              />

              {/* Gradient Scrims for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 group-hover:from-black/90 group-hover:via-black/45 transition-colors duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-br ${season.accentColor} mix-blend-overlay opacity-60`} />

              {/* Top Tag & Season Counter Badge */}
              <div className="relative z-10 flex items-center justify-between gap-1">
                <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[3px] bg-white/15 backdrop-blur-md text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold border border-white/20 truncate max-w-[70%] sm:max-w-none">
                  <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-luxury-gold flex-shrink-0" />
                  <span className="truncate">{badgeText}</span>
                </span>

                <span className="text-[9px] sm:text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-md px-1.5 py-0.5 sm:px-2 rounded-[3px] border border-white/10 font-mono whitespace-nowrap">
                  {count} {locale === "ar" ? "عطور" : "parfums"}
                </span>
              </div>

              {/* Bottom Information & CTA Button */}
              <div className="relative z-10 space-y-1 sm:space-y-2 text-white">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-luxury-gold font-semibold block line-clamp-1">
                  {subtitleText}
                </span>

                <h3 className="font-serif text-lg sm:text-2xl lg:text-3xl font-medium tracking-tight group-hover:text-luxury-secondary transition-colors">
                  {locale === "ar" ? season.nameAr : season.nameFr}
                </h3>

                <p className="hidden sm:block text-[11px] text-white/80 line-clamp-2 leading-relaxed font-light pt-0.5">
                  {descriptionText}
                </p>

                {/* Accords preview */}
                <div className="pt-0.5 sm:pt-1.5 flex items-center">
                  <span className="text-[9px] sm:text-[10px] text-white/70 italic truncate">
                    {accordsText}
                  </span>
                </div>

                {/* Hover CTA Indicator */}
                <div className="pt-1 sm:pt-2 flex items-center space-x-1.5 sm:space-x-2 rtl:space-x-reverse text-[11px] sm:text-xs font-semibold text-luxury-secondary group-hover:text-white transition-colors">
                  <span>
                    {locale === "ar"
                      ? `عطور ${season.nameAr}`
                      : `Découvrir`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
