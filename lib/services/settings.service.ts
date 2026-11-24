import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria-locations";
import {
  DEFAULT_STORE_SETTINGS,
  StoreSettings,
  WilayaDeliveryRateRecord,
  WilayaRateMap,
} from "@/types/settings";

const LOCAL_SETTINGS_PATH = path.join(process.cwd(), "lib", "data", "store-settings.json");

function readLocalSettingsFallback(): StoreSettings {
  try {
    if (fs.existsSync(LOCAL_SETTINGS_PATH)) {
      const raw = fs.readFileSync(LOCAL_SETTINGS_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STORE_SETTINGS,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn("[getStoreSettings] Local fallback read failed:", err);
  }
  return DEFAULT_STORE_SETTINGS;
}

async function writeLocalSettingsFallback(settings: StoreSettings): Promise<void> {
  try {
    const dir = path.dirname(LOCAL_SETTINGS_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(
      LOCAL_SETTINGS_PATH,
      JSON.stringify(settings, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("[saveStoreSettings] Local fallback write skipped:", err);
  }
}

/**
 * Retrieve global store settings from Supabase store_settings (with local JSON & defaults fallback).
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("store_settings") as any)
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data) {
      const local = readLocalSettingsFallback();
      return {
        brandName: data.brand_name || DEFAULT_STORE_SETTINGS.brandName,
        contactPhone: data.contact_phone || DEFAULT_STORE_SETTINGS.contactPhone,
        supportEmail: data.support_email || DEFAULT_STORE_SETTINGS.supportEmail,
        addressFr: data.address_fr || DEFAULT_STORE_SETTINGS.addressFr,
        addressAr: data.address_ar || DEFAULT_STORE_SETTINGS.addressAr,
        currency: data.currency || DEFAULT_STORE_SETTINGS.currency,
        pack3DiscountPct: Number(data.pack_3_discount_pct ?? DEFAULT_STORE_SETTINGS.pack3DiscountPct),
        pack5DiscountPct: Number(data.pack_5_discount_pct ?? DEFAULT_STORE_SETTINGS.pack5DiscountPct),
        pack10DiscountPct: Number(data.pack_10_discount_pct ?? DEFAULT_STORE_SETTINGS.pack10DiscountPct),
        deliveryPricingMode:
          data.delivery_pricing_mode || local.deliveryPricingMode || "manual",
        deliveryPricingCarrierId:
          data.delivery_pricing_carrier_id ?? local.deliveryPricingCarrierId ?? null,
        deliveryPricingTariffType:
          data.delivery_pricing_tariff_type || local.deliveryPricingTariffType || "home",
        deliveryPricingSyncedAt:
          data.delivery_pricing_synced_at ?? local.deliveryPricingSyncedAt ?? null,
        updatedAt: data.updated_at || undefined,
      };
    }
  } catch (err) {
    console.warn("[getStoreSettings] Supabase fetch failed, using fallback:", err);
  }

  return readLocalSettingsFallback();
}

/**
 * Persist store general settings & pack discount rules to Supabase (and local fallback if table not migrated yet).
 * Also syncs matching custom pack discount percentages in the bundles table when present.
 */
export async function saveStoreSettings(
  settings: StoreSettings
): Promise<{ success: boolean; persistedToDb: boolean; error?: string }> {
  const now = new Date().toISOString();
  const existingLocal = readLocalSettingsFallback();
  const clean: StoreSettings = {
    brandName: settings.brandName.trim() || DEFAULT_STORE_SETTINGS.brandName,
    contactPhone: settings.contactPhone.trim() || DEFAULT_STORE_SETTINGS.contactPhone,
    supportEmail: settings.supportEmail.trim() || DEFAULT_STORE_SETTINGS.supportEmail,
    addressFr: settings.addressFr.trim() || DEFAULT_STORE_SETTINGS.addressFr,
    addressAr: settings.addressAr.trim() || DEFAULT_STORE_SETTINGS.addressAr,
    currency: settings.currency.trim() || DEFAULT_STORE_SETTINGS.currency,
    pack3DiscountPct: Math.min(90, Math.max(0, Number(settings.pack3DiscountPct) || 0)),
    pack5DiscountPct: Math.min(90, Math.max(0, Number(settings.pack5DiscountPct) || 0)),
    pack10DiscountPct: Math.min(90, Math.max(0, Number(settings.pack10DiscountPct) || 0)),
    deliveryPricingMode:
      settings.deliveryPricingMode || existingLocal.deliveryPricingMode || "manual",
    deliveryPricingCarrierId:
      settings.deliveryPricingCarrierId !== undefined
        ? settings.deliveryPricingCarrierId
        : existingLocal.deliveryPricingCarrierId ?? null,
    deliveryPricingTariffType:
      settings.deliveryPricingTariffType || existingLocal.deliveryPricingTariffType || "home",
    deliveryPricingSyncedAt:
      settings.deliveryPricingSyncedAt !== undefined
        ? settings.deliveryPricingSyncedAt
        : existingLocal.deliveryPricingSyncedAt ?? null,
    updatedAt: now,
  };

  let persistedToDb = false;

  try {
    const admin = createAdminClient();
    const baseRow = {
      id: "default",
      brand_name: clean.brandName,
      contact_phone: clean.contactPhone,
      support_email: clean.supportEmail,
      address_fr: clean.addressFr,
      address_ar: clean.addressAr,
      currency: clean.currency,
      pack_3_discount_pct: clean.pack3DiscountPct,
      pack_5_discount_pct: clean.pack5DiscountPct,
      pack_10_discount_pct: clean.pack10DiscountPct,
      updated_at: now,
    };

    let { error } = await (admin.from("store_settings") as any).upsert(
      {
        ...baseRow,
        delivery_pricing_mode: clean.deliveryPricingMode,
        delivery_pricing_carrier_id: clean.deliveryPricingCarrierId,
        delivery_pricing_tariff_type: clean.deliveryPricingTariffType,
        delivery_pricing_synced_at: clean.deliveryPricingSyncedAt,
      },
      { onConflict: "id" }
    );

    // Fallback if optional delivery_pricing_* columns don't exist yet on store_settings
    if (error && (error.code === "42703" || error.message?.includes("delivery_pricing"))) {
      const retry = await (admin.from("store_settings") as any).upsert(baseRow, {
        onConflict: "id",
      });
      error = retry.error;
    }

    if (!error) {
      persistedToDb = true;
    } else if (
      error.code !== "42P01" &&
      error.code !== "PGRST205" &&
      !error.message?.includes("store_settings")
    ) {
      console.error("[saveStoreSettings] Supabase error:", error.message);
      return { success: false, persistedToDb: false, error: error.message };
    }

    // Best-effort sync to custom pack tiers in bundles table if matching tiers exist
    try {
      const tierUpdates = [
        { count: 3, pct: clean.pack3DiscountPct },
        { count: 5, pct: clean.pack5DiscountPct },
        { count: 10, pct: clean.pack10DiscountPct },
      ];
      for (const tier of tierUpdates) {
        await (admin.from("bundles") as any)
          .update({ discount_percentage: tier.pct, updated_at: now })
          .eq("type", "custom")
          .eq("required_bottles_count", tier.count);
      }
    } catch {
      // Ignore if custom bundles aren't seeded
    }
  } catch (err: any) {
    console.warn("[saveStoreSettings] Supabase write error, falling back to local file:", err?.message);
  }

  // Always keep local JSON fallback updated so dev/pre-migration environments reflect changes immediately
  await writeLocalSettingsFallback(clean);

  return { success: true, persistedToDb };
}

/**
 * Fetch all 58 Algerian wilayas with live Supabase delivery fees, estimated days, and active flags.
 */
export async function getWilayaDeliveryRates(): Promise<WilayaDeliveryRateRecord[]> {
  const dbMap = new Map<
    string,
    { delivery_fee_dzd: number; estimated_days: string; is_active: boolean }
  >();

  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("wilaya_delivery_rates") as any)
      .select("wilaya_code, delivery_fee_dzd, estimated_days, is_active");

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        dbMap.set(String(row.wilaya_code).padStart(2, "0"), {
          delivery_fee_dzd: Number(row.delivery_fee_dzd),
          estimated_days: row.estimated_days || "24h - 48h",
          is_active: row.is_active !== false,
        });
      }
    }
  } catch (err) {
    console.warn("[getWilayaDeliveryRates] Failed to query Supabase, using defaults:", err);
  }

  return ALGERIA_WILAYAS.map((w) => {
    const live = dbMap.get(w.code);
    return {
      wilayaCode: w.code,
      nameFr: w.name_fr,
      nameAr: w.name_ar,
      deliveryFeeDZD: live !== undefined ? live.delivery_fee_dzd : w.deliveryFeeDZD,
      estimatedDays: live?.estimated_days || "24h - 48h",
      isActive: live !== undefined ? live.is_active : true,
      communesCount: w.communes.length,
    };
  });
}

/**
 * Lightweight map keyed by wilaya code ('01'..'58') for storefront checkout forms.
 */
export async function getWilayaRateMap(): Promise<WilayaRateMap> {
  const rates = await getWilayaDeliveryRates();
  const map: WilayaRateMap = {};
  for (const r of rates) {
    map[r.wilayaCode] = {
      deliveryFeeDZD: r.deliveryFeeDZD,
      estimatedDays: r.estimatedDays,
      isActive: r.isActive,
    };
  }
  return map;
}

/**
 * Persist all 58 wilaya delivery rates directly to Supabase wilaya_delivery_rates table.
 */
export async function saveWilayaDeliveryRates(
  rates: {
    wilayaCode: string;
    deliveryFeeDZD: number;
    estimatedDays?: string;
    isActive?: boolean;
  }[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const admin = createAdminClient();

    const rows = rates
      .map((r) => {
        const code = String(r.wilayaCode).padStart(2, "0");
        const meta = ALGERIA_WILAYAS.find((w) => w.code === code);
        if (!meta) return null;
        return {
          wilaya_code: code,
          name_fr: meta.name_fr,
          name_ar: meta.name_ar,
          delivery_fee_dzd: Math.max(0, Math.round(Number(r.deliveryFeeDZD) || 0)),
          estimated_days: (r.estimatedDays || "24h - 48h").trim().slice(0, 20),
          is_active: r.isActive !== false,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (rows.length === 0) {
      return { success: false, error: "Aucune wilaya valide à enregistrer." };
    }

    const { error } = await (admin.from("wilaya_delivery_rates") as any).upsert(rows, {
      onConflict: "wilaya_code",
    });

    if (error) {
      console.error("[saveWilayaDeliveryRates] Supabase upsert error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, count: rows.length };
  } catch (err: any) {
    console.error("[saveWilayaDeliveryRates] Error:", err);
    return {
      success: false,
      error: err?.message || "Erreur lors de la sauvegarde des tarifs wilayas.",
    };
  }
}
