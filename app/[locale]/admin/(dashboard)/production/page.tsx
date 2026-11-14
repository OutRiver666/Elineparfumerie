import React from "react";
import { Locale } from "@/lib/i18n";
import { getProductionBatches } from "@/lib/services/production.service";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Calendar,
} from "lucide-react";

interface AdminProductionPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminProductionPage({
  params,
}: AdminProductionPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  const batches = await getProductionBatches();

  const completedBatches = batches.filter((b) => b.status === "completed");
  const inProgressBatches = batches.filter((b) => b.status === "in_progress");
  const totalUnitsProduced = completedBatches.reduce(
    (acc, b) => acc + b.unitsProduced,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "إدارة الورشة" : "Atelier de Production"}
          </span>
          <h2 className="font-serif text-2xl font-medium text-luxury-text">
            {locale === "ar" ? "دفعات التصنيع" : "Batches de Production"}
          </h2>
        </div>
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          <span>
            {locale === "ar" ? "تسجيل دفعة جديدة" : "Nouveau Batch"}
          </span>
        </Button>
      </div>

      {/* Production Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "دفعات مكتملة" : "Batches Terminés"}
          </p>
          <p className="text-2xl font-semibold text-luxury-text">{completedBatches.length}</p>
        </div>
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "قيد التصنيع" : "En Cours"}
          </p>
          <p className="text-2xl font-semibold text-indigo-700">{inProgressBatches.length}</p>
        </div>
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "إجمالي الوحدات المنتجة" : "Unités Produites"}
          </p>
          <p className="text-2xl font-semibold text-luxury-text">{totalUnitsProduced}</p>
        </div>
      </div>

      {/* In-progress batches alert */}
      {inProgressBatches.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-[4px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <p className="font-semibold text-indigo-800 text-sm">
              {locale === "ar"
                ? `${inProgressBatches.length} دفعة قيد التصنيع`
                : `${inProgressBatches.length} batch(es) en cours de macération`}
            </p>
          </div>
          {inProgressBatches.map((b) => (
            <p key={b.id} className="text-xs text-indigo-700">
              <strong>{b.batchNumber}</strong> — {b.targetProduct} ({b.size})
            </p>
          ))}
        </div>
      )}

      {/* Batch Records */}
      {batches.length === 0 ? (
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-luxury-secondary mx-auto flex items-center justify-center mb-4">
            <FlaskConical className="w-6 h-6 text-luxury-text-muted" />
          </div>
          <h3 className="font-serif text-lg font-medium text-luxury-text mb-1">
            {locale === "ar" ? "لا توجد دفعات إنتاج مسجلة" : "Aucun lot de production"}
          </h3>
          <p className="text-xs text-luxury-text-muted max-w-sm mx-auto mb-6">
            {locale === "ar"
              ? "سجل دفعة جديدة لتتبع استهلاك الزيوت ومواد التغليف آلياً."
              : "Enregistrez votre premier lot de fabrication pour déduire automatiquement les matières premières."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`bg-white border rounded-[4px] overflow-hidden ${
                batch.status === "in_progress"
                  ? "border-indigo-200"
                  : "border-luxury-border/30"
              }`}
            >
              {/* Batch Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-luxury-border/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[3px] bg-luxury-secondary flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-luxury-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-luxury-text text-sm font-mono">
                      {batch.batchNumber}
                    </p>
                    <p className="text-[10px] text-luxury-text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(batch.createdAt).toLocaleDateString(
                        locale === "ar" ? "ar-DZ" : "fr-DZ",
                        { day: "2-digit", month: "long", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {batch.status === "completed" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[3px] text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {locale === "ar" ? "مكتمل" : "Terminé"}
                    </span>
                  ) : batch.status === "in_progress" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-[3px] text-[10px] font-semibold">
                      <Clock className="w-3 h-3" />
                      {locale === "ar" ? "قيد التصنيع" : "En cours"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-[3px] text-[10px] font-semibold">
                      <XCircle className="w-3 h-3" />
                      {locale === "ar" ? "ملغى" : "Annulé"}
                    </span>
                  )}
                </div>
              </div>

              {/* Batch Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
                    {locale === "ar" ? "التركيبة والمنتج" : "Formulation & Produit"}
                  </p>
                  <p className="font-medium text-luxury-text text-sm">{batch.targetProduct}</p>
                  <p className="text-luxury-text-secondary mt-0.5 leading-relaxed">
                    {batch.formulationName}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
                    {locale === "ar" ? "الكمية والسعة" : "Volume & Unités"}
                  </p>
                  <div className="flex items-center gap-2 text-luxury-text font-medium text-sm">
                    <Package className="w-4 h-4 text-luxury-accent" />
                    <span>
                      {batch.unitsProduced} {locale === "ar" ? "قارورة" : "unités"} ({batch.size})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Production Process Guide */}
      <div className="bg-luxury-secondary/40 border border-luxury-border/30 rounded-[4px] p-5">
        <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-3">
          {locale === "ar" ? "مراحل الإنتاج في الورشة" : "Processus de Production Atelier"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            {
              step: "1",
              titleFr: "Dosage des huiles",
              titleAr: "جرعات الزيوت",
              descFr: "Peser les huiles concentrées selon la formulation",
              descAr: "وزن الزيوت المركزة حسب التركيبة",
            },
            {
              step: "2",
              titleFr: "Dilution & Mélange",
              titleAr: "التخفيف والخلط",
              descFr: "Mélanger avec l'alcool cosmétique à 96°",
              descAr: "الخلط مع الكحول التجميلي 96 درجة",
            },
            {
              step: "3",
              titleFr: "Macération",
              titleAr: "مرحلة النقع",
              descFr: "Repos 7 à 21 jours pour la fixation des notes",
              descAr: "الراحة 7 إلى 21 يومًا لتثبيت الروائح",
            },
            {
              step: "4",
              titleFr: "Embouteillage",
              titleAr: "التعبئة والتغليف",
              descFr: "Remplissage, étiquetage et mise en boîte",
              descAr: "التعبئة والتصنيف والتغليف النهائي",
            },
          ].map((step) => (
            <div key={step.step} className="flex gap-2.5 text-xs">
              <span className="w-5 h-5 rounded-full bg-luxury-accent/20 text-luxury-accent text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step.step}
              </span>
              <div>
                <p className="font-semibold text-luxury-text">
                  {locale === "ar" ? step.titleAr : step.titleFr}
                </p>
                <p className="text-luxury-text-muted leading-tight mt-0.5">
                  {locale === "ar" ? step.descAr : step.descFr}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
