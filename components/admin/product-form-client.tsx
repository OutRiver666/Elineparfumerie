"use client";

import React, { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Star,
  ExternalLink,
  Sparkles,
  Check,
  AlertCircle,
  Smartphone,
  LayoutTemplate,
  Layers,
  UploadCloud,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProductLandingImageAction } from "@/lib/actions/products";
import type { LandingPageMode } from "@/types/perfume";

const PRESET_PLACEHOLDERS = [
  {
    titleFr: "Flacon Noir & Or (Oud)",
    titleAr: "قارورة سوداء وذهبية",
    url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
  },
  {
    titleFr: "Cristal Ambré (Boisé)",
    titleAr: "قارورة كريستال عنبري",
    url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000",
  },
  {
    titleFr: "Verre Minimaliste (Floral)",
    titleAr: "قارورة زجاجية نقية",
    url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000",
  },
  {
    titleFr: "Brume Royale (Vanille)",
    titleAr: "عطر الفانيليا الملكي",
    url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000",
  },
  {
    titleFr: "Flacon Émeraude (Frais)",
    titleAr: "قارورة زمردية فاخرة",
    url: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1000",
  },
];

type Variant = {
  size: "25ml" | "30ml" | "50ml" | "80ml" | "100ml";
  sku: string;
  price_dzd: number;
  compare_at_price_dzd: number | null;
  stock_quantity: number;
  is_active: boolean;
};

type FragranceFamily = { id: string; name_fr: string; name_ar: string };

interface ProductFormClientProps {
  locale: string;
  families: FragranceFamily[];
  action: (formData: FormData, locale: string) => Promise<{ error?: string; fieldErrors?: Record<string, string[]> }>;
  initialData?: any;
  mode: "create" | "edit";
}

