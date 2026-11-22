import React from "react";
import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import { getAdminCustomRules } from "@/lib/services/bundles.service";
import { PackRulesClient } from "@/components/admin/pack-rules-client";

export const metadata: Metadata = {
  title: "Règles Packs Sur-Mesure | Studio Éline",
  description: "Configuration des paliers de remises et quotas pour les coffrets personnalisés",
};

interface PackRulesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPackRulesPage({ params }: PackRulesPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  const tiers = await getAdminCustomRules();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-outfit">
      <PackRulesClient tiers={tiers} locale={locale} />
    </div>
  );
}
