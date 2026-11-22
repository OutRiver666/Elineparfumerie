import React from "react";
import { Locale } from "@/lib/i18n";
import { getRawMaterials, getPackagingMaterials } from "@/lib/services/inventory.service";
import { formatPrice } from "@/lib/utils";
import { AlertCircle, Package, Droplets, Box, Tag, Boxes, ShieldAlert, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface AdminInventoryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminInventoryPage({
  params,
}: AdminInventoryPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const isAr = locale === "ar";

  const rawMaterials = await getRawMaterials();
  const packagingMaterials = await getPackagingMaterials();

  const lowStockRaw = rawMaterials.filter((m) => m.isLowStock);
  const lowStockPackaging = packagingMaterials.filter((m) => m.isLowStock);
  const totalLowStock = lowStockRaw.length + lowStockPackaging.length;

  // Estimate total raw material value
  const rawMaterialValue = rawMaterials.reduce(
    (acc, m) => acc + m.stockQuantity * m.costPerUnitDZD,
    0
  );
  const packagingValue = packagingMaterials.reduce(
    (acc, m) => acc + m.stockQuantity * m.costPerUnitDZD,
    0
  );

  return (
    <div className="space-y-6 sm:space-y-7 font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <Boxes className="w-3 h-3 text-amber-600" />
              {isAr ? "مستودع وورشة التصنيع" : "Atelier & Matières Premières"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "إدارة المخزون والتوريد" : "Gestion des Stocks & Packaging"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "متابعة كميات الزيوت العطرية، الكحول، القوارير والتغليف لضمان استمرارية الإنتاج."
              : "Suivi en temps réel des huiles précieuses, alcool cosmétique, flacons et coffrets."}
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-xs font-medium">
            <span>{isAr ? "مواد خام" : "Matières Premières"}</span>
            <Droplets className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 tracking-tight">{rawMaterials.length}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isAr ? "مركّب مسجل" : "références actives"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-xs font-medium">
            <span>{isAr ? "مواد التعبئة" : "Emballages & Flacons"}</span>
            <Box className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 tracking-tight">{packagingMaterials.length}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isAr ? "عنصر تغليف" : "références packaging"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-xs font-medium">
            <span>{isAr ? "قيمة المخزون" : "Valeur du Stock"}</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            {formatPrice(rawMaterialValue + packagingValue, locale)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isAr ? "تقدير إجمالي للمواد" : "Matières + packaging"}
          </p>
        </div>

        <div
          className={`rounded-xl p-4 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
            totalLowStock > 0
              ? "bg-rose-50/50 border-rose-200"
              : "bg-emerald-50/50 border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
            <span className={totalLowStock > 0 ? "text-rose-800" : "text-emerald-800"}>
              {isAr ? "تنبيهات المخزون" : "Alertes Stock"}
            </span>
            <AlertCircle
              className={`w-4 h-4 ${
                totalLowStock > 0 ? "text-rose-600 animate-pulse" : "text-emerald-600"
              }`}
            />
          </div>
          <p
            className={`text-2xl font-bold tracking-tight ${
              totalLowStock > 0 ? "text-rose-900" : "text-emerald-900"
            }`}
          >
            {totalLowStock}
          </p>
          <p
            className={`text-[11px] font-semibold mt-0.5 ${
              totalLowStock > 0 ? "text-rose-700" : "text-emerald-700"
            }`}
          >
            {totalLowStock > 0
              ? isAr ? "مادة تحت الحد الأدنى" : "sous seuil critique"
              : isAr ? "جميع المستويات كافية" : "Niveaux optimaux"}
          </p>
        </div>
      </div>

      {/* Critical Stock Alert Box */}
      {totalLowStock > 0 && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <p className="font-bold text-rose-900 text-xs">
              {isAr ? "تنبيهات مخزون عاجلة للتوريد" : "Alertes Stock Critiques à Réapprovisionner"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...lowStockRaw, ...lowStockPackaging].map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-rose-900 text-xs rounded-lg border border-rose-200 shadow-2xs font-medium"
              >
                <span className="font-mono text-[10px] text-rose-600 font-bold">{item.sku}</span>
                <span>
                  — {isAr ? item.nameAr : item.nameFr}:{" "}
                  <strong>
                    {item.stockQuantity}
                    {"unit" in item ? ` ${item.unit}` : " pcs"}
                  </strong>{" "}
                  (min: {item.minThreshold})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw Materials Table Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="flex flex-row items-center gap-2.5 p-5 pb-4 border-b border-zinc-100">
          <Droplets className="w-4 h-4 text-amber-600" />
          <div>
            <CardTitle className="text-base font-bold text-zinc-900">
              {isAr ? "مواد الخام والزيوت العطرية" : "Matières Premières & Huiles de Parfumerie"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              {isAr ? "مخزون الزيوت النقية، الكحول والمثبتات" : "Stocks d'extraits, bases et solvants de formulation"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-zinc-50/80 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">{isAr ? "المادة" : "Matière"}</th>
                  <th className="py-3 px-4">{isAr ? "الفئة" : "Catégorie"}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{isAr ? "الكمية" : "Quantité"}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{isAr ? "الحد الأدنى" : "Seuil Min"}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{isAr ? "تكلفة الوحدة" : "Coût/Unité"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "الحالة" : "État"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                {rawMaterials.map((material) => (
                  <tr
                    key={material.id}
                    className={`hover:bg-zinc-50/70 transition-colors ${
                      material.isLowStock ? "bg-rose-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[10px] font-bold">
                      {material.sku}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-zinc-900">
                        {isAr ? material.nameAr : material.nameFr}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200/60 rounded-md text-zinc-700 text-[11px] font-semibold capitalize">
                        {material.category === "oil"
                          ? isAr ? "زيت عطري" : "Huile"
                          : material.category === "alcohol"
                          ? isAr ? "كحول" : "Alcool"
                          : isAr ? "إضافات" : "Additif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right rtl:text-left font-bold">
                      <span className={material.isLowStock ? "text-rose-600" : "text-zinc-900"}>
                        {material.stockQuantity.toLocaleString()} {material.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right rtl:text-left text-zinc-400">
                      {material.minThreshold.toLocaleString()} {material.unit}
                    </td>
                    <td className="py-3 px-4 text-right rtl:text-left text-zinc-700 font-semibold">
                      {formatPrice(material.costPerUnitDZD, locale)}/{material.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {material.isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
                          ⚠ {isAr ? "منخفض" : "Critique"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                          ✓ {isAr ? "كافٍ" : "Optimal"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Packaging Table Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="flex flex-row items-center gap-2.5 p-5 pb-4 border-b border-zinc-100">
          <Box className="w-4 h-4 text-amber-600" />
          <div>
            <CardTitle className="text-base font-bold text-zinc-900">
              {isAr ? "مواد التعبئة والتغليف الفاخر" : "Emballages & Conditionnement de Luxe"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              {isAr ? "قوارير زجاجية، مضخات ذهبية، علب هدايا وملصقات" : "Flacons en verre lourd, pompes spray, coffrets et étiquettes"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-zinc-50/80 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">{isAr ? "المادة" : "Matériau"}</th>
                  <th className="py-3 px-4">{isAr ? "النوع" : "Type"}</th>
                  <th className="py-3 px-4">{isAr ? "الحجم" : "Taille"}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{isAr ? "الكمية" : "Quantité"}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{isAr ? "تكلفة الوحدة" : "Coût/Pièce"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "الحالة" : "État"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                {packagingMaterials.map((material) => (
                  <tr
                    key={material.id}
                    className={`hover:bg-zinc-50/70 transition-colors ${
                      material.isLowStock ? "bg-rose-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[10px] font-bold">
                      {material.sku}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-zinc-900">
                        {isAr ? material.nameAr : material.nameFr}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200/60 rounded-md text-zinc-700 text-[11px] font-semibold capitalize">
                        {material.materialType === "bottle"
                          ? isAr ? "قارورة" : "Flacon"
                          : material.materialType === "box"
                          ? isAr ? "علبة" : "Coffret"
                          : material.materialType === "pump"
                          ? isAr ? "مضخة" : "Pompe"
                          : material.materialType === "label"
                          ? isAr ? "ملصق" : "Étiquette"
                          : material.materialType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-semibold">
                      {material.bottleSize || "—"}
                    </td>
                    <td className="py-3 px-4 text-right rtl:text-left font-bold">
                      <span className={material.isLowStock ? "text-rose-600" : "text-zinc-900"}>
                        {material.stockQuantity.toLocaleString()} pcs
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right rtl:text-left text-zinc-700 font-semibold">
                      {formatPrice(material.costPerUnitDZD, locale)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {material.isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
                          ⚠ {isAr ? "منخفض" : "Critique"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                          ✓ {isAr ? "كافٍ" : "Optimal"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