const SIZES: Variant["size"][] = ["25ml", "30ml", "50ml", "80ml", "100ml"];
const SEASONS = ["spring", "summer", "autumn", "winter"];
const SEASON_LABELS: Record<string, { fr: string; ar: string }> = {
  spring: { fr: "Printemps", ar: "ربيع" },
  summer: { fr: "Été", ar: "صيف" },
  autumn: { fr: "Automne", ar: "خريف" },
  winter: { fr: "Hiver", ar: "شتاء" },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function ProductFormClient({
  locale,
  families,
  action,
  initialData,
  mode,
}: ProductFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form state
  const [nameFr, setNameFr] = useState(initialData?.name_fr || "");
  const [nameAr, setNameAr] = useState(initialData?.name_ar || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [descFr, setDescFr] = useState(initialData?.description_fr || "");
  const [descAr, setDescAr] = useState(initialData?.description_ar || "");
  const [gender, setGender] = useState<string>(initialData?.gender || "unisex");
  const [classification, setClassification] = useState<string>(initialData?.classification || "standard");
  const [familyId, setFamilyId] = useState<string>(initialData?.fragrance_family_id || "");
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(
    initialData?.seasons || ["spring", "summer", "autumn", "winter"]
  );
  const [topNotesFr, setTopNotesFr] = useState(
    (initialData?.top_notes_fr || []).join(", ")
  );
  const [topNotesAr, setTopNotesAr] = useState(
    (initialData?.top_notes_ar || []).join(", ")
  );
  const [heartNotesFr, setHeartNotesFr] = useState(
    (initialData?.heart_notes_fr || []).join(", ")
  );
  const [heartNotesAr, setHeartNotesAr] = useState(
    (initialData?.heart_notes_ar || []).join(", ")
  );
  const [baseNotesFr, setBaseNotesFr] = useState(
    (initialData?.base_notes_fr || []).join(", ")
  );
  const [baseNotesAr, setBaseNotesAr] = useState(
    (initialData?.base_notes_ar || []).join(", ")
  );
  const initialImages: string[] = (() => {
    if (!initialData?.images) return [];
    if (Array.isArray(initialData.images)) return initialData.images;
    try {
      const parsed = JSON.parse(initialData.images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [initialData.images];
    }
  })();

  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);

  // Landing Page Mode & Images state
  const initialLandingImages: string[] = (() => {
    if (!initialData?.landing_page_images) return [];
    if (Array.isArray(initialData.landing_page_images)) {
      return initialData.landing_page_images.filter(Boolean);
    }
    try {
      const parsed = JSON.parse(initialData.landing_page_images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  })();

  const [landingPageMode, setLandingPageMode] = useState<LandingPageMode>(
    initialData?.landing_page_mode === "landing_only" ||
      initialData?.landing_page_mode === "both"
      ? initialData.landing_page_mode
      : "standard"
  );
  const [landingImages, setLandingImages] = useState<string[]>(initialLandingImages);
  const [newLandingUrl, setNewLandingUrl] = useState("");
  const [landingError, setLandingError] = useState<string | null>(null);
  const [isUploadingLanding, setIsUploadingLanding] = useState(false);
  const [showPhonePreview, setShowPhonePreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const landingFileInputRef = useRef<HTMLInputElement>(null);

  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);
  const [isBestseller, setIsBestseller] = useState(initialData?.is_bestseller || false);
  const [isPublished, setIsPublished] = useState(
    initialData?.is_published !== undefined ? initialData.is_published : true
  );

  const [variants, setVariants] = useState<Variant[]>(
    initialData?.product_variants?.length
      ? initialData.product_variants.map((v: any) => ({
          size: v.size,
          sku: v.sku,
          price_dzd: Number(v.price_dzd),
          compare_at_price_dzd: v.compare_at_price_dzd ? Number(v.compare_at_price_dzd) : null,
          stock_quantity: v.stock_quantity,
          is_active: v.is_active,
        }))
      : [{ size: "50ml", sku: "", price_dzd: 0, compare_at_price_dzd: null, stock_quantity: 0, is_active: true }]
  );

  const handleAddImage = (urlToAdd?: string) => {
    const targetUrl = (urlToAdd || newImageUrl).trim();
    if (!targetUrl) {
      setImageError(locale === "ar" ? "يرجى إدخال رابط الصورة" : "Veuillez entrer une URL d'image valide");
      return;
    }
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://") && !targetUrl.startsWith("/")) {
      setImageError(locale === "ar" ? "يجب أن يبدأ الرابط بـ https:// أو http://" : "Le lien doit commencer par https:// ou http://");
      return;
    }
    if (images.includes(targetUrl)) {
      setImageError(locale === "ar" ? "هذه الصورة موجودة بالفعل" : "Cette image est déjà ajoutée");
      return;
    }
    setImages((prev) => [...prev, targetUrl]);
    setNewImageUrl("");
    setImageError(null);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToPromote: number) => {
    setImages((prev) => {
      const selected = prev[indexToPromote];
      const rest = prev.filter((_, idx) => idx !== indexToPromote);
      return [selected, ...rest];
    });
  };

  // Landing Page Images Handlers
  const handleAddLandingUrl = () => {
    const targetUrl = newLandingUrl.trim();
    if (!targetUrl) {
      setLandingError(
        locale === "ar" ? "يرجى إدخال رابط الصورة" : "Veuillez entrer une URL d'image valide"
      );
      return;
    }
    if (
      !targetUrl.startsWith("http://") &&
      !targetUrl.startsWith("https://") &&
      !targetUrl.startsWith("/")
    ) {
      setLandingError(
        locale === "ar"
          ? "يجب أن يبدأ الرابط بـ https:// أو http:// أو /"
          : "Le lien doit commencer par https://, http:// ou /"
      );
      return;
    }
    setLandingImages((prev) => [...prev, targetUrl]);
    setNewLandingUrl("");
    setLandingError(null);
  };

  const handleUploadLandingFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLandingError(null);
    setIsUploadingLanding(true);

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: format non supporté`);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        errors.push(`${file.name}: > 15 Mo`);
        continue;
      }

      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await uploadProductLandingImageAction(fd, locale);
        if (res.success && res.url) {
          uploadedUrls.push(res.url);
        } else {
          errors.push(res.error || file.name);
        }
      } catch (err: any) {
        errors.push(err?.message || file.name);
      }
    }

    if (uploadedUrls.length > 0) {
      setLandingImages((prev) => [...prev, ...uploadedUrls]);
    }
    if (errors.length > 0) {
      setLandingError(errors.join(" • "));
    }

    setIsUploadingLanding(false);
    if (landingFileInputRef.current) {
      landingFileInputRef.current.value = "";
    }
  };

  const handleMoveLandingImage = (index: number, direction: "up" | "down") => {
    setLandingImages((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleRemoveLandingImage = (indexToRemove: number) => {
    setLandingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCopyProductLink = async () => {
    if (!slug) return;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/${locale}/shop/${slug}`
        : `/${locale}/shop/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleNameFrChange = (value: string) => {
    setNameFr(value);
    if (mode === "create") {
      setSlug(slugify(value));
    }
  };

  const toggleSeason = (s: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: "30ml", sku: "", price_dzd: 0, compare_at_price_dzd: null, stock_quantity: 0, is_active: true },
    ]);
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: keyof Variant, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name_fr", nameFr);
      formData.set("name_ar", nameAr);
      formData.set("slug", slug);
      formData.set("description_fr", descFr);
      formData.set("description_ar", descAr);
      formData.set("gender", gender);
      formData.set("classification", classification);
      formData.set("fragrance_family_id", familyId || "");
      selectedSeasons.forEach((s) => formData.append("seasons", s));
      formData.set("top_notes_fr", topNotesFr);
      formData.set("top_notes_ar", topNotesAr);
      formData.set("heart_notes_fr", heartNotesFr);
      formData.set("heart_notes_ar", heartNotesAr);
      formData.set("base_notes_fr", baseNotesFr);
      formData.set("base_notes_ar", baseNotesAr);
      formData.set("images", JSON.stringify(images));
      formData.set("landing_page_mode", landingPageMode);
      formData.set("landing_page_images", JSON.stringify(landingImages));
      formData.set("is_featured", String(isFeatured));
      formData.set("is_bestseller", String(isBestseller));
      formData.set("is_published", String(isPublished));
      formData.set("variants", JSON.stringify(variants));

      try {
        const result = await action(formData, locale);
        if (result?.error) {
          setError(result.error);
          if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        }
        // On success, action redirects automatically
      } catch (err: any) {
        // NEXT_REDIRECT is thrown on successful redirect — ignore it
        if (err?.message?.includes("NEXT_REDIRECT")) return;
        setError("Une erreur inattendue est survenue.");
      }
    });
  };

  const inputCls =
    "w-full px-3 py-2 border border-luxury-border/50 rounded-[4px] text-sm bg-white text-luxury-text placeholder:text-luxury-text-muted focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors";
  const labelCls =
    "block text-[10px] uppercase tracking-widest font-semibold text-luxury-text-muted mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[4px] text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Back + Save */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/admin/products`)}
          className="flex items-center gap-2 text-sm text-luxury-text-muted hover:text-luxury-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === "ar" ? "العودة" : "Retour aux produits"}
        </button>
        <Button type="submit" variant="default" size="sm" className="gap-2" disabled={isPending}>
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {mode === "create"
            ? locale === "ar" ? "إنشاء المنتج" : "Créer le produit"
            : locale === "ar" ? "Enregistrer" : "Enregistrer les modifications"}
        </Button>
      </div>

      {/* Basic Info */}
      <section className="bg-white border border-luxury-border/30 rounded-[4px] p-6 space-y-5">
        <h3 className="font-medium text-sm text-luxury-text uppercase tracking-widest">
          {locale === "ar" ? "المعلومات الأساسية" : "Informations générales"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nom (Français) *</label>
            <input
              className={inputCls}
              placeholder="ex: Oud Royal"
              value={nameFr}
              onChange={(e) => handleNameFrChange(e.target.value)}
              required
            />
            {fieldErrors.name_fr && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.name_fr[0]}</p>
            )}
          </div>
          <div>
            <label className={labelCls}>الاسم (عربي) *</label>
            <input
              className={inputCls}
              dir="rtl"
              placeholder="مثال: عود ملكي"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Slug (URL) *</label>
          <input
            className={`${inputCls} font-mono text-xs`}
            placeholder="oud-royal"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <p className="text-[10px] text-luxury-text-muted mt-1">
            Lettres minuscules, chiffres et tirets uniquement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Description (Français) *</label>
            <textarea
              className={inputCls}
              rows={4}
              placeholder="Description du parfum en français..."
              value={descFr}
              onChange={(e) => setDescFr(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>الوصف (عربي) *</label>
            <textarea
              className={inputCls}
              rows={4}
              dir="rtl"
              placeholder="وصف العطر بالعربية..."
              value={descAr}
              onChange={(e) => setDescAr(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      {/* Classification */}
      <section className="bg-white border border-luxury-border/30 rounded-[4px] p-6 space-y-5">
        <h3 className="font-medium text-sm text-luxury-text uppercase tracking-widest">
          {locale === "ar" ? "التصنيف" : "Classification"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Genre</label>
            <select
              className={inputCls}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="unisex">Mixte / مختلط</option>
              <option value="men">Homme / رجالي</option>
              <option value="women">Femme / نسائي</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Classification</label>
            <select
              className={inputCls}
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="X2">X2</option>
              <option value="X3">X3</option>
              <option value="X4">X4</option>
              <option value="X5">X5</option>
              <option value="X6">X6</option>
              <option value="X7">X7</option>
              <option value="X8">X8</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Famille Olfactive</label>
            <select
              className={inputCls}
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
            >
              <option value="">— Aucune —</option>
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name_fr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Seasons */}
        <div>
          <label className={labelCls}>Saisons</label>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSeason(s)}
                className={`px-3 py-1.5 text-xs rounded-[3px] border transition-colors ${
                  selectedSeasons.includes(s)
                    ? "bg-luxury-accent text-white border-luxury-accent"
                    : "border-luxury-border/50 text-luxury-text-muted hover:border-luxury-accent"
                }`}
              >
                {SEASON_LABELS[s].fr}
              </button>
            ))}
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-6">
          {[
            { key: "is_featured", label: "En vedette", value: isFeatured, set: setIsFeatured },
            { key: "is_bestseller", label: "Bestseller", value: isBestseller, set: setIsBestseller },
            { key: "is_published", label: "Publié (visible en boutique)", value: isPublished, set: setIsPublished },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => set(e.target.checked)}
                className="w-4 h-4 accent-luxury-accent"
              />
              <span className="text-sm text-luxury-text">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="bg-white border border-luxury-border/30 rounded-[4px] p-6 space-y-5">
        <h3 className="font-medium text-sm text-luxury-text uppercase tracking-widest">
          {locale === "ar" ? "رائحة العطر" : "Pyramide Olfactive"}
        </h3>
        <p className="text-xs text-luxury-text-muted -mt-3">
          Séparez les notes par des virgules (ex: Rose, Jasmin, Oud)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Notes de tête (FR)</label>
            <input className={inputCls} value={topNotesFr} onChange={(e) => setTopNotesFr(e.target.value)} placeholder="Rose, Bergamote, Citron" />
          </div>
          <div>
            <label className={labelCls}>نوتات القمة (AR)</label>
            <input className={inputCls} dir="rtl" value={topNotesAr} onChange={(e) => setTopNotesAr(e.target.value)} placeholder="ورد، برغموت، ليمون" />
          </div>
          <div>
            <label className={labelCls}>Notes de cœur (FR)</label>
            <input className={inputCls} value={heartNotesFr} onChange={(e) => setHeartNotesFr(e.target.value)} placeholder="Jasmin, Iris, Oud" />
          </div>
          <div>
            <label className={labelCls}>نوتات القلب (AR)</label>
            <input className={inputCls} dir="rtl" value={heartNotesAr} onChange={(e) => setHeartNotesAr(e.target.value)} placeholder="ياسمين، سوسن، عود" />
          </div>
          <div>
            <label className={labelCls}>Notes de fond (FR)</label>
            <input className={inputCls} value={baseNotesFr} onChange={(e) => setBaseNotesFr(e.target.value)} placeholder="Ambre, Musc, Santal" />
          </div>
          <div>
            <label className={labelCls}>نوتات القاعدة (AR)</label>
            <input className={inputCls} dir="rtl" value={baseNotesAr} onChange={(e) => setBaseNotesAr(e.target.value)} placeholder="عنبر، مسك، صندل" />
          </div>
        </div>
      </section>

      {/* Images Manager */}
      <section className="bg-white border border-luxury-border/30 rounded-[4px] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-luxury-border/20">
          <div>
            <h3 className="font-medium text-sm text-luxury-text uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-luxury-accent" />
              <span>{locale === "ar" ? "صور العطر والمعرض (Images)" : "Images & Galerie du Parfum"}</span>
            </h3>
            <p className="text-xs text-luxury-text-muted mt-0.5">
              {locale === "ar"
                ? "أضف عدة صور للعطر عبر الرابط أو اختر من النماذج الجاهزة. الصورة الأولى هي صورة الغلاف الرئيسية."
                : "Ajoutez plusieurs images par lien URL ou choisissez parmi les modèles prédéfinis. La première image servira de photo de couverture."}
            </p>
          </div>
          <span className="text-xs text-luxury-accent font-semibold px-2.5 py-1 bg-luxury-secondary rounded-[3px] self-start sm:self-auto">
            {images.length} {locale === "ar" ? "صور مضافة" : "image(s) ajoutée(s)"}
          </span>
        </div>

        {/* Input Add Image by URL */}
        <div className="space-y-2">
          <label className={labelCls}>
            {locale === "ar" ? "إضافة رابط صورة جديد (Image URL)" : "Ajouter une image par lien URL"}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              className={`${inputCls} flex-1`}
              value={newImageUrl}
              onChange={(e) => {
                setNewImageUrl(e.target.value);
                if (imageError) setImageError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
              placeholder="https://images.unsplash.com/photo-1594035910387... ou https://.../parfum.jpg"
            />
            <Button
              type="button"
              onClick={() => handleAddImage()}
              className="gap-1.5 shrink-0"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === "ar" ? "إضافة الصورة" : "Ajouter l'image"}</span>
            </Button>
          </div>

          {imageError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{imageError}</span>
            </p>
          )}
        </div>

        {/* Preset Placeholders (Quick 1-Click Fill) */}
        <div className="space-y-2 bg-luxury-secondary/30 p-3 rounded-[4px] border border-luxury-border/20">
          <div className="flex items-center gap-1.5 text-xs text-luxury-text font-medium">
            <Sparkles className="w-3.5 h-3.5 text-luxury-accent" />
            <span>
              {locale === "ar"
                ? "صور مقترحة عالية الجودة (اضغط لإضافتها كنموذج تجريبي بنقرة واحدة):"
                : "Photos modèles prédéfinies haute qualité (cliquez pour ajouter instantanément) :"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_PLACEHOLDERS.map((preset, idx) => {
              const isAdded = images.includes(preset.url);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!isAdded) handleAddImage(preset.url);
                  }}
                  disabled={isAdded}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs border transition-all ${
                    isAdded
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default opacity-80"
                      : "bg-white hover:bg-luxury-secondary border-luxury-border/40 text-luxury-text hover:border-luxury-accent cursor-pointer shadow-xs"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                  />
                  <span>{locale === "ar" ? preset.titleAr : preset.titleFr}</span>
                  {isAdded ? (
                    <Check className="w-3 h-3 text-emerald-600 ml-1" />
                  ) : (
                    <Plus className="w-3 h-3 text-luxury-accent ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Images Preview Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-luxury-text-muted font-semibold">
              {locale === "ar" ? "معاينة الصور المضافة" : "Aperçu des Images"}
            </p>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setImages([])}
                className="text-[11px] text-red-600 hover:underline"
              >
                {locale === "ar" ? "حذف الكل" : "Tout supprimer"}
              </button>
            )}
          </div>

          {images.length === 0 ? (
            <div className="border-2 border-dashed border-luxury-border/60 rounded-[4px] p-8 text-center text-luxury-text-muted">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-luxury-border" />
              <p className="text-sm font-medium text-luxury-text">
                {locale === "ar" ? "لا توجد صور مضافة بعد" : "Aucune image ajoutée"}
              </p>
              <p className="text-xs text-luxury-text-muted mt-1 max-w-md mx-auto">
                {locale === "ar"
                  ? "أدخل رابط URL في الحقل أعلاه أو اختر من الصور المقترحة لمعاينة شكل العطر في المتجر."
                  : "Collez une URL d'image ci-dessus ou cliquez sur une photo prédéfinie pour voir l'aperçu."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((imgUrl, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`group relative bg-luxury-secondary/20 rounded-[4px] border overflow-hidden transition-all flex flex-col ${
                      isPrimary
                        ? "border-luxury-accent ring-2 ring-luxury-accent/20 shadow-sm"
                        : "border-luxury-border/40 hover:border-luxury-accent/50"
                    }`}
                  >
                    {/* Badge Cover */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                      {isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-luxury-accent text-white text-[10px] font-bold shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{locale === "ar" ? "غلاف رئيسي" : "Principale"}</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-black/60 text-white text-[10px] font-mono">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title={locale === "ar" ? "حذف الصورة" : "Supprimer cette image"}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-luxury-text hover:text-red-600 shadow-sm transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Image Preview Box */}
                    <div className="aspect-square w-full relative bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      {/* Broken Link Fallback */}
                      <div
                        style={{ display: "none" }}
                        className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-amber-50 text-amber-800 text-[10px]"
                      >
                        <AlertCircle className="w-5 h-5 text-amber-600 mb-1" />
                        <span>Lien invalide</span>
                      </div>
                    </div>

                    {/* Actions & Info Footer */}
                    <div className="p-2 space-y-1.5 bg-white border-t border-luxury-border/20 mt-auto">
                      <div className="flex items-center justify-between text-[10px] text-luxury-text-muted">
                        <span className="truncate max-w-[100px] font-mono" title={imgUrl}>
                          {imgUrl.replace(/^https?:\/\//, "").split("/")[0]}
                        </span>
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Ouvrir le lien"
                          className="hover:text-luxury-accent"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="w-full py-1 text-[10px] font-medium text-luxury-accent hover:bg-luxury-secondary rounded-[2px] border border-luxury-accent/30 hover:border-luxury-accent transition-colors"
                        >
                          {locale === "ar" ? "تعيين كغلاف" : "Définir comme principale"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Landing Page (Mobile Images) Control */}
      <section className="bg-white border border-luxury-border/30 rounded-[4px] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-luxury-border/20">
          <div>
            <h3 className="font-medium text-sm text-luxury-text uppercase tracking-widest flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-luxury-accent" />
              <span>
                {locale === "ar"
                  ? "صفحة الهبوط بالصور (إعلانات الهاتف)"
                  : "Page Landing Produit (Images Mobile / Pub)"}
              </span>
            </h3>
            <p className="text-xs text-luxury-text-muted mt-0.5">
              {locale === "ar"
                ? "اختر طريقة عرض صفحة هذا العطر: التفاصيل العادية، صور صفحة هبوط فقط، أو كلاهما مع استمارة الدفع عند الاستلام في الأسفل."
                : "Choisissez librement l'affichage de la page produit : fiche normale, images landing uniquement, ou les deux (images landing puis fiche normale + formulaire COD en bas)."}
            </p>
          </div>
          {slug && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCopyProductLink}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-[3px] border border-luxury-border/50 bg-luxury-secondary/40 hover:border-luxury-accent text-luxury-text transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">
                      {locale === "ar" ? "تم النسخ!" : "Lien copié !"}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-luxury-accent" />
                    <span>{locale === "ar" ? "نسخ رابط الصفحة" : "Copier le lien"}</span>
                  </>
                )}
              </button>
              {mode === "edit" && (
                <a
                  href={`/${locale}/shop/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-[3px] border border-luxury-border/50 hover:border-luxury-accent text-luxury-text-muted hover:text-luxury-text transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{locale === "ar" ? "فتح" : "Voir"}</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* 3 Display Mode Cards */}
        <div className="space-y-2">
          <label className={labelCls}>
            {locale === "ar" ? "وضع عرض صفحة العطر" : "Mode d'affichage de la page"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                value: "standard" as LandingPageMode,
                icon: LayoutTemplate,
                titleFr: "Fiche Normale",
                titleAr: "التفاصيل العادية فقط",
                descFr: "Galerie classique, notes olfactives et formulaire COD.",
                descAr: "صفحة المتجر العادية مع الصور والوصف واستمارة الطلب.",
              },
              {
                value: "landing_only" as LandingPageMode,
                icon: Smartphone,
                titleFr: "Landing Images Uniquement",
                titleAr: "صور الهبوط فقط",
                descFr: "Images empilées plein écran mobile + formulaire COD à la fin.",
                descAr: "صور متتالية مثالية للهاتف تليها مباشرة استمارة الطلب.",
              },
              {
                value: "both" as LandingPageMode,
                icon: Layers,
                titleFr: "Landing + Fiche Normale",
                titleAr: "صور الهبوط + التفاصيل العادية",
                descFr: "Images landing en premier, puis détails produit et formulaire COD.",
                descAr: "صور الهبوط أولاً، ثم تفاصيل العطر العادية، ثم استمارة الطلب.",
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = landingPageMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setLandingPageMode(opt.value);
                    setLandingError(null);
                  }}
                  className={`text-left rtl:text-right p-3.5 rounded-[4px] border transition-all cursor-pointer ${
                    isSelected
                      ? "border-luxury-accent bg-luxury-secondary/50 ring-2 ring-luxury-accent/20"
                      : "border-luxury-border/40 bg-white hover:border-luxury-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? "text-luxury-accent" : "text-luxury-text-muted"
                        }`}
                      />
                      <span className="text-xs font-semibold text-luxury-text">
                        {locale === "ar" ? opt.titleAr : opt.titleFr}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-luxury-accent text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-luxury-text-muted leading-snug">
                    {locale === "ar" ? opt.descAr : opt.descFr}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Landing Images Upload & Stack Manager */}
        <div className="space-y-4 pt-2 border-t border-luxury-border/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-luxury-text">
                {locale === "ar"
                  ? "صور صفحة الهبوط (صورة طويلة أو صور متتالية الواحدة تحت الأخرى)"
                  : "Images de la Page Landing (1 image longue ou plusieurs images empilées)"}
              </p>
              <p className="text-[11px] text-luxury-text-muted mt-0.5">
                {locale === "ar"
                  ? "يتم عرض الصور بالترتيب من الأعلى إلى الأسفل بدون فراغات، بعرض كامل لشاشة الهاتف."
                  : "Les images s'affichent de haut en bas sans aucun espace, plein écran sur téléphone. Vous pouvez garder vos images enregistrées même en mode Fiche Normale."}
              </p>
            </div>
            <span className="text-xs text-luxury-accent font-semibold px-2.5 py-1 bg-luxury-secondary rounded-[3px] self-start sm:self-auto shrink-0">
              {landingImages.length} {locale === "ar" ? "صور هبوط" : "image(s) landing"}
            </span>
          </div>

          {/* Upload from Device + Paste URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Device Multi-File Upload */}
            <div className="p-3.5 rounded-[4px] border border-dashed border-luxury-accent/50 bg-luxury-secondary/20 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-luxury-text">
                <UploadCloud className="w-4 h-4 text-luxury-accent shrink-0" />
                <span>
                  {locale === "ar"
                    ? "رفع صورة أو عدة صور من الجهاز"
                    : "Téléverser 1 ou plusieurs images depuis l'appareil"}
                </span>
              </div>
              <input
                ref={landingFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUploadLandingFiles}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="default"
                disabled={isUploadingLanding}
                onClick={() => landingFileInputRef.current?.click()}
                className="w-full gap-2"
              >
                {isUploadingLanding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{locale === "ar" ? "جاري الرفع..." : "Téléchargement..."}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>
                      {locale === "ar" ? "اختيار الصور (JPG, PNG, WEBP)" : "Choisir des images (JPG, PNG, WEBP)"}
                    </span>
                  </>
                )}
              </Button>
            </div>

            {/* Paste URL */}
            <div className="p-3.5 rounded-[4px] border border-luxury-border/40 bg-luxury-secondary/10 flex flex-col justify-between gap-2">
              <label className="text-xs font-medium text-luxury-text">
                {locale === "ar" ? "أو إضافة صورة عبر الرابط (URL)" : "Ou ajouter par lien URL"}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  className={`${inputCls} flex-1`}
                  value={newLandingUrl}
                  onChange={(e) => {
                    setNewLandingUrl(e.target.value);
                    if (landingError) setLandingError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLandingUrl();
                    }
                  }}
                  placeholder="https://.../landing-section-1.jpg"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddLandingUrl}
                  className="shrink-0 gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === "ar" ? "إضافة" : "Ajouter"}</span>
                </Button>
              </div>
            </div>
          </div>

          {landingError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{landingError}</span>
            </p>
          )}

          {/* Warning if mode needs images */}
          {landingPageMode !== "standard" && landingImages.length === 0 && (
            <div className="p-3 rounded-[4px] bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {locale === "ar"
                  ? "أضف صورة واحدة على الأقل لتفعيل صفحة الهبوط عند الحفظ."
                  : "Ajoutez au moins une image landing pour enregistrer ce mode d'affichage."}
              </span>
            </div>
          )}

          {/* Ordered Stack List + Optional Mobile Preview */}
          {landingImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-luxury-text-muted font-semibold">
                  {locale === "ar"
                    ? "ترتيب صور صفحة الهبوط (من الأعلى إلى الأسفل)"
                    : "Ordre d'affichage vertical (haut → bas)"}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPhonePreview((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-luxury-accent hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {showPhonePreview
                        ? locale === "ar"
                          ? "إخفاء معاينة الهاتف"
                          : "Masquer l'aperçu mobile"
                        : locale === "ar"
                        ? "معاينة شاشة الهاتف"
                        : "Aperçu écran téléphone"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLandingImages([])}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    {locale === "ar" ? "حذف الكل" : "Tout supprimer"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {landingImages.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className="flex items-center gap-3 p-2.5 rounded-[4px] border border-luxury-border/40 bg-luxury-secondary/20"
                  >
                    <span className="w-7 h-7 rounded-[3px] bg-luxury-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="w-12 h-16 rounded-[3px] overflow-hidden bg-gray-100 border border-luxury-border/30 shrink-0">
                      <img
                        src={imgUrl}
                        alt={`Landing #${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-luxury-text">
                        {locale === "ar" ? `القسم #${idx + 1}` : `Section #${idx + 1}`}
                      </p>
                      <p className="text-[11px] text-luxury-text-muted font-mono truncate" title={imgUrl}>
                        {imgUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveLandingImage(idx, "up")}
                        disabled={idx === 0}
                        title={locale === "ar" ? "نقل للأعلى" : "Monter"}
                        className="p-1.5 rounded-[3px] border border-luxury-border/40 bg-white hover:border-luxury-accent text-luxury-text disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveLandingImage(idx, "down")}
                        disabled={idx === landingImages.length - 1}
                        title={locale === "ar" ? "نقل للأسفل" : "Descendre"}
                        className="p-1.5 rounded-[3px] border border-luxury-border/40 bg-white hover:border-luxury-accent text-luxury-text disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={locale === "ar" ? "فتح الصورة" : "Ouvrir l'image"}
                        className="p-1.5 rounded-[3px] border border-luxury-border/40 bg-white hover:border-luxury-accent text-luxury-text-muted hover:text-luxury-text transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveLandingImage(idx)}
                        title={locale === "ar" ? "حذف" : "Supprimer"}
                        className="p-1.5 rounded-[3px] border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Screen Live Stack Preview */}
              {showPhonePreview && (
                <div className="pt-3 flex justify-center">
                  <div className="w-[320px] rounded-[24px] border-[6px] border-zinc-900 bg-white shadow-xl overflow-hidden">
                    <div className="bg-zinc-900 text-white text-[10px] py-1.5 px-3 flex items-center justify-between">
                      <span>9:41</span>
                      <span className="font-mono text-zinc-400 truncate max-w-[180px]">
                        /shop/{slug || "parfum"}
                      </span>
                      <span>5G</span>
                    </div>
                    <div className="max-h-[520px] overflow-y-auto flex flex-col gap-0">
                      {landingImages.map((imgUrl, idx) => (
                        <img
                          key={`preview-${idx}`}
                          src={imgUrl}
                          alt={`Aperçu mobile ${idx + 1}`}
                          className="block w-full h-auto m-0 p-0"
                        />
                      ))}
                      {landingPageMode === "both" && (
                        <div className="p-3 bg-luxury-secondary/40 text-center text-[11px] font-medium text-luxury-text border-t border-luxury-border/30">
                          {locale === "ar"
                            ? "↓ تفاصيل العطر العادية ↓"
                            : "↓ Fiche Produit Normale ↓"}
                        </div>
                      )}
                      <div className="p-4 bg-luxury-accent/10 text-center text-xs font-semibold text-luxury-accent border-t border-luxury-accent/20">
                        {locale === "ar"
                          ? "استمارة الطلب المباشر (الدفع عند الاستلام)"
                          : "Formulaire de Commande Rapide (COD)"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Variants */}
      <section className="bg-white border border-luxury-border/30 rounded-[4px] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-luxury-text uppercase tracking-widest">
            {locale === "ar" ? "الأحجام والأسعار" : "Variantes (Tailles & Prix)"}
          </h3>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 text-xs text-luxury-accent hover:text-luxury-accent/80 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une taille
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-3 bg-luxury-secondary/30 rounded-[3px] items-end"
            >
              <div>
                <label className={labelCls}>Taille</label>
                <select
                  className={inputCls}
                  value={v.size}
                  onChange={(e) => updateVariant(idx, "size", e.target.value)}
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>SKU *</label>
                <input
                  className={inputCls}
                  placeholder="ELN-OUD-50"
                  value={v.sku}
                  onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Prix (DZD) *</label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={v.price_dzd || ""}
                  onChange={(e) => updateVariant(idx, "price_dzd", Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Prix barré</label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={v.compare_at_price_dzd || ""}
                  onChange={(e) =>
                    updateVariant(idx, "compare_at_price_dzd", e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Stock</label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={v.stock_quantity}
                  onChange={(e) => updateVariant(idx, "stock_quantity", Number(e.target.value))}
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={v.is_active}
                    onChange={(e) => updateVariant(idx, "is_active", e.target.checked)}
                    className="w-4 h-4 accent-luxury-accent"
                  />
                  <span className="text-xs text-luxury-text">Actif</span>
                </label>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="mb-2 p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
