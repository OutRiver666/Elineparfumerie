import type { StorefrontThemeId } from "@/lib/themes/storefront-themes";

export interface HeroSectionContent {
  badgeFr: string;
  badgeAr: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  primaryBtnTextFr: string;
  primaryBtnTextAr: string;
  primaryBtnLink: string;
  secondaryBtnTextFr: string;
  secondaryBtnTextAr: string;
  secondaryBtnLink: string;
  imageUrl: string;
  floatingBadgeTopFr: string;
  floatingBadgeTopAr: string;
  floatingBadgeTitleFr: string;
  floatingBadgeTitleAr: string;
  floatingBadgeSubFr: string;
  floatingBadgeSubAr: string;
}

export interface GenderCardContent {
  tagFr: string;
  tagAr: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  imageUrl: string;
  link: string;
}

export interface GenderSectionContent {
  headerTagFr: string;
  headerTagAr: string;
  headerTitleFr: string;
  headerTitleAr: string;
  men: GenderCardContent;
  women: GenderCardContent;
  unisex: GenderCardContent;
}

export interface SeasonCardContent {
  key: "spring" | "summer" | "autumn" | "winter";
  nameFr: string;
  nameAr: string;
  subtitleFr: string;
  subtitleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  accordsFr: string;
  accordsAr: string;
  badgeFr: string;
  badgeAr: string;
  imageUrl: string;
}

export interface SeasonSectionContent {
  headerTagFr: string;
  headerTagAr: string;
  headerTitleFr: string;
  headerTitleAr: string;
  spring: SeasonCardContent;
  summer: SeasonCardContent;
  autumn: SeasonCardContent;
  winter: SeasonCardContent;
}

export interface CollectionCardContent {
  tagFr: string;
  tagAr: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  imageUrl: string;
  linkUrl: string;
}

export interface CollectionsSectionContent {
  headerTagFr: string;
  headerTagAr: string;
  headerTitleFr: string;
  headerTitleAr: string;
  linkTextFr: string;
  linkTextAr: string;
  linkUrl: string;
  card1: CollectionCardContent;
  card2: CollectionCardContent;
}

export interface CustomPackSectionContent {
  badgeFr: string;
  badgeAr: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  step1Fr: string;
  step1Ar: string;
  step2Fr: string;
  step2Ar: string;
  step3Fr: string;
  step3Ar: string;
  btnTextFr: string;
  btnTextAr: string;
  btnLink: string;
  imageUrl: string;
}

export interface StorefrontContent {
  themeId?: StorefrontThemeId;
  hero: HeroSectionContent;
  gender: GenderSectionContent;
  seasons: SeasonSectionContent;
  collections: CollectionsSectionContent;
  customPack: CustomPackSectionContent;
  updatedAt?: string;
}
