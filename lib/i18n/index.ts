import fr from "./dictionaries/fr.json";
import ar from "./dictionaries/ar.json";
import { Dictionary, Locale } from "./types";

const dictionaries: Record<Locale, Dictionary> = {
  fr: fr as Dictionary,
  ar: ar as Dictionary,
};

export const defaultLocale: Locale = "fr";
export const locales: Locale[] = ["fr", "ar"];

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export * from "./types";
