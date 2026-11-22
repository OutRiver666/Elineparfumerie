export type LandingPageMode = "standard" | "landing_only" | "both";

export interface PerfumeVariant {
  id: string;
  size: "25ml" | "30ml" | "50ml" | "80ml" | "100ml";
  priceDZD: number;
  compareAtPriceDZD?: number;
  stock: number;
  sku: string;
}

export interface Perfume {
  id: string;
  slug: string;
  name: {
    fr: string;
    ar: string;
  };
  description: {
    fr: string;
    ar: string;
  };
  gender: "men" | "women" | "unisex";
  seasons: ("spring" | "summer" | "autumn" | "winter")[];
  family: {
    fr: string;
    ar: string;
  };
  classification?: "X2" | "X3" | "X4" | "X5" | "X6" | "X7" | "X8";
  notes: {
    top: { fr: string[]; ar: string[] };
    heart: { fr: string[]; ar: string[] };
    base: { fr: string[]; ar: string[] };
  };
  variants: PerfumeVariant[];
  images: string[];
  landingPageMode?: LandingPageMode;
  landingPageImages?: string[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
}
