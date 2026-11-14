"use client";

import React, { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { adminLogin, LoginResult } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Loader2, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AdminLoginFormProps {
  locale: Locale;
}

const initialState: LoginResult = {
  success: false,
};

export function AdminLoginForm({ locale }: AdminLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || `/${locale}/admin`;

  const [state, formAction, isPending] = useActionState(adminLogin, initialState);

  useEffect(() => {
    if (state.success) {
      router.push(nextUrl);
      router.refresh();
    }
  }, [state.success, router, nextUrl]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />

      {state.error && (
        <div className="p-3.5 rounded-[4px] bg-red-50 border border-red-200/60 flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <p className="leading-relaxed">{state.error}</p>
        </div>
      )}

      {/* Email input */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs uppercase tracking-wider text-luxury-text font-medium"
        >
          {locale === "ar" ? "البريد الإلكتروني" : "Adresse Email"}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-luxury-text-muted">
            <Mail className="w-4 h-4" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={locale === "ar" ? "admin@elineparfumerie.dz" : "admin@elineparfumerie.dz"}
            className="ps-10 h-11 bg-white border-luxury-border/60 focus:border-luxury-accent focus:ring-1 focus:ring-luxury-accent text-sm"
          />
        </div>
      </div>

      {/* Password input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs uppercase tracking-wider text-luxury-text font-medium"
          >
            {locale === "ar" ? "كلمة المرور" : "Mot de passe"}
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-luxury-text-muted">
            <Lock className="w-4 h-4" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="ps-10 h-11 bg-white border-luxury-border/60 focus:border-luxury-accent focus:ring-1 focus:ring-luxury-accent text-sm"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-luxury-text hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-sm gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-luxury-accent" />
            <span>{locale === "ar" ? "جارٍ التحقق..." : "Connexion en cours..."}</span>
          </>
        ) : (
          <>
            <span>{locale === "ar" ? "تسجيل الدخول" : "Accéder à l'administration"}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {/* Security notice */}
      <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-luxury-text-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-luxury-accent" />
        <span>
          {locale === "ar"
            ? "جلسة مشفرة ومحمية ببروتوكول Supabase Auth"
            : "Session chiffrée & protégée par Supabase Auth"}
        </span>
      </div>
    </form>
  );
}
