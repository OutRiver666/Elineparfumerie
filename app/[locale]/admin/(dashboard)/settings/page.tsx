import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria-locations";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";
import { Settings, Save, MapPin, Truck, Tag, Store, Sliders } from "lucide-react";

interface AdminSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const isAr = locale === "ar";

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
    <div className="space-y-6 sm:space-y-7 font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <Sliders className="w-3 h-3 text-amber-600" />
              {isAr ? "تهيئة المتجر والتوصيل" : "Paramètres & Tarification"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "الإعدادات العامة وتسعيرة التوصيل" : "Paramètres Généraux & Livraison"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "تعديل معلومات المتجر، تسعيرات التوصيل في 58 ولاية، وقواعد الخصومات."
              : "Configuration des tarifs de livraison par Wilaya, remises de coffrets et coordonnées boutique."}
          </p>
        </div>

        <Button size="sm" className="gap-2 rounded-lg bg-zinc-900 text-white hover:bg-black font-semibold shadow-xs">
          <Save className="w-4 h-4" />
          <span>{isAr ? "حفظ التغييرات" : "Enregistrer"}</span>
        </Button>
      </div>

      {/* Store Info Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <CardHeader className="flex flex-row items-center gap-2.5 p-5 pb-4 border-b border-zinc-100">
          <Store className="w-4 h-4 text-amber-600" />
          <div>
            <CardTitle className="text-sm font-bold text-zinc-900">
              {isAr ? "معلومات المتجر وهوية العلامة" : "Informations Boutique & Contact"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              {isAr ? "بيانات التواصل المعروضة للزبائن" : "Données affichées sur les reçus et factures"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { labelFr: "Nom de la marque", labelAr: "اسم الماركة", value: "Éline Parfumerie" },
              { labelFr: "Téléphone contact", labelAr: "هاتف التواصل", value: "0550 XX XX XX" },
              { labelFr: "Email support", labelAr: "البريد الإلكتروني", value: "contact@eline-parfumerie.dz" },
              { labelFr: "Devise par défaut", labelAr: "العملة", value: "DZD — Dinar Algérien" },
            ].map((field) => (
              <div key={field.labelFr}>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  {isAr ? field.labelAr : field.labelFr}
                </label>
                <input
                  type="text"
                  defaultValue={field.value}
                  className="w-full px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pack Discount Settings Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <CardHeader className="flex flex-row items-center gap-2.5 p-5 pb-4 border-b border-zinc-100">
          <Tag className="w-4 h-4 text-amber-600" />
          <div>
            <CardTitle className="text-sm font-bold text-zinc-900">
              {isAr ? "نسب الخصم للباقات والعروض" : "Règles Promotionnelles des Packs"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              {isAr ? "خصومات تلقائية على باقات العطور" : "Remises appliquées automatiquement au panier"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  {isAr ? setting.labelAr : setting.labelFr}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={setting.value}
                    className="flex-1 px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                  <span className="text-xs font-bold text-zinc-700">{setting.suffix}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wilaya Delivery Rates Table Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-amber-600" />
            <div>
              <CardTitle className="text-sm font-bold text-zinc-900">
                {isAr
                  ? "تسعيرة التوصيل حسب الولاية (58 ولاية)"
                  : "Tarifs Livraison par Wilaya (58 wilayas)"}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                {isAr ? "رسوم الشحن المحتسبة آلياً عند الطلب" : "Frais de port calculés côté serveur lors du checkout"}
              </CardDescription>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-md">
            58 Wilayas
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-zinc-50/80 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-100 sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="py-3 px-4">{isAr ? "رمز" : "Code"}</th>
                  <th className="py-3 px-4">{isAr ? "الولاية" : "Wilaya"}</th>
                  <th className="py-3 px-4">{isAr ? "عدد البلديات" : "Communes"}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">
                    {isAr ? "رسوم التوصيل (DA)" : "Tarif Livraison (DA)"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                {ALGERIA_WILAYAS.map((wilaya) => (
                  <tr key={wilaya.code} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-zinc-400 font-bold">
                      {wilaya.code}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-zinc-900">
                      {isAr ? wilaya.name_ar : wilaya.name_fr}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400">
                      {wilaya.communes.length} {isAr ? "بلدية" : "communes"}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-end rtl:justify-start gap-2">
                        <input
                          type="number"
                          defaultValue={wilaya.deliveryFeeDZD}
                          className="w-24 px-2.5 py-1 border border-zinc-200/80 rounded-md text-xs text-right font-bold text-zinc-900 bg-zinc-50/50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
                        />
                        <span className="text-[11px] font-semibold text-zinc-400">DZD</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              {isAr
                ? "يتم حساب رسوم التوصيل تلقائياً على الخادم عند تقديم الطلب"
                : "Les tarifs sont recalculés côté serveur à chaque commande"}
            </p>
            <Button size="sm" className="gap-2 rounded-lg bg-zinc-900 text-white hover:bg-black font-semibold shadow-xs">
              <Save className="w-3.5 h-3.5" />
              <span>{isAr ? "حفظ التسعيرات" : "Sauvegarder les tarifs"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
