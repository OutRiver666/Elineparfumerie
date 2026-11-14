import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  locale?: Locale;
  requiredPermissionNameFr?: string;
  requiredPermissionNameAr?: string;
  fallbackHref?: string;
}

export function AccessDenied({
  locale = "fr",
  requiredPermissionNameFr = "cette section",
  requiredPermissionNameAr = "هذا القسم",
  fallbackHref,
}: AccessDeniedProps) {
  const isAr = locale === "ar";
  const defaultFallback = fallbackHref || `/${locale}/admin`;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-luxury-border/60 rounded-[8px] p-8 text-center shadow-sm space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-200/60 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>{isAr ? "وصول مقيّد" : "Accès Restreint"}</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-luxury-text">
            {isAr ? "غير مصرح لك بالدخول" : "Autorisation Insuffisante"}
          </h3>
          <p className="text-xs text-luxury-text-secondary leading-relaxed">
            {isAr
              ? `حسابك لا يمتلك الصلاحيات الإدارية المطلوبة للوصول إلى ${requiredPermissionNameAr}. يرجى التواصل مع المدير العام (Super Admin) لتعديل مستوى أذوناتك.`
              : `Votre profil administrateur ne dispose pas des droits requis pour accéder à ${requiredPermissionNameFr}. Veuillez contacter le Super Administrateur pour ajuster vos permissions.`}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link href={defaultFallback}>
            <Button variant="default" size="sm" className="gap-2">
              {isAr ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة للوحة الرئيسية</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour à l'accueil autorisé</span>
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
