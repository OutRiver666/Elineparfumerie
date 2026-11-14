import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria-locations";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";
import { Settings, Save, MapPin, Truck, Tag, Store } from "lucide-react";

interface AdminSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  // Check auth and permissions
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;
  const authInfo = await getEffectiveAdminPermissions(user?.email || "", simulatedRole);

  if (!authInfo.permissions.settings_team && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="les paramètres de la boutique et les tarifs de livraison"
        requiredPermissionNameAr="إعدادات المتجر وتسعيرات التوصيل"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "إعدادات النظام" : "Configuration Système"}
          </span>
          <h2 className="font-serif text-2xl font-medium text-luxury-text">
            {locale === "ar" ? "الإعدادات العامة" : "Paramètres & Tarifs Livraison"}
          </h2>
        </div>
        <Button variant="default" size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          <span>{locale === "ar" ? "حفظ التغييرات" : "Enregistrer"}</span>
        </Button>
      </div>

      {/* Store Info */}
      <div className="bg-white border border-luxury-border/30 rounded-[4px] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-luxury-border/20">
          <Store className="w-4 h-4 text-luxury-accent" />
          <h3 className="font-medium text-luxury-text text-sm">
            {locale === "ar" ? "معلومات المتجر" : "Informations Boutique"}
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { labelFr: "Nom de la marque", labelAr: "اسم الماركة", value: "Éline Parfumerie" },
            { labelFr: "Téléphone contact", labelAr: "هاتف التواصل", value: "0550 XX XX XX" },
            { labelFr: "Email", labelAr: "البريد الإلكتروني", value: "contact@eline-parfumerie.dz" },
            { labelFr: "Devise", labelAr: "العملة", value: "DZD — Dinar Algérien" },
          ].map((field) => (
            <div key={field.labelFr}>
              <label className="block text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
                {locale === "ar" ? field.labelAr : field.labelFr}
              </label>
              <input
                type="text"
                defaultValue={field.value}
                className="w-full px-3 py-2 border border-luxury-border/60 rounded-[4px] text-sm bg-white text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pack Discount Settings */}
      <div className="bg-white border border-luxury-border/30 rounded-[4px] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-luxury-border/20">
          <Tag className="w-4 h-4 text-luxury-accent" />
          <h3 className="font-medium text-luxury-text text-sm">
            {locale === "ar" ? "إعدادات الخصومات والباقات" : "Règles Promotionnelles Packs"}
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              labelFr: "Remise Pack 3 Flacons",
              labelAr: "خصم باقة 3 عطور",
              value: "15",
              suffix: "%",
            },
            {
              labelFr: "Remise Pack 5 Flacons",
              labelAr: "خصم باقة 5 عطور",
              value: "20",
              suffix: "%",
            },
            {
              labelFr: "Remise Pack 10+ Flacons",
              labelAr: "خصم باقة 10+ عطور",
              value: "25",
              suffix: "%",
            },
          ].map((setting) => (
            <div key={setting.labelFr}>
              <label className="block text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
                {locale === "ar" ? setting.labelAr : setting.labelFr}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={setting.value}
                  className="flex-1 px-3 py-2 border border-luxury-border/60 rounded-[4px] text-sm bg-white text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors"
                />
                <span className="text-sm font-semibold text-luxury-text">{setting.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wilaya Delivery Rates */}
      <div className="bg-white border border-luxury-border/30 rounded-[4px] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-luxury-border/20">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-luxury-accent" />
            <h3 className="font-medium text-luxury-text text-sm">
              {locale === "ar"
                ? "تسعيرة التوصيل حسب الولاية (58 ولاية)"
                : "Tarifs Livraison par Wilaya (58 wilayas)"}
            </h3>
          </div>
          <p className="text-[10px] text-luxury-text-muted">
            {locale === "ar" ? "قابل للتعديل" : "Modifiable"}
          </p>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-luxury-secondary/60 text-luxury-text-muted uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "رمز" : "Code"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "الولاية" : "Wilaya"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "عدد البلديات" : "Communes"}
                </th>
                <th className="py-3 px-4 text-right">
                  {locale === "ar" ? "رسوم التوصيل (DA)" : "Tarif Livraison (DA)"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/20">
              {ALGERIA_WILAYAS.map((wilaya) => (
                <tr key={wilaya.code} className="hover:bg-luxury-secondary/30 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-luxury-text-muted font-medium">
                    {wilaya.code}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-medium text-luxury-text">
                      {locale === "ar" ? wilaya.name_ar : wilaya.name_fr}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-luxury-text-muted">
                    {wilaya.communes.length}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        defaultValue={wilaya.deliveryFeeDZD}
                        className="w-20 px-2 py-1 border border-luxury-border/40 rounded-[3px] text-xs text-right bg-white text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                      />
                      <span className="text-luxury-text-muted">DA</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-luxury-border/20 flex items-center justify-between">
          <p className="text-xs text-luxury-text-muted">
            {locale === "ar"
              ? "يتم حساب رسوم التوصيل تلقائياً على الخادم عند تقديم الطلب"
              : "Les tarifs sont recalculés côté serveur à chaque commande"}
          </p>
          <Button variant="default" size="sm" className="gap-2">
            <Save className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "حفظ التسعيرات" : "Sauvegarder les tarifs"}</span>
          </Button>
        </div>
      </div>

      {/* Environment Variables Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-[4px] p-4 text-xs">
        <p className="font-semibold text-amber-800 mb-2">
          🔧 {locale === "ar" ? "إعداد متغيرات البيئة (Supabase)" : "Configuration Variables d'Environnement (Supabase)"}
        </p>
        <p className="text-amber-700 mb-3">
          {locale === "ar"
            ? "لتفعيل قاعدة البيانات الحقيقية، قم بإنشاء ملف .env.local في جذر المشروع:"
            : "Pour activer la base de données réelle, créez un fichier .env.local à la racine du projet:"}
        </p>
        <pre className="bg-amber-100 rounded-[3px] p-3 text-amber-900 font-mono text-[10px] leading-relaxed overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
        </pre>
        <p className="text-amber-700 mt-2">
          {locale === "ar"
            ? "يمكن الحصول على هذه المفاتيح من لوحة تحكم Supabase > Settings > API"
            : "Ces clés sont disponibles dans Supabase Dashboard > Project Settings > API"}
        </p>
      </div>
    </div>
  );
}
