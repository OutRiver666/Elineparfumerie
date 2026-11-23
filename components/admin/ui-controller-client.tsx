"use client";

import React, { useState, useTransition, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/i18n";
import { StorefrontContent } from "@/types/storefront-content";
import {
  updateStorefrontContentAction,
  resetStorefrontContentAction,
  uploadStorefrontImageAction,
} from "@/lib/actions/storefront-content";
import { Button } from "@/components/ui/button";
import { DEFAULT_STOREFRONT_CONTENT } from "@/lib/data/storefront-content.default";
import {
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Eye,
  SlidersHorizontal,
  Upload,
  UploadCloud,
  ImageIcon,
  Sun,
  Flame,
  Snowflake,
  Check,
  AlertCircle,
  Link as LinkIcon,
  X,
  Layers,
  Box,
  MessageSquare,
  Trash2,
  Star,
} from "lucide-react";
import { Testimonial } from "@/types/testimonial";
import { deleteTestimonialAction } from "@/lib/actions/testimonials";

interface UiControllerClientProps {
  initialContent: StorefrontContent;
  initialTestimonials?: Testimonial[];
  locale: Locale;
}

type TabKey = "hero" | "gender" | "seasons" | "collections" | "customPack" | "testimonials";

/**
 * Validate that an image source string is safe and valid for Next.js Image
 */
function isValidImageSrc(src?: string | null): boolean {
  if (!src || typeof src !== "string") return false;
  const s = src.trim();
  if (!s) return false;
  if (s.startsWith("/")) return true;
  if (s.startsWith("http://") || s.startsWith("https://")) {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Device Image Uploader Component
 * Allows user to pick/drag-and-drop an image directly from their device,
 * uploads it to Supabase Storage / public uploads, and updates the URL.
 */
interface ImageDeviceUploaderProps {
  label: string;
  aspectHint?: string;
  currentUrl: string;
  onChange: (url: string) => void;
  locale: Locale;
}

function ImageDeviceUploader({
  label,
  aspectHint = "4:5",
  currentUrl,
  onChange,
  locale,
}: ImageDeviceUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError(
        locale === "ar"
          ? "يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)."
          : "Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP)."
      );
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadStorefrontImageAction(formData, locale);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setUploadError(res.error || "Erreur de téléchargement");
      }
    } catch (err: any) {
      setUploadError(err?.message || "Erreur lors du téléchargement");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] uppercase tracking-wider text-luxury-text-muted font-medium">
          {label}
        </label>
        {aspectHint && (
          <span className="text-[10px] uppercase font-mono text-luxury-text-muted">
            Format: {aspectHint}
          </span>
        )}
      </div>

      {/* Main Drag-and-Drop / Device Picker Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[6px] p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? "border-luxury-accent bg-luxury-accent/5 ring-2 ring-luxury-accent/20"
            : "border-luxury-border/60 hover:border-luxury-accent/70 bg-luxury-secondary/15 hover:bg-luxury-secondary/30"
        } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="py-3 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-luxury-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-luxury-text">
              {locale === "ar"
                ? "جاري رفع الصورة من جهازك..."
                : "Téléversement de l'image en cours..."}
            </span>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-luxury-border/40 flex items-center justify-center text-luxury-accent">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-luxury-text">
                {locale === "ar"
                  ? "انقر لرفع صورة من جهازك أو اسحبها هنا"
                  : "Téléverser depuis votre appareil"}
              </p>
              <p className="text-[11px] text-luxury-text-muted mt-0.5">
                {locale === "ar"
                  ? "يدعم جميع أجهزة الكمبيوتر والهواتف (JPG, PNG, WEBP — حتى 12 ميغابايت)"
                  : "Glissez-déposez ou parcourez vos fichiers (JPG, PNG, WEBP — max 12 Mo)"}
              </p>
            </div>
          </>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 p-2 rounded-[3px] border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Manual URL input toggle */}
      <div className="pt-1">
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-[11px] text-luxury-text-muted hover:text-luxury-accent flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>
              {locale === "ar"
                ? "أو أدخل رابط صورة خارجي (URL) يدوياً"
                : "Ou saisir une URL externe manuellement"}
            </span>
          </button>
        ) : (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-luxury-text-muted">
                {locale === "ar" ? "رابط الصورة (URL)" : "URL de l'Image"}
              </span>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="text-[10px] text-luxury-text-muted hover:text-luxury-text"
              >
                {locale === "ar" ? "إخفاء" : "Masquer"}
              </button>
            </div>
            <input
              type="url"
              value={currentUrl}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-luxury-border/60 rounded-[4px] text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent"
            />
          </div>
        )}
      </div>

      {/* Current image file info badge */}
      {currentUrl && (
        <div className="flex items-center justify-between text-[11px] text-luxury-text-muted bg-white p-2 rounded-[3px] border border-luxury-border/30">
          <div className="flex items-center gap-2 truncate">
            <ImageIcon className="w-3.5 h-3.5 text-luxury-accent flex-shrink-0" />
            <span className="truncate font-mono text-[10px]">{currentUrl}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-luxury-text-muted hover:text-rose-600 p-0.5 ml-2"
            title="Effacer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function UiControllerClient({
  initialContent,
  initialTestimonials = [],
  locale,
}: UiControllerClientProps) {
  const [content, setContent] = useState<StorefrontContent>(() => ({
    ...DEFAULT_STOREFRONT_CONTENT,
    ...initialContent,
    collections: {
      ...DEFAULT_STOREFRONT_CONTENT.collections,
      ...(initialContent?.collections || {}),
      card1: {
        ...DEFAULT_STOREFRONT_CONTENT.collections.card1,
        ...(initialContent?.collections?.card1 || {}),
      },
      card2: {
        ...DEFAULT_STOREFRONT_CONTENT.collections.card2,
        ...(initialContent?.collections?.card2 || {}),
      },
    },
    customPack: {
      ...DEFAULT_STOREFRONT_CONTENT.customPack,
      ...(initialContent?.customPack || {}),
    },
  }));
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>(initialTestimonials);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleDeleteTestimonial = (id: string) => {
    if (
      !window.confirm(
        locale === "ar"
          ? "هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً من الموقع؟"
          : "Êtes-vous sûr de vouloir supprimer définitivement cet avis ?"
      )
    )
      return;

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteTestimonialAction(id, locale);
      if (res.success) {
        setTestimonialsList((prev) => prev.filter((t) => t.id !== id));
        setStatusMessage({
          type: "success",
          text: locale === "ar" ? "تم حذف التقييم بنجاح." : "Avis supprimé avec succès.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Erreur lors de la suppression.",
        });
      }
      setDeletingId(null);
    });
  };

  // Helper for Hero fields
  const handleHeroChange = (field: keyof StorefrontContent["hero"], value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  // Helper for Gender section headers
  const handleGenderHeaderChange = (
    field: "headerTagFr" | "headerTagAr" | "headerTitleFr" | "headerTitleAr",
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      gender: {
        ...prev.gender,
        [field]: value,
      },
    }));
  };

  // Helper for Gender cards
  const handleGenderCardChange = (
    cardKey: "men" | "women" | "unisex",
    field: keyof StorefrontContent["gender"]["men"],
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      gender: {
        ...prev.gender,
        [cardKey]: {
          ...prev.gender[cardKey],
          [field]: value,
        },
      },
    }));
  };

  // Helper for Season section headers
  const handleSeasonHeaderChange = (
    field: "headerTagFr" | "headerTagAr" | "headerTitleFr" | "headerTitleAr",
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [field]: value,
      },
    }));
  };

  // Helper for Season cards
  const handleSeasonCardChange = (
    seasonKey: "spring" | "summer" | "autumn" | "winter",
    field: keyof StorefrontContent["seasons"]["spring"],
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonKey]: {
          ...prev.seasons[seasonKey],
          [field]: value,
        },
      },
    }));
  };

  // Helper for Collections section headers
  const handleCollectionsHeaderChange = (
    field: "headerTagFr" | "headerTagAr" | "headerTitleFr" | "headerTitleAr" | "linkTextFr" | "linkTextAr" | "linkUrl",
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      collections: {
        ...prev.collections,
        [field]: value,
      },
    }));
  };

  // Helper for Collections cards
  const handleCollectionsCardChange = (
    cardKey: "card1" | "card2",
    field: keyof StorefrontContent["collections"]["card1"],
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      collections: {
        ...prev.collections,
        [cardKey]: {
          ...prev.collections[cardKey],
          [field]: value,
        },
      },
    }));
  };

  // Helper for Custom Pack section
  const handleCustomPackChange = (
    field: keyof StorefrontContent["customPack"],
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      customPack: {
        ...prev.customPack,
        [field]: value,
      },
    }));
  };

  // Save handler
  const handleSave = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await updateStorefrontContentAction(content, locale);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text:
            locale === "ar"
              ? "تم حفظ وتحديث الواجهة بنجاح! التغييرات مفعلة مباشرة على المتجر."
              : "Modifications enregistrées avec succès ! La vitrine est mise à jour instantanément.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || (locale === "ar" ? "حدث خطأ أثناء الحفظ" : "Erreur lors de l'enregistrement"),
        });
      }
    });
  };

  // Reset handler
  const handleReset = () => {
    const confirmText =
      locale === "ar"
        ? "هل أنت متأكد من رغبتك في استعادة الصور والنصوص الأصلية الافتراضية؟"
        : "Êtes-vous sûr de vouloir réinitialiser tous les textes et images aux valeurs d'origine ?";
    if (!window.confirm(confirmText)) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await resetStorefrontContentAction(locale);
      if (res.success) {
        window.location.reload();
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Erreur de réinitialisation",
        });
      }
    });
  };

  const inputCls =
    "w-full px-3 py-2 text-xs sm:text-sm bg-white border border-luxury-border/60 rounded-[4px] text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent transition-colors";
  const labelCls = "block text-[11px] uppercase tracking-wider text-luxury-text-muted font-medium mb-1";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-luxury-border/40 p-4 sm:p-6 rounded-[6px] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-luxury-secondary text-luxury-accent text-[11px] uppercase tracking-widest font-semibold mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {locale === "ar" ? "لوحة التحكم في الواجهة" : "Studio Vitrine & Bannières"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
            {locale === "ar" ? "تخصيص صور ونصوص المتجر" : "Contrôleur Visuel de la Vitrine"}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-text-secondary mt-1">
            {locale === "ar"
              ? "ارفع صورك مباشرة من هاتفك أو حاسوبك للبانر الرئيسي (Hero)، أقسام الفئات، وخلفيات الفصول الأربعة مع تعديل النصوص بسهولة."
              : "Téléversez vos photos directement depuis votre appareil pour le Hero, les collections et les 4 saisons, et modifiez tous les textes en un clic."}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-luxury-text bg-luxury-secondary hover:bg-luxury-secondary/80 rounded-[4px] transition-colors border border-luxury-border/40"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "معاينة المتجر المباشر" : "Voir le Site Direct"}</span>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
            className="text-xs gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "استعادة الافتراضي" : "Réinitialiser"}</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="text-xs gap-1.5 min-w-[130px] bg-luxury-accent hover:bg-luxury-accent/90 text-white shadow-xs"
          >
            {isPending ? (
              <span className="inline-block animate-spin mr-1">⏳</span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>
              {isPending
                ? locale === "ar"
                  ? "جاري الحفظ..."
                  : "Enregistrement..."
                : locale === "ar"
                ? "حفظ التغييرات"
                : "Enregistrer"}
            </span>
          </Button>
        </div>
      </div>

      {/* Notification status message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-[4px] border flex items-center gap-3 text-xs sm:text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-luxury-border/40 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "hero"
              ? "border-luxury-accent text-luxury-accent font-semibold"
              : "border-transparent text-luxury-text-muted hover:text-luxury-text"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{locale === "ar" ? "1. البانر الرئيسي (Hero)" : "1. Section Hero (Bannière)"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gender")}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "gender"
              ? "border-luxury-accent text-luxury-accent font-semibold"
              : "border-transparent text-luxury-text-muted hover:text-luxury-text"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{locale === "ar" ? "2. أقسام الفئات (رجال / نساء / للجنسين)" : "2. Collections Homme / Femme / Mixte"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seasons")}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "seasons"
              ? "border-luxury-accent text-luxury-accent font-semibold"
              : "border-transparent text-luxury-text-muted hover:text-luxury-text"
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>{locale === "ar" ? "3. الفصول الأربعة (ربيع / صيف / خريف / شتاء)" : "3. Les 4 Saisons Olfactives"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("collections")}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "collections"
              ? "border-luxury-accent text-luxury-accent font-semibold"
              : "border-transparent text-luxury-text-muted hover:text-luxury-text"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{locale === "ar" ? "4. مجموعات التوقيع (Collections Signatures)" : "4. Nos Collections Signatures"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("customPack")}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "customPack"
              ? "border-luxury-accent text-luxury-accent font-semibold"
              : "border-transparent text-luxury-text-muted hover:text-luxury-text"
          }`}
        >
          <Box className="w-4 h-4" />
          <span>{locale === "ar" ? "5. باقة العطور المخصصة (Coffret Personnalisé)" : "5. Composer Mon Coffret Personnalisé"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("testimonials")}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "testimonials"
              ? "border-luxury-accent text-luxury-accent font-semibold"
              : "border-transparent text-luxury-text-muted hover:text-luxury-text"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{locale === "ar" ? "6. إدارة تقييمات الزبائن (Avis)" : "6. Avis & Témoignages Clients"}</span>
          <span className="text-[10px] bg-luxury-secondary px-1.5 py-0.5 rounded-full text-luxury-accent font-semibold">
            {testimonialsList.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: HERO SECTION */}
      {/* ============================================================== */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hero Image Device Upload Box */}
            <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-luxury-border/20 pb-3">
                <Upload className="w-4 h-4 text-luxury-accent" />
                <h3 className="font-serif text-base font-medium text-luxury-text">
                  {locale === "ar" ? "صورة البانر الرئيسي (Hero Image)" : "Image Principale du Hero"}
                </h3>
              </div>

              {/* Device Image Uploader */}
              <ImageDeviceUploader
                label={locale === "ar" ? "صورة الغلاف الكبيرة" : "Image Principale (Format Recommandé 4:5 ou Vertical)"}
                aspectHint="1200 x 1500 (4:5)"
                currentUrl={content.hero.imageUrl}
                onChange={(url) => handleHeroChange("imageUrl", url)}
                locale={locale}
              />
            </div>

            {/* Hero Text Box */}
            <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-luxury-border/20 pb-3">
                <Sparkles className="w-4 h-4 text-luxury-accent" />
                <h3 className="font-serif text-base font-medium text-luxury-text">
                  {locale === "ar" ? "نصوص وعناوين البانر (باللغتين)" : "Textes & Titres du Hero"}
                </h3>
              </div>

              {/* Tagline / Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Badge Haut (Français)</label>
                  <input
                    type="text"
                    value={content.hero.badgeFr}
                    onChange={(e) => handleHeroChange("badgeFr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>الشعار العلوي (العربية)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={content.hero.badgeAr}
                    onChange={(e) => handleHeroChange("badgeAr", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Title H1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Grand Titre H1 (Français)</label>
                  <textarea
                    rows={2}
                    value={content.hero.titleFr}
                    onChange={(e) => handleHeroChange("titleFr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>العنوان الرئيسي H1 (العربية)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={content.hero.titleAr}
                    onChange={(e) => handleHeroChange("titleAr", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Subtitle / Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Sous-titre / Paragraphe (Français)</label>
                  <textarea
                    rows={3}
                    value={content.hero.subtitleFr}
                    onChange={(e) => handleHeroChange("subtitleFr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>الوصف التقديمي (العربية)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={content.hero.subtitleAr}
                    onChange={(e) => handleHeroChange("subtitleAr", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="pt-2 border-t border-luxury-border/20 space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-luxury-text font-semibold">
                  {locale === "ar" ? "أزرار الدعوة للإجراء (CTA)" : "Boutons d'Action (CTA)"}
                </h4>

                {/* Primary Button */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-luxury-secondary/30 rounded-[4px]">
                  <div>
                    <label className={labelCls}>Texte Bouton 1 (FR)</label>
                    <input
                      type="text"
                      value={content.hero.primaryBtnTextFr}
                      onChange={(e) => handleHeroChange("primaryBtnTextFr", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>نص الزر الأول (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={content.hero.primaryBtnTextAr}
                      onChange={(e) => handleHeroChange("primaryBtnTextAr", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Lien de Redirection</label>
                    <input
                      type="text"
                      value={content.hero.primaryBtnLink}
                      onChange={(e) => handleHeroChange("primaryBtnLink", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-luxury-secondary/30 rounded-[4px]">
                  <div>
                    <label className={labelCls}>Texte Bouton 2 (FR)</label>
                    <input
                      type="text"
                      value={content.hero.secondaryBtnTextFr}
                      onChange={(e) => handleHeroChange("secondaryBtnTextFr", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>نص الزر الثاني (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={content.hero.secondaryBtnTextAr}
                      onChange={(e) => handleHeroChange("secondaryBtnTextAr", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Lien de Redirection</label>
                    <input
                      type="text"
                      value={content.hero.secondaryBtnLink}
                      onChange={(e) => handleHeroChange("secondaryBtnLink", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Floating Badge on Image */}
              <div className="pt-2 border-t border-luxury-border/20 space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-luxury-text font-semibold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-luxury-accent" />
                  <span>
                    {locale === "ar"
                      ? "البطاقة العائمة على الصورة (Badge Flottant)"
                      : "Badge Flottant Superposé sur l'Image"}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Titre Flottant (FR)</label>
                    <input
                      type="text"
                      value={content.hero.floatingBadgeTitleFr}
                      onChange={(e) => handleHeroChange("floatingBadgeTitleFr", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>عنوان البطاقة (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={content.hero.floatingBadgeTitleAr}
                      onChange={(e) => handleHeroChange("floatingBadgeTitleAr", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white border border-luxury-border/40 p-5 rounded-[6px] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-luxury-border/20 pb-2">
                <span className="text-[11px] uppercase tracking-wider text-luxury-accent font-semibold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{locale === "ar" ? "معاينة حية فورية" : "Aperçu Visuel Direct"}</span>
                </span>
                <span className="text-[10px] text-luxury-text-muted font-mono">
                  {locale === "ar" ? "عرض حي" : "Simulation"}
                </span>
              </div>

              {/* Realistic Hero Mockup */}
              <div className="bg-luxury-secondary/40 p-4 rounded-[6px] border border-luxury-border/30 space-y-3">
                <div className="inline-block px-2 py-0.5 rounded-[2px] bg-luxury-surface text-luxury-accent text-[9px] uppercase tracking-widest font-semibold">
                  {locale === "ar" ? content.hero.badgeAr : content.hero.badgeFr}
                </div>
                <h4 className="font-serif text-lg font-medium text-luxury-text line-clamp-2">
                  {locale === "ar" ? content.hero.titleAr : content.hero.titleFr}
                </h4>
                <p className="text-[11px] text-luxury-text-secondary line-clamp-2">
                  {locale === "ar" ? content.hero.subtitleAr : content.hero.subtitleFr}
                </p>

                {/* Preview Image Card with Floating Badge */}
                <div className="relative aspect-[4/5] w-full rounded-[4px] overflow-hidden bg-black/10 mt-3 border border-luxury-border/20 shadow-xs">
                  {content.hero.imageUrl ? (
                    <Image
                      src={content.hero.imageUrl}
                      alt="Hero Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-luxury-text-muted">
                      <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-xs">Pas d'image</span>
                    </div>
                  )}

                  {/* Floating badge mockup */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md p-2 rounded-[3px] shadow-floating max-w-[160px]">
                    <span className="text-[8px] uppercase tracking-widest text-luxury-accent font-semibold block">
                      {locale === "ar" ? content.hero.floatingBadgeTopAr : content.hero.floatingBadgeTopFr}
                    </span>
                    <p className="font-serif text-[11px] font-medium text-luxury-text truncate">
                      {locale === "ar" ? content.hero.floatingBadgeTitleAr : content.hero.floatingBadgeTitleFr}
                    </p>
                    <span className="text-[9px] text-luxury-text-secondary block truncate">
                      {locale === "ar" ? content.hero.floatingBadgeSubAr : content.hero.floatingBadgeSubFr}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: GENDER SECTION */}
      {/* ============================================================== */}
      {activeTab === "gender" && (
        <div className="space-y-6">
          {/* Section Header Inputs */}
          <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-medium text-luxury-text border-b border-luxury-border/20 pb-3">
              {locale === "ar" ? "عنوان قسم الفئات (En-tête de Section)" : "En-tête de la Section Collections"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Sous-titre / Tag Haut (FR)</label>
                <input
                  type="text"
                  value={content.gender.headerTagFr}
                  onChange={(e) => handleGenderHeaderChange("headerTagFr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>الشعار العلوي (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={content.gender.headerTagAr}
                  onChange={(e) => handleGenderHeaderChange("headerTagAr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Grand Titre (FR)</label>
                <input
                  type="text"
                  value={content.gender.headerTitleFr}
                  onChange={(e) => handleGenderHeaderChange("headerTitleFr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>العنوان الرئيسي (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={content.gender.headerTitleAr}
                  onChange={(e) => handleGenderHeaderChange("headerTitleAr", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* 3 Gender Cards: Men, Women, Unisex with Device Uploader */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["men", "women", "unisex"] as const).map((key) => {
              const card = content.gender[key];
              const titleMap = {
                men: { fr: "Collection Homme", ar: "تشكيلة الرجال" },
                women: { fr: "Collection Femme", ar: "تشكيلة النساء" },
                unisex: { fr: "Collection Unisexe / Mixte", ar: "تشكيلة للجنسين" },
              };

              return (
                <div
                  key={key}
                  className="bg-white border border-luxury-border/40 p-5 rounded-[6px] shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-luxury-border/20 pb-2">
                      <h4 className="font-serif text-sm font-semibold text-luxury-text">
                        {locale === "ar" ? titleMap[key].ar : titleMap[key].fr}
                      </h4>
                      <span className="text-[10px] uppercase font-mono text-luxury-text-muted">
                        Aspect 3:4
                      </span>
                    </div>

                    {/* Preview Image */}
                    <div className="relative aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-black/10 border border-luxury-border/30">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.titleFr}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-luxury-text-muted">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[9px] uppercase tracking-widest text-luxury-gold font-semibold block">
                          {locale === "ar" ? card.tagAr : card.tagFr}
                        </span>
                        <h5 className="font-serif text-sm font-medium">
                          {locale === "ar" ? card.titleAr : card.titleFr}
                        </h5>
                        <p className="text-[10px] text-white/80 line-clamp-1">
                          {locale === "ar" ? card.subtitleAr : card.subtitleFr}
                        </p>
                      </div>
                    </div>

                    {/* Device Image Uploader */}
                    <ImageDeviceUploader
                      label={locale === "ar" ? "رفع صورة القسم" : "Téléverser l'Image"}
                      aspectHint="3:4"
                      currentUrl={card.imageUrl}
                      onChange={(url) => handleGenderCardChange(key, "imageUrl", url)}
                      locale={locale}
                    />

                    {/* Titles */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>Titre (FR)</label>
                        <input
                          type="text"
                          value={card.titleFr}
                          onChange={(e) => handleGenderCardChange(key, "titleFr", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>العنوان (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={card.titleAr}
                          onChange={(e) => handleGenderCardChange(key, "titleAr", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Subtitle / Description */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>Sous-titre (FR)</label>
                        <input
                          type="text"
                          value={card.subtitleFr}
                          onChange={(e) => handleGenderCardChange(key, "subtitleFr", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>الوصف (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={card.subtitleAr}
                          onChange={(e) => handleGenderCardChange(key, "subtitleAr", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SEASONS SECTION */}
      {/* ============================================================== */}
      {activeTab === "seasons" && (
        <div className="space-y-6">
          {/* Header Inputs */}
          <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-medium text-luxury-text border-b border-luxury-border/20 pb-3">
              {locale === "ar"
                ? "عنوان قسم الفصول الأربعة (En-tête de Section)"
                : "En-tête de la Section 4 Saisons"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Sous-titre / Tag Haut (FR)</label>
                <input
                  type="text"
                  value={content.seasons.headerTagFr}
                  onChange={(e) => handleSeasonHeaderChange("headerTagFr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>الشعار العلوي (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={content.seasons.headerTagAr}
                  onChange={(e) => handleSeasonHeaderChange("headerTagAr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Grand Titre (FR)</label>
                <input
                  type="text"
                  value={content.seasons.headerTitleFr}
                  onChange={(e) => handleSeasonHeaderChange("headerTitleFr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>العنوان الرئيسي (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={content.seasons.headerTitleAr}
                  onChange={(e) => handleSeasonHeaderChange("headerTitleAr", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* 4 Seasons Cards with Device Uploader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(["winter", "autumn", "spring", "summer"] as const).map((key) => {
              const card = content.seasons[key];
              const icons = {
                spring: Sparkles,
                summer: Sun,
                autumn: Flame,
                winter: Snowflake,
              };
              const Icon = icons[key];

              return (
                <div
                  key={key}
                  className="bg-white border border-luxury-border/40 p-4 rounded-[6px] shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-luxury-border/20 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-4 h-4 text-luxury-accent" />
                        <h4 className="font-serif text-sm font-semibold text-luxury-text">
                          {locale === "ar" ? card.nameAr : card.nameFr}
                        </h4>
                      </div>
                      <span className="text-[9px] uppercase font-mono text-luxury-text-muted">
                        Aspect 4:5
                      </span>
                    </div>

                    {/* Preview Image */}
                    <div className="relative aspect-[4/5] w-full rounded-[4px] overflow-hidden bg-black/10 border border-luxury-border/30">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.nameFr}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-luxury-text-muted">
                          <ImageIcon className="w-6 h-6 opacity-40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-white">
                        <span className="text-[8px] uppercase tracking-wider font-semibold bg-white/20 px-1.5 py-0.5 rounded-[2px] truncate">
                          {locale === "ar" ? card.badgeAr : card.badgeFr}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white space-y-0.5">
                        <span className="text-[8px] uppercase tracking-widest text-luxury-gold font-semibold block truncate">
                          {locale === "ar" ? card.subtitleAr : card.subtitleFr}
                        </span>
                        <h5 className="font-serif text-base font-medium">
                          {locale === "ar" ? card.nameAr : card.nameFr}
                        </h5>
                        <p className="text-[9px] text-white/80 line-clamp-1 italic">
                          {locale === "ar" ? card.accordsAr : card.accordsFr}
                        </p>
                      </div>
                    </div>

                    {/* Device Image Uploader */}
                    <ImageDeviceUploader
                      label={locale === "ar" ? `رفع خلفية فصل ${card.nameAr}` : `Image ${card.nameFr}`}
                      aspectHint="4:5"
                      currentUrl={card.imageUrl}
                      onChange={(url) => handleSeasonCardChange(key, "imageUrl", url)}
                      locale={locale}
                    />

                    {/* Subtitle / Accords */}
                    <div>
                      <label className={labelCls}>Sous-titre (FR)</label>
                      <input
                        type="text"
                        value={card.subtitleFr}
                        onChange={(e) => handleSeasonCardChange(key, "subtitleFr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>الوصف المختصر (AR)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={card.subtitleAr}
                        onChange={(e) => handleSeasonCardChange(key, "subtitleAr", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    {/* Accords notes */}
                    <div>
                      <label className={labelCls}>Accords (FR)</label>
                      <input
                        type="text"
                        value={card.accordsFr}
                        onChange={(e) => handleSeasonCardChange(key, "accordsFr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>النغمات العطرية (AR)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={card.accordsAr}
                        onChange={(e) => handleSeasonCardChange(key, "accordsAr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: NOS COLLECTIONS SIGNATURES */}
      {/* ============================================================== */}
      {activeTab === "collections" && (
        <div className="space-y-8">
          {/* Section Header Controls */}
          <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-luxury-border/20 pb-3">
              <Layers className="w-4 h-4 text-luxury-accent" />
              <h3 className="font-serif text-base font-medium text-luxury-text">
                {locale === "ar"
                  ? "عناوين ورابط قسم المجموعات المميزة"
                  : "En-tête de la Section Collections Signatures"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Badge / Tag Haut (FR)</label>
                <input
                  type="text"
                  value={content.collections.headerTagFr}
                  onChange={(e) => handleCollectionsHeaderChange("headerTagFr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>الوسم العلوي (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={content.collections.headerTagAr}
                  onChange={(e) => handleCollectionsHeaderChange("headerTagAr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Titre Principal de la Section (FR)</label>
                <input
                  type="text"
                  value={content.collections.headerTitleFr}
                  onChange={(e) => handleCollectionsHeaderChange("headerTitleFr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>العنوان الرئيسي للقسم (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={content.collections.headerTitleAr}
                  onChange={(e) => handleCollectionsHeaderChange("headerTitleAr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Texte du Lien / Bouton (FR)</label>
                <input
                  type="text"
                  value={content.collections.linkTextFr}
                  onChange={(e) => handleCollectionsHeaderChange("linkTextFr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>نص زر التصفح (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={content.collections.linkTextAr}
                  onChange={(e) => handleCollectionsHeaderChange("linkTextAr", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Lien de Redirection (URL)</label>
                <input
                  type="text"
                  value={content.collections.linkUrl}
                  onChange={(e) => handleCollectionsHeaderChange("linkUrl", e.target.value)}
                  placeholder="/collections"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* The 2 Collection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(["card1", "card2"] as const).map((cardKey, idx) => {
              const card = content.collections[cardKey];
              const cardLabelFr = idx === 0 ? "Collection Signature 1 (Gauche)" : "Collection Signature 2 (Droite)";
              const cardLabelAr = idx === 0 ? "المجموعة الأولى (اليسار)" : "المجموعة الثانية (اليمين)";

              return (
                <div
                  key={cardKey}
                  className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-luxury-border/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-luxury-accent" />
                      <h4 className="font-serif text-base font-medium text-luxury-text">
                        {locale === "ar" ? cardLabelAr : cardLabelFr}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-luxury-secondary px-2 py-0.5 rounded-[3px] text-luxury-text-muted">
                      Card #{idx + 1}
                    </span>
                  </div>

                  {/* Card Visual Live Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-luxury-text-muted font-medium block">
                      {locale === "ar" ? "معاينة البطاقة على الصفحة الرئيسية" : "Aperçu Direct de la Carte"}
                    </span>
                    <div className="relative rounded-[6px] overflow-hidden bg-luxury-surface min-h-[220px] flex items-end p-5 shadow-xs border border-luxury-border/30">
                      {isValidImageSrc(card?.imageUrl) ? (
                        <Image
                          src={card.imageUrl.trim()}
                          alt={locale === "ar" ? card?.titleAr || "" : card?.titleFr || ""}
                          fill
                          className="object-cover object-center"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center text-white/40 text-xs">
                          Aucune image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      <div className="relative z-10 text-white space-y-0.5">
                        <span className="text-[9px] uppercase tracking-widest text-luxury-gold font-semibold block truncate">
                          {locale === "ar" ? card.tagAr : card.tagFr}
                        </span>
                        <h5 className="font-serif text-lg font-medium">
                          {locale === "ar" ? card.titleAr : card.titleFr}
                        </h5>
                        <p className="text-[10px] text-white/80 line-clamp-2 max-w-sm">
                          {locale === "ar" ? card.descriptionAr : card.descriptionFr}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Device Image Uploader */}
                  <ImageDeviceUploader
                    label={locale === "ar" ? `رفع صورة ${cardLabelAr}` : `Photo pour ${cardLabelFr}`}
                    aspectHint="16:9 ou 4:3 (800 x 450)"
                    currentUrl={card.imageUrl}
                    onChange={(url) => handleCollectionsCardChange(cardKey, "imageUrl", url)}
                    locale={locale}
                  />

                  {/* Tag / Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Sous-titre / Tag (FR)</label>
                      <input
                        type="text"
                        value={card.tagFr}
                        onChange={(e) => handleCollectionsCardChange(cardKey, "tagFr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>الوسم / العنوان الفرعي (AR)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={card.tagAr}
                        onChange={(e) => handleCollectionsCardChange(cardKey, "tagAr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Titre de la Collection (FR)</label>
                      <input
                        type="text"
                        value={card.titleFr}
                        onChange={(e) => handleCollectionsCardChange(cardKey, "titleFr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>اسم المجموعة (AR)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={card.titleAr}
                        onChange={(e) => handleCollectionsCardChange(cardKey, "titleAr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Description (FR)</label>
                      <textarea
                        rows={3}
                        value={card.descriptionFr}
                        onChange={(e) => handleCollectionsCardChange(cardKey, "descriptionFr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>الوصف (AR)</label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={card.descriptionAr}
                        onChange={(e) => handleCollectionsCardChange(cardKey, "descriptionAr", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <label className={labelCls}>Lien de Destination</label>
                    <input
                      type="text"
                      value={card.linkUrl}
                      onChange={(e) => handleCollectionsCardChange(cardKey, "linkUrl", e.target.value)}
                      placeholder="/collections"
                      className={inputCls}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: COMPOSER MON COFFRET PERSONNALISÉ */}
      {/* ============================================================== */}
      {activeTab === "customPack" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box Image Device Upload */}
            <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-luxury-border/20 pb-3">
                <Upload className="w-4 h-4 text-luxury-accent" />
                <h3 className="font-serif text-base font-medium text-luxury-text">
                  {locale === "ar" ? "صورة الصندوق الترويجي (Image du Coffret)" : "Image Promotionnelle du Coffret"}
                </h3>
              </div>

              <ImageDeviceUploader
                label={locale === "ar" ? "صورة باقة الـ 3 عطور" : "Photo du Coffret (Format Recommandé 4:3)"}
                aspectHint="1000 x 750 (4:3)"
                currentUrl={content.customPack.imageUrl}
                onChange={(url) => handleCustomPackChange("imageUrl", url)}
                locale={locale}
              />
            </div>

            {/* Title & Badge */}
            <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-luxury-border/20 pb-3">
                <Box className="w-4 h-4 text-luxury-accent" />
                <h3 className="font-serif text-base font-medium text-luxury-text">
                  {locale === "ar" ? "العناوين والشارة" : "Titres & Badges"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Badge Haut (FR)</label>
                  <input
                    type="text"
                    value={content.customPack.badgeFr}
                    onChange={(e) => handleCustomPackChange("badgeFr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>الشارة العلوية (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={content.customPack.badgeAr}
                    onChange={(e) => handleCustomPackChange("badgeAr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Titre Principal (FR)</label>
                  <input
                    type="text"
                    value={content.customPack.titleFr}
                    onChange={(e) => handleCustomPackChange("titleFr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>العنوان الرئيسي (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={content.customPack.titleAr}
                    onChange={(e) => handleCustomPackChange("titleAr", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Description Paragraph */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className={labelCls}>Paragraphe Explicatif (FR)</label>
                  <textarea
                    rows={3}
                    value={content.customPack.descriptionFr}
                    onChange={(e) => handleCustomPackChange("descriptionFr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>الفقرة التوضيحية (AR)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={content.customPack.descriptionAr}
                    onChange={(e) => handleCustomPackChange("descriptionAr", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* The 3 Steps */}
            <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-luxury-border/20 pb-3">
                <SlidersHorizontal className="w-4 h-4 text-luxury-accent" />
                <h3 className="font-serif text-base font-medium text-luxury-text">
                  {locale === "ar" ? "خطوات تصميم الباقة (3 مراحل)" : "Les 3 Étapes Guidées"}
                </h3>
              </div>

              {/* Step 1 */}
              <div className="p-3 rounded-[4px] bg-luxury-secondary/20 space-y-2 border border-luxury-border/30">
                <span className="text-[10px] uppercase font-bold text-luxury-accent">Étape 1 / المرحلة الأولى</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={content.customPack.step1Fr}
                    onChange={(e) => handleCustomPackChange("step1Fr", e.target.value)}
                    placeholder="Étape 1 (FR)"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={content.customPack.step1Ar}
                    onChange={(e) => handleCustomPackChange("step1Ar", e.target.value)}
                    placeholder="المرحلة الأولى (AR)"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-[4px] bg-luxury-secondary/20 space-y-2 border border-luxury-border/30">
                <span className="text-[10px] uppercase font-bold text-luxury-accent">Étape 2 / المرحلة الثانية</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={content.customPack.step2Fr}
                    onChange={(e) => handleCustomPackChange("step2Fr", e.target.value)}
                    placeholder="Étape 2 (FR)"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={content.customPack.step2Ar}
                    onChange={(e) => handleCustomPackChange("step2Ar", e.target.value)}
                    placeholder="المرحلة الثانية (AR)"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-[4px] bg-luxury-secondary/20 space-y-2 border border-luxury-border/30">
                <span className="text-[10px] uppercase font-bold text-luxury-accent">Étape 3 / المرحلة الثالثة</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={content.customPack.step3Fr}
                    onChange={(e) => handleCustomPackChange("step3Fr", e.target.value)}
                    placeholder="Étape 3 (FR)"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={content.customPack.step3Ar}
                    onChange={(e) => handleCustomPackChange("step3Ar", e.target.value)}
                    placeholder="المرحلة الثالثة (AR)"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* CTA Button & Link */}
            <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-luxury-border/20 pb-3">
                <LinkIcon className="w-4 h-4 text-luxury-accent" />
                <h3 className="font-serif text-base font-medium text-luxury-text">
                  {locale === "ar" ? "زر الانتقال (Action Button)" : "Bouton d'Action & Lien"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Texte du Bouton (FR)</label>
                  <input
                    type="text"
                    value={content.customPack.btnTextFr}
                    onChange={(e) => handleCustomPackChange("btnTextFr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>نص الزر (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={content.customPack.btnTextAr}
                    onChange={(e) => handleCustomPackChange("btnTextAr", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Lien de Redirection</label>
                  <input
                    type="text"
                    value={content.customPack.btnLink}
                    onChange={(e) => handleCustomPackChange("btnLink", e.target.value)}
                    placeholder="/packs/builder"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-luxury-border/40 p-5 rounded-[6px] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-luxury-border/20 pb-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-luxury-accent" />
                  <h4 className="font-serif text-sm font-medium text-luxury-text">
                    {locale === "ar" ? "معاينة حية للمتجر" : "Aperçu Direct Vitrine"}
                  </h4>
                </div>
                <span className="text-[10px] text-luxury-accent bg-luxury-secondary px-2 py-0.5 rounded-[3px] font-medium">
                  {locale === "ar" ? "مباشر" : "En direct"}
                </span>
              </div>

              {/* Mini replica of the custom pack section */}
              <div className="bg-luxury-surface p-5 rounded-[6px] border border-luxury-border/30 space-y-4">
                {/* Image */}
                <div className="relative aspect-[4/3] w-full rounded-[4px] overflow-hidden bg-luxury-secondary">
                  {isValidImageSrc(content.customPack?.imageUrl) ? (
                    <Image
                      src={content.customPack.imageUrl.trim()}
                      alt="Coffret personnalisé"
                      fill
                      className="object-cover object-center"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-luxury-text-muted">
                      Aucune image
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white text-luxury-accent text-[9px] uppercase tracking-wider font-semibold border border-luxury-border/30">
                    <Box className="w-2.5 h-2.5" />
                    <span>{locale === "ar" ? content.customPack.badgeAr : content.customPack.badgeFr}</span>
                  </span>

                  <h5 className="font-serif text-base font-medium text-luxury-text leading-snug">
                    {locale === "ar" ? content.customPack.titleAr : content.customPack.titleFr}
                  </h5>

                  <p className="text-[11px] text-luxury-text-secondary leading-relaxed line-clamp-2">
                    {locale === "ar" ? content.customPack.descriptionAr : content.customPack.descriptionFr}
                  </p>

                  <div className="space-y-1 pt-1 text-[10px] text-luxury-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-luxury-text text-white text-[8px] font-bold">1</span>
                      <span className="truncate">{locale === "ar" ? content.customPack.step1Ar : content.customPack.step1Fr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-luxury-text text-white text-[8px] font-bold">2</span>
                      <span className="truncate">{locale === "ar" ? content.customPack.step2Ar : content.customPack.step2Fr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-luxury-text text-white text-[8px] font-bold">3</span>
                      <span className="truncate">{locale === "ar" ? content.customPack.step3Ar : content.customPack.step3Fr}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full py-1.5 px-3 rounded-[3px] bg-luxury-accent text-white text-[11px] font-medium text-center shadow-xs">
                      {locale === "ar" ? content.customPack.btnTextAr : content.customPack.btnTextFr}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: AVIS & TÉMOIGNAGES CLIENTS */}
      {/* ============================================================== */}
      {activeTab === "testimonials" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-luxury-border/40 p-6 rounded-[6px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-luxury-accent" />
                <h3 className="font-serif text-lg font-medium text-luxury-text">
                  {locale === "ar" ? "إدارة تقييمات وتعليقات الزبائن" : "Modération des Avis & Témoignages"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-luxury-text-secondary">
                {locale === "ar"
                  ? "جميع التعليقات التي نشرها الزبائن على الصفحة الرئيسية. يمكنك حذف أي تقييم تجريبي أو غير مرغوب فيه."
                  : "Consultez et gérez en direct tous les commentaires publiés par vos clients sur la vitrine."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-luxury-secondary text-luxury-text font-medium text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>
                  {testimonialsList.length > 0
                    ? (
                        testimonialsList.reduce((acc, t) => acc + (Number(t.rating) || 5), 0) /
                        testimonialsList.length
                      ).toFixed(1)
                    : "5.0"}{" "}
                  / 5
                </span>
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-[4px] bg-luxury-surface border border-luxury-border/40 text-luxury-accent">
                {testimonialsList.length} {locale === "ar" ? "تقييم منشور" : "avis au total"}
              </span>
            </div>
          </div>

          {/* Testimonials List */}
          {testimonialsList.length === 0 ? (
            <div className="bg-white border border-luxury-border/40 p-12 rounded-[6px] text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-luxury-text-muted mx-auto opacity-40" />
              <p className="text-sm font-medium text-luxury-text">
                {locale === "ar" ? "لا توجد تقييمات حالياً." : "Aucun avis client pour le moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonialsList.map((t) => {
                const isDeleting = deletingId === t.id;

                return (
                  <div
                    key={t.id}
                    className="bg-white border border-luxury-border/40 p-5 rounded-[6px] shadow-xs flex flex-col justify-between space-y-4 relative"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Stars + Delete Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (Number(t.rating) || 5)
                                  ? "fill-current text-amber-500"
                                  : "text-neutral-200 fill-neutral-200"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-semibold text-luxury-text ml-1.5 rtl:ml-0 rtl:mr-1.5">
                            {t.rating}/5
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isDeleting ? "..." : locale === "ar" ? "حذف" : "Supprimer"}</span>
                        </Button>
                      </div>

                      {/* Quote text */}
                      <p className="text-xs sm:text-[13px] text-luxury-text leading-relaxed italic bg-luxury-secondary/15 p-3 rounded-[4px] border border-luxury-border/20">
                        "{t.quote}"
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-2 border-t border-luxury-border/30 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-luxury-text">{t.author}</div>
                        <div className="text-[11px] text-luxury-text-muted">{t.city}</div>
                      </div>

                      <div className="text-right rtl:text-left space-y-0.5">
                        <span className="inline-block text-[10px] text-luxury-accent font-medium bg-luxury-surface px-2 py-0.5 rounded-[2px] border border-luxury-border/30">
                          {t.perfume}
                        </span>
                        <div className="text-[10px] text-luxury-text-muted">
                          {new Date(t.createdAt).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
