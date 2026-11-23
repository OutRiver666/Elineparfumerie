import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Locale, getDictionary } from "@/lib/i18n";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Package,
  Edit,
  Eye,
  EyeOff,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Layers,
  Flame,
  CheckCircle2,
  Smartphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  params: Promise<{ locale: string }>;
}

interface AdminProductVariant {
  id: string;
  size: string;
  priceDZD: number;
  compareAtPriceDZD?: number;
  stock: number;
  sku: string;
}

interface AdminProduct {
  id: string;
  slug: string;
  name: { fr: string; ar: string };
  gender: string;
  family: { fr: string; ar: string };
  classification: string | null;
  variants: AdminProductVariant[];
  isFeatured: boolean;
  isBestseller: boolean;
  isPublished: boolean;
  landingPageMode: "standard" | "landing_only" | "both";
  landingImagesCount: number;
}

async function getAllProductsForAdmin(): Promise<AdminProduct[]> {
  try {
    const admin = createAdminClient();
    const baseSelect = `
      id, slug, name_fr, name_ar, gender, is_featured, is_bestseller, is_published, classification,
      fragrance_families (name_fr, name_ar),
      product_variants (id, size, sku, price_dzd, compare_at_price_dzd, stock_quantity, is_active)
    `;
    const extendedSelect = `
      ${baseSelect},
      landing_page_mode, landing_page_images
    `;

    let { data, error } = await (admin.from("products") as any)
      .select(extendedSelect)
      .order("created_at", { ascending: false });

    if (error && (error.code === "42703" || error.message?.includes("landing_page"))) {
      const fallback = await (admin.from("products") as any)
        .select(baseSelect)
        .order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error || !data) return [];

    return (data as any[]).map((item: any) => ({
      id: item.id,
      slug: item.slug,
      name: { fr: item.name_fr, ar: item.name_ar },
      gender: item.gender,
      family: {
        fr: item.fragrance_families?.name_fr || "—",
        ar: item.fragrance_families?.name_ar || "—",
      },
      classification: item.classification === "standard" ? null : item.classification,
      variants: (item.product_variants || []).map((v: any) => ({
        id: v.id,
        size: v.size,
        priceDZD: Number(v.price_dzd),
        compareAtPriceDZD: v.compare_at_price_dzd ? Number(v.compare_at_price_dzd) : undefined,
        stock: Number(v.stock_quantity),
        sku: v.sku,
      })),
      isFeatured: Boolean(item.is_featured),
      isBestseller: Boolean(item.is_bestseller),
      isPublished: Boolean(item.is_published),
      landingPageMode:
        item.landing_page_mode === "landing_only" || item.landing_page_mode === "both"
          ? item.landing_page_mode
          : "standard",
      landingImagesCount: Array.isArray(item.landing_page_images)
        ? item.landing_page_images.length
        : 0,
    }));
  } catch {
    return [];
  }
}

