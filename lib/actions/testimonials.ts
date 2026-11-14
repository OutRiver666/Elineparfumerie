"use server";

import { revalidatePath } from "next/cache";
import { CreateTestimonialInput, Testimonial } from "@/types/testimonial";
import { addTestimonial, deleteTestimonial, getTestimonials } from "@/lib/services/testimonials.service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function submitTestimonialAction(
  input: CreateTestimonialInput,
  locale: string = "fr"
): Promise<{ success: boolean; testimonial?: Testimonial; error?: string }> {
  try {
    const res = await addTestimonial(input);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    // Revalidate paths so the home page updates instantly
    revalidatePath("/");
    revalidatePath("/fr");
    revalidatePath("/ar");
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/admin/ui-controller`);

    return { success: true, testimonial: res.testimonial };
  } catch (error: any) {
    console.error("[submitTestimonialAction] Error:", error);
    return {
      success: false,
      error:
        locale === "ar"
          ? "حدث خطأ غير متوقع أثناء إرسال تقييمك."
          : "Une erreur est survenue lors de l'enregistrement de votre avis.",
    };
  }
}

export async function deleteTestimonialAction(
  id: string,
  locale: string = "fr"
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaff(locale);

    const res = await deleteTestimonial(id);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/");
    revalidatePath("/fr");
    revalidatePath("/ar");
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/admin/ui-controller`);

    return { success: true };
  } catch (error: any) {
    console.error("[deleteTestimonialAction] Error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la suppression.",
    };
  }
}

export async function fetchAllTestimonialsAdminAction(
  locale: string = "fr"
): Promise<{ success: boolean; testimonials?: Testimonial[]; error?: string }> {
  try {
    await requireStaff(locale);
    const list = await getTestimonials(true);
    return { success: true, testimonials: list };
  } catch (error: any) {
    return { success: false, error: error?.message || "Erreur de chargement des avis." };
  }
}

async function requireStaff(locale: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);

  const admin = createAdminClient();
  const { data: profile } = await (admin.from("profiles") as any)
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active || !["owner", "manager"].includes(profile.role)) {
    redirect(`/${locale}/admin/login?error=unauthorized`);
  }
  return user;
}
