"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createAdminMember,
  updateAdminMember,
  toggleAdminStatus,
  deleteAdminMember,
  resetAdminPassword,
  getTeamMembers,
} from "@/lib/services/team.service";
import { AdminPermissions, AdminRole, ALL_PERMISSIONS_KEYS, ROLE_PRESETS } from "@/types/admin-role";
import { requireAdminPermission } from "@/lib/security/auth-guard";

export async function createAdminAction(prevState: unknown, formData: FormData) {
  try {
    const locale = formData.get("locale")?.toString() || "fr";
    await requireAdminPermission("settings_team", locale);

    const email = formData.get("email")?.toString() || "";
    const fullName = formData.get("fullName")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const role = (formData.get("role")?.toString() || "order_manager") as AdminRole;

    if (!email || !fullName) {
      return { success: false, error: locale === "ar" ? "يرجى ملء جميع الحقول الإلزامية." : "Veuillez remplir les champs obligatoires." };
    }

    const effectivePassword = password.trim() || "Eline2026!";
    if (effectivePassword.length < 6) {
      return {
        success: false,
        error:
          locale === "ar"
            ? "كلمة المرور يجب أن لا تقل عن 6 أحرف."
            : "Le mot de passe doit comporter au moins 6 caractères.",
      };
    }

    // Extract individual permissions
    const permissions: Partial<AdminPermissions> = {};
    for (const key of ALL_PERMISSIONS_KEYS) {
      permissions[key] = formData.get(`perm_${key}`) === "on";
    }

    const res = await createAdminMember({
      email,
      fullName,
      phone,
      password: effectivePassword,
      role,
      permissions,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath(`/${locale}/admin/team`);
    revalidatePath(`/${locale}/admin`);

    return {
      success: true,
      member: res.member,
      message:
        locale === "ar"
          ? "تمت إضافة المسؤول بنجاح وتحديد صلاحياته."
          : "L'administrateur a été créé avec succès et ses accès sont opérationnels.",
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur inattendue" };
  }
}

export async function updateAdminAction(prevState: unknown, formData: FormData) {
  try {
    const locale = formData.get("locale")?.toString() || "fr";
    await requireAdminPermission("settings_team", locale);

    const id = formData.get("id")?.toString() || "";
    const fullName = formData.get("fullName")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const role = (formData.get("role")?.toString() || "custom") as AdminRole;

    if (!id || !fullName) {
      return { success: false, error: "Informations invalides" };
    }

    const permissions: Partial<AdminPermissions> = {};
    for (const key of ALL_PERMISSIONS_KEYS) {
      permissions[key] = formData.get(`perm_${key}`) === "on";
    }

    const password = formData.get("password")?.toString() || "";

    const res = await updateAdminMember(id, {
      fullName,
      phone,
      role,
      permissions: permissions as AdminPermissions,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    if (password && password.length >= 6) {
      await resetAdminPassword(id, password);
    }

    revalidatePath(`/${locale}/admin/team`);
    revalidatePath(`/${locale}/admin`);

    return {
      success: true,
      message: locale === "ar" ? "تم تحديث الصلاحيات بنجاح." : "Permissions mises à jour avec succès.",
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur inattendue" };
  }
}

export async function toggleAdminStatusAction(
  id: string,
  locale: string = "fr"
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  try {
    await requireAdminPermission("settings_team", locale);
    const res = await toggleAdminStatus(id);
    revalidatePath(`/${locale}/admin/team`);
    revalidatePath(`/${locale}/admin`);
    return res;
  } catch (err: any) {
    return { success: false, error: err?.message || "Non autorisé" };
  }
}

export async function deleteAdminAction(id: string, locale: string = "fr") {
  try {
    await requireAdminPermission("settings_team", locale);
    const res = await deleteAdminMember(id);
    revalidatePath(`/${locale}/admin/team`);
    revalidatePath(`/${locale}/admin`);
    return res;
  } catch (err: any) {
    return { success: false, error: err?.message || "Non autorisé" };
  }
}

export async function setSimulatedRoleAction(roleOrId: string | null, locale: string = "fr") {
  try {
    const { authInfo } = await requireAdminPermission("settings_team", locale);
    if (!authInfo.isRealOwner) {
      return { success: false, error: "Seul le Super Administrateur peut activer la simulation." };
    }

    const cookieStore = await cookies();
    if (!roleOrId || roleOrId === "real_owner") {
      cookieStore.delete("eline_admin_simulation");
    } else {
      cookieStore.set("eline_admin_simulation", roleOrId, {
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: "lax",
      });
    }
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/orders`);
    revalidatePath(`/${locale}/admin/products`);
    revalidatePath(`/${locale}/admin/sales`);
    revalidatePath(`/${locale}/admin/ui-controller`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Non autorisé" };
  }
}

export async function resetAdminPasswordAction(id: string, newPassword: string, locale: string = "fr") {
  try {
    await requireAdminPermission("settings_team", locale);

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error:
          locale === "ar"
            ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل."
            : "Le mot de passe doit comporter au moins 6 caractères.",
      };
    }

    const res = await resetAdminPassword(id, newPassword);
    if (res.success) {
      revalidatePath(`/${locale}/admin/team`);
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err?.message || "Non autorisé" };
  }
}
