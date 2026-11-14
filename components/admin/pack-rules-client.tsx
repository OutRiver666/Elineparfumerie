"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { CustomTierRule } from "@/lib/services/bundles.service";
import {
  saveCustomTierAction,
  deleteBundleAction,
  toggleBundleActiveAction,
  CustomTierInput,
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
  Tag,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Boxes,
  Percent,
  Calculator,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PackRulesClientProps {
  tiers: CustomTierRule[];
  locale: Locale;
}

const BOTTLE_SIZES = ["25ml", "30ml", "50ml", "80ml", "100ml"];

export function PackRulesClient({
  tiers: initialTiers,
  locale = "fr",
}: PackRulesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tiersList, setTiersList] = useState<CustomTierRule[]>(initialTiers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);

  // Form Fields
  const [nameFr, setNameFr] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [requiredBottlesCount, setRequiredBottlesCount] = useState<number>(3);
  const [discountPercentage, setDiscountPercentage] = useState<number>(15);
  const [allowedSizes, setAllowedSizes] = useState<string[]>(["25ml", "30ml", "50ml", "80ml", "100ml"]);
  const [isActive, setIsActive] = useState(true);

  // Delete confirm dialog
  const [deletingTier, setDeletingTier] = useState<CustomTierRule | null>(null);

  // Open Form for New Tier
  const handleOpenNew = () => {
    setEditingTierId(null);
    const nextCount = (tiersList[tiersList.length - 1]?.requiredBottlesCount || 2) + 1;
    setNameFr(`Coffret ${nextCount} Flacons Sur-Mesure`);
    setNameAr(`باقة ${nextCount} عطور مخصصة`);
    setSlug(`regle-${nextCount}-flacons`);
    setDescriptionFr(`Composez votre sélection avec ${nextCount} flacons au choix et profitez d'une remise exclusive.`);
    setDescriptionAr(`اختر ${nextCount} عطور على ذوقك واستفد من خصم تلقائي فوري.`);
    setRequiredBottlesCount(nextCount);
    setDiscountPercentage(Math.min(50, nextCount * 5));
    setAllowedSizes(["25ml", "30ml", "50ml", "80ml", "100ml"]);
    setIsActive(true);
    setIsFormOpen(true);
  };

  // Open Form for Edit Tier
  const handleOpenEdit = (tier: CustomTierRule) => {
    setEditingTierId(tier.id);
    setNameFr(tier.name.fr);
    setNameAr(tier.name.ar);
    setSlug(tier.slug);
    setDescriptionFr(tier.description.fr);
    setDescriptionAr(tier.description.ar);
    setRequiredBottlesCount(tier.requiredBottlesCount);
    setDiscountPercentage(tier.discountPercentage);
    setAllowedSizes(tier.allowedSizes || ["50ml"]);
    setIsActive(tier.isActive);
    setIsFormOpen(true);
  };

  const handleToggleSize = (size: string) => {
    if (allowedSizes.includes(size)) {
      if (allowedSizes.length <= 1) {
        toast.error("Au moins une contenance doit rester cochée");
        return;
      }
      setAllowedSizes(allowedSizes.filter((s) => s !== size));
    } else {
      setAllowedSizes([...allowedSizes, size]);
    }
  };

  // Save Tier Action
  const handleSaveTier = () => {
    if (!nameFr.trim() || !nameAr.trim()) {
      toast.error("Veuillez renseigner les noms français et arabe");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug requis");
      return;
    }
    if (requiredBottlesCount < 2) {
      toast.error("Un pack doit comporter au minimum 2 flacons");
      return;
    }
    if (discountPercentage <= 0 || discountPercentage > 90) {
      toast.error("Pourcentage de remise invalide (entre 1% et 90%)");
      return;
    }

    const payload: CustomTierInput = {
      id: editingTierId || undefined,
      name_fr: nameFr.trim(),
      name_ar: nameAr.trim(),
      slug: slug.trim(),
      description_fr: descriptionFr.trim(),
      description_ar: descriptionAr.trim(),
      required_bottles_count: requiredBottlesCount,
      discount_percentage: discountPercentage,
      allowed_sizes: allowedSizes,
      images: [],
      is_active: isActive,
    };

    startTransition(async () => {
      const res = await saveCustomTierAction(payload, locale);
      if (res.success) {
        toast.success(
          editingTierId
            ? locale === "ar"
              ? "تم تحديث قاعدة الباقة بنجاح"
              : "Règle mise à jour avec succès"
            : locale === "ar"
            ? "تمت إضافة قاعدة التخفيض بنجاح"
            : "Nouveau palier créé avec succès"
        );
        setIsFormOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur de sauvegarde");
      }
    });
  };

  // Toggle Active Tier
  const handleToggleActive = (tier: CustomTierRule) => {
    const newStatus = !tier.isActive;
    setTiersList((prev) =>
      prev.map((t) => (t.id === tier.id ? { ...t, isActive: newStatus } : t))
    );

    startTransition(async () => {
      const res = await toggleBundleActiveAction(tier.id, newStatus, locale);
      if (res.success) {
        toast.success(
          newStatus
            ? locale === "ar"
              ? `تم تفعيل ${tier.name[locale]}`
              : `${tier.name[locale]} activé`
            : locale === "ar"
            ? `تم تعطيل ${tier.name[locale]}`
            : `${tier.name[locale]} désactivé`
        );
      } else {
        toast.error(res.error || "Erreur de mise à jour");
        setTiersList(initialTiers);
      }
    });
  };

  // Delete Tier
  const handleDeleteConfirm = () => {
    if (!deletingTier) return;
    const toDeleteId = deletingTier.id;

    setTiersList((prev) => prev.filter((t) => t.id !== toDeleteId));
    setDeletingTier(null);

    startTransition(async () => {
      const res = await deleteBundleAction(toDeleteId, locale);
      if (res.success) {
        toast.success(locale === "ar" ? "تم حذف القاعدة بنجاح" : "Palier supprimé");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la suppression");
        setTiersList(initialTiers);
      }
    });
  };

  // Quick statistics
  const totalTiers = tiersList.length;
  const activeTiers = tiersList.filter((t) => t.isActive).length;
  const maxDiscount =
    totalTiers > 0 ? Math.max(...tiersList.map((t) => t.discountPercentage)) : 0;

  return (
    <div className="space-y-8">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
            {locale === "ar" ? "أتيليه التصميم المخصص" : "ATELIER SUR-MESURE"}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text flex items-center space-x-3 rtl:space-x-reverse">
            <Tag className="w-7 h-7 text-luxury-accent" />
            <span>
              {locale === "ar" ? "قواعد الباقات المخصصة" : "Règles Packs Sur-Mesure"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-luxury-text-secondary mt-1 max-w-2xl">
            {locale === "ar"
              ? "تحكم في نسب التخفيض الآلية وعدد القوارير المطلوبة عندما يقوم الزبون بتركيب باقته الخاصة في صفحة المتجر."
              : "Définissez les paliers de remises automatiques appliqués lorsque le client assemble son propre coffret personnalisé dans l'atelier."}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <Link href={`/${locale}/admin/packs`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Boxes className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-luxury-accent" />
              <span>{locale === "ar" ? "الباقات الجاهزة" : "Packs Prédéfinis"}</span>
            </Button>
          </Link>
          <Button
            variant="accent"
            size="sm"
            onClick={handleOpenNew}
            className="text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
            <span>{locale === "ar" ? "إضافة قاعدة / مستوى جديد" : "Nouveau Palier"}</span>
          </Button>
        </div>
      </div>

      {/* ─── Informational Luxury Banner ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-luxury-surface via-luxury-secondary/30 to-luxury-surface p-5 rounded-[6px] border border-luxury-border/40 flex items-start space-x-4 rtl:space-x-reverse">
        <div className="w-10 h-10 rounded-full bg-luxury-accent/15 text-luxury-accent flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif text-sm font-semibold text-luxury-text">
            {locale === "ar"
              ? "كيف تعمل قواعد الباقات المخصصة في المتجر؟"
              : "Comment fonctionne la tarification dynamique de l'atelier ?"}
          </h4>
          <p className="text-xs text-luxury-text-secondary leading-relaxed">
            {locale === "ar"
              ? "في صفحة /packs/builder، يختار الزبون عطوراً وسعات بحرية تامة. يقوم النظام تلقائياً باكتشاف عدد القوارير المختارة، وتطبيق نسبة التخفيض المقابلة للبالغ المعرف أدناه. كل قاعدة نشطة هنا تظهر للزبون كخيار فوري."
              : "Dans l'atelier /packs/builder, le client choisit librement ses parfums. Dès qu'il atteint le nombre de flacons requis par un palier actif, la remise pourcentage correspondante est calculée instantanément sur son panier et affichée avec transparence."}
          </p>
        </div>
      </div>

      {/* ─── Metric Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[6px] border border-luxury-border/40 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-semibold">
              {locale === "ar" ? "إجمالي القواعد" : "Total Paliers"}
            </p>
            <h3 className="font-serif text-2xl font-medium text-luxury-text mt-1">
              {totalTiers}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-luxury-secondary/50 flex items-center justify-center text-luxury-accent">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[6px] border border-luxury-border/40 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-semibold">
              {locale === "ar" ? "القواعد النشطة في المتجر" : "Paliers Actifs"}
            </p>
            <h3 className="font-serif text-2xl font-medium text-emerald-600 mt-1">
              {activeTiers}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[6px] border border-luxury-border/40 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-luxury-text-muted font-semibold">
              {locale === "ar" ? "أعلى نسبة خصم معروضة" : "Remise Maximale"}
            </p>
            <h3 className="font-serif text-2xl font-medium text-luxury-accent mt-1">
              {maxDiscount}%
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-luxury-accent">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Tiers List ───────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-luxury-text">
            {locale === "ar"
              ? "مستويات التخفيض المعتمدة"
              : "Paliers de Remise par Nombre de Flacons"}
          </h3>
          <Link
            href={`/${locale}/packs/builder`}
            target="_blank"
            className="text-xs text-luxury-accent hover:underline flex items-center space-x-1 rtl:space-x-reverse"
          >
            <span>{locale === "ar" ? "معاينة الأتيليه في المتجر" : "Tester dans l'atelier"}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {tiersList.length === 0 ? (
          <div className="bg-white rounded-[6px] border border-luxury-border/40 p-12 text-center space-y-4">
            <Tag className="w-8 h-8 text-luxury-text-muted mx-auto" />
            <p className="text-sm font-medium text-luxury-text">
              {locale === "ar"
                ? "لا توجد قواعد مسجلة حالياً"
                : "Aucune règle de coffret sur-mesure"}
            </p>
            <Button variant="accent" size="sm" onClick={handleOpenNew}>
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Ajouter un premier palier</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiersList.map((tier, idx) => {
              // Simulated live calculation
              const exampleFlaconPrice = 8000;
              const exampleSubtotal = exampleFlaconPrice * tier.requiredBottlesCount;
              const exampleDiscount = Math.round((exampleSubtotal * tier.discountPercentage) / 100);
              const exampleFinal = exampleSubtotal - exampleDiscount;

              return (
                <div
                  key={tier.id}
                  className={`bg-white rounded-[6px] border transition-all flex flex-col justify-between p-6 shadow-subtle ${
                    tier.isActive
                      ? "border-luxury-border/40 hover:border-luxury-accent/50 hover:shadow-card"
                      : "border-neutral-200 bg-neutral-50/50 opacity-75"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Bottle Count & Discount Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="w-7 h-7 rounded-full bg-luxury-secondary/60 text-luxury-text font-serif font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-serif text-sm font-semibold text-luxury-text">
                          {tier.requiredBottlesCount}{" "}
                          {locale === "ar" ? "قوارير" : "Flacons"}
                        </span>
                      </div>

                      <Badge className="bg-luxury-accent text-white font-bold text-xs px-2.5 py-0.5">
                        -{tier.discountPercentage}%
                      </Badge>
                    </div>

                    {/* Titles */}
                    <div>
                      <h4 className="font-serif text-base font-semibold text-luxury-text">
                        {tier.name[locale]}
                      </h4>
                      <p className="text-xs text-luxury-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {tier.description[locale]}
                      </p>
                    </div>

                    {/* Eligible Sizes */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-luxury-accent font-semibold block mb-1">
                        {locale === "ar" ? "السعات المؤهلة:" : "Contenances éligibles:"}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {tier.allowedSizes.map((sz) => (
                          <span
                            key={sz}
                            className="text-[10px] px-2 py-0.5 rounded-[3px] bg-luxury-surface border border-luxury-border/30 text-luxury-text font-medium"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Live Simulation Box */}
                    <div className="bg-luxury-surface/80 p-3 rounded-[4px] border border-luxury-border/30 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-luxury-text-muted">
                        <span>Exemple ({tier.requiredBottlesCount} × 8,000 DZD):</span>
                        <span>{formatPrice(exampleSubtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-600 font-medium">
                        <span>Remise {tier.discountPercentage}%:</span>
                        <span>-{formatPrice(exampleDiscount)}</span>
                      </div>
                      <div className="flex items-center justify-between font-serif font-semibold text-luxury-text pt-1 border-t border-luxury-border/20">
                        <span>Prix facturé au client:</span>
                        <span>{formatPrice(exampleFinal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-4 mt-4 border-t border-luxury-border/30 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(tier)}
                      disabled={isPending}
                      className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-medium px-2 py-1 rounded-[3px] transition-colors ${
                        tier.isActive
                          ? "text-emerald-700 hover:bg-emerald-50"
                          : "text-luxury-text-muted hover:bg-luxury-secondary/50"
                      }`}
                    >
                      {tier.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{locale === "ar" ? "نشط" : "Actif"}</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-luxury-text-muted" />
                          <span>{locale === "ar" ? "معطل" : "Inactif"}</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(tier)}
                        className="h-8 text-xs font-medium px-2.5"
                      >
                        <Edit className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span>{locale === "ar" ? "تعديل" : "Modifier"}</span>
                      </Button>

                      <button
                        type="button"
                        onClick={() => setDeletingTier(tier)}
                        className="p-1.5 rounded-[4px] text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Add/Edit Tier Dialog ─────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-medium text-luxury-text flex items-center space-x-2.5 rtl:space-x-reverse">
              <Tag className="w-5 h-5 text-luxury-accent" />
              <span>
                {editingTierId
                  ? locale === "ar"
                    ? "تعديل قاعدة الباقة المخصصة"
                    : "Modifier le Palier Sur-Mesure"
                  : locale === "ar"
                  ? "إضافة قاعدة تخفيض جديدة"
                  : "Nouveau Palier de Réduction"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-luxury-text-secondary">
              {locale === "ar"
                ? "حدد عدد القوارير التي تؤهل الزبون ونسبة الخصم الممنوحة."
                : "Indiquez le nombre de flacons déclenchant ce palier et le pourcentage de remise immédiate."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {/* Name FR & AR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Nom du Palier (FR) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Coffret Trio Signature"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  اسم المستوى (العربية) *
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: باقة الثلاثي المميزة"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Identifiant URL (Slug) *
                </label>
                <input
                  type="text"
                  placeholder="regle-3-flacons"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent font-mono"
                />
              </div>
            </div>

            {/* Bottles count and discount % */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-[4px] bg-luxury-surface border border-luxury-border/40">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Nombre de Flacons Requis *
                </label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={requiredBottlesCount}
                  onChange={(e) => setRequiredBottlesCount(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full px-3 py-2 text-sm font-semibold bg-white border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent text-center"
                />
                <span className="text-[10px] text-luxury-text-muted mt-1 block">
                  Ex: 2, 3, 4 flacons
                </span>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Remise Appliquée (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-sm font-semibold bg-white border border-luxury-border/40 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-luxury-accent text-center"
                  />
                  <span className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-luxury-accent">
                    %
                  </span>
                </div>
                <span className="text-[10px] text-luxury-text-muted mt-1 block">
                  Ex: 10%, 15%, 20%
                </span>
              </div>
            </div>

            {/* Allowed Sizes */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-2">
                Contenances Acceptées pour cette Offre
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

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  Description FR
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: 3 flacons avec 15% de remise..."
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-luxury-text font-semibold block mb-1">
                  الوصف بالعربية
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  placeholder="مثال: اختر 3 عطور مع خصم 15%..."
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-luxury-surface border border-luxury-border/40 rounded-[4px] resize-none text-right"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-[4px] bg-luxury-surface border border-luxury-border/40">
              <div>
                <span className="text-xs font-semibold text-luxury-text block">
                  Activer ce palier dans l'atelier
                </span>
                <span className="text-[11px] text-luxury-text-secondary">
                  Accessible aux clients pour composer leur coffret.
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
              onClick={handleSaveTier}
              disabled={isPending}
              className="font-semibold"
            >
              {isPending
                ? "Enregistrement..."
                : editingTierId
                ? "Mettre à jour"
                : "Créer le Palier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ───────────────────────────────────────── */}
      <Dialog
        open={Boolean(deletingTier)}
        onOpenChange={(open) => !open && setDeletingTier(null)}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-medium text-red-600 flex items-center space-x-2 rtl:space-x-reverse">
              <AlertCircle className="w-5 h-5" />
              <span>Supprimer ce palier ?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-luxury-text-secondary pt-2">
              Êtes-vous certain de vouloir supprimer le palier "{deletingTier?.name[locale]}" ({deletingTier?.requiredBottlesCount} flacons / -{deletingTier?.discountPercentage}%) ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex items-center justify-end space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingTier(null)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