export default async function AdminProductsPage({
  params,
}: AdminProductsPageProps) {
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

  if (!authInfo.permissions.products_view && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="le catalogue de parfums et gestion des prix"
        requiredPermissionNameAr="كتالوج العطور والأسعار"
      />
    );
  }

  const canManageProducts = Boolean(authInfo.permissions.products_manage || authInfo.isOwner);
  const products = await getAllProductsForAdmin();
  const lowStockProducts = products.filter((p: AdminProduct) =>
    p.variants.some((v: AdminProductVariant) => v.stock < 10)
  );
  const totalVariants = products.reduce((acc: number, p: any) => acc + (p.variants?.length || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-7 font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <Package className="w-3 h-3 text-amber-600" />
              {isAr ? "دليل العطور والتسعير" : "Catalogue & Tarification"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "كتالوج العطور والمنتجات" : "Catalogue des Parfums"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "إدارة الأسعار، الأحجام، المخزون، ونشر العطور على المتجر."
              : "Gestion des fiches produits, déclinaisons de contenances et niveaux de stock."}
          </p>
        </div>

        {authInfo.permissions.products_manage && (
          <Link href={`/${locale}/admin/products/new`}>
            <Button size="sm" className="gap-2 rounded-lg bg-zinc-900 text-white hover:bg-black shadow-xs font-semibold">
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة عطر جديد" : "Nouveau Parfum"}</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-xs font-medium">
            <span>{isAr ? "إجمالي العطور" : "Total Parfums"}</span>
            <Package className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 tracking-tight">{products.length}</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-xs font-medium">
            <span>{isAr ? "الأحجام الفعالة" : "Variantes Actives"}</span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 tracking-tight">{totalVariants}</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-xs font-medium">
            <span>{isAr ? "الأكثر طلباً" : "Bestsellers"}</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 tracking-tight">
            {products.filter((p) => p.isBestseller).length}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5 text-amber-800 text-xs font-medium">
            <span>{isAr ? "مخزون حرج" : "Stock Faible"}</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 tracking-tight">{lowStockProducts.length}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">
              {isAr ? "تنبيه: عطور بمخزون منخفض" : "Alerte Réapprovisionnement"}
            </p>
            <p className="text-amber-700 mt-0.5">
              {isAr
                ? `${lowStockProducts.length} عطر بحاجة لتعبئة في الورشة`
                : `${lowStockProducts.length} référence(s) avec un stock inférieur à 10 unités`}
              : {lowStockProducts.map((p) => p.name.fr).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Products Table Card */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-zinc-100">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900">
              {isAr ? "قائمة المنتجات والأسعار" : "Catalogue & Variantes Éline"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              {isAr
                ? `إجمالي ${products.length} عطر مسجل ونشط على المتجر`
                : `${products.length} référence(s) olfactive(s) au total`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-zinc-100/70 border border-zinc-200/70 rounded-lg px-3 py-1.5 w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400">
              {isAr ? "بحث بالاسم أو الكود..." : "Rechercher un parfum..."}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile Product Cards (< md) */}
          <div className="md:hidden divide-y divide-zinc-100">
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (acc: number, v: AdminProductVariant) => acc + v.stock,
                0
              );
              const isLowStock = product.variants.some((v: AdminProductVariant) => v.stock < 10);
              const minPrice =
                product.variants.length > 0
                  ? Math.min(...product.variants.map((v: AdminProductVariant) => v.priceDZD))
                  : 0;
              const maxPrice =
                product.variants.length > 0
                  ? Math.max(...product.variants.map((v: AdminProductVariant) => v.priceDZD))
                  : 0;

              return (
                <div key={product.id} className="p-4 space-y-3 hover:bg-zinc-50/70 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 text-sm truncate">
                        {isAr ? product.name.ar : product.name.fr}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        /{product.slug} • {isAr ? product.family.ar : product.family.fr}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/${locale}/shop/${product.slug}`} target="_blank">
                        <button
                          title={isAr ? "معاينة على المتجر" : "Aperçu en boutique"}
                          className="p-2 rounded-lg bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <Link href={`/${locale}/admin/products/${product.id}/edit`}>
                        <button
                          title={isAr ? "تعديل المنتج" : "Modifier"}
                          className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-black transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      {canManageProducts && (
                        <DeleteProductButton
                          productId={product.id}
                          productNameFr={product.name.fr}
                          productNameAr={product.name.ar}
                          productSlug={product.slug}
                          variantsCount={product.variants.length}
                          locale={locale}
                          size="mobile"
                        />
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {product.isBestseller && (
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 text-[9px] font-bold rounded-md">
                        BESTSELLER
                      </span>
                    )}
                    {product.classification && (
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-zinc-100 text-zinc-700 text-[9px] font-bold rounded-md">
                        {product.classification}
                      </span>
                    )}
                    {product.landingPageMode === "landing_only" && product.landingImagesCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200/70 text-[9px] font-bold rounded-md">
                        <Smartphone className="w-2.5 h-2.5" />
                        {isAr ? "صفحة هبوط" : "LANDING PAGE"}
                      </span>
                    )}
                    {product.landingPageMode === "both" && product.landingImagesCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200/70 text-[9px] font-bold rounded-md">
                        <Layers className="w-2.5 h-2.5" />
                        {isAr ? "هبوط + تفاصيل" : "LANDING + FICHE"}
                      </span>
                    )}
                  </div>

                  {/* Sizes, Price & Stock */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map((v: AdminProductVariant) => (
                        <span
                          key={v.id}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                            v.stock < 10
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-zinc-200/80 bg-zinc-50 text-zinc-700"
                          }`}
                        >
                          {v.size}
                        </span>
                      ))}
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-zinc-900">
                        {formatPrice(minPrice, locale)}
                        {minPrice !== maxPrice && ` — ${formatPrice(maxPrice, locale)}`}
                      </p>
                      <p className={`text-[10px] font-semibold ${isLowStock ? "text-rose-600" : "text-zinc-500"}`}>
                        {totalStock} {isAr ? "وحدة" : "unités"}
                        {isLowStock ? (isAr ? " • ⚠ منخفض" : " • ⚠ Faible") : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-zinc-50/80 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">{isAr ? "العطر" : "Parfum"}</th>
                  <th className="py-3 px-4">{isAr ? "العائلة والعطار" : "Famille"}</th>
                  <th className="py-3 px-4">{isAr ? "الأحجام والأسعار" : "Contenances & Prix"}</th>
                  <th className="py-3 px-4">{isAr ? "المخزون" : "Stock"}</th>
                  <th className="py-3 px-4">{isAr ? "الحالة" : "Visibilité"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                {products.map((product) => {
                  const totalStock = product.variants.reduce(
                    (acc: number, v: AdminProductVariant) => acc + v.stock,
                    0
                  );
                  const isLowStock = product.variants.some((v: AdminProductVariant) => v.stock < 10);
                  const minPrice =
                    product.variants.length > 0
                      ? Math.min(...product.variants.map((v: AdminProductVariant) => v.priceDZD))
                      : 0;
                  const maxPrice =
                    product.variants.length > 0
                      ? Math.max(...product.variants.map((v: AdminProductVariant) => v.priceDZD))
                      : 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-zinc-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center shrink-0 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-amber-200 transition-colors">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 text-xs">
                              {isAr ? product.name.ar : product.name.fr}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              {product.slug}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {product.isBestseller && (
                                <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 text-[9px] font-bold rounded-md">
                                  BESTSELLER
                                </span>
                              )}
                              {product.classification && (
                                <span className="inline-flex items-center px-1.5 py-0.5 bg-zinc-100 text-zinc-700 text-[9px] font-bold rounded-md">
                                  {product.classification}
                                </span>
                              )}
                              {product.landingPageMode === "landing_only" && product.landingImagesCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200/70 text-[9px] font-bold rounded-md">
                                  <Smartphone className="w-2.5 h-2.5" />
                                  {isAr ? "صفحة هبوط" : "LANDING PAGE"}
                                </span>
                              )}
                              {product.landingPageMode === "both" && product.landingImagesCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200/70 text-[9px] font-bold rounded-md">
                                  <Layers className="w-2.5 h-2.5" />
                                  {isAr ? "هبوط + تفاصيل" : "LANDING + FICHE"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-700">
                          {isAr ? product.family.ar : product.family.fr}
                        </p>
                        <p className="text-[10px] text-zinc-400 capitalize">
                          {product.gender === "men"
                            ? isAr ? "رجالي" : "Pour Homme"
                            : product.gender === "women"
                            ? isAr ? "نسائي" : "Pour Femme"
                            : isAr ? "مختلط" : "Mixte"}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((v: AdminProductVariant) => (
                            <span
                              key={v.id}
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                                v.stock < 10
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-zinc-200/80 bg-zinc-50 text-zinc-700"
                              }`}
                            >
                              {v.size}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] font-bold text-zinc-900 mt-1">
                          {formatPrice(minPrice, locale)}
                          {minPrice !== maxPrice && ` — ${formatPrice(maxPrice, locale)}`}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            isLowStock ? "text-rose-600" : "text-zinc-900"
                          }`}
                        >
                          {totalStock} {isAr ? "وحدة" : "unités"}
                        </span>
                        {isLowStock && (
                          <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                            {isAr ? "⚠ مخزون منخفض" : "⚠ Stock faible"}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isAr ? "منشور" : "Publié"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link href={`/${locale}/shop/${product.slug}`} target="_blank">
                            <button
                              title={isAr ? "معاينة على المتجر" : "Aperçu en boutique"}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <Link href={`/${locale}/admin/products/${product.id}/edit`}>
                            <button
                              title={isAr ? "تعديل المنتج" : "Modifier"}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          {canManageProducts && (
                            <DeleteProductButton
                              productId={product.id}
                              productNameFr={product.name.fr}
                              productNameAr={product.name.ar}
                              productSlug={product.slug}
                              variantsCount={product.variants.length}
                              locale={locale}
                              size="desktop"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
