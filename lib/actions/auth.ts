"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { z } from "zod";
import { redirect } from "next/navigation";
import { getAdminMemberByEmail } from "@/lib/services/team.service";
import { ROLE_PRESETS, AdminRole } from "@/types/admin-role";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères"),
  locale: z.enum(["fr", "ar"]).default("fr"),
});

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function adminLogin(
  prevState: unknown,
  formData: FormData
): Promise<LoginResult> {
  const rawEmail = formData.get("email")?.toString() || "";
  const rawPassword = formData.get("password")?.toString() || "";
  const rawLocale = formData.get("locale")?.toString() || "fr";

  const parsed = loginSchema.safeParse({
    email: rawEmail.trim(),
    password: rawPassword,
    locale: rawLocale,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Données invalides",
    };
  }

  const { email, password, locale } = parsed.data;

  // Rate limit: max 20 login attempts per 5 minutes per email address
  const rateLimit = await checkRateLimit(`login:${email.toLowerCase()}`, {
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      error:
        locale === "ar"
          ? "تجاوزت الحد المسموح من المحاولات. يرجى الانتظار 15 دقيقة."
          : "Trop de tentatives de connexion échouées. Veuillez patienter 15 minutes.",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error:
          locale === "ar"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
            : "Email ou mot de passe incorrect.",
      };
    }

    // Ensure profile exists in profiles table with active owner role
    const adminClient = createAdminClient();
    const { data: rawProfile } = await (adminClient.from("profiles") as any)
      .select("role, is_active")
      .eq("id", data.user.id)
      .single();

    const profile = rawProfile as { role?: string; is_active?: boolean } | null;

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return {
        success: false,
        error:
          locale === "ar"
            ? "تم تعطيل هذا الحساب من قبل الإدارة."
            : "Ce compte administrateur a été désactivé.",
      };
    }

    if (!profile) {
      const userEmail = data.user.email || "";
      const member = userEmail ? await getAdminMemberByEmail(userEmail) : null;
      const assignedRole = member?.role || "order_manager";
      const isOwner = assignedRole === "owner";
      const permissions =
        member?.permissions ||
        (assignedRole in ROLE_PRESETS
          ? ROLE_PRESETS[assignedRole as Exclude<AdminRole, "custom">].permissions
          : ROLE_PRESETS.order_manager.permissions);

      await (adminClient.from("profiles") as any).upsert(
        {
          id: data.user.id,
          email: data.user.email,
          full_name:
            member?.fullName ||
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "Administrateur",
          role: isOwner ? "owner" : "employee",
          permissions: {
            ...permissions,
            assigned_role: assignedRole,
          },
          is_active: member?.isActive ?? true,
        },
        { onConflict: "id" }
      );
    }

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        locale === "ar"
          ? "حدث خطأ أثناء تسجيل الدخول. يرجى التحقق من اتصالك."
          : "Erreur lors de l'authentification. Veuillez réessayer.",
    };
  }
}

export async function adminLogout(locale: string = "fr") {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout network errors
  }
  redirect(`/${locale}/admin/login`);
}
