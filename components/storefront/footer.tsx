import React from "react";
import Link from "next/link";
import { Locale, getDictionary } from "@/lib/i18n";
import { ShieldCheck, Truck, Sparkles, Heart } from "lucide-react";
import { DEFAULT_STORE_SETTINGS, StoreSettings } from "@/types/settings";

interface FooterProps {
  locale?: Locale;
  settings?: StoreSettings;
}

export function Footer({ locale = "fr", settings }: FooterProps) {
  const dict = getDictionary(locale);
  const s = settings || DEFAULT_STORE_SETTINGS;

  return (
    <footer className="bg-luxury-secondary text-luxury-text mt-24 border-t border-luxury-border/30">
      {/* Brand Value Pillars */}
      <div className="container mx-auto px-4 sm:px-6 py-12 border-b border-luxury-border/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left rtl:md:text-right">
          <div className="flex flex-col items-center md:items-start rtl:md:items-start space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-luxury-surface text-luxury-accent mb-1">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-sm font-semibold text-luxury-text">
              {locale === "ar" ? "خلاصات نقية وتعتيق حرفي" : "Huiles Pures & Macération"}
            </h4>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              {locale === "ar"
                ? "انتقاء دقيق لأجود الزيوت العطرية العالمية المركزة بنسب ثبات عالية."
                : "Sélection rigoureuse d'huiles parfumées de haute pureté pour une tenue longue durée."}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start rtl:md:items-start space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-luxury-surface text-luxury-accent mb-1">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-sm font-semibold text-luxury-text">
              {locale === "ar" ? "توصيل إلى 58 ولاية" : "Livraison 58 Wilayas"}
            </h4>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              {dict.footer.wilayaDeliveryNote}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start rtl:md:items-start space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-luxury-surface text-luxury-accent mb-1">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-sm font-semibold text-luxury-text">
              {locale === "ar" ? "الدفع عند الاستلام (COD)" : "Paiement à la Livraison"}
            </h4>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
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
            <span className="block font-serif text-2xl tracking-[0.2em] font-medium text-luxury-text uppercase">
              {s.brandName}
            </span>
            <p className="text-xs text-luxury-text-secondary max-w-md leading-relaxed">
              {dict.footer.brandStatement}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h5 className="text-[11px] uppercase tracking-widest text-luxury-text font-semibold">
              {dict.footer.quickLinks}
            </h5>
            <ul className="space-y-2 text-xs text-luxury-text-secondary">
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
            <h5 className="text-[11px] uppercase tracking-widest text-luxury-text font-semibold">
              {dict.footer.customerCare}
            </h5>
            <ul className="space-y-2 text-xs text-luxury-text-secondary">
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
        <div className="pt-10 mt-10 border-t border-luxury-border/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-luxury-text-muted">
          <p>© {new Date().getFullYear()} {dict.footer.copyright}</p>
          <p className="mt-2 sm:mt-0">
            {locale === "ar" ? "عطور استثنائية صُنعت بشغف في الجزائر" : "Compositions d'exception façonnées en Algérie"}
          </p>
        </div>
      </div>
    </footer>
  );
}
