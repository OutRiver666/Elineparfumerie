"use client";

import React, { useState, useTransition } from "react";
import { Locale } from "@/lib/i18n";
import { Testimonial } from "@/types/testimonial";
import { submitTestimonialAction } from "@/lib/actions/testimonials";
import { Button } from "@/components/ui/button";
import {
  Star,
  MessageSquarePlus,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  ChevronDown,
  Quote,
} from "lucide-react";

interface TestimonialsSectionProps {
  initialTestimonials: Testimonial[];
  locale: Locale;
  perfumesList?: { nameFr: string; nameAr: string }[];
}

export function TestimonialsSection({
  initialTestimonials,
  locale,
  perfumesList = [],
}: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // Form State
  const [author, setAuthor] = useState("");
  const [city, setCity] = useState("");
  const [perfume, setPerfume] = useState(
    perfumesList.length > 0
      ? locale === "ar"
        ? perfumesList[0].nameAr
        : perfumesList[0].nameFr
      : "Oud Royal — X8"
  );
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [quote, setQuote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Ratings average calculation
  const totalCount = testimonials.length;
  const avgRating = totalCount > 0
    ? (testimonials.reduce((sum, t) => sum + (Number(t.rating) || 5), 0) / totalCount).toFixed(1)
    : "5.0";

  // Visible testimonials (default 3, expandable to all)
  const visibleTestimonials = showAll ? testimonials : testimonials.slice(0, 6);

  const resetForm = () => {
    setAuthor("");
    setCity("");
    setQuote("");
    setRating(5);
    setHoverRating(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!author.trim() || author.trim().length < 2) {
      setErrorMessage(
        locale === "ar"
          ? "يرجى كتابة اسمك (حرفان على الأقل)."
          : "Veuillez renseigner votre nom (au moins 2 caractères)."
      );
      return;
    }

    if (!city.trim() || city.trim().length < 2) {
      setErrorMessage(
        locale === "ar"
          ? "يرجى تحديد مدينتك أو ولايتك."
          : "Veuillez indiquer votre ville ou wilaya."
      );
      return;
    }

    if (!quote.trim() || quote.trim().length < 6) {
      setErrorMessage(
        locale === "ar"
          ? "يرجى كتابة تعليقك (6 أحرف على الأقل)."
          : "Votre avis doit contenir au moins 6 caractères."
      );
      return;
    }

    startTransition(async () => {
      const res = await submitTestimonialAction(
        {
          author: author.trim(),
          city: city.trim(),
          perfume: perfume.trim(),
          rating,
          quote: quote.trim(),
        },
        locale
      );

      if (res.success && res.testimonial) {
        setNewlyAddedId(res.testimonial.id);
        setTestimonials((prev) => [res.testimonial!, ...prev]);
        setSuccessMessage(
          locale === "ar"
            ? "شكراً جزيلاً! تم نشر تقييمك مباشرة على الموقع بنجاح."
            : "Merci beaucoup ! Votre avis a été publié en direct sur notre vitrine."
        );
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 1800);
      } else {
        setErrorMessage(
          res.error ||
            (locale === "ar"
              ? "تعذر إرسال التعليق، يرجى المحاولة مرة أخرى."
              : "Impossible d'enregistrer votre avis. Veuillez réessayer.")
        );
      }
    });
  };

  const getRatingLabel = (val: number) => {
    if (locale === "ar") {
      switch (val) {
        case 1:
          return "مقبول";
        case 2:
          return "متوسط";
        case 3:
          return "جيد";
        case 4:
          return "جيد جداً";
        default:
          return "استثنائي وفخم !";
      }
    }
    switch (val) {
      case 1:
        return "Passable";
      case 2:
        return "Moyen";
      case 3:
        return "Bien";
      case 4:
        return "Très bien";
      default:
        return "Exceptionnel !";
    }
  };

  return (
    <section className="bg-luxury-secondary/40 py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest text-luxury-accent font-semibold">
                {locale === "ar" ? "شهادات الزبائن" : "Témoignages & Avis Vérifiés"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-white text-luxury-accent px-2 py-0.5 rounded-[3px] border border-luxury-border/30 font-medium">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                <span>{avgRating} / 5</span>
                <span className="text-luxury-text-muted">({totalCount} {locale === "ar" ? "تقييم" : "avis"})</span>
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
              {locale === "ar" ? "ثقة وتجارب زبائننا عبر الولايات" : "Ce Que Disent Nos Clients"}
            </h2>
            <p className="text-xs sm:text-sm text-luxury-text-secondary max-w-xl">
              {locale === "ar"
                ? "انطباعات حقيقية من عشاق العطور الذين اختاروا تركيبات إيلين الحرفية لمناسباتهم ويومياتهم."
                : "Découvrez les retours authentiques de nos clients à travers toute l'Algérie sur la tenue, la projection et le sillage de nos créations."}
            </p>
          </div>

          {/* Action Button: Add Comment / Testimonial */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={() => {
                resetForm();
                setIsOpen(true);
              }}
              className="gap-2 shadow-xs text-xs sm:text-sm px-4 py-2.5"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{locale === "ar" ? "أضف تقييمك الآن" : "Donner mon avis"}</span>
            </Button>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTestimonials.map((t) => {
            const isNew = t.id === newlyAddedId;

            return (
              <div
                key={t.id}
                className={`bg-white p-6 sm:p-7 rounded-[6px] shadow-subtle border transition-all duration-300 flex flex-col justify-between relative ${
                  isNew
                    ? "border-luxury-accent/60 ring-2 ring-luxury-accent/20 bg-amber-50/20"
                    : "border-luxury-border/30 hover:border-luxury-border/70"
                }`}
              >
                {/* Quotes mark & Verified badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse text-amber-400">
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
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isNew && (
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-luxury-accent text-white px-1.5 py-0.5 rounded-[2px] animate-pulse">
                        {locale === "ar" ? "جديد" : "Nouveau"}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[2px] border border-emerald-200/60 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{locale === "ar" ? "زبون موثق" : "Avis Vérifié"}</span>
                    </span>
                  </div>
                </div>

                {/* Comment quote text */}
                <div className="space-y-3 flex-1 mb-5">
                  <p className="text-xs sm:text-[13px] text-luxury-text leading-relaxed font-light italic">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author footer */}
                <div className="pt-3.5 border-t border-luxury-border/30 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-serif text-sm font-medium text-luxury-text">
                      {t.author}
                    </h5>
                    <span className="text-[11px] text-luxury-text-muted">{t.city}</span>
                  </div>
                  <span className="text-[10px] text-luxury-accent font-medium bg-luxury-surface px-2 py-0.5 rounded-[2px] border border-luxury-border/30 truncate max-w-[150px]">
                    {t.perfume}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more toggle */}
        {testimonials.length > 6 && (
          <div className="text-center mt-10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-xs gap-1.5"
            >
              <span>
                {showAll
                  ? locale === "ar"
                    ? "عرض أقل"
                    : "Afficher moins"
                  : locale === "ar"
                  ? `عرض جميع التقييمات (${testimonials.length})`
                  : `Voir tous les avis (${testimonials.length})`}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showAll ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: SUBMIT A REVIEW / LAISSER UN AVIS */}
      {/* ============================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-[6px] border border-luxury-border/60 shadow-luxury max-w-lg w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-luxury-border/30 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-semibold block mb-1">
                  {locale === "ar" ? "شاركنا انطباعك" : "Votre Retour d'Expérience"}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-luxury-text">
                  {locale === "ar" ? "أضف تقييمك على عطور إيلين" : "Laisser un Avis Client"}
                </h3>
                <p className="text-xs text-luxury-text-secondary mt-1">
                  {locale === "ar"
                    ? "رأيك يهمنا ويوجه باقي الزبائن لاختيار نفحاتهم العطرية."
                    : "Partagez votre ressenti sur la tenue, le sillage et le packaging de nos fragrances."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-luxury-text-muted hover:text-luxury-text p-1 rounded-[3px] hover:bg-luxury-secondary transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-[4px] bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="p-3 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5 p-3 rounded-[4px] bg-luxury-secondary/25 border border-luxury-border/30 text-center">
                <label className="block text-[11px] uppercase tracking-wider text-luxury-text-muted font-medium">
                  {locale === "ar" ? "تقييمك العام (اضغط على النجوم)" : "Votre Note Globale"}
                </label>

                <div className="flex items-center justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeVal = hoverRating !== null ? hoverRating : rating;
                    const isFilled = starVal <= activeVal;

                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(starVal)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                        title={`${starVal} / 5`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? "fill-amber-400 text-amber-500"
                              : "text-neutral-300 fill-neutral-100"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <span className="text-[11px] font-semibold text-luxury-accent block">
                  {getRatingLabel(hoverRating !== null ? hoverRating : rating)}
                </span>
              </div>

              {/* Author & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-text-muted font-medium mb-1">
                    {locale === "ar" ? "الاسم أو اللقب *" : "Nom ou Prénom *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={locale === "ar" ? "مثال: كريم ب." : "Ex: Karim B."}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-luxury-border/60 rounded-[4px] text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-text-muted font-medium mb-1">
                    {locale === "ar" ? "المدينة أو الولاية *" : "Ville / Wilaya *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={locale === "ar" ? "مثال: وهران أو الجزائر" : "Ex: Alger, Oran, Sétif..."}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-luxury-border/60 rounded-[4px] text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                  />
                </div>
              </div>

              {/* Fragrance selector */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-text-muted font-medium mb-1">
                  {locale === "ar" ? "العطر المجرّب *" : "Parfum ou Coffret Choisi *"}
                </label>
                <div className="relative">
                  <select
                    value={perfume}
                    onChange={(e) => setPerfume(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-luxury-border/60 rounded-[4px] text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent appearance-none cursor-pointer"
                  >
                    {perfumesList.map((p, idx) => {
                      const name = locale === "ar" ? p.nameAr : p.nameFr;
                      return (
                        <option key={idx} value={name}>
                          {name}
                        </option>
                      );
                    })}
                    <option value="Oud Royal — X8 (50ml)">Oud Royal — X8 (50ml)</option>
                    <option value="Imperial Santal (50ml)">Imperial Santal (50ml)</option>
                    <option value="Fleur de Soie (50ml)">Fleur de Soie (50ml)</option>
                    <option value="Rose Impériale (30ml)">Rose Impériale (30ml)</option>
                    <option value="Coffret Sur-Mesure (3 Flacons)">
                      {locale === "ar" ? "صندوق 3 عطور مخصص (Coffret)" : "Coffret Sur-Mesure (3 Flacons)"}
                    </option>
                    <option value="Autre parfum Éline">
                      {locale === "ar" ? "عطر آخر من دار إيلين" : "Autre parfum Éline"}
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-luxury-text-muted pointer-events-none absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Quote / Review Text */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-text-muted font-medium mb-1">
                  {locale === "ar" ? "تعليقك وتقييمك *" : "Votre Témoignage / Commentaire *"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder={
                    locale === "ar"
                      ? "شاركنا رأيك في ثبات العطر، فخامة القارورة، والتوصيل..."
                      : "Partagez vos impressions sur la tenue du parfum, la finesse du sillage, la rapidité de la livraison..."
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-luxury-border/60 rounded-[4px] text-luxury-text focus:outline-none focus:ring-1 focus:ring-luxury-accent"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="text-xs"
                >
                  <span>{locale === "ar" ? "إلغاء" : "Annuler"}</span>
                </Button>

                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={isPending}
                  className="text-xs min-w-[120px]"
                >
                  {isPending ? (
                    <span className="inline-block animate-spin mr-1">⏳</span>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isPending
                      ? locale === "ar"
                        ? "جاري النشر..."
                        : "Publication..."
                      : locale === "ar"
                      ? "نشر التقييم"
                      : "Publier mon avis"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
