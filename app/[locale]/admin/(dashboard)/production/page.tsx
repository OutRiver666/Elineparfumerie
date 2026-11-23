import React from "react";
import { Locale } from "@/lib/i18n";
import { getProductionBatches } from "@/lib/services/production.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FlaskConical,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Calendar,
  Layers,
} from "lucide-react";

interface AdminProductionPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminProductionPage({
  params,
}: AdminProductionPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const isAr = locale === "ar";

  const batches = await getProductionBatches();

  const completedBatches = batches.filter((b) => b.status === "completed");
  const inProgressBatches = batches.filter((b) => b.status === "in_progress");
  const totalUnitsProduced = completedBatches.reduce(
    (acc, b) => acc + b.unitsProduced,
    0
  );

  return (
    <div className="space-y-6 sm:space-y-7 font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <FlaskConical className="w-3 h-3 text-amber-600" />
              {isAr ? "إدارة الورشة والتصنيع" : "Atelier & Macération"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "دفعات التصنيع والتركيب" : "Lots de Fabrication & Batches"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "متابعة دفعات خلط الزيوت، فترات التعتيق وتعبئة القوارير."
              : "Suivi des formulations, traçabilité des lots et décompte automatique des matières."}
          </p>
        </div>

        <Button size="sm" className="w-full sm:w-auto gap-2 rounded-lg bg-zinc-900 text-white hover:bg-black font-semibold shadow-xs">
          <Plus className="w-4 h-4" />
          <span>{isAr ? "تسجيل دفعة جديدة" : "Nouveau Batch"}</span>
        </Button>
      </div>

      {/* Production Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-xs font-medium">
            <span>{isAr ? "دفعات مكتملة" : "Batches Terminés"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 tracking-tight">{completedBatches.length}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isAr ? "جاهزة للبيع" : "conditionnés"}
          </p>
        </div>

        <div className="rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 via-white to-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-indigo-800 text-xs font-semibold">
            <span>{isAr ? "قيد التعتيق / التصنيع" : "En Macération"}</span>
            <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-indigo-900 tracking-tight">{inProgressBatches.length}</p>
          <p className="text-[11px] text-indigo-700 mt-0.5">
            {isAr ? "في المعمل حالياً" : "en cours d'élaboration"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-xs font-medium">
            <span>{isAr ? "إجمالي الوحدات المنتجة" : "Unités Produites"}</span>
            <Package className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 tracking-tight">{totalUnitsProduced}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isAr ? "قارورة عطر" : "flacons au total"}
          </p>
        </div>
      </div>

      {/* In-progress batches alert */}
      {inProgressBatches.length > 0 && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <p className="font-bold text-indigo-900 text-xs">
              {isAr
                ? `${inProgressBatches.length} دفعة قيد التصنيع والمتابعة`
                : `${inProgressBatches.length} lot(s) actuellement en cours de macération`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {inProgressBatches.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-indigo-200 text-xs text-indigo-900 font-medium shadow-2xs"
              >
                <span className="font-mono text-[10px] font-bold text-indigo-700">{b.batchNumber}</span>
                <span>— {b.targetProduct} ({b.size})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Batch Records */}
      {batches.length === 0 ? (
        <Card className="border-zinc-200/80 p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 mx-auto flex items-center justify-center mb-3 text-zinc-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">
            {isAr ? "لا توجد دفعات إنتاج مسجلة" : "Aucun lot de fabrication"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            {isAr
              ? "سجل دفعة جديدة لتتبع استهلاك الزيوت ومواد التغليف آلياً."
              : "Enregistrez votre premier lot de fabrication pour déduire automatiquement les matières premières."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {batches.map((batch) => (
            <Card
              key={batch.id}
              className={`border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-zinc-300 ${
                batch.status === "in_progress" ? "border-indigo-200" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-700">
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-xs font-mono">
                      {batch.batchNumber}
                    </p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      {new Date(batch.createdAt).toLocaleDateString(
                        isAr ? "ar-DZ" : "fr-DZ",
                        { day: "2-digit", month: "long", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {batch.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {isAr ? "مكتمل" : "Terminé"}
                    </span>
                  ) : batch.status === "in_progress" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-full text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-indigo-600 animate-pulse" />
                      {isAr ? "قيد التعتيق" : "En cours"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[10px] font-bold">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      {isAr ? "ملغى" : "Annulé"}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 text-xs">
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    {isAr ? "التركيبة والمنتج المستهدف" : "Formulation & Produit"}
                  </p>
                  <p className="font-bold text-zinc-900 text-xs">{batch.targetProduct}</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">
                    {batch.formulationName}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    {isAr ? "الكمية والسعة" : "Volume & Unités"}
                  </p>
                  <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {batch.unitsProduced} {isAr ? "قارورة" : "unités"} ({batch.size})
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
