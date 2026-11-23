"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { BundleItem, ProductForBundleSelection } from "@/lib/services/bundles.service";
import {
  savePredefinedBundleAction,
  toggleBundleActiveAction,
  deleteBundleAction,
  PredefinedBundleInput,
} from "@/lib/actions/bundles";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Boxes,
  Plus,
  Search,
  Check,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Percent,
  Coins,
  ArrowRight,
  PackageCheck,
  ImageIcon,
  X,
  Layers,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PacksManagerClientProps {
  bundles: BundleItem[];
  availableProducts: ProductForBundleSelection[];
  locale: Locale;
}

const LUXURY_IMAGE_PRESETS = [
  {
    name: "Coffret Prestige Noir & Or",
    url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Duo Flacons Coucher de Soleil",
    url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Trio Flacons Ambre & Cuir",
    url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Coffret Velours Royal",
    url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Collection Signature Flacons Verre",
    url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1000",
  },
];

const BOTTLE_SIZES = ["25ml", "30ml", "50ml", "80ml", "100ml"];

export function PacksManagerClient({
  bundles: initialBundles,
  availableProducts,
  locale = "fr",
}: PacksManagerClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [bundlesList, setBundlesList] = useState<BundleItem[]>(initialBundles);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Edit / Create Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);

  // Form Fields
  const [nameFr, setNameFr] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [fixedPriceDZD, setFixedPriceDZD] = useState<number>(10000);
  const [discountPercentage, setDiscountPercentage] = useState<number | undefined>(15);
  const [allowedSizes, setAllowedSizes] = useState<string[]>(["50ml"]);
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Pack items composition
  interface SelectedItem {
    productId: string;
    variantId: string;
    productNameFr: string;
    productNameAr: string;
    size: string;
    priceDZD: number;
    quantity: number;
  }
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Item Picker Dropdown temporary selection
  const [pickerProductId, setPickerProductId] = useState<string>(
    availableProducts[0]?.id || ""
  );
  const [pickerVariantId, setPickerVariantId] = useState<string>(
    availableProducts[0]?.variants[0]?.id || ""
  );
  const [pickerQuantity, setPickerQuantity] = useState<number>(1);

  // Delete Confirmation State
  const [deletingBundle, setDeletingBundle] = useState<BundleItem | null>(null);

  // Calculate sum of separate items
  const separateItemsTotalDZD = selectedItems.reduce(
    (sum, item) => sum + item.priceDZD * item.quantity,
    0
  );
  const calculatedSavingsDZD = Math.max(0, separateItemsTotalDZD - fixedPriceDZD);
  const calculatedDiscountPct =
    separateItemsTotalDZD > 0
      ? Math.round(((separateItemsTotalDZD - fixedPriceDZD) / separateItemsTotalDZD) * 100)
      : 0;

  // Filtered Bundles
  const filteredBundles = bundlesList.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      b.name.fr.toLowerCase().includes(q) ||
      b.name.ar.includes(q) ||
      b.slug.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? b.isActive
        : !b.isActive;

    return matchQuery && matchStatus;
  });

  // Open Form for New Pack
  const handleOpenNew = () => {
    setEditingBundleId(null);
    setNameFr("");
    setNameAr("");
    setSlug("");
    setDescriptionFr("");
    setDescriptionAr("");
    setFixedPriceDZD(14000);
    setDiscountPercentage(15);
    setAllowedSizes(["50ml"]);
    setImages([LUXURY_IMAGE_PRESETS[0].url]);
    setIsActive(true);
    setSelectedItems([]);
    setIsFormOpen(true);
  };

  // Open Form for Existing Pack
  const handleOpenEdit = (bundle: BundleItem) => {
    setEditingBundleId(bundle.id);
    setNameFr(bundle.name.fr);
    setNameAr(bundle.name.ar);
    setSlug(bundle.slug);
    setDescriptionFr(bundle.description.fr);
    setDescriptionAr(bundle.description.ar);
    setFixedPriceDZD(bundle.priceDZD);
    setDiscountPercentage(bundle.discountPercentage || 0);
    setAllowedSizes(bundle.allowedSizes || ["50ml"]);
    setImages(bundle.images || []);
    setIsActive(bundle.isActive);

    const items: SelectedItem[] = (bundle.items || []).map((bi) => ({
      productId: bi.productId,
      variantId: bi.variantId,
      productNameFr: bi.productNameFr,
      productNameAr: bi.productNameAr,
      size: bi.size,
      priceDZD: bi.priceDZD,
      quantity: bi.quantity,
    }));
    setSelectedItems(items);
    setIsFormOpen(true);
  };

  // Auto-generate slug from French Name
  const handleNameFrChange = (val: string) => {
    setNameFr(val);
    if (!editingBundleId) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Add Item to Composition
  const handleAddItemToPack = () => {
    const product = availableProducts.find((p) => p.id === pickerProductId);
    if (!product) return;
    const variant = product.variants.find((v) => v.id === pickerVariantId);
    if (!variant) return;

    // Check if variant is already added
    const existingIndex = selectedItems.findIndex((i) => i.variantId === variant.id);
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += pickerQuantity;
      setSelectedItems(updated);
      toast.success(
        locale === "ar"
          ? `تم تحديث كمية ${product.nameAr}`
          : `Quantité mise à jour pour ${product.nameFr}`
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.id,
          variantId: variant.id,
          productNameFr: product.nameFr,
          productNameAr: product.nameAr,
          size: variant.size,
          priceDZD: variant.priceDZD,
          quantity: pickerQuantity,
        },
      ]);
      toast.success(
        locale === "ar"
          ? `تمت إضافة ${product.nameAr} إلى تشكيلة الباقة`
          : `${product.nameFr} (${variant.size}) ajouté au coffret`
      );
    }
  };

  const handleRemoveItem = (variantId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.variantId !== variantId));
  };

  // Image helpers
  const handleAddCustomImage = () => {
    if (!customImageUrl.trim()) return;
    if (images.includes(customImageUrl.trim())) {
      toast.error(locale === "ar" ? "الصورة مضافة بالفعل" : "Cette photo est déjà présente");
      return;
    }
    setImages([...images, customImageUrl.trim()]);
    setCustomImageUrl("");
    toast.success(locale === "ar" ? "تمت إضافة الصورة" : "Photo ajoutée");
  };

  const handleToggleSize = (size: string) => {
    if (allowedSizes.includes(size)) {
      if (allowedSizes.length <= 1) {
        toast.error(
          locale === "ar"
            ? "يجب الإبقاء على حجم واحد على الأقل"
            : "Conservez au moins une taille autorisée"
        );
        return;
      }
      setAllowedSizes(allowedSizes.filter((s) => s !== size));
    } else {
      setAllowedSizes([...allowedSizes, size]);
    }
  };

  // Save Predefined Bundle
  const handleSaveBundle = async () => {
    if (!nameFr.trim() || !nameAr.trim()) {
      toast.error(locale === "ar" ? "يرجى ملء اسم الباقة بالفرنسية والعربية" : "Veuillez renseigner les noms français et arabe");
      return;
    }
    if (!slug.trim()) {
      toast.error(locale === "ar" ? "يرجى تحديد معرف الرابط (Slug)" : "Veuillez indiquer un slug URL valide");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error(
        locale === "ar"
          ? "يجب إضافة عطر واحد على الأقل داخل الباقة"
          : "Veuillez ajouter au moins un parfum dans la composition du pack"
      );
      return;
    }
    if (fixedPriceDZD <= 0) {
      toast.error(locale === "ar" ? "يرجى تحديد سعر صالح للباقة" : "Veuillez indiquer un prix valide");
      return;
    }

    const payload: PredefinedBundleInput = {
      id: editingBundleId || undefined,
      name_fr: nameFr.trim(),
      name_ar: nameAr.trim(),
      slug: slug.trim(),
      description_fr: descriptionFr.trim() || `Coffret prestige exclusif Éline Parfumerie contenant ${selectedItems.length} créations.`,
      description_ar: descriptionAr.trim() || `تشكيلة فاخرة حصرية من إيلين للعطور تضم ${selectedItems.length} ابتكارات.`,
      fixed_price_dzd: fixedPriceDZD,
      discount_percentage: discountPercentage || null,
      required_bottles_count: selectedItems.reduce((acc, i) => acc + i.quantity, 0),
      allowed_sizes: allowedSizes,
      images: images.length > 0 ? images : [LUXURY_IMAGE_PRESETS[0].url],
      is_active: isActive,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    startTransition(async () => {
      const result = await savePredefinedBundleAction(payload, locale);
      if (result.success) {
        toast.success(
          editingBundleId
            ? locale === "ar"
              ? "تم تحديث الباقة بنجاح"
              : "Pack mis à jour avec succès"
            : locale === "ar"
            ? "تم إنشاء الباقة بنجاح"
            : "Nouveau pack créé avec succès"
        );
        setIsFormOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la sauvegarde du pack");
      }
    });
  };

  // Toggle Active Status
  const handleToggleActive = (bundle: BundleItem) => {
    const newStatus = !bundle.isActive;
    // Optimistic update
    setBundlesList((prev) =>
      prev.map((b) => (b.id === bundle.id ? { ...b, isActive: newStatus } : b))
    );

    startTransition(async () => {
      const res = await toggleBundleActiveAction(bundle.id, newStatus, locale);
      if (res.success) {
        toast.success(
          newStatus
            ? locale === "ar"
              ? `تم تفعيل ${bundle.name[locale]}`
              : `${bundle.name[locale]} est maintenant actif en boutique`
            : locale === "ar"
            ? `تم تعطيل ${bundle.name[locale]}`
            : `${bundle.name[locale]} a été désactivé`
        );
      } else {
        toast.error(res.error || "Erreur lors de la mise à jour");
        // Revert on error
        setBundlesList(initialBundles);
      }
    });
  };

  // Delete Bundle
  const handleDeleteConfirm = () => {
    if (!deletingBundle) return;
    const toDeleteId = deletingBundle.id;

    // Optimistic remove
    setBundlesList((prev) => prev.filter((b) => b.id !== toDeleteId));
    setDeletingBundle(null);

    startTransition(async () => {
      const res = await deleteBundleAction(toDeleteId, locale);
      if (res.success) {
        toast.success(
          locale === "ar" ? "تم حذف الباقة بنجاح" : "Pack supprimé avec succès"
        );
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la suppression");
        setBundlesList(initialBundles);
      }
    });
  };

  // Statistics
  const totalPacks = bundlesList.length;
  const activePacks = bundlesList.filter((b) => b.isActive).length;
  const avgPrice =
    totalPacks > 0
      ? Math.round(bundlesList.reduce((sum, b) => sum + b.priceDZD, 0) / totalPacks)
      : 0;
  const avgDiscount =
    totalPacks > 0
      ? Math.round(
          bundlesList.reduce((sum, b) => sum + (b.discountPercentage || 0), 0) / totalPacks
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* ─── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "كتالوج الباقات والعروض" : "CATALOGUE DES OFFRES"}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text flex items-center space-x-3 rtl:space-x-reverse">
            <Boxes className="w-7 h-7 text-luxury-accent" />
            <span>{locale === "ar" ? "الباقات الجاهزة" : "Packs Prédéfinis"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-luxury-text-secondary mt-1">
            {locale === "ar"
              ? "إدارة وتخصيص الباقات الجاهزة للشحن مع تشكيلات العطور المحددة وأسعار التوفير."
              : "Créez et gérez vos coffrets prêts à offrir avec sélection de parfums prédéfinie et tarifs remisés."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/${locale}/admin/packs/rules`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-luxury-accent" />
              <span>{locale === "ar" ? "قواعد الباقات المخصصة" : "Règles Sur-Mesure"}</span>
            </Button>
          </Link>
          <Button
            variant="accent"
            size="sm"
            onClick={handleOpenNew}
            className="text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            <span>{locale === "ar" ? "إنشاء باقة جديدة" : "Nouveau Pack"}</span>
          </Button>
        </div>
      </div>

      {/* ─── Metric Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-5 rounded-[6px] border border-luxury-border/40 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-semibold">
              {locale === "ar" ? "إجمالي الباقات" : "Total Coffrets"}
            </p>
            <h3 className="font-serif text-2xl font-medium text-luxury-text mt-1">
              {totalPacks}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-luxury-secondary/50 flex items-center justify-center text-luxury-accent">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[6px] border border-luxury-border/40 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-semibold">
              {locale === "ar" ? "الباقات النشطة" : "Packs Actifs"}
            </p>
            <h3 className="font-serif text-2xl font-medium text-emerald-600 mt-1">
              {activePacks}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[6px] border border-luxury-border/40 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-semibold">
              {locale === "ar" ? "متوسط السعر" : "Prix Moyen Pack"}
            </p>
            <h3 className="font-serif text-2xl font-medium text-luxury-text mt-1">
              {formatPrice(avgPrice)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-luxury-secondary/50 flex items-center justify-center text-luxury-accent">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[6px] border border-luxury-border/40 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-semibold">
              {locale === "ar" ? "متوسط التخفيض" : "Remise Moyenne"}
            </p>
            <h3 className="font-serif text-2xl font-medium text-luxury-accent mt-1">
              {avgDiscount}%
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-luxury-accent">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Controls: Search, Filters & View Toggle ──────────────────────────── */}
      <div className="bg-white p-4 rounded-[6px] border border-luxury-border/40 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-luxury-text-muted" />
          <input
            type="text"
            placeholder={
              locale === "ar"
                ? "بحث عن باقة بالاسم أو الرمز..."
                : "Rechercher par nom, fragrance ou slug..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
          {/* Status Filter */}
          <div className="flex rounded-[4px] border border-luxury-border/40 p-0.5 bg-luxury-surface text-xs shrink-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-[3px] font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-white text-luxury-text shadow-sm"
                  : "text-luxury-text-secondary hover:text-luxury-text"
              }`}
            >
              {locale === "ar" ? "الكل" : "Tous"} ({bundlesList.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-[3px] font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-luxury-text-secondary hover:text-luxury-text"
              }`}
            >
              {locale === "ar" ? "نشط" : "Actifs"} ({activePacks})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1 rounded-[3px] font-medium transition-colors ${
                statusFilter === "inactive"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-luxury-text-secondary hover:text-luxury-text"
              }`}
            >
              {locale === "ar" ? "معطل" : "Inactifs"} ({totalPacks - activePacks})
            </button>
          </div>

          {/* View toggle */}
          <div className="hidden sm:flex rounded-[4px] border border-luxury-border/40 p-0.5 bg-luxury-surface text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded-[3px] font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-luxury-text shadow-sm"
                  : "text-luxury-text-muted"
              }`}
              title="Vue Grille"
            >
              <Boxes className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-[3px] font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white text-luxury-text shadow-sm"
                  : "text-luxury-text-muted"
              }`}
              title="Vue Tableau"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bundles Display ──────────────────────────────────────────────────── */}
      {filteredBundles.length === 0 ? (
        <div className="bg-white rounded-[6px] border border-luxury-border/40 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-luxury-secondary/40 text-luxury-text-muted flex items-center justify-center mx-auto">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-luxury-text">
              {locale === "ar" ? "لم يتم العثور على أي باقة" : "Aucun pack trouvé"}
            </h3>
            <p className="text-xs text-luxury-text-secondary max-w-sm mx-auto mt-1">
              {locale === "ar"
                ? "جرب تعديل كلمات البحث أو قم بإنشاء أول باقة جاهزة في متجرك."
                : "Modifiez vos filtres de recherche ou commencez par créer votre premier coffret cadeau."}
            </p>
          </div>
          <Button variant="accent" size="sm" onClick={handleOpenNew}>
            <Plus className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            <span>{locale === "ar" ? "إنشاء باقة جديدة" : "Créer un Pack"}</span>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* ─── Grid View ─────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBundles.map((bundle) => {
            const coverImage = bundle.images[0] || LUXURY_IMAGE_PRESETS[0].url;
            return (
              <div
                key={bundle.id}
                className="group bg-white rounded-[6px] border border-luxury-border/40 shadow-subtle hover:shadow-card transition-all flex flex-col overflow-hidden"
              >
                {/* Visual Cover */}
                <div className="relative aspect-[16/10] bg-luxury-surface overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={bundle.name.fr}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <Badge
                      className={`text-[10px] font-semibold border-0 ${
                        bundle.isActive
                          ? "bg-emerald-500/90 text-white backdrop-blur-sm"
                          : "bg-amber-500/90 text-white backdrop-blur-sm"
                      }`}
                    >
                      {bundle.isActive
                        ? locale === "ar"
                          ? "نشط في المتجر"
                          : "Actif en boutique"
                        : locale === "ar"
                        ? "معطل / مسودة"
                        : "Désactivé"}
                    </Badge>

                    {bundle.discountPercentage ? (
                      <Badge className="bg-luxury-accent text-white font-bold text-[11px] shadow-sm">
                        -{bundle.discountPercentage}%
                      </Badge>
                    ) : null}
                  </div>

                  {/* Bottom Image Overlay: Price */}
                  <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-luxury-secondary font-medium block">
                        {locale === "ar" ? "سعر الباقة" : "Tarif Pack"}
                      </span>
                      <span className="font-serif text-xl font-medium tracking-wide">
                        {formatPrice(bundle.priceDZD)}
                      </span>
                    </div>

                    <div className="text-[11px] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-[3px] border border-white/10">
                      {bundle.requiredBottlesCount}{" "}
                      {locale === "ar" ? "عطور" : "Flacons"}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-base font-semibold text-luxury-text line-clamp-1">
                        {bundle.name[locale]}
                      </h3>
                    </div>
                    <p className="text-[11px] text-luxury-text-secondary line-clamp-2 leading-relaxed">
                      {bundle.description[locale]}
                    </p>

                    {/* Included Fragrances Chips */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-luxury-accent font-semibold block mb-1.5">
                        {locale === "ar" ? "العطور المتضمنة:" : "Composition du coffret:"}
                      </span>
                      {bundle.items && bundle.items.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {bundle.items.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-0.5 rounded-[3px] bg-luxury-secondary/40 text-[11px] text-luxury-text font-medium border border-luxury-border/30"
                            >
                              <span>
                                {locale === "ar" ? item.productNameAr : item.productNameFr}
                              </span>
                              <span className="text-luxury-text-muted text-[10px]">
                                ({item.size})
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-luxury-accent font-bold">
                                  ×{item.quantity}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-luxury-text-muted italic">
                          {locale === "ar"
                            ? "لم يتم تعيين عطور بعد"
                            : "Aucun parfum lié"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-luxury-border/30 flex items-center justify-between">
                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(bundle)}
                      disabled={isPending}
                      className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-medium px-2 py-1 rounded-[3px] transition-colors ${
                        bundle.isActive
                          ? "text-emerald-700 hover:bg-emerald-50"
                          : "text-luxury-text-muted hover:bg-luxury-secondary/50"
                      }`}
                      title={bundle.isActive ? "Désactiver" : "Activer"}
                    >
                      {bundle.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{locale === "ar" ? "نشط" : "Visible"}</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-luxury-text-muted" />
                          <span>{locale === "ar" ? "معطل" : "Masqué"}</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <Link
                        href={`/${locale}/packs`}
                        target="_blank"
                        className="p-1.5 rounded-[4px] text-luxury-text-muted hover:text-luxury-text hover:bg-luxury-secondary/60 transition-colors"
                        title={locale === "ar" ? "معاينة في المتجر" : "Voir sur la boutique"}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(bundle)}
                        className="h-8 text-xs font-medium px-2.5"
                      >
                        <Edit className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span>{locale === "ar" ? "تعديل" : "Modifier"}</span>
                      </Button>

                      <button
                        type="button"
                        onClick={() => setDeletingBundle(bundle)}
                        className="p-1.5 rounded-[4px] text-red-500 hover:bg-red-50 transition-colors"
                        title={locale === "ar" ? "حذف" : "Supprimer"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Table View ────────────────────────────────────────────────────── */
        <div className="bg-white rounded-[6px] border border-luxury-border/40 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-luxury-surface border-b border-luxury-border/40 text-luxury-text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {locale === "ar" ? "الباقة" : "Coffret"}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {locale === "ar" ? "العطور المتضمنة" : "Composition"}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {locale === "ar" ? "السعر" : "Tarif Fixe"}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {locale === "ar" ? "التخفيض" : "Remise"}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {locale === "ar" ? "الحالة" : "Statut"}
                  </th>
                  <th className="px-4 py-3 font-semibold text-right rtl:text-left">
                    {locale === "ar" ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/20">
                {filteredBundles.map((bundle) => {
                  const coverImage = bundle.images[0] || LUXURY_IMAGE_PRESETS[0].url;
                  return (
                    <tr
                      key={bundle.id}
                      className="hover:bg-luxury-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="relative w-12 h-12 rounded-[4px] overflow-hidden flex-shrink-0 bg-luxury-surface border border-luxury-border/30">
                            <Image
                              src={coverImage}
                              alt={bundle.name.fr}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-luxury-text text-xs line-clamp-1">
                              {bundle.name[locale]}
                            </p>
                            <span className="text-[10px] text-luxury-text-muted font-mono">
                              /{bundle.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {bundle.items && bundle.items.length > 0 ? (
                            bundle.items.map((it) => (
                              <span
                                key={it.id}
                                className="px-1.5 py-0.5 rounded-[2px] bg-luxury-secondary/50 text-[10px] text-luxury-text font-medium"
                              >
                                {it.productNameFr} ({it.size}) ×{it.quantity}
                              </span>
                            ))
                          ) : (
                            <span className="text-luxury-text-muted text-[10px] italic">
                              Aucun parfum
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-serif font-semibold text-luxury-text">
                        {formatPrice(bundle.priceDZD)}
                      </td>
                      <td className="px-4 py-3">
                        {bundle.discountPercentage ? (
                          <Badge className="bg-luxury-accent/15 text-luxury-accent border-0 text-[10px] font-bold">
                            -{bundle.discountPercentage}%
                          </Badge>
                        ) : (
                          <span className="text-luxury-text-muted text-[10px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(bundle)}
                          className={`inline-flex items-center space-x-1 rtl:space-x-reverse text-[11px] font-semibold px-2 py-0.5 rounded-[3px] ${
                            bundle.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              bundle.isActive ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span>
                            {bundle.isActive
                              ? locale === "ar"
                                ? "نشط"
                                : "Actif"
                              : locale === "ar"
                              ? "معطل"
                              : "Inactif"}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right rtl:text-left">
                        <div className="flex items-center justify-end space-x-1 rtl:space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(bundle)}
                            className="h-7 w-7 p-0"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5 text-luxury-text-secondary" />
                          </Button>
                          <button
                            type="button"
                            onClick={() => setDeletingBundle(bundle)}
                            className="h-7 w-7 flex items-center justify-center rounded-[4px] text-red-500 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Pack Creator & Editor Dialog Modal ───────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-medium text-luxury-text flex items-center space-x-2.5 rtl:space-x-reverse">
              <Boxes className="w-5 h-5 text-luxury-accent" />
              <span>
                {editingBundleId
                  ? locale === "ar"
                    ? "تعديل تفاصيل الباقة"
                    : "Modifier le Pack Prédéfini"
                  : locale === "ar"
                  ? "إنشاء باقة جاهزة جديدة"
                  : "Créer un Nouveau Pack Prédéfini"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-luxury-text-secondary">
              {locale === "ar"
                ? "حدد اسم الباقة، العطور المتضمنة فيها، السعر الإجمالي، والتخفيض المطبق للزبائن."
                : "Configurez les informations du coffret, les parfums inclus avec leurs formats, et le tarif préférentiel."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-3">
            {/* Section 1: Names & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Nom en Français *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Coffret Prestige Duo"
                  value={nameFr}
                  onChange={(e) => handleNameFrChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  الاسم بالعربية *
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: باقة الثنائي الملكي"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Slug URL (Identifiant Unique) *
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-luxury-text-muted bg-luxury-secondary/40 px-3 py-2 rounded-l-[4px] border border-r-0 border-luxury-border/40">
                    /packs/
                  </span>
                  <input
                    type="text"
                    placeholder="pack-duo-prestige"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-r-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Description (FR)
                </label>
                <textarea
                  rows={2}
                  placeholder="Description luxueuse du coffret..."
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  الوصف بالعربية
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  placeholder="وصف راقي للباقة ومكوناتها..."
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent resize-none text-right"
                />
              </div>
            </div>

            {/* Section 3: Allowed Bottle Sizes */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-2">
                Contenances Autorisées dans ce Pack
              </label>
              <div className="flex flex-wrap gap-2">
                {BOTTLE_SIZES.map((size) => {
                  const selected = allowedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleToggleSize(size)}
                      className={`px-3 py-1.5 rounded-[4px] text-xs font-medium border transition-colors flex items-center space-x-1.5 rtl:space-x-reverse ${
                        selected
                          ? "bg-luxury-text text-white border-luxury-text"
                          : "bg-luxury-surface text-luxury-text border-luxury-border/40 hover:bg-luxury-secondary/40"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-luxury-accent" />}
                      <span>{size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Pack Composition (Parfums inclus) */}
            <div className="bg-luxury-secondary/20 p-4 rounded-[6px] border border-luxury-border/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-luxury-text flex items-center space-x-2 rtl:space-x-reverse">
                    <Boxes className="w-4 h-4 text-luxury-accent" />
                    <span>Composition du Coffret (Parfums & Formats)</span>
                  </h4>
                  <p className="text-[11px] text-luxury-text-secondary">
                    Sélectionnez les fragrances incluses dans ce pack prédéfini.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-[3px] bg-luxury-accent/15 text-luxury-accent">
                  {selectedItems.length} parfum(s) inclus
                </span>
              </div>

              {/* Picker Form */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-[4px] border border-luxury-border/30">
                <div className="sm:col-span-5">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-text-muted font-semibold block mb-1">
                    Sélectionner un Parfum
                  </label>
                  <select
                    value={pickerProductId}
                    onChange={(e) => {
                      setPickerProductId(e.target.value);
                      const prod = availableProducts.find((p) => p.id === e.target.value);
                      if (prod && prod.variants.length > 0) {
                        setPickerVariantId(prod.variants[0].id);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                  >
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameFr} ({p.nameAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-text-muted font-semibold block mb-1">
                    Taille / Variante
                  </label>
                  <select
                    value={pickerVariantId}
                    onChange={(e) => setPickerVariantId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                  >
                    {availableProducts
                      .find((p) => p.id === pickerProductId)
                      ?.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.size} — {formatPrice(v.priceDZD)} (Stock: {v.stock})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-text-muted font-semibold block mb-1">
                    Qté
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={pickerQuantity}
                    onChange={(e) => setPickerQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2 py-1.5 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] text-center"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    onClick={handleAddItemToPack}
                    className="w-full text-xs h-8"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Ajouter</span>
                  </Button>
                </div>
              </div>

              {/* Items List Table */}
              {selectedItems.length > 0 && (
                <div className="bg-white rounded-[4px] border border-luxury-border/30 overflow-x-auto">
                  <table className="w-full min-w-[460px] text-xs">
                    <thead className="bg-luxury-surface text-luxury-text-muted text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left rtl:text-right">Parfum</th>
                        <th className="px-3 py-2 text-left rtl:text-right">Format</th>
                        <th className="px-3 py-2 text-left rtl:text-right">Prix Unitaire</th>
                        <th className="px-3 py-2 text-center">Quantité</th>
                        <th className="px-3 py-2 text-right rtl:text-left">Sous-Total</th>
                        <th className="px-2 py-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-luxury-border/20">
                      {selectedItems.map((item) => (
                        <tr key={item.variantId} className="hover:bg-luxury-secondary/10">
                          <td className="px-3 py-2 font-medium text-luxury-text">
                            {item.productNameFr}
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] text-luxury-text-secondary">
                            {item.size}
                          </td>
                          <td className="px-3 py-2 font-medium text-luxury-text">
                            {formatPrice(item.priceDZD)}
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-luxury-accent">
                            ×{item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right rtl:text-left font-serif font-medium text-luxury-text">
                            {formatPrice(item.priceDZD * item.quantity)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.variantId)}
                              className="text-red-500 hover:text-red-700 p-1 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 5: Pricing & Savings Advisor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[6px] bg-luxury-surface border border-luxury-border/40">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Prix Fixe du Pack (DZD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={fixedPriceDZD}
                    onChange={(e) => setFixedPriceDZD(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm font-serif font-semibold bg-white border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                  />
                  <span className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-luxury-text-muted">
                    DZD
                  </span>
                </div>
                <p className="text-[10px] text-luxury-text-muted mt-1">
                  Prix facturé au client pour l'ensemble du coffret.
                </p>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Remise Affichée (%)
                </label>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercentage ?? ""}
                      onChange={(e) =>
                        setDiscountPercentage(
                          e.target.value === "" ? undefined : parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 text-sm font-semibold bg-white border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                    />
                    <span className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-luxury-text-muted">
                      %
                    </span>
                  </div>
                  {calculatedDiscountPct > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDiscountPercentage(calculatedDiscountPct)}
                      className="text-xs h-9"
                      title="Utiliser le pourcentage calculé"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-luxury-accent" />
                      <span>{calculatedDiscountPct}% Auto</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Live Savings Calculation Summary */}
              {selectedItems.length > 0 && (
                <div className="sm:col-span-2 pt-2 border-t border-luxury-border/30 flex flex-wrap items-center justify-between text-xs text-luxury-text-secondary">
                  <span>
                    Total au détail:{" "}
                    <strong className="text-luxury-text">
                      {formatPrice(separateItemsTotalDZD)}
                    </strong>
                  </span>
                  <span>
                    Économie offerte:{" "}
                    <strong className="text-emerald-600">
                      {formatPrice(calculatedSavingsDZD)}
                    </strong>
                  </span>
                  <span>
                    Remise effective:{" "}
                    <strong className="text-luxury-accent">
                      {calculatedDiscountPct}%
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Section 6: Image Gallery & Presets */}
            <div className="space-y-3">
              <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block">
                Photos du Pack (Galerie & Présentoirs)
              </label>

              {/* 1-Click Luxury Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-luxury-accent font-semibold block">
                  Presets photographiques studio Éline (1-Clic):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {LUXURY_IMAGE_PRESETS.map((preset) => {
                    const isAdded = images.includes(preset.url);
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            setImages(images.filter((img) => img !== preset.url));
                          } else {
                            setImages([...images, preset.url]);
                          }
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-[3px] border transition-colors flex items-center space-x-1.5 rtl:space-x-reverse ${
                          isAdded
                            ? "bg-luxury-accent/15 text-luxury-accent border-luxury-accent font-semibold"
                            : "bg-white text-luxury-text border-luxury-border/40 hover:bg-luxury-secondary/40"
                        }`}
                      >
                        {isAdded ? (
                          <Check className="w-3 h-3 text-luxury-accent" />
                        ) : (
                          <Plus className="w-3 h-3 text-luxury-text-muted" />
                        )}
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image URL Input */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomImage}
                  className="text-xs h-8"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>Ajouter URL</span>
                </Button>
              </div>

              {/* Selected Images Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                  {images.map((imgUrl, index) => (
                    <div
                      key={imgUrl}
                      className="relative aspect-square rounded-[4px] overflow-hidden border border-luxury-border/40 group"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 rtl:left-auto rtl:right-1 bg-luxury-accent text-white text-[9px] px-1 rounded font-semibold">
                          Couverture
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 rtl:right-auto rtl:left-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        title="Supprimer la photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 7: Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-[4px] bg-luxury-surface border border-luxury-border/40">
              <div>
                <span className="text-xs font-semibold text-luxury-text block">
                  Visibilité sur la boutique
                </span>
                <span className="text-[11px] text-luxury-text-secondary">
                  Si activé, ce pack sera immédiatement visible et achetable sur la page /packs.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? "bg-emerald-600" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="mt-6 flex items-center justify-end space-x-2 rtl:space-x-reverse border-t border-luxury-border/30 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={handleSaveBundle}
              disabled={isPending}
              className="font-semibold"
            >
              {isPending ? (
                <span>Enregistrement...</span>
              ) : (
                <span>{editingBundleId ? "Mettre à jour" : "Créer le Pack"}</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ───────────────────────────────────────── */}
      <Dialog
        open={Boolean(deletingBundle)}
        onOpenChange={(open) => !open && setDeletingBundle(null)}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-medium text-red-600 flex items-center space-x-2 rtl:space-x-reverse">
              <AlertCircle className="w-5 h-5" />
              <span>
                {locale === "ar" ? "تأكيد حذف الباقة" : "Supprimer ce coffret ?"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-luxury-text-secondary pt-2">
              {locale === "ar"
                ? `هل أنت متأكد من رغبتك في حذف "${deletingBundle?.name[locale]}" نهائياً؟ لن يتمكن الزبائن من طلبه بعد ذلك.`
                : `Êtes-vous certain de vouloir supprimer définitivement le pack "${deletingBundle?.name[locale]}" ? Cette action est irréversible.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex items-center justify-end space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingBundle(null)}
              disabled={isPending}
            >
              {locale === "ar" ? "إلغاء" : "Annuler"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending
                ? locale === "ar"
                  ? "جاري الحذف..."
                  : "Suppression..."
                : locale === "ar"
                ? "تأكيد الحذف"
                : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
