"use client";

import React, { useTransition } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { setSimulatedRoleAction } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";

interface SimulationBannerProps {
  locale?: Locale;
  simulatedRole?: string | null;
}

export function SimulationBanner({
  locale = "fr",
  simulatedRole,
}: SimulationBannerProps) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const handleExitSimulation = () => {
    startTransition(async () => {
      await setSimulatedRoleAction(null, locale);
      window.location.reload();
    });
  };

  const roleName =
    isAr
      ? simulatedRole === "order_manager"
        ? "مؤكد الطلبيات (Call Center)"
        : simulatedRole === "catalog_manager"
        ? "مسير الكتالوج والمخزون"
        : simulatedRole === "vitrine_manager"
        ? "مسؤول الواجهة والآراء"
        : "دور مخصص"
      : simulatedRole === "order_manager"
      ? "Confirmateur de Commandes"
      : simulatedRole === "catalog_manager"
      ? "Gestionnaire Catalogue & Stock"
      : simulatedRole === "vitrine_manager"
      ? "Responsable Vitrine & Avis"
      : "Rôle Personnalisé";

  return (
    <div className="bg-amber-500 text-white px-3 sm:px-4 py-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md z-30 select-none animate-fadeIn">
      <div className="flex items-start sm:items-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
        <span className="font-medium leading-snug">
          {isAr ? (
            <>
              وضع المعاينة مفعّل : أنت تتصفح لوحة التحكم حالياً بدور <strong>{roleName}</strong>.
            </>
          ) : (
            <>
              Mode simulation actif : Vous prévisualisez l'interface en tant que <strong>{roleName}</strong>.
            </>
          )}
        </span>
      </div>

      <button
        onClick={handleExitSimulation}
        disabled={isPending}
        className="self-start sm:self-auto px-3 py-1 rounded bg-black/25 hover:bg-black/40 text-white font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
        <span>{isAr ? "إنهاء المعاينة" : "Quitter la simulation"}</span>
      </button>
    </div>
  );
}
