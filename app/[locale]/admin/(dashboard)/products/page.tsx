import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Locale, getDictionary } from "@/lib/i18n";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Package,
  Edit,
  Eye,
  EyeOff,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

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
}

async function getAllProductsForAdmin(): Promise<AdminProduct[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("products") as any)
      .select(`
        id, slug, name_fr, name_ar, gender, is_featured, is_bestseller, is_published, classification,
        fragrance_families (name_fr, name_ar),
        product_variants (id, size, sku, price_dzd, compare_at_price_dzd, stock_quantity, is_active)
      `)
      .order("created_at", { ascending: false });

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
        requiredPermissionNameFr="la consultation du catalogue et des parfums"
        requiredPermissionNameAr="دليل المنتجات والعطور"
      />
    );
  }

  const products = await getAllProductsForAdmin();

  // Summary stats
  const publishedCount = products.filter((p: any) => p.isPublished).length;
  const lowStockProducts = products.filter((p: any) =>
    p.variants.some((v: any) => v.stock < 10)
  );
  const totalVariants = products.reduce((acc: number, p: any) => acc + (p.variants?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "إدارة المنتجات" : "Gestion du Catalogue"}
          </span>
          <h2 className="font-serif text-2xl font-medium text-luxury-text">
            {locale === "ar" ? "كتالوج العطور" : "Catalogue Parfums"}
          </h2>
        </div>
        {authInfo.permissions.products_manage && (
          <Link href={`/${locale}/admin/products/new`}>
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>{locale === "ar" ? "إضافة عطر جديد" : "Nouveau Parfum"}</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "إجمالي المنتجات" : "Total Parfums"}
          </p>
          <p className="text-2xl font-semibold text-luxury-text">{products.length}</p>
        </div>
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "إجمالي الأحجام" : "Variantes Actives"}
          </p>
          <p className="text-2xl font-semibold text-luxury-text">{totalVariants}</p>
        </div>
        <div className="bg-white border border-luxury-border/30 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-luxury-text-muted mb-1">
            {locale === "ar" ? "الأكثر مبيعاً" : "Bestsellers"}
          </p>
          <p className="text-2xl font-semibold text-luxury-text">
            {products.filter((p) => p.isBestseller).length}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-[4px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-amber-700 mb-1">
            {locale === "ar" ? "مخزون منخفض" : "Stock Faible"}
          </p>
          <p className="text-2xl font-semibold text-amber-800">{lowStockProducts.length}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[4px] p-4 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              {locale === "ar" ? "تحذير: مخزون منخفض" : "Alerte Stock Faible"}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {locale === "ar"
                ? `${lowStockProducts.length} منتج بحاجة إلى تجديد المخزون`
                : `${lowStockProducts.length} produit(s) nécessitent un réapprovisionnement`}
              : {lowStockProducts.map((p) => p.name.fr).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-luxury-border/30 rounded-[4px] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-luxury-border/30">
          <h3 className="font-medium text-luxury-text text-sm">
            {locale === "ar" ? "قائمة المنتجات" : "Liste des Produits"}
          </h3>
          <div className="flex items-center gap-2 bg-luxury-secondary/50 rounded-[3px] px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-luxury-text-muted" />
            <span className="text-xs text-luxury-text-muted">
              {locale === "ar" ? "بحث..." : "Rechercher..."}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-luxury-secondary/60 text-luxury-text-muted uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "العطر" : "Parfum"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "التصنيف" : "Famille"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "الأحجام والأسعار" : "Variantes & Prix"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "المخزون الكلي" : "Stock Total"}
                </th>
                <th className="py-3 px-4 text-left rtl:text-right">
                  {locale === "ar" ? "الحالة" : "Statut"}
                </th>
                <th className="py-3 px-4 text-center">
                  {locale === "ar" ? "إجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/20 text-luxury-text">
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
                    className="hover:bg-luxury-secondary/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[3px] bg-luxury-secondary/80 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-luxury-text-muted" />
                        </div>
                        <div>
                          <p className="font-semibold text-luxury-text">
                            {locale === "ar" ? product.name.ar : product.name.fr}
                          </p>
                          <p className="text-[10px] text-luxury-text-muted font-mono">
                            {product.slug}
                          </p>
                          <div className="flex gap-1 mt-0.5">
                            {product.isBestseller && (
                              <span className="inline-block px-1.5 py-0 bg-amber-100 text-amber-800 text-[9px] font-semibold rounded-[2px]">
                                BESTSELLER
                              </span>
                            )}
                            {product.classification && (
                              <span className="inline-block px-1.5 py-0 bg-luxury-accent/10 text-luxury-accent text-[9px] font-semibold rounded-[2px]">
                                {product.classification}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-luxury-text-secondary">
                        {locale === "ar" ? product.family.ar : product.family.fr}
                      </p>
                      <p className="text-[10px] text-luxury-text-muted capitalize">
                        {product.gender === "men"
                          ? locale === "ar"
                            ? "رجالي"
                            : "Homme"
                          : product.gender === "women"
                          ? locale === "ar"
                            ? "نسائي"
                            : "Femme"
                          : locale === "ar"
                          ? "مختلط"
                          : "Mixte"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.variants.map((v: AdminProductVariant) => (
                          <span
                            key={v.id}
                            className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-medium border ${
                              v.stock < 10
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-luxury-border/40 bg-luxury-secondary/50 text-luxury-text"
                            }`}
                          >
                            {v.size}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-luxury-text-muted mt-1">
                        {formatPrice(minPrice, locale)}
                        {minPrice !== maxPrice && ` — ${formatPrice(maxPrice, locale)}`}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          isLowStock ? "text-red-600" : "text-luxury-text"
                        }`}
                      >
                        {totalStock}
                        {locale === "ar" ? " وحدة" : " unités"}
                      </span>
                      {isLowStock && (
                        <p className="text-[10px] text-red-500 mt-0.5">
                          {locale === "ar" ? "⚠ مخزون منخفض" : "⚠ Stock faible"}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-700 font-medium">
                          {locale === "ar" ? "منشور" : "Publié"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/${locale}/shop/${product.slug}`}>
                          <button className="p-1.5 rounded-[3px] hover:bg-luxury-secondary text-luxury-text-muted hover:text-luxury-accent transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <Link href={`/${locale}/admin/products/${product.id}/edit`}>
                          <button className="p-1.5 rounded-[3px] hover:bg-luxury-secondary text-luxury-text-muted hover:text-luxury-accent transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-luxury-border/30 flex items-center justify-between">
          <p className="text-xs text-luxury-text-muted">
            {locale === "ar"
              ? `إجمالي ${products.length} منتج مسجل`
              : `${products.length} parfum(s) au total dans le catalogue`}
          </p>
          <div className="flex items-center gap-2 text-xs text-luxury-text-muted">
            <TrendingUp className="w-3.5 h-3.5 text-luxury-accent" />
            <span>
              {locale === "ar"
                ? "جميع المنتجات منشورة على الموقع"
                : "Tous les produits sont visibles sur la boutique"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
