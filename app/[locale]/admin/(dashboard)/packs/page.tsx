import React from "react";
import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import {
  getAdminBundles,
  getAvailableProductsForBundles,
} from "@/lib/services/bundles.service";
import { PacksManagerClient } from "@/components/admin/packs-manager-client";

export const metadata: Metadata = {
  title: "Gestion des Packs & Coffrets | Studio Éline",
  description: "Gestion des offres groupées et coffrets signatures prédéfinis",
};

interface PacksPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPacksPage({ params }: PacksPageProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";

  const [bundles, availableProducts] = await Promise.all([
    getAdminBundles(),
    getAvailableProductsForBundles(),
  ]);

  return (
    <div className="space-y-6 font-outfit">
      <PacksManagerClient
        bundles={bundles}
        availableProducts={availableProducts}
        locale={locale}
      />
    </div>
  );
}
