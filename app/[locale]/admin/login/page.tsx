import React from "react";
import { Locale } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import Link from "next/link";
import { Globe, ArrowLeft, KeyRound, Sparkles } from "lucide-react";

interface AdminLoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const resolved = await params;
  const locale = (resolved.locale === "ar" ? "ar" : "fr") as Locale;

  // If already logged in, redirect directly to dashboard
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(`/${locale}/admin`);
  }

  const otherLocale: Locale = locale === "fr" ? "ar" : "fr";

  return (
    <div className="min-h-screen bg-luxury-secondary/50 flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Bar with Language Toggle and Storefront Link */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-xs">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-luxury-text-secondary hover:text-luxury-text transition-colors"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${locale === "ar" ? "rotate-180" : ""}`} />
          <span>{locale === "ar" ? "العودة إلى المتجر" : "Retour à la boutique"}</span>
        </Link>

        <Link
          href={`/${otherLocale}/admin/login`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-white border border-luxury-border/60 text-luxury-text hover:text-luxury-accent transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-luxury-accent" />
          <span className="font-medium uppercase tracking-wider">
            {locale === "ar" ? "Français" : "العربية"}
          </span>
        </Link>
      </div>

      {/* Centered Login Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white border border-luxury-border/40 rounded-[6px] shadow-sm p-8 sm:p-10">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <span className="text-[11px] uppercase tracking-[0.3em] text-luxury-accent font-semibold block mb-2">
              Éline Parfumerie
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-text">
              {locale === "ar" ? "بوابة الإدارة والورشة" : "Portail d'Administration"}
            </h1>
            <p className="text-xs text-luxury-text-secondary mt-2">
              {locale === "ar"
                ? "لوحة التحكم الخاصة بإدارة الطلبيات والمخزون وتركيبات العطور"
                : "Accès réservé aux gestionnaires et au personnel de l'atelier"}
            </p>
          </div>

          {/* Form */}
          <AdminLoginForm locale={locale} />

          {/* First-time Setup Guidance Box */}
          <div className="mt-8 pt-6 border-t border-luxury-border/40 text-[11px] text-luxury-text-secondary leading-relaxed">
            <div className="flex items-start gap-2 bg-luxury-secondary/70 p-3 rounded-[4px]">
              <KeyRound className="w-4 h-4 text-luxury-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-luxury-text mb-0.5">
                  {locale === "ar" ? "إنشاء حساب المشرف الأول:" : "Créer le premier administrateur :"}
                </p>
                <p>
                  {locale === "ar"
                    ? "في لوحة تحكم Supabase > Authentication > Users، اضغط على «Add user» وأدخل بريدك الإلكتروني وكلمة المرور، ثم سجل دخولك هنا مباشرة."
                    : "Dans votre console Supabase > Authentication > Users, cliquez sur « Add user », saisissez votre email et mot de passe, puis connectez-vous ici."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer copyright */}
        <p className="text-center text-[11px] text-luxury-text-muted mt-6">
          © {new Date().getFullYear()} Éline Parfumerie. Alger, Algérie.
        </p>
      </div>

      {/* Empty bottom spacer for symmetrical centering */}
      <div className="h-6" />
    </div>
  );
}
