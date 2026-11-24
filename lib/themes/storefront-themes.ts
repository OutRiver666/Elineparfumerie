export type StorefrontThemeId =
  | "atelier-ivoire"
  | "azur-riviera"
  | "oud-noir"
  | "rose-de-grasse"
  | "emeraude-imperiale"
  | "sahara-ambre"
  | "monochrome-editorial"
  | "midnight-sapphire";

export interface StorefrontThemeDefinition {
  id: StorefrontThemeId;
  nameFr: string;
  nameAr: string;
  taglineFr: string;
  taglineAr: string;
  layoutStyleFr: string;
  layoutStyleAr: string;
  mode: "light" | "dark";
  fontDisplayLabel: string;
  fontBodyLabel: string;
  fontArabicLabel: string;
  swatches: {
    bg: string;
    surface: string;
    primary: string;
    accent: string;
    text: string;
  };
  previewHeroType:
    | "split-classic"
    | "riviera-coastal"
    | "cinematic-dark"
    | "arched-couture"
    | "royal-emerald"
    | "sculptural-amber"
    | "magazine-grid"
    | "celestial-glow";
}

export const DEFAULT_STOREFRONT_THEME: StorefrontThemeId = "atelier-ivoire";

export const STOREFRONT_THEMES: StorefrontThemeDefinition[] = [
  {
    id: "atelier-ivoire",
    nameFr: "Atelier Ivoire",
    nameAr: "أتيليه إيفوار",
    taglineFr: "Haute Parfumerie Parisienne • Classique & Lumineux",
    taglineAr: "عطور باريسية راقية • كلاسيكي ومشرق",
    layoutStyleFr: "Hero Split 2 Colonnes • Cadre Flottant Classique",
    layoutStyleAr: "واجهة مقسّمة إلى عمودين • تصميم كلاسيكي متوازن",
    mode: "light",
    fontDisplayLabel: "Playfair Display",
    fontBodyLabel: "Inter",
    fontArabicLabel: "Amiri",
    swatches: {
      bg: "#FFFFFF",
      surface: "#F8F7F4",
      primary: "#171717",
      accent: "#9A7655",
      text: "#171717",
    },
    previewHeroType: "split-classic",
  },
  {
    id: "azur-riviera",
    nameFr: "Azur Riviera",
    nameAr: "أزور ريفييرا",
    taglineFr: "Bleu Ciel, Bleu Marine & Blanc Pur • Élégance Méditerranéenne",
    taglineAr: "أزرق سماوي، كحلي ملكي وأبيض نقي • أناقة متوسطية",
    layoutStyleFr: "Hero Côtier Blanc & Marine • Cartes Aériennes Arrondies",
    layoutStyleAr: "واجهة متوسطية باللون الأزرق والأبيض • بطاقات انسيابية",
    mode: "light",
    fontDisplayLabel: "Cormorant Garamond",
    fontBodyLabel: "Plus Jakarta Sans",
    fontArabicLabel: "Tajawal",
    swatches: {
      bg: "#FFFFFF",
      surface: "#EDF5FF",
      primary: "#0A1E3F",
      accent: "#1D78D8",
      text: "#0A1E3F",
    },
    previewHeroType: "riviera-coastal",
  },
  {
    id: "oud-noir",
    nameFr: "Oud Noir",
    nameAr: "عود نوار",
    taglineFr: "Luxe Nocturne • Obsidienne & Or Champagne",
    taglineAr: "فخامة ليلية • أسود أوبسيديان وذهبي شامبانيا",
    layoutStyleFr: "Hero Cinématique Plein Écran • Verre Sombre & Filets Or",
    layoutStyleAr: "واجهة سينمائية كاملة • زجاج داكن وخطوط ذهبية",
    mode: "dark",
    fontDisplayLabel: "Cinzel",
    fontBodyLabel: "Montserrat",
    fontArabicLabel: "Amiri",
    swatches: {
      bg: "#09090B",
      surface: "#151417",
      primary: "#F5F0E6",
      accent: "#D4AF6A",
      text: "#F5F0E6",
    },
    previewHeroType: "cinematic-dark",
  },
  {
    id: "rose-de-grasse",
    nameFr: "Rose de Grasse",
    nameAr: "ورد غراس",
    taglineFr: "Maison Couture • Soie Rosée & Bordeaux Velours",
    taglineAr: "دار كوتور ناعمة • وردي حريري وعنابي مخملي",
    layoutStyleFr: "Hero Portrait en Arche • Cartes Douces Couture",
    layoutStyleAr: "واجهة بإطار قوسي فاخر • بطاقات ناعمة مستديرة",
    mode: "light",
    fontDisplayLabel: "Bodoni Moda",
    fontBodyLabel: "DM Sans",
    fontArabicLabel: "Cairo",
    swatches: {
      bg: "#FDF8F6",
      surface: "#F6E9E5",
      primary: "#2A181D",
      accent: "#88364C",
      text: "#2A181D",
    },
    previewHeroType: "arched-couture",
  },
  {
    id: "emeraude-imperiale",
    nameFr: "Émeraude Impériale",
    nameAr: "الزمرد الملكي",
    taglineFr: "Héritage Royal • Vert Émeraude, Parchemin & Or Bruni",
    taglineAr: "إرث ملكي • أخضر زمردي وكريمي عتيق مع ذهبي",
    layoutStyleFr: "Pavillon Royal Émeraude & Or • Galeries Parchemin",
    layoutStyleAr: "واجهة قصر زمردي بإطارات ذهبية • معارض كريمية",
    mode: "light",
    fontDisplayLabel: "Cormorant Garamond",
    fontBodyLabel: "Plus Jakarta Sans",
    fontArabicLabel: "Amiri",
    swatches: {
      bg: "#FBF8F1",
      surface: "#0D2B22",
      primary: "#0D2B22",
      accent: "#C5A059",
      text: "#10221C",
    },
    previewHeroType: "royal-emerald",
  },
  {
    id: "sahara-ambre",
    nameFr: "Sahara Ambre",
    nameAr: "عنبر الصحراء",
    taglineFr: "Chaleur Orientale • Sable Doré & Terre Cuite",
    taglineAr: "دفء شرقي • رمال ذهبية وتيراكوتا دافئة",
    layoutStyleFr: "Hero Éditorial Asymétrique • Blocs Sculpturaux Argile",
    layoutStyleAr: "واجهة تحريرية دافئة غير متماثلة • ألوان صحراوية",
    mode: "light",
    fontDisplayLabel: "Fraunces",
    fontBodyLabel: "Plus Jakarta Sans",
    fontArabicLabel: "Tajawal",
    swatches: {
      bg: "#FBF6EE",
      surface: "#F1E5D5",
      primary: "#2C1A11",
      accent: "#B85328",
      text: "#2C1A11",
    },
    previewHeroType: "sculptural-amber",
  },
  {
    id: "monochrome-editorial",
    nameFr: "Monochrome Éditorial",
    nameAr: "مونوكروم تحريري",
    taglineFr: "Avant-Garde Magazine • Noir Absolu & Blanc Galerie",
    taglineAr: "أسلوب مجلات الموضة • أسود ناصع وأبيض صافي",
    layoutStyleFr: "Grille Magazine 0px • Titres Monumentaux & Index 01/02/03",
    layoutStyleAr: "شبكة مجلات بزوايا حادة • عناوين ضخمة وترقيم 01/02/03",
    mode: "light",
    fontDisplayLabel: "Syne",
    fontBodyLabel: "Inter",
    fontArabicLabel: "Cairo",
    swatches: {
      bg: "#FFFFFF",
      surface: "#F4F4F5",
      primary: "#09090B",
      accent: "#18181B",
      text: "#09090B",
    },
    previewHeroType: "magazine-grid",
  },
  {
    id: "midnight-sapphire",
    nameFr: "Midnight Sapphire",
    nameAr: "سافير منتصف الليل",
    taglineFr: "Nuit Royale • Bleu Saphir Profond, Bleu Glacé & Argent",
    taglineAr: "ليل ملكي • أزرق سافير عميق مع أزرق جليدي وذهبي فضي",
    layoutStyleFr: "Hero Halo Saphir Lumineux • Panneaux Verre Bleu Nuit",
    layoutStyleAr: "واجهة بريق أزرق ليلي • بطاقات زجاجية سافير",
    mode: "dark",
    fontDisplayLabel: "Prata",
    fontBodyLabel: "DM Sans",
    fontArabicLabel: "Tajawal",
    swatches: {
      bg: "#061124",
      surface: "#0E1F3D",
      primary: "#F8FAFC",
      accent: "#58A6FF",
      text: "#F1F5F9",
    },
    previewHeroType: "celestial-glow",
  },
];

export const STOREFRONT_THEME_MAP: Record<StorefrontThemeId, StorefrontThemeDefinition> =
  STOREFRONT_THEMES.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<StorefrontThemeId, StorefrontThemeDefinition>);

export function resolveStorefrontThemeId(raw?: string | null): StorefrontThemeId {
  if (raw && raw in STOREFRONT_THEME_MAP) {
    return raw as StorefrontThemeId;
  }
  return DEFAULT_STOREFRONT_THEME;
}
