import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { getStorefrontContent } from "@/lib/services/storefront-content.service";
import { getTestimonials } from "@/lib/services/testimonials.service";
import { UiControllerClient } from "@/components/admin/ui-controller-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEffectiveAdminPermissions } from "@/lib/services/team.service";
import { AccessDenied } from "@/components/admin/access-denied";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface UiControllerPageProps {
  params: Promise<{ locale: string }>;
}

export default async function UiControllerPage({ params }: UiControllerPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  // Check auth and permissions
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const simulatedRole = cookieStore.get("eline_admin_simulation")?.value || null;
  const authInfo = await getEffectiveAdminPermissions(user?.email || "", simulatedRole);

  if (!authInfo.permissions.ui_controller && !authInfo.isOwner) {
    return (
      <AccessDenied
        locale={locale}
        requiredPermissionNameFr="le Studio Vitrine et la modération des avis"
        requiredPermissionNameAr="تخصيص الواجهة ومراجعة آراء الزبائن"
      />
    );
  }

  const content = await getStorefrontContent();
  const testimonials = await getTestimonials(true);

  return (
    <UiControllerClient
      initialContent={content}
      initialTestimonials={testimonials}
      locale={locale}
    />
  );
}
