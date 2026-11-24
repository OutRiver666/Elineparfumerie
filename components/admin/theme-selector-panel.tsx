"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Locale } from "@/lib/i18n";
import {
  STOREFRONT_THEMES,
  StorefrontThemeDefinition,
  StorefrontThemeId,
} from "@/lib/themes/storefront-themes";
import { setStorefrontThemeAction } from "@/lib/actions/storefront-content";
import {
  Check,
  Sparkles,
  ExternalLink,
  Loader2,
  Moon,
  Sun,
  Type,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";

interface ThemeSelectorPanelProps {
  currentThemeId: StorefrontThemeId;
  onThemeApplied: (themeId: StorefrontThemeId) => void;
  locale: Locale;
}

function getFontPreviewVar(themeId: StorefrontThemeId): string {
  switch (themeId) {
    case "azur-riviera":
    case "emeraude-imperiale":
      return "var(--font-cormorant), Georgia, serif";
    case "oud-noir":
      return "var(--font-cinzel), Georgia, serif";
    case "rose-de-grasse":
      return "var(--font-bodoni), Georgia, serif";
    case "sahara-ambre":
      return "var(--font-fraunces), Georgia, serif";
    case "monochrome-editorial":
      return "var(--font-syne), sans-serif";
    case "midnight-sapphire":
      return "var(--font-prata), Georgia, serif";
    default:
      return "var(--font-serif), Georgia, serif";
  }
}

function ThemeMiniPreview({ theme }: { theme: StorefrontThemeDefinition }) {
  const { bg, surface, primary, accent, text } = theme.swatches;
  const displayFont = getFontPreviewVar(theme.id);

  return (
    <div
      className="relative h-44 w-full overflow-hidden border-b border-zinc-200/80 select-none"
      style={{ backgroundColor: bg, color: text }}
    >
      {/* Mini Navbar */}
      <div
        className="flex items-center justify-between px-3.5 py-2 border-b"
        style={{
          borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          backgroundColor: theme.id === "azur-riviera" ? "#0A1E3F" : bg,
          color: theme.id === "azur-riviera" ? "#FFFFFF" : text,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 rounded-full opacity-50" style={{ backgroundColor: "currentColor" }} />
          <span className="w-4 h-1 rounded-full opacity-35" style={{ backgroundColor: "currentColor" }} />
        </div>
        <span
          className="text-[11px] tracking-[0.22em] uppercase font-semibold"
          style={{ fontFamily: displayFont }}
        >
          ÉLINE
        </span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full opacity-50" style={{ backgroundColor: accent }} />
        </div>
      </div>

      {/* Architectural Hero Miniature per Theme */}
      {theme.previewHeroType === "split-classic" && (
        <div className="grid grid-cols-2 h-[142px] p-3.5 gap-3 items-center" style={{ backgroundColor: surface }}>
          <div className="space-y-1.5">
            <span className="inline-block px-1.5 py-0.5 text-[7px] uppercase tracking-widest rounded-sm" style={{ backgroundColor: bg, color: accent }}>
              Atelier
            </span>
            <p className="text-[13px] leading-tight font-medium" style={{ fontFamily: displayFont }}>
              L&apos;Essence d&apos;Éline
            </p>
            <div className="flex gap-1 pt-1">
              <span className="px-2 py-1 text-[7px] rounded-sm text-white" style={{ backgroundColor: primary }}>
                Catalogue
              </span>
              <span className="px-2 py-1 text-[7px] rounded-sm border" style={{ borderColor: accent, color: text }}>
                Coffrets
              </span>
            </div>
          </div>
          <div className="h-full rounded-md relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}33, ${primary}22)` }}>
            <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-sm bg-white/95 shadow-xs">
              <div className="w-8 h-1 rounded-full mb-1" style={{ backgroundColor: accent }} />
              <div className="w-12 h-1 rounded-full bg-zinc-800" />
            </div>
          </div>
        </div>
      )}

      {theme.previewHeroType === "riviera-coastal" && (
        <div
          className="grid grid-cols-12 h-[142px] p-3 gap-2.5 items-center"
          style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #EAF4FF 55%, #D6EAFF 100%)" }}
        >
          <div className="col-span-7 space-y-1.5">
            <span className="inline-block px-2 py-0.5 text-[7px] font-bold uppercase tracking-wider rounded-full bg-sky-100 text-sky-700 border border-sky-200">
              Azur Riviera
            </span>
            <p className="text-[14px] leading-tight font-semibold" style={{ fontFamily: displayFont, color: "#0A1E3F" }}>
              Fraîcheur &amp; Prestige Marin
            </p>
            <div className="flex gap-1 pt-0.5">
              <span className="px-2.5 py-1 text-[7px] font-semibold rounded-full text-white" style={{ backgroundColor: "#0A1E3F" }}>
                Explorer
              </span>
              <span className="px-2 py-1 text-[7px] font-semibold rounded-full text-white" style={{ backgroundColor: "#1D78D8" }}>
                Packs
              </span>
            </div>
          </div>
          <div
            className="col-span-5 h-full rounded-2xl relative overflow-hidden border-2 border-white shadow-sm"
            style={{ background: "linear-gradient(160deg, #0A1E3F 0%, #1D78D8 65%, #7DD3FC 100%)" }}
          >
            <div className="absolute bottom-2 inset-x-2 rounded-xl bg-white/95 px-2 py-1 text-[7px] font-bold text-[#0A1E3F]">
              Oud Azur • 50ml
            </div>
          </div>
        </div>
      )}

      {theme.previewHeroType === "cinematic-dark" && (
        <div
          className="h-[142px] flex flex-col items-center justify-center text-center px-4 relative"
          style={{
            background: "radial-gradient(circle at 50% 35%, rgba(212,175,106,0.22), #09090B 72%)",
          }}
        >
          <div className="absolute inset-2.5 border pointer-events-none" style={{ borderColor: "rgba(212,175,106,0.28)" }} />
          <span className="text-[7px] tracking-[0.28em] uppercase mb-1" style={{ color: accent }}>
            HAUTE PARFUMERIE NOCTURNE
          </span>
          <p className="text-[15px] tracking-[0.12em] uppercase" style={{ fontFamily: displayFont, color: text }}>
            OUD NOIR ÉLINE
          </p>
          <div className="flex gap-1.5 mt-2.5">
            <span className="px-2.5 py-1 text-[7px] tracking-widest uppercase font-semibold" style={{ backgroundColor: accent, color: "#09090B" }}>
              Découvrir
            </span>
            <span className="px-2 py-1 text-[7px] tracking-widest uppercase border" style={{ borderColor: "rgba(212,175,106,0.5)", color: accent }}>
              Coffret
            </span>
          </div>
        </div>
      )}

      {theme.previewHeroType === "arched-couture" && (
        <div className="grid grid-cols-12 h-[142px] px-4 py-2.5 gap-3 items-center" style={{ backgroundColor: bg }}>
          <div className="col-span-7 space-y-1.5">
            <span className="inline-block px-2 py-0.5 text-[7px] italic rounded-full" style={{ backgroundColor: surface, color: accent }}>
              Maison Couture
            </span>
            <p className="text-[14px] leading-tight" style={{ fontFamily: displayFont, color: primary }}>
              Velours &amp; Pétales de Grasse
            </p>
            <span className="inline-block px-2.5 py-1 text-[7px] rounded-full text-white mt-0.5" style={{ backgroundColor: accent }}>
              Collection Privée
            </span>
          </div>
          <div className="col-span-5 h-full flex items-end justify-center">
            <div
              className="w-20 h-[116px] rounded-t-full border-2 p-1"
              style={{ borderColor: `${accent}55`, backgroundColor: surface }}
            >
              <div
                className="w-full h-full rounded-t-full"
                style={{ background: `linear-gradient(180deg, ${accent}35, ${accent}88)` }}
              />
            </div>
          </div>
        </div>
      )}

      {theme.previewHeroType === "royal-emerald" && (
        <div
          className="h-[142px] p-3 flex items-center justify-between gap-3 relative"
          style={{ backgroundColor: "#0D2B22", color: "#FBF8F1" }}
        >
          <div className="absolute inset-2 border pointer-events-none" style={{ borderColor: "rgba(197,160,89,0.45)" }} />
          <div className="space-y-1.5 z-10 pl-2">
            <span className="text-[7px] uppercase tracking-[0.24em] block" style={{ color: accent }}>
              MAISON IMPÉRIALE
            </span>
            <p className="text-[14px] leading-tight font-semibold" style={{ fontFamily: displayFont }}>
              Émeraude &amp; Or Royal
            </p>
            <span className="inline-block px-2.5 py-1 text-[7px] uppercase tracking-wider font-semibold" style={{ backgroundColor: accent, color: "#0D2B22" }}>
              Explorer
            </span>
          </div>
          <div
            className="w-20 h-24 z-10 mr-2 border p-1 shrink-0"
            style={{ borderColor: accent, background: "linear-gradient(145deg, rgba(197,160,89,0.28), rgba(13,43,34,0.8))" }}
          />
        </div>
      )}

      {theme.previewHeroType === "sculptural-amber" && (
        <div className="grid grid-cols-12 h-[142px] p-3 gap-2.5 items-center" style={{ backgroundColor: bg }}>
          <div
            className="col-span-6 h-full rounded-2xl p-2.5 flex flex-col justify-end"
            style={{ background: "linear-gradient(150deg, #D99756 0%, #B85328 100%)", color: "#FFF8F0" }}
          >
            <span className="text-[7px] uppercase tracking-widest opacity-85">Sahara</span>
            <p className="text-[12px] font-semibold leading-tight" style={{ fontFamily: displayFont }}>
              Ambre Doré
            </p>
          </div>
          <div className="col-span-6 space-y-1.5">
            <p className="text-[13px] leading-tight font-medium" style={{ fontFamily: displayFont, color: primary }}>
              Chaleur &amp; Sillage Solaire
            </p>
            <div className="flex gap-1">
              <span className="px-2 py-1 text-[7px] rounded-md text-white" style={{ backgroundColor: accent }}>
                Catalogue
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 pt-1">
              <div className="h-5 rounded-md" style={{ backgroundColor: surface }} />
              <div className="h-5 rounded-md" style={{ backgroundColor: surface }} />
            </div>
          </div>
        </div>
      )}

      {theme.previewHeroType === "magazine-grid" && (
        <div className="h-[142px] p-3 flex flex-col justify-between bg-white text-black">
          <div className="flex items-baseline justify-between border-b border-black pb-1.5">
            <p className="text-[15px] font-extrabold tracking-tight uppercase leading-none" style={{ fontFamily: displayFont }}>
              ÉLINE N°08
            </p>
            <span className="text-[7px] font-mono uppercase tracking-widest">PARIS • ALGER</span>
          </div>
          <div className="grid grid-cols-12 gap-2 flex-1 pt-2">
            <div className="col-span-5 flex flex-col justify-between border-r border-black/20 pr-2">
              <span className="text-[7px] font-mono text-zinc-500">01 / EXTRAITS</span>
              <span className="px-2 py-1 text-[7px] font-bold uppercase tracking-widest bg-black text-white text-center">
                SHOP NOW
              </span>
            </div>
            <div className="col-span-7 bg-zinc-900 text-white p-2 flex items-end justify-between">
              <span className="text-[7px] font-mono">EDITION 2026</span>
              <span className="w-3 h-3 border border-white/60" />
            </div>
          </div>
        </div>
      )}

      {theme.previewHeroType === "celestial-glow" && (
        <div
          className="h-[142px] grid grid-cols-12 p-3.5 gap-2.5 items-center relative overflow-hidden"
          style={{
            background: "radial-gradient(circle at 78% 45%, rgba(88,166,255,0.34), #061124 68%)",
          }}
        >
          <div className="col-span-7 space-y-1.5 z-10">
            <span className="inline-block px-2 py-0.5 text-[7px] uppercase tracking-widest rounded-md border" style={{ borderColor: "rgba(88,166,255,0.4)", color: "#93C5FD", backgroundColor: "rgba(14,31,61,0.7)" }}>
              Midnight
            </span>
            <p className="text-[14px] leading-tight text-white" style={{ fontFamily: displayFont }}>
              Saphir de Minuit
            </p>
            <span className="inline-block px-2.5 py-1 text-[7px] font-semibold rounded-md text-[#061124]" style={{ backgroundColor: "#93C5FD" }}>
              Découvrir
            </span>
          </div>
          <div className="col-span-5 h-full rounded-xl border border-sky-400/30 bg-sky-950/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-10 h-14 rounded-lg bg-gradient-to-b from-sky-300/40 to-blue-900/60 border border-sky-300/40" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ThemeSelectorPanel({
  currentThemeId,
  onThemeApplied,
  locale,
}: ThemeSelectorPanelProps) {
  const isAr = locale === "ar";
  const [applyingId, setApplyingId] = useState<StorefrontThemeId | null>(null);

  const activeTheme =
    STOREFRONT_THEMES.find((t) => t.id === currentThemeId) || STOREFRONT_THEMES[0];

  const handleSelectTheme = async (themeId: StorefrontThemeId) => {
    if (applyingId) return;
    setApplyingId(themeId);
    try {
      const res = await setStorefrontThemeAction(themeId, locale);
      if (res.success) {
        onThemeApplied(themeId);
        const chosen = STOREFRONT_THEMES.find((t) => t.id === themeId);
        toast.success(
          isAr
            ? `تم تفعيل تصميم "${chosen?.nameAr}" على المتجر بنجاح!`
            : `Thème « ${chosen?.nameFr} » activé sur toute la boutique !`
        );
      } else {
        toast.error(res.error || "Erreur lors de l'activation du thème");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur réseau");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Theme Summary Banner */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl border border-zinc-200 flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: activeTheme.swatches.bg }}
          >
            <Sparkles className="w-5 h-5" style={{ color: activeTheme.swatches.accent }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {isAr ? "التصميم النشط حالياً" : "Thème Actif sur la Boutique"}
              </span>
              <span className="text-xs font-bold text-zinc-900">
                {isAr ? activeTheme.nameAr : activeTheme.nameFr}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isAr ? activeTheme.layoutStyleAr : activeTheme.layoutStyleFr} •{" "}
              <span className="font-semibold text-zinc-700">
                {activeTheme.fontDisplayLabel} + {activeTheme.fontBodyLabel}
              </span>
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto"
        >
          <span>{isAr ? "معاينة التصميم المباشر" : "Aperçu Live du Site"}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 8 Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {STOREFRONT_THEMES.map((theme) => {
          const isSelected = theme.id === currentThemeId;
          const isApplying = applyingId === theme.id;

          return (
            <div
              key={theme.id}
              className={`group rounded-2xl border bg-white overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? "border-zinc-900 ring-2 ring-zinc-900/15 shadow-md"
                  : "border-zinc-200/90 hover:border-zinc-400 hover:shadow-sm"
              }`}
            >
              <div>
                {/* Miniature Architectural Preview */}
                <div className="relative">
                  <ThemeMiniPreview theme={theme} />
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
                      <Check className="w-3 h-3" />
                      <span>{isAr ? "مفعّل" : "Actif"}</span>
                    </span>
                  )}
                  <span
                    className={`absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-sm ${
                      theme.mode === "dark"
                        ? "bg-black/70 text-amber-200 border border-white/15"
                        : "bg-white/90 text-zinc-700 border border-zinc-200/80"
                    }`}
                  >
                    {theme.mode === "dark" ? (
                      <Moon className="w-2.5 h-2.5" />
                    ) : (
                      <Sun className="w-2.5 h-2.5" />
                    )}
                    <span>
                      {theme.mode === "dark"
                        ? isAr
                          ? "داكن"
                          : "Sombre"
                        : isAr
                        ? "فاتح"
                        : "Clair"}
                    </span>
                  </span>
                </div>

                {/* Theme Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-950">
                      {isAr ? theme.nameAr : theme.nameFr}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                      {isAr ? theme.taglineAr : theme.taglineFr}
                    </p>
                  </div>

                  {/* Layout & Font Metadata */}
                  <div className="space-y-1.5 text-[10.5px] bg-zinc-50 border border-zinc-100 rounded-lg p-2.5">
                    <div className="flex items-start gap-1.5 text-zinc-600">
                      <LayoutTemplate className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        {isAr ? theme.layoutStyleAr : theme.layoutStyleFr}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600">
                      <Type className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate font-medium">
                        {theme.fontDisplayLabel} • {theme.fontBodyLabel}
                      </span>
                    </div>
                  </div>

                  {/* Palette Swatches */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {[
                        theme.swatches.bg,
                        theme.swatches.surface,
                        theme.swatches.accent,
                        theme.swatches.primary,
                      ].map((hex, idx) => (
                        <span
                          key={idx}
                          title={hex}
                          className="w-5 h-5 rounded-full border border-zinc-300/80 shadow-2xs"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      AR: {theme.fontArabicLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="px-4 pb-4">
                <button
                  type="button"
                  disabled={isSelected || Boolean(applyingId)}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                      : "bg-zinc-900 hover:bg-black text-white shadow-xs disabled:opacity-50"
                  }`}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isAr ? "جاري التفعيل..." : "Application..."}</span>
                    </>
                  ) : isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? "التصميم المفعّل" : "Thème appliqué"}</span>
                    </>
                  ) : (
                    <span>{isAr ? "تطبيق هذا التصميم" : "Appliquer ce thème"}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
