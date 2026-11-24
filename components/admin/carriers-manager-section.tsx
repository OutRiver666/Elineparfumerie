"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import {
  CARRIER_ACCENT_OPTIONS,
  CarrierAccentColor,
  EcoTrackCarrierPublic,
  getCarrierColorTheme,
} from "@/lib/shipping/carriers-types";
import {
  saveCarrierAction,
  toggleCarrierActiveAction,
  deleteCarrierAction,
  testCarrierConnectionAction,
} from "@/lib/actions/carriers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  KeyRound,
  Plug,
  Eye,
  EyeOff,
  Power,
} from "lucide-react";
import { toast } from "sonner";

interface CarriersManagerSectionProps {
  locale: Locale;
  initialCarriers: EcoTrackCarrierPublic[];
  onCarriersChange?: (carriers: EcoTrackCarrierPublic[]) => void;
}

interface CarrierFormState {
  id?: string;
  name: string;
  shortName: string;
  baseUrl: string;
  apiToken: string;
  accentColor: CarrierAccentColor;
  isActive: boolean;
}

const EMPTY_FORM: CarrierFormState = {
  name: "",
  shortName: "",
  baseUrl: "",
  apiToken: "",
  accentColor: "blue",
  isActive: true,
};

export function CarriersManagerSection({
  locale,
  initialCarriers,
  onCarriersChange,
}: CarriersManagerSectionProps) {
  const isAr = locale === "ar";
  const router = useRouter();

  const [carriers, setCarriers] = useState<EcoTrackCarrierPublic[]>(initialCarriers);
  const updateCarriers = (next: EcoTrackCarrierPublic[]) => {
    setCarriers(next);
    onCarriersChange?.(next);
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<EcoTrackCarrierPublic | null>(null);
  const [form, setForm] = useState<CarrierFormState>(EMPTY_FORM);
  const [showToken, setShowToken] = useState(false);

  const [testingModal, setTestingModal] = useState(false);
  const [testingRowId, setTestingRowId] = useState<string | null>(null);
  const [modalTestResult, setModalTestResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<EcoTrackCarrierPublic | null>(null);
  const [isSaving, startSave] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const activeCount = carriers.filter((c) => c.isActive).length;

  const openAddModal = () => {
    setEditingCarrier(null);
    setForm(EMPTY_FORM);
    setShowToken(false);
    setModalTestResult(null);
    setModalOpen(true);
  };

  const openEditModal = (carrier: EcoTrackCarrierPublic) => {
    setEditingCarrier(carrier);
    setForm({
      id: carrier.id,
      name: carrier.name,
      shortName: carrier.shortName,
      baseUrl: carrier.baseUrl,
      apiToken: "",
      accentColor: carrier.accentColor,
      isActive: carrier.isActive,
    });
    setShowToken(false);
    setModalTestResult(null);
    setModalOpen(true);
  };

  const handleTestInModal = async () => {
    setTestingModal(true);
    setModalTestResult(null);
    try {
      const res = await testCarrierConnectionAction(
        {
          baseUrl: form.baseUrl,
          apiToken: form.apiToken,
          existingCarrierId: editingCarrier?.id,
        },
        locale
      );
      if (res.success) {
        const msg = isAr
          ? `تم الاتصال بنجاح بمنصة EcoTrack (${res.totalOrders ?? 0} طرد مسجّل)`
          : `Connexion EcoTrack réussie ! (${res.totalOrders ?? 0} colis détecté(s))`;
        setModalTestResult({ type: "success", text: msg });
        toast.success(msg);
      } else {
        const err = res.error || (isAr ? "فشل الاتصال بمنصة EcoTrack" : "Échec de connexion EcoTrack");
        setModalTestResult({ type: "error", text: err });
      }
    } catch (err: any) {
      setModalTestResult({
        type: "error",
        text: err?.message || "Erreur réseau",
      });
    } finally {
      setTestingModal(false);
    }
  };

  const handleTestRow = async (carrier: EcoTrackCarrierPublic) => {
    setTestingRowId(carrier.id);
    try {
      const res = await testCarrierConnectionAction(
        { baseUrl: carrier.baseUrl, existingCarrierId: carrier.id },
        locale
      );
      if (res.success) {
        toast.success(
          isAr
            ? `${carrier.name}: متصل بنجاح (${res.totalOrders ?? 0} طرد)`
            : `${carrier.name} : connecté ✓ (${res.totalOrders ?? 0} colis)`
        );
      } else {
        toast.error(`${carrier.name} : ${res.error || "Échec"}`);
      }
    } finally {
      setTestingRowId(null);
    }
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.baseUrl.trim()) {
      setModalTestResult({
        type: "error",
        text: isAr
          ? "يرجى إدخال اسم الشركة ورابط EcoTrack."
          : "Veuillez saisir le nom de la société et l'URL EcoTrack.",
      });
      return;
    }
    if (!editingCarrier && !form.apiToken.trim()) {
      setModalTestResult({
        type: "error",
        text: isAr
          ? "يرجى إدخال مفتاح API (Token)."
          : "Veuillez saisir la clé API (Token) EcoTrack.",
      });
      return;
    }

    startSave(async () => {
      const res = await saveCarrierAction(
        {
          id: form.id,
          name: form.name.trim(),
          shortName: form.shortName.trim() || undefined,
          baseUrl: form.baseUrl.trim(),
          apiToken: form.apiToken.trim() || undefined,
          accentColor: form.accentColor,
          isActive: form.isActive,
        },
        locale
      );

      if (res.success && res.carriers) {
        updateCarriers(res.carriers);
        setModalOpen(false);
        toast.success(
          editingCarrier
            ? isAr
              ? `تم تحديث شركة التوصيل "${form.name.trim()}"`
              : `Transporteur « ${form.name.trim()} » mis à jour`
            : isAr
            ? `تمت إضافة "${form.name.trim()}" وتفعيلها في صفحة الطلبيات`
            : `« ${form.name.trim()} » ajouté ! Disponible immédiatement dans Commandes`
        );
        router.refresh();
      } else {
        const err = res.error || (isAr ? "حدث خطأ أثناء الحفظ" : "Erreur lors de l'enregistrement");
        setModalTestResult({ type: "error", text: err });
        toast.error(err);
      }
    });
  };

  const handleToggleActive = async (carrier: EcoTrackCarrierPublic) => {
    setBusyId(carrier.id);
    try {
      const nextActive = !carrier.isActive;
      const res = await toggleCarrierActiveAction(carrier.id, nextActive, locale);
      if (res.success && res.carriers) {
        updateCarriers(res.carriers);
        toast.success(
          nextActive
            ? isAr
              ? `تم تفعيل ${carrier.name}`
              : `${carrier.name} activé`
            : isAr
            ? `تم إيقاف ${carrier.name}`
            : `${carrier.name} désactivé`
        );
        router.refresh();
      } else {
        toast.error(res.error || "Erreur");
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      const res = await deleteCarrierAction(deleteTarget.id, locale);
      if (res.success && res.carriers) {
        updateCarriers(res.carriers);
        toast.success(
          isAr
            ? `تم حذف ${deleteTarget.name}`
            : `Transporteur « ${deleteTarget.name} » supprimé`
        );
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la suppression");
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="p-4 sm:p-5 pb-4 border-b border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-sm font-bold text-zinc-900">
                    {isAr
                      ? "شركات التوصيل المرتبطة بـ EcoTrack"
                      : "Transporteurs EcoTrack Connectés"}
                  </CardTitle>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    {activeCount}/{carriers.length} {isAr ? "نشط" : "actif(s)"}
                  </span>
                </div>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  {isAr
                    ? "أضف أي شركة توصيل تعمل بنظام EcoTrack (الرابط + Token) لتظهر مباشرة في صفحة الطلبيات والمزامنة التلقائية."
                    : "Ajoutez n'importe quelle société de livraison EcoTrack (URL + Token API) : elle apparaît immédiatement dans Commandes & Auto-Sync."}
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              onClick={openAddModal}
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold gap-1.5 h-9 px-3.5 rounded-lg self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? "إضافة شركة توصيل" : "Ajouter un transporteur"}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {carriers.map((carrier) => {
              const theme = getCarrierColorTheme(carrier.accentColor);
              const isBusy = busyId === carrier.id;
              const isTesting = testingRowId === carrier.id;

              return (
                <div
                  key={carrier.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                    carrier.isActive
                      ? "bg-white border-zinc-200/90 hover:border-zinc-300 shadow-2xs"
                      : "bg-zinc-50/70 border-zinc-200/60 opacity-75"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${theme.chipClass}`}
                        >
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-zinc-900 text-xs sm:text-sm truncate">
                              {carrier.name}
                            </p>
                            {carrier.isBuiltIn && (
                              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200/70">
                                {isAr ? "افتراضي" : "Défaut"}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-zinc-400 truncate">
                            ID: {carrier.id} • {carrier.shortName}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggleActive(carrier)}
                        title={
                          carrier.isActive
                            ? isAr
                              ? "تعطيل"
                              : "Désactiver"
                            : isAr
                            ? "تفعيل"
                            : "Activer"
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer shrink-0 ${
                          carrier.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
                        }`}
                      >
                        <Power className="w-2.5 h-2.5" />
                        <span>
                          {carrier.isActive
                            ? isAr
                              ? "نشط"
                              : "Actif"
                            : isAr
                            ? "معطّل"
                            : "Inactif"}
                        </span>
                      </button>
                    </div>

                    <div className="space-y-1.5 text-[11px] bg-zinc-50/90 border border-zinc-100 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 text-zinc-600 min-w-0">
                        <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="font-mono truncate" dir="ltr">
                          {carrier.baseUrl.replace(/^https?:\/\//i, "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500 min-w-0">
                        <KeyRound className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="font-mono truncate" dir="ltr">
                          {carrier.tokenMasked || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-100">
                    <button
                      type="button"
                      disabled={isTesting}
                      onClick={() => handleTestRow(carrier)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isTesting ? (
                        <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                      ) : (
                        <Plug className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{isAr ? "اختبار" : "Tester"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(carrier)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />
                        <span>{isAr ? "تعديل" : "Modifier"}</span>
                      </button>

                      {!carrier.isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(carrier)}
                          title={isAr ? "حذف شركة التوصيل" : "Supprimer"}
                          className="p-1.5 rounded-lg border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Carrier Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => !isSaving && setModalOpen(open)}>
        <DialogContent
          className="max-w-lg rounded-2xl border-zinc-200 p-0 overflow-hidden font-outfit"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-zinc-900 via-amber-500 to-zinc-900" />

          <form onSubmit={handleSubmitModal} className="p-5 sm:p-6 space-y-4">
            <DialogHeader className="text-start space-y-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                <span>
                  {editingCarrier
                    ? isAr
                      ? `تعديل ${editingCarrier.name}`
                      : `Modifier ${editingCarrier.name}`
                    : isAr
                    ? "إضافة شركة توصيل EcoTrack جديدة"
                    : "Nouveau Transporteur EcoTrack"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                {isAr
                  ? "أدخل رابط المنصة ومفتاح الـ API الخاص بشركة التوصيل، وسيتم ربطها تلقائياً بصفحة الطلبيات."
                  : "Saisissez simplement l'URL EcoTrack et le Token API : la société sera immédiatement disponible pour expédier et synchroniser vos commandes."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5">
              {/* Name & Short Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    {isAr ? "اسم شركة التوصيل *" : "Nom de la société *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={isAr ? "مثال: DHD Livraison" : "ex: DHD Livraison, Conexlog..."}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    {isAr ? "الاسم المختصر" : "Nom court"}
                  </label>
                  <input
                    type="text"
                    value={form.shortName}
                    onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                    placeholder="ex: DHD"
                    maxLength={20}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium"
                  />
                </div>
              </div>

              {/* Base URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 block">
                  {isAr ? "رابط منصة EcoTrack (URL) *" : "URL EcoTrack *"}
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={form.baseUrl}
                    onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                    placeholder="https://dhd.ecotrack.dz"
                    className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* API Token */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                  <span>
                    {isAr ? "مفتاح API (Token)" : "Clé API (Token)"}
                    {!editingCarrier && " *"}
                  </span>
                  {editingCarrier && (
                    <span className="text-[10px] font-normal text-zinc-400">
                      {isAr
                        ? "اتركه فارغاً للاحتفاظ بالمفتاح الحالي"
                        : "Laisser vide pour conserver le token actuel"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showToken ? "text" : "password"}
                    required={!editingCarrier}
                    dir="ltr"
                    value={form.apiToken}
                    onChange={(e) => setForm((f) => ({ ...f, apiToken: e.target.value }))}
                    placeholder={
                      editingCarrier
                        ? editingCarrier.tokenMasked || "••••••••••••••••"
                        : "Collez votre token API EcoTrack..."
                    }
                    className="w-full pl-9 pr-10 py-2 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  {isAr ? "لون التمييز في لوحة التحكم" : "Couleur du badge dans Commandes"}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {CARRIER_ACCENT_OPTIONS.map((opt) => {
                    const selected = form.accentColor === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, accentColor: opt.key }))}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          selected
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-2xs"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${opt.swatchClass}`} />
                        <span>{isAr ? opt.labelAr : opt.labelFr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Test Result Banner */}
              {modalTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                    modalTestResult.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {modalTestResult.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{modalTestResult.text}</span>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                disabled={testingModal || isSaving || !form.baseUrl.trim()}
                onClick={handleTestInModal}
                className="rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                {testingModal ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                ) : (
                  <Plug className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{isAr ? "اختبار الاتصال" : "Tester la connexion"}</span>
              </Button>

              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border-zinc-200 text-zinc-600 text-xs"
                >
                  {isAr ? "إلغاء" : "Annuler"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>
                    {editingCarrier
                      ? isAr
                        ? "حفظ التغييرات"
                        : "Enregistrer"
                      : isAr
                      ? "إضافة وتفعيل"
                      : "Ajouter & Activer"}
                  </span>
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-2xl p-6 font-outfit" dir={isAr ? "rtl" : "ltr"}>
          <DialogHeader className="text-start space-y-1.5">
            <DialogTitle className="text-base font-bold text-zinc-950">
              {isAr ? "حذف شركة التوصيل؟" : "Supprimer ce transporteur ?"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 leading-relaxed">
              {isAr
                ? `هل أنت متأكد من حذف "${deleteTarget?.name}"؟ الطلبيات السابقة لن تُحذف.`
                : `Voulez-vous vraiment supprimer « ${deleteTarget?.name} » ? L'historique des commandes existantes reste intact.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={Boolean(busyId)}
              className="rounded-lg text-xs"
            >
              {isAr ? "إلغاء" : "Annuler"}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={Boolean(busyId)}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
            >
              {busyId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{isAr ? "تأكيد الحذف" : "Supprimer"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
