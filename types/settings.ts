export interface StoreSettings {
  brandName: string;
  contactPhone: string;
  supportEmail: string;
  addressFr: string;
  addressAr: string;
  currency: string;
  pack3DiscountPct: number;
  pack5DiscountPct: number;
  pack10DiscountPct: number;
  updatedAt?: string;
}

export interface WilayaDeliveryRateRecord {
  wilayaCode: string;
  nameFr: string;
  nameAr: string;
  deliveryFeeDZD: number;
  estimatedDays: string;
  isActive: boolean;
  communesCount: number;
}

export type WilayaRateMap = Record<
  string,
  {
    deliveryFeeDZD: number;
    estimatedDays: string;
    isActive: boolean;
  }
>;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  brandName: "Éline Parfumerie",
  contactPhone: "0550 00 00 00",
  supportEmail: "contact@elineparfumerie.dz",
  addressFr: "Alger, Algérie",
  addressAr: "الجزائر العاصمة، الجزائر",
  currency: "DZD — Dinar Algérien",
  pack3DiscountPct: 15,
  pack5DiscountPct: 20,
  pack10DiscountPct: 25,
};
