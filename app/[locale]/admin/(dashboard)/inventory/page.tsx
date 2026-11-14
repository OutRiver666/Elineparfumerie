import React from "react";
import { Locale } from "@/lib/i18n";
import { getRawMaterials, getPackagingMaterials } from "@/lib/services/inventory.service";
import { formatPrice } from "@/lib/utils";
import { AlertCircle, Package, Droplets, Box, Tag } from "lucide-react";

interface AdminInventoryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminInventoryPage({
  params,
}: AdminInventoryPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "مستودع المصنع" : "Atelier & Entrepôt"}
          </span>
          <h2 className="font-serif text-2xl font-medium text-luxury-text">
            {locale === "ar" ? "إدارة المخزون" : "Gestion des Stocks"}
          </h2>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "مواد الخام" : "Matières Premières"}
          </p>
          <p className="text-2xl font-semibold text-luxury-text">{rawMaterials.length}</p>
          <p className="text-[10px] text-luxury-text-muted">
            {locale === "ar" ? "نوع مسجل" : "références"}
          </p>
        </div>
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "مواد التغليف" : "Emballages"}
          </p>
          <p className="text-2xl font-semibold text-luxury-text">{packagingMaterials.length}</p>
          <p className="text-[10px] text-luxury-text-muted">
            {locale === "ar" ? "نوع مسجل" : "références"}
          </p>
        </div>
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "قيمة المخزون" : "Valeur du Stock"}
          </p>
          <p className="text-lg font-semibold text-luxury-text">
            {formatPrice(rawMaterialValue + packagingValue, locale)}
          </p>
        </div>
        <div
          className={`rounded-[4px] p-4 border ${
            totalLowStock > 0
              ? "bg-red-50 border-red-200"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <p
            className={`text-[10px] uppercase tracking-widest mb-1 ${
              totalLowStock > 0 ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {locale === "ar" ? "تحذيرات المخزون" : "Alertes Stock"}
          </p>
          <p
            className={`text-2xl font-semibold ${
              totalLowStock > 0 ? "text-red-800" : "text-emerald-800"
            }`}
          >
            {totalLowStock}
          </p>
          <p className="text-[10px] text-red-600">
            {totalLowStock > 0
              ? locale === "ar"
                ? "مادة تحت الحد الأدنى"
                : "sous seuil critique"
              : locale === "ar"
              ? "كل شيء على ما يرام"
              : "Niveaux OK"}
          </p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {totalLowStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[4px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="font-semibold text-red-800 text-sm">
              {locale === "ar" ? "تنبيهات مخزون عاجلة" : "Alertes Stock Critiques"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...lowStockRaw, ...lowStockPackaging].map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 text-xs rounded-[3px] border border-red-200"
              >
                <span className="font-mono text-[10px]">{item.sku}</span>
                <span>
                  —{" "}
                  {locale === "ar" ? item.nameAr : item.nameFr}:{" "}
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

      {/* Raw Materials Table */}
      <div className="bg-white border border-luxury-border/30 rounded-[4px] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-luxury-border/20">
          <Droplets className="w-4 h-4 text-luxury-accent" />
          <h3 className="font-medium text-luxury-text text-sm">
            {locale === "ar" ? "مواد الخام والزيوت العطرية" : "Matières Premières & Huiles"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-luxury-secondary/60 text-luxury-text-muted uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 text-left rtl:text-right">SKU</th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "المادة" : "Matière"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "الفئة" : "Catégorie"}
                </th>
                <th className="py-3 px-4 text-right">
                  {locale === "ar" ? "الكمية" : "Quantité"}
                </th>
                <th className="py-3 px-4 text-right">
                  {locale === "ar" ? "الحد الأدنى" : "Seuil Min"}
                </th>
                <th className="py-3 px-4 text-right">
                  {locale === "ar" ? "تكلفة الوحدة" : "Coût/Unité"}
                </th>
                <th className="py-3 px-4 text-center">
                  {locale === "ar" ? "الحالة" : "État"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/20">
              {rawMaterials.map((material) => (
                <tr
                  key={material.id}
                  className={`hover:bg-luxury-secondary/30 transition-colors ${
                    material.isLowStock ? "bg-red-50/40" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono text-luxury-text-muted text-[10px]">
                    {material.sku}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-luxury-text">
                      {locale === "ar" ? material.nameAr : material.nameFr}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-luxury-secondary rounded-[2px] text-luxury-text-secondary capitalize">
                      {material.category === "oil"
                        ? locale === "ar" ? "زيت" : "Huile"
                        : material.category === "alcohol"
                        ? locale === "ar" ? "كحول" : "Alcool"
                        : locale === "ar" ? "إضافات" : "Additif"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span className={material.isLowStock ? "text-red-600" : "text-luxury-text"}>
                      {material.stockQuantity.toLocaleString()} {material.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-luxury-text-muted">
                    {material.minThreshold.toLocaleString()} {material.unit}
                  </td>
                  <td className="py-3 px-4 text-right text-luxury-text-secondary">
                    {formatPrice(material.costPerUnitDZD, locale)}/{material.unit}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {material.isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded-[3px] border border-red-200">
                        ⚠ {locale === "ar" ? "منخفض" : "Critique"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-[3px] border border-emerald-200">
                        ✓ {locale === "ar" ? "كافٍ" : "OK"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Packaging Table */}
      <div className="bg-white border border-luxury-border/30 rounded-[4px] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-luxury-border/20">
          <Box className="w-4 h-4 text-luxury-accent" />
          <h3 className="font-medium text-luxury-text text-sm">
            {locale === "ar" ? "مواد التعبئة والتغليف" : "Emballages & Conditionnement"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-luxury-secondary/60 text-luxury-text-muted uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 text-left rtl:text-right">SKU</th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "المادة" : "Matériau"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "النوع" : "Type"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "الحجم" : "Taille"}
                </th>
                <th className="py-3 px-4 text-right">
                  {locale === "ar" ? "الكمية" : "Quantité"}
                </th>
                <th className="py-3 px-4 text-right">
                  {locale === "ar" ? "تكلفة الوحدة" : "Coût/Pièce"}
                </th>
                <th className="py-3 px-4 text-center">
                  {locale === "ar" ? "الحالة" : "État"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/20">
              {packagingMaterials.map((material) => (
                <tr
                  key={material.id}
                  className={`hover:bg-luxury-secondary/30 transition-colors ${
                    material.isLowStock ? "bg-red-50/40" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono text-luxury-text-muted text-[10px]">
                    {material.sku}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-luxury-text">
                      {locale === "ar" ? material.nameAr : material.nameFr}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-luxury-secondary rounded-[2px] text-luxury-text-secondary capitalize">
                      {material.materialType === "bottle"
                        ? locale === "ar" ? "قارورة" : "Flacon"
                        : material.materialType === "box"
                        ? locale === "ar" ? "علبة" : "Coffret"
                        : material.materialType === "pump"
                        ? locale === "ar" ? "مضخة" : "Pompe"
                        : material.materialType === "label"
                        ? locale === "ar" ? "ملصق" : "Étiquette"
                        : material.materialType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-luxury-text-secondary">
                    {material.bottleSize || "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span className={material.isLowStock ? "text-red-600" : "text-luxury-text"}>
                      {material.stockQuantity.toLocaleString()} pcs
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-luxury-text-secondary">
                    {formatPrice(material.costPerUnitDZD, locale)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {material.isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded-[3px] border border-red-200">
                        ⚠ {locale === "ar" ? "منخفض" : "Critique"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-[3px] border border-emerald-200">
                        ✓ {locale === "ar" ? "كافٍ" : "OK"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-luxury-border/20 flex items-center justify-between">
          <p className="text-xs text-luxury-text-muted">
            {locale === "ar"
              ? `قيمة التغليف الإجمالية: ${formatPrice(packagingValue, locale)}`
              : `Valeur totale emballages: ${formatPrice(packagingValue, locale)}`}
          </p>
          <p className="text-xs text-luxury-text-muted">
            {locale === "ar"
              ? `قيمة المواد الخام الإجمالية: ${formatPrice(rawMaterialValue, locale)}`
              : `Valeur matières premières: ${formatPrice(rawMaterialValue, locale)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
