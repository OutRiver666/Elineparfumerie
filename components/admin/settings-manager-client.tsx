"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { StoreSettings, WilayaDeliveryRateRecord } from "@/types/settings";
import {
  saveAllSettingsAction,
  saveGeneralSettingsAction,
  saveWilayaRatesAction,
} from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Save,
  Truck,
  Tag,
  Store,
  Sliders,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsManagerClientProps {
  locale: Locale;
  initialSettings: StoreSettings;
  initialWilayaRates: WilayaDeliveryRateRecord[];
}

export function SettingsManagerClient({
  locale,
  initialSettings,
  initialWilayaRates,
}: SettingsManagerClientProps) {
  const isAr = locale === "ar";
  const router = useRouter();

  // General & Pack settings state
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [savedSettingsSnapshot, setSavedSettingsSnapshot] =
    useState<StoreSettings>(initialSettings);

  // 58 Wilayas state
  const [wilayaRates, setWilayaRates] =
    useState<WilayaDeliveryRateRecord[]>(initialWilayaRates);
  const [savedRatesSnapshot, setSavedRatesSnapshot] =
    useState<WilayaDeliveryRateRecord[]>(initialWilayaRates);

  // Search, filter & bulk edit
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [bulkFeeInput, setBulkFeeInput] = useState("");

  // Save state
  const [isSavingAll, startSaveAll] = useTransition();
  const [isSavingGeneral, startSaveGeneral] = useTransition();
  const [isSavingRates, startSaveRates] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isGeneralDirty = useMemo(() => {
    return (
      settings.brandName !== savedSettingsSnapshot.brandName ||
      settings.contactPhone !== savedSettingsSnapshot.contactPhone ||
      settings.supportEmail !== savedSettingsSnapshot.supportEmail ||
      settings.addressFr !== savedSettingsSnapshot.addressFr ||
      settings.addressAr !== savedSettingsSnapshot.addressAr ||
      settings.currency !== savedSettingsSnapshot.currency ||
      settings.pack3DiscountPct !== savedSettingsSnapshot.pack3DiscountPct ||
      settings.pack5DiscountPct !== savedSettingsSnapshot.pack5DiscountPct ||
      settings.pack10DiscountPct !== savedSettingsSnapshot.pack10DiscountPct
    );
  }, [settings, savedSettingsSnapshot]);

  const modifiedWilayasCount = useMemo(() => {
    const snapMap = new Map(savedRatesSnapshot.map((r) => [r.wilayaCode, r]));
    let count = 0;
    for (const r of wilayaRates) {
      const orig = snapMap.get(r.wilayaCode);
      if (
        !orig ||
        orig.deliveryFeeDZD !== r.deliveryFeeDZD ||
        orig.estimatedDays !== r.estimatedDays ||
        orig.isActive !== r.isActive
      ) {
        count++;
      }
    }
    return count;
  }, [wilayaRates, savedRatesSnapshot]);

  const hasUnsavedChanges = isGeneralDirty || modifiedWilayasCount > 0;

  const filteredWilayas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return wilayaRates.filter((w) => {
      if (activeFilter === "active" && !w.isActive) return false;
      if (activeFilter === "inactive" && w.isActive) return false;
      if (!q) return true;
      return (
        w.wilayaCode.includes(q) ||
        w.nameFr.toLowerCase().includes(q) ||
        w.nameAr.includes(q)
      );
    });
  }, [wilayaRates, searchQuery, activeFilter]);

  const activeWilayasCount = useMemo(
    () => wilayaRates.filter((w) => w.isActive).length,
    [wilayaRates]
  );

  const updateWilaya = (
    code: string,
    patch: Partial<Pick<WilayaDeliveryRateRecord, "deliveryFeeDZD" | "estimatedDays" | "isActive">>
  ) => {
    setWilayaRates((prev) =>
      prev.map((w) => (w.wilayaCode === code ? { ...w, ...patch } : w))
    );
  };

  const handleApplyBulkFee = () => {
    if (bulkFeeInput.trim() === "") return;
    const fee = Math.max(0, Math.round(Number(bulkFeeInput)));
    if (Number.isNaN(fee)) return;

    const targetCodes = new Set(filteredWilayas.map((w) => w.wilayaCode));
    setWilayaRates((prev) =>
      prev.map((w) => (targetCodes.has(w.wilayaCode) ? { ...w, deliveryFeeDZD: fee } : w))
    );
    toast.success(
      isAr
        ? `تم تطبيق ${fee} دج على ${targetCodes.size} ولاية (اضغط حفظ لتثبيت التغييرات)`
        : `${fee} DZD appliqué à ${targetCodes.size} wilaya(s) (cliquez sur Sauvegarder pour confirmer)`
    );
    setBulkFeeInput("");
  };

  const handleResetUnsaved = () => {
    setSettings(savedSettingsSnapshot);
    setWilayaRates(savedRatesSnapshot);
    setFeedback(null);
  };

  const handleSaveGeneral = () => {
    setFeedback(null);
    startSaveGeneral(async () => {
      const res = await saveGeneralSettingsAction(settings, locale);
      if (res.success) {
        setSavedSettingsSnapshot(settings);
        const msg = isAr
          ? "تم حفظ معلومات المتجر ونسب الخصم بنجاح."
          : "Informations boutique et règles promotionnelles enregistrées.";
        setFeedback({ type: "success", text: msg });
        toast.success(msg);
        router.refresh();
      } else {
        const err = res.error || (isAr ? "حدث خطأ أثناء الحفظ." : "Erreur lors de l'enregistrement.");
        setFeedback({ type: "error", text: err });
        toast.error(err);
      }
    });
  };

  const handleSaveRates = () => {
    setFeedback(null);
    startSaveRates(async () => {
      const payload = wilayaRates.map((w) => ({
        wilayaCode: w.wilayaCode,
        deliveryFeeDZD: w.deliveryFeeDZD,
        estimatedDays: w.estimatedDays,
        isActive: w.isActive,
      }));
      const res = await saveWilayaRatesAction(payload, locale);
      if (res.success) {
        setSavedRatesSnapshot(wilayaRates);
        const msg = isAr
          ? `تم حفظ تسعيرات التوصيل لـ ${res.count || wilayaRates.length} ولاية بنجاح.`
          : `Tarifs de livraison enregistrés pour ${res.count || wilayaRates.length} wilayas.`;
        setFeedback({ type: "success", text: msg });
        toast.success(msg);
        router.refresh();
      } else {
        const err = res.error || (isAr ? "حدث خطأ أثناء حفظ التسعيرات." : "Erreur lors de la sauvegarde des tarifs.");
        setFeedback({ type: "error", text: err });
        toast.error(err);
      }
    });
  };

  const handleSaveAll = () => {
    setFeedback(null);
    startSaveAll(async () => {
      const res = await saveAllSettingsAction(
        {
          general: settings,
          wilayaRates: wilayaRates.map((w) => ({
            wilayaCode: w.wilayaCode,
            deliveryFeeDZD: w.deliveryFeeDZD,
            estimatedDays: w.estimatedDays,
            isActive: w.isActive,
          })),
        },
        locale
      );
      if (res.success) {
        setSavedSettingsSnapshot(settings);
        setSavedRatesSnapshot(wilayaRates);
        const msg = isAr
          ? `تم حفظ جميع الإعدادات وتسعيرات التوصيل (${wilayaRates.length} ولاية) بنجاح.`
          : `Tous les paramètres et tarifs des ${wilayaRates.length} wilayas ont été enregistrés.`;
        setFeedback({ type: "success", text: msg });
        toast.success(msg);
        router.refresh();
      } else {
        const err = res.error || (isAr ? "حدث خطأ أثناء الحفظ." : "Erreur lors de l'enregistrement.");
        setFeedback({ type: "error", text: err });
        toast.error(err);
      }
    });
  };

  const isAnySaving = isSavingAll || isSavingGeneral || isSavingRates;

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
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300/70 px-2 py-0.5 rounded-full">
                {isAr ? "تغييرات غير محفوظة" : "Modifications non enregistrées"}
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "الإعدادات العامة وتسعيرة التوصيل" : "Paramètres Généraux & Livraison"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? `تعديل معلومات المتجر، تسعيرات التوصيل في ${wilayaRates.length} ولاية، وقواعد الخصومات — تُطبَّق فوراً على المتجر واستمارة الطلب.`
              : "Configuration des tarifs de livraison par Wilaya, remises de coffrets et coordonnées boutique — appliqués en direct au checkout."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isAnySaving}
              onClick={handleResetUnsaved}
              className="gap-1.5 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? "تراجع" : "Annuler"}</span>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={isAnySaving}
            onClick={handleSaveAll}
            className="w-full sm:w-auto gap-2 rounded-lg bg-zinc-900 text-white hover:bg-black font-semibold shadow-xs"
          >
            {isSavingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSavingAll
                ? isAr
                  ? "جاري الحفظ..."
                  : "Enregistrement..."
                : isAr
                ? "حفظ جميع التغييرات"
                : "Enregistrer tout"}
            </span>
          </Button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-2xs ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Store Info Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <CardHeader className="flex flex-row items-center gap-2.5 p-4 sm:p-5 pb-4 border-b border-zinc-100">
          <Store className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <CardTitle className="text-sm font-bold text-zinc-900">
              {isAr ? "معلومات المتجر وهوية العلامة" : "Informations Boutique & Contact"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              {isAr
                ? "بيانات التواصل المعروضة في المتجر وتذييل الصفحات"
                : "Données affichées sur le pied de page, les reçus et factures"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                {isAr ? "اسم الماركة" : "Nom de la marque"}
              </label>
              <input
                type="text"
                value={settings.brandName}
                onChange={(e) => setSettings((s) => ({ ...s, brandName: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                {isAr ? "هاتف التواصل" : "Téléphone contact"}
              </label>
              <input
                type="tel"
                dir="ltr"
                value={settings.contactPhone}
                onChange={(e) => setSettings((s) => ({ ...s, contactPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                {isAr ? "البريد الإلكتروني" : "Email support"}
              </label>
              <input
                type="email"
                dir="ltr"
                value={settings.supportEmail}
                onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                {isAr ? "العملة" : "Devise par défaut"}
              </label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                {isAr ? "العنوان (بالفرنسية)" : "Adresse / Ville (FR)"}
              </label>
              <input
                type="text"
                value={settings.addressFr}
                onChange={(e) => setSettings((s) => ({ ...s, addressFr: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                {isAr ? "العنوان (بالعربية)" : "Adresse / Ville (AR)"}
              </label>
              <input
                type="text"
                dir="rtl"
                value={settings.addressAr}
                onChange={(e) => setSettings((s) => ({ ...s, addressAr: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pack Discount Settings Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <CardTitle className="text-sm font-bold text-zinc-900">
                {isAr ? "نسب الخصم للباقات والعروض" : "Règles Promotionnelles des Packs"}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                {isAr
                  ? "خصومات تلقائية على باقات العطور المخصصة"
                  : "Remises appliquées automatiquement aux coffrets sur-mesure"}
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isAnySaving || !isGeneralDirty}
            onClick={handleSaveGeneral}
            className="self-start sm:self-auto gap-1.5 text-xs rounded-lg border-zinc-200 text-zinc-800"
          >
            {isSavingGeneral ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isAr ? "حفظ المعلومات والخصومات" : "Sauvegarder infos & remises"}</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                key: "pack3DiscountPct" as const,
                labelFr: "Remise Pack 3 Flacons",
                labelAr: "خصم باقة 3 عطور",
              },
              {
                key: "pack5DiscountPct" as const,
                labelFr: "Remise Pack 5 Flacons",
                labelAr: "خصم باقة 5 عطور",
              },
              {
                key: "pack10DiscountPct" as const,
                labelFr: "Remise Pack 10+ Flacons",
                labelAr: "خصم باقة 10+ عطور",
              },
            ].map((setting) => (
              <div key={setting.key}>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  {isAr ? setting.labelAr : setting.labelFr}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={settings[setting.key]}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        [setting.key]: Math.min(90, Math.max(0, Number(e.target.value) || 0)),
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                  <span className="text-xs font-bold text-zinc-700">%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wilaya Delivery Rates Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="space-y-3 p-4 sm:p-5 pb-4 border-b border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900">
                  {isAr
                    ? `تسعيرة التوصيل حسب الولاية (${wilayaRates.length} ولاية)`
                    : `Tarifs Livraison par Wilaya (${wilayaRates.length} wilayas)`}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  {isAr
                    ? "رسوم الشحن المحتسبة آلياً عند الطلب (أدخل 0 للتوصيل المجاني)"
                    : "Frais de port calculés en direct sur la boutique et côté serveur (0 = Livraison Gratuite)"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                {activeWilayasCount}/{wilayaRates.length} {isAr ? "نشطة" : "actives"}
              </span>
              {modifiedWilayasCount > 0 && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                  {modifiedWilayasCount} {isAr ? "معدّلة" : "modifiée(s)"}
                </span>
              )}
            </div>
          </div>

          {/* Search, Status Filter & Bulk Update Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? "بحث برمز الولاية أو الاسم (مثال: 16، الجزائر)..."
                      : "Rechercher par code ou nom (ex: 16, Alger)..."
                  }
                  className="w-full ps-8 pe-3 py-2 border border-zinc-200/80 rounded-lg text-xs bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-lg text-[11px] font-semibold self-start sm:self-auto">
                {[
                  { key: "all" as const, fr: "Toutes", ar: "الكل" },
                  { key: "active" as const, fr: "Actives", ar: "النشطة" },
                  { key: "inactive" as const, fr: "Désactivées", ar: "المعطلة" },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeFilter === f.key
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {isAr ? f.ar : f.fr}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Apply Flat Fee */}
            <div className="flex items-center gap-1.5 bg-amber-50/60 border border-amber-200/70 rounded-lg p-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 ms-1" />
              <input
                type="number"
                min={0}
                max={50000}
                step={50}
                value={bulkFeeInput}
                onChange={(e) => setBulkFeeInput(e.target.value)}
                placeholder={isAr ? "سعر موحّد (دج)" : "Tarif fixe (DA)"}
                className="w-28 px-2 py-1 text-xs font-bold bg-white border border-amber-200 rounded text-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleApplyBulkFee}
                disabled={bulkFeeInput.trim() === ""}
                className="px-2.5 py-1 rounded text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isAr
                  ? `تطبيق (${filteredWilayas.length})`
                  : `Appliquer (${filteredWilayas.length})`}
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile Wilaya Cards (< md) */}
          <div className="md:hidden divide-y divide-zinc-100 max-h-[540px] overflow-y-auto">
            {filteredWilayas.map((wilaya) => (
              <div
                key={wilaya.wilayaCode}
                className={`p-3.5 space-y-2.5 transition-colors ${
                  !wilaya.isActive ? "bg-zinc-50/80 opacity-65" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-[11px] font-bold text-zinc-600 shrink-0">
                      {wilaya.wilayaCode}
                    </span>
                    <span className="font-bold text-xs text-zinc-900 truncate">
                      {isAr ? wilaya.nameAr : wilaya.nameFr}
                    </span>
                    {wilaya.deliveryFeeDZD === 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold shrink-0">
                        {isAr ? "مجاني" : "Gratuit"}
                      </span>
                    )}
                  </div>

                  <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={wilaya.isActive}
                      onChange={(e) =>
                        updateWilaya(wilaya.wilayaCode, { isActive: e.target.checked })
                      }
                      className="w-4 h-4 accent-zinc-900 rounded"
                    />
                    <span>{wilaya.isActive ? (isAr ? "نشط" : "Actif") : isAr ? "موقف" : "Off"}</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-0.5">
                      {isAr ? "المدة المتوقعة" : "Délai estimé"}
                    </label>
                    <input
                      type="text"
                      value={wilaya.estimatedDays}
                      onChange={(e) =>
                        updateWilaya(wilaya.wilayaCode, { estimatedDays: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 border border-zinc-200/80 rounded-md text-xs font-medium text-zinc-800 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-0.5">
                      {isAr ? "رسوم التوصيل (DZD)" : "Tarif (DZD)"}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={50000}
                        step={50}
                        value={wilaya.deliveryFeeDZD}
                        onChange={(e) =>
                          updateWilaya(wilaya.wilayaCode, {
                            deliveryFeeDZD: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-full px-2.5 py-1.5 border border-zinc-200/80 rounded-md text-xs text-end font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                      <span className="text-[10px] font-semibold text-zinc-400">DA</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block overflow-x-auto max-h-[540px] overflow-y-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-zinc-50/95 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-100 sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="py-3 px-4">{isAr ? "رمز" : "Code"}</th>
                  <th className="py-3 px-4">{isAr ? "الولاية" : "Wilaya"}</th>
                  <th className="py-3 px-4">{isAr ? "البلديات" : "Communes"}</th>
                  <th className="py-3 px-4">{isAr ? "المدة المتوقعة" : "Délai Estimé"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "التفعيل" : "Actif"}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">
                    {isAr ? "رسوم التوصيل (DA)" : "Tarif Livraison (DA)"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                {filteredWilayas.map((wilaya) => (
                  <tr
                    key={wilaya.wilayaCode}
                    className={`hover:bg-zinc-50/70 transition-colors ${
                      !wilaya.isActive ? "bg-zinc-50/70 opacity-60" : ""
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono text-zinc-400 font-bold">
                      {wilaya.wilayaCode}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">
                          {isAr ? wilaya.nameAr : wilaya.nameFr}
                        </span>
                        {wilaya.deliveryFeeDZD === 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                            {isAr ? "مجاني" : "Gratuit"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400">
                      {wilaya.communesCount} {isAr ? "بلدية" : "communes"}
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={wilaya.estimatedDays}
                        onChange={(e) =>
                          updateWilaya(wilaya.wilayaCode, { estimatedDays: e.target.value })
                        }
                        className="w-28 px-2.5 py-1 border border-zinc-200/80 rounded-md text-xs text-zinc-800 bg-zinc-50/50 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={wilaya.isActive}
                        onChange={(e) =>
                          updateWilaya(wilaya.wilayaCode, { isActive: e.target.checked })
                        }
                        className="w-4 h-4 accent-zinc-900 cursor-pointer rounded"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-end rtl:justify-start gap-2">
                        <input
                          type="number"
                          min={0}
                          max={50000}
                          step={50}
                          value={wilaya.deliveryFeeDZD}
                          onChange={(e) =>
                            updateWilaya(wilaya.wilayaCode, {
                              deliveryFeeDZD: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
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

          <div className="p-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-zinc-400">
              {isAr
                ? "يتم حفظ التسعيرات مباشرة في قاعدة البيانات وتطبيقها فوراً على استمارة الطلب"
                : "Les tarifs sont enregistrés dans Supabase et appliqués immédiatement au checkout"}
            </p>
            <Button
              type="button"
              size="sm"
              disabled={isAnySaving}
              onClick={handleSaveRates}
              className="w-full sm:w-auto gap-2 rounded-lg bg-zinc-900 text-white hover:bg-black font-semibold shadow-xs shrink-0"
            >
              {isSavingRates ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>
                {isSavingRates
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Sauvegarde..."
                  : isAr
                  ? "حفظ تسعيرات التوصيل"
                  : "Sauvegarder les tarifs"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
