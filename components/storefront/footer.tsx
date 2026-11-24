import React from "react";
import Link from "next/link";
import { Locale, getDictionary } from "@/lib/i18n";
import { ShieldCheck, Truck, Sparkles, Heart } from "lucide-react";
import { DEFAULT_STORE_SETTINGS, StoreSettings } from "@/types/settings";
import { StorefrontThemeId } from "@/lib/themes/storefront-themes";

interface FooterProps {
  locale?: Locale;
  settings?: StoreSettings;
  themeId?: StorefrontThemeId;
}

export function Footer({ locale = "fr", settings, themeId = "atelier-ivoire" }: FooterProps) {
  const dict = getDictionary(locale);
  const s = settings || DEFAULT_STORE_SETTINGS;
  const isAzurDarkFooter = themeId === "azur-riviera";
  const isEmeraldDarkFooter = themeId === "emeraude-imperiale";
  const isInvertedBand = isAzurDarkFooter || isEmeraldDarkFooter;

  return (
    <footer
      className={
        isAzurDarkFooter
          ? "bg-[#0A1E3F] text-white mt-24 border-t border-sky-400/20"
          : isEmeraldDarkFooter
          ? "bg-[#0C2A22] text-[#FBF8F1] mt-24 border-t border-[#C5A059]/30"
          : "bg-luxury-secondary text-luxury-text mt-24 border-t border-luxury-border/30"
      }
    >
      {/* Brand Value Pillars */}
      <div
        className={`container mx-auto px-4 sm:px-6 py-12 border-b ${
          isAzurDarkFooter
            ? "border-sky-400/15"
            : isEmeraldDarkFooter
            ? "border-[#C5A059]/20"
            : "border-luxury-border/30"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left rtl:md:text-right">
          <div className="flex flex-col items-center md:items-start rtl:md:items-start space-y-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-[var(--theme-btn-radius,4px)] mb-1 ${
                isAzurDarkFooter
                  ? "bg-sky-400/15 text-sky-300"
                  : isEmeraldDarkFooter
                  ? "bg-[#C5A059]/15 text-[#DFC07D]"
                  : "bg-luxury-surface text-luxury-accent"
              }`}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className={`font-serif text-sm font-semibold ${isInvertedBand ? "text-white" : "text-luxury-text"}`}>
              {locale === "ar" ? "خلاصات نقية وتعتيق حرفي" : "Huiles Pures & Macération"}
            </h4>
            <p className={`text-xs leading-relaxed ${isAzurDarkFooter ? "text-blue-100/75" : isEmeraldDarkFooter ? "text-[#C8D8D1]" : "text-luxury-text-secondary"}`}>
              {locale === "ar"
                ? "انتقاء دقيق لأجود الزيوت العطرية العالمية المركزة بنسب ثبات عالية."
                : "Sélection rigoureuse d'huiles parfumées de haute pureté pour une tenue longue durée."}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start rtl:md:items-start space-y-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-[var(--theme-btn-radius,4px)] mb-1 ${
                isAzurDarkFooter
                  ? "bg-sky-400/15 text-sky-300"
                  : isEmeraldDarkFooter
                  ? "bg-[#C5A059]/15 text-[#DFC07D]"
                  : "bg-luxury-surface text-luxury-accent"
              }`}
            >
              <Truck className="h-5 w-5" />
            </div>
            <h4 className={`font-serif text-sm font-semibold ${isInvertedBand ? "text-white" : "text-luxury-text"}`}>
              {locale === "ar" ? "توصيل إلى 58 ولاية" : "Livraison 58 Wilayas"}
            </h4>
            <p className={`text-xs leading-relaxed ${isAzurDarkFooter ? "text-blue-100/75" : isEmeraldDarkFooter ? "text-[#C8D8D1]" : "text-luxury-text-secondary"}`}>
              {dict.footer.wilayaDeliveryNote}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start rtl:md:items-start space-y-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-[var(--theme-btn-radius,4px)] mb-1 ${
                isAzurDarkFooter
                  ? "bg-sky-400/15 text-sky-300"
                  : isEmeraldDarkFooter
                  ? "bg-[#C5A059]/15 text-[#DFC07D]"
                  : "bg-luxury-surface text-luxury-accent"
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className={`font-serif text-sm font-semibold ${isInvertedBand ? "text-white" : "text-luxury-text"}`}>
              {locale === "ar" ? "الدفع عند الاستلام (COD)" : "Paiement à la Livraison"}
            </h4>
            <p className={`text-xs leading-relaxed ${isAzurDarkFooter ? "text-blue-100/75" : isEmeraldDarkFooter ? "text-[#C8D8D1]" : "text-luxury-text-secondary"}`}>
              {locale === "ar"
                ? "تسوق بكل طمأنينة مع إمكانية معاينة الطرد والدفع نقداً عند باب منزلك."
                : "Commandez l'esprit serein sans prépaiement. Vous réglez à la réception."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <span className={`block font-serif text-2xl tracking-[0.2em] font-medium uppercase ${isInvertedBand ? "text-white" : "text-luxury-text"}`}>
              {s.brandName}
            </span>
            <p className={`text-xs max-w-md leading-relaxed ${isAzurDarkFooter ? "text-blue-100/75" : isEmeraldDarkFooter ? "text-[#C8D8D1]" : "text-luxury-text-secondary"}`}>
              {dict.footer.brandStatement}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h5 className={`text-[11px] uppercase tracking-widest font-semibold ${isAzurDarkFooter ? "text-sky-300" : isEmeraldDarkFooter ? "text-[#DFC07D]" : "text-luxury-text"}`}>
              {dict.footer.quickLinks}
            </h5>
            <ul className={`space-y-2 text-xs ${isAzurDarkFooter ? "text-blue-100/80" : isEmeraldDarkFooter ? "text-[#C8D8D1]" : "text-luxury-text-secondary"}`}>
              <li>
                <Link href={`/${locale}/shop`} className="hover:text-luxury-accent transition-colors">
                  {dict.nav.shop}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/packs`} className="hover:text-luxury-accent transition-colors">
                  {dict.nav.packs}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/packs/builder`} className="hover:text-luxury-accent transition-colors">
                  {dict.nav.buildPack}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div className="space-y-3">
            <h5 className={`text-[11px] uppercase tracking-widest font-semibold ${isAzurDarkFooter ? "text-sky-300" : isEmeraldDarkFooter ? "text-[#DFC07D]" : "text-luxury-text"}`}>
              {dict.footer.customerCare}
            </h5>
            <ul className={`space-y-2 text-xs ${isAzurDarkFooter ? "text-blue-100/80" : isEmeraldDarkFooter ? "text-[#C8D8D1]" : "text-luxury-text-secondary"}`}>
              <li>
                {locale === "ar"
                  ? `الهاتف: ${s.contactPhone}`
                  : `Service Client: ${s.contactPhone}`}
              </li>
              <li>{s.supportEmail}</li>
              <li>{locale === "ar" ? s.addressAr : s.addressFr}</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className={`pt-10 mt-10 border-t flex flex-col sm:flex-row items-center justify-between text-[11px] ${isAzurDarkFooter ? "border-sky-400/15 text-blue-200/70" : isEmeraldDarkFooter ? "border-[#C5A059]/20 text-[#A8BFB6]" : "border-luxury-border/30 text-luxury-text-muted"}`}>
          <p>© {new Date().getFullYear()} {dict.footer.copyright}</p>
          <p className="mt-2 sm:mt-0">
            {locale === "ar" ? "عطور استثنائية صُنعت بشغف في الجزائر" : "Compositions d'exception façonnées en Algérie"}
          </p>
        </div>
      </div>
    </footer>
  );
}
