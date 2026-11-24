import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CarrierAccentColor,
  EcoTrackCarrierPublic,
  EcoTrackCarrierSecret,
} from "@/lib/shipping/carriers-types";

const LOCAL_CARRIERS_PATH = path.join(process.cwd(), "lib", "data", "ecotrack-carriers.json");
const BUILT_IN_IDS = new Set(["navex", "anderson"]);

export function maskApiToken(token: string): string {
  const clean = (token || "").trim();
  if (!clean) return "";
  if (clean.length <= 8) return "••••••••";
  return `${clean.slice(0, 4)}••••${clean.slice(-4)}`;
}

export function normalizeEcoTrackBaseUrl(rawUrl: string): string {
  let clean = (rawUrl || "").trim();
  if (!clean) return "";
  if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  // Strip any pasted /api/v1... or /tracking... suffix so only origin/base remains
  try {
    const u = new URL(clean);
    clean = `${u.protocol}//${u.host}`;
  } catch {
    clean = clean.replace(/\/api\/v1.*$/i, "").replace(/\/+$/, "");
  }
  return clean.replace(/\/+$/, "");
}

export function slugifyCarrierId(name: string): string {
  const base = (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return base || `carrier-${Date.now().toString(36)}`;
}

function getDefaultBuiltInCarriers(): EcoTrackCarrierSecret[] {
  const navexBase = normalizeEcoTrackBaseUrl(
    process.env.NAVEX_BASE_URL ||
      process.env.ECOTRACK_BASE_URL ||
      "https://navexdelivery.ecotrack.dz"
  );
  const navexToken =
    process.env.NAVEX_API_TOKEN ||
    process.env.ECOTRACK_API_TOKEN ||
    "fPPdVFNKnm23s2ekbLT018v5Tafrn4ulJBjjEDVbB02FLG8yaRm0Tx4oUch5";

  const andersonBase = normalizeEcoTrackBaseUrl(
    process.env.ANDERSON_BASE_URL || "https://anderson-ecommerce.ecotrack.dz"
  );
  const andersonToken =
    process.env.ANDERSON_API_TOKEN ||
    "qjP6BI13RQnyd4ff0IFKjGjGnLe8e6puJ7fHGqkywTLPqkOFnWm9kCYUvlBk";

  return [
    {
      id: "navex",
      name: "Navex Delivery",
      shortName: "Navex",
      baseUrl: navexBase,
      portalUrl: `${navexBase}/tracking/info?tracking=`,
      accentColor: "amber",
      isActive: true,
      isBuiltIn: true,
      apiToken: navexToken,
      tokenMasked: maskApiToken(navexToken),
      hasToken: Boolean(navexToken),
      sortOrder: 1,
    },
    {
      id: "anderson",
      name: "Anderson Logistique",
      shortName: "Anderson",
      baseUrl: andersonBase,
      portalUrl: `${andersonBase}/tracking/info?tracking=`,
      accentColor: "orange",
      isActive: true,
      isBuiltIn: true,
      apiToken: andersonToken,
      tokenMasked: maskApiToken(andersonToken),
      hasToken: Boolean(andersonToken),
      sortOrder: 2,
    },
  ];
}

function toSecretRecord(row: any): EcoTrackCarrierSecret {
  const baseUrl = normalizeEcoTrackBaseUrl(row.base_url || row.baseUrl || "");
  const apiToken = String(row.api_token || row.apiToken || "").trim();
  const id = String(row.id || "").trim().toLowerCase();
  return {
    id,
    name: String(row.name || id).trim(),
    shortName: String(row.short_name || row.shortName || row.name || id).trim(),
    baseUrl,
    portalUrl: `${baseUrl}/tracking/info?tracking=`,
    accentColor: (row.accent_color || row.accentColor || "blue") as CarrierAccentColor,
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : row.isActive !== false,
    isBuiltIn: BUILT_IN_IDS.has(id),
    apiToken,
    tokenMasked: maskApiToken(apiToken),
    hasToken: Boolean(apiToken),
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 10),
    createdAt: row.created_at || row.createdAt,
  };
}

export function toPublicCarrier(c: EcoTrackCarrierSecret): EcoTrackCarrierPublic {
  return {
    id: c.id,
    name: c.name,
    shortName: c.shortName,
    baseUrl: c.baseUrl,
    portalUrl: c.portalUrl,
    accentColor: c.accentColor,
    isActive: c.isActive,
    isBuiltIn: c.isBuiltIn,
    tokenMasked: c.tokenMasked,
    hasToken: c.hasToken,
    sortOrder: c.sortOrder,
    createdAt: c.createdAt,
  };
}

function readLocalCarriersFallback(): EcoTrackCarrierSecret[] {
  try {
    if (fs.existsSync(LOCAL_CARRIERS_PATH)) {
      const raw = fs.readFileSync(LOCAL_CARRIERS_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(toSecretRecord).sort((a, b) => a.sortOrder - b.sortOrder);
      }
    }
  } catch (err) {
    console.warn("[carriers.service] Local JSON read failed:", err);
  }
  return getDefaultBuiltInCarriers();
}

async function writeLocalCarriersFallback(carriers: EcoTrackCarrierSecret[]): Promise<void> {
  try {
    const dir = path.dirname(LOCAL_CARRIERS_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    const serialized = carriers.map((c) => ({
      id: c.id,
      name: c.name,
      short_name: c.shortName,
      base_url: c.baseUrl,
      api_token: c.apiToken,
      accent_color: c.accentColor,
      is_active: c.isActive,
      sort_order: c.sortOrder,
      created_at: c.createdAt || new Date().toISOString(),
    }));
    await fs.promises.writeFile(LOCAL_CARRIERS_PATH, JSON.stringify(serialized, null, 2), "utf-8");
  } catch (err) {
    console.warn("[carriers.service] Local JSON write skipped:", err);
  }
}

/**
 * Retrieves all EcoTrack carriers (including server-side API tokens).
 * Reads from Supabase `ecotrack_carriers`, falling back to local JSON + built-in defaults.
 */
export async function getAllCarriersServer(): Promise<EcoTrackCarrierSecret[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("ecotrack_carriers") as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(toSecretRecord);
    }

    // If table exists but is empty, seed defaults once
    if (!error && Array.isArray(data) && data.length === 0) {
      const defaults = getDefaultBuiltInCarriers();
      await (admin.from("ecotrack_carriers") as any).upsert(
        defaults.map((c) => ({
          id: c.id,
          name: c.name,
          short_name: c.shortName,
          base_url: c.baseUrl,
          api_token: c.apiToken,
          accent_color: c.accentColor,
          is_active: c.isActive,
          sort_order: c.sortOrder,
        })),
        { onConflict: "id" }
      );
      return defaults;
    }
  } catch {
    // Table not created yet — use local JSON fallback
  }

  return readLocalCarriersFallback();
}

export async function getAllCarriersPublic(): Promise<EcoTrackCarrierPublic[]> {
  const all = await getAllCarriersServer();
  return all.map(toPublicCarrier);
}

export async function getActiveCarriersPublic(): Promise<EcoTrackCarrierPublic[]> {
  const all = await getAllCarriersServer();
  return all.filter((c) => c.isActive).map(toPublicCarrier);
}

/**
 * Resolves a single carrier by its ID slug or display name.
 * Falls back cleanly to the first active carrier or Navex.
 */
export async function getCarrierByIdServer(
  carrierIdOrName?: string | null
): Promise<EcoTrackCarrierSecret> {
  const all = await getAllCarriersServer();
  const needle = (carrierIdOrName || "").trim().toLowerCase();

  if (needle) {
    const exactId = all.find((c) => c.id.toLowerCase() === needle);
    if (exactId) return exactId;

    const byName = all.find(
      (c) =>
        c.name.toLowerCase() === needle ||
        c.shortName.toLowerCase() === needle ||
        needle.includes(c.id.toLowerCase()) ||
        needle.includes(c.shortName.toLowerCase())
    );
    if (byName) return byName;
  }

  return all.find((c) => c.isActive) || all[0] || getDefaultBuiltInCarriers()[0];
}

export interface UpsertCarrierInput {
  id?: string;
  name: string;
  shortName?: string;
  baseUrl: string;
  apiToken?: string;
  accentColor?: CarrierAccentColor;
  isActive?: boolean;
}

export async function upsertCarrierServer(
  input: UpsertCarrierInput
): Promise<{ success: boolean; carrier?: EcoTrackCarrierPublic; persistedToDb: boolean; error?: string }> {
  const all = await getAllCarriersServer();
  const cleanName = input.name.trim();
  const cleanShort = (input.shortName || cleanName.split(/\s+/)[0] || cleanName).trim().slice(0, 20);
  const cleanUrl = normalizeEcoTrackBaseUrl(input.baseUrl);
  const now = new Date().toISOString();

  const existing = input.id
    ? all.find((c) => c.id.toLowerCase() === input.id!.trim().toLowerCase())
    : undefined;

  let targetId = existing ? existing.id : slugifyCarrierId(cleanName);
  if (!existing) {
    // Ensure unique slug ID
    let suffix = 2;
    const existingIds = new Set(all.map((c) => c.id));
    const baseSlug = targetId;
    while (existingIds.has(targetId)) {
      targetId = `${baseSlug}-${suffix++}`;
    }
  }

  const finalToken = (input.apiToken || "").trim() || existing?.apiToken || "";
  if (!finalToken) {
    return {
      success: false,
      persistedToDb: false,
      error: "La clé API (Token) EcoTrack est obligatoire.",
    };
  }

  const sortOrder = existing
    ? existing.sortOrder
    : Math.max(2, ...all.map((c) => c.sortOrder || 0)) + 1;

  const record: EcoTrackCarrierSecret = {
    id: targetId,
    name: cleanName,
    shortName: cleanShort,
    baseUrl: cleanUrl,
    portalUrl: `${cleanUrl}/tracking/info?tracking=`,
    accentColor: input.accentColor || existing?.accentColor || "blue",
    isActive: input.isActive !== undefined ? input.isActive : existing ? existing.isActive : true,
    isBuiltIn: BUILT_IN_IDS.has(targetId),
    apiToken: finalToken,
    tokenMasked: maskApiToken(finalToken),
    hasToken: true,
    sortOrder,
    createdAt: existing?.createdAt || now,
  };

  let persistedToDb = false;
  try {
    const admin = createAdminClient();
    const { error } = await (admin.from("ecotrack_carriers") as any).upsert(
      {
        id: record.id,
        name: record.name,
        short_name: record.shortName,
        base_url: record.baseUrl,
        api_token: record.apiToken,
        accent_color: record.accentColor,
        is_active: record.isActive,
        sort_order: record.sortOrder,
        updated_at: now,
      },
      { onConflict: "id" }
    );
    if (!error) {
      persistedToDb = true;
    }
  } catch {
    // Fallback below handles local JSON persistence
  }

  const updatedList = existing
    ? all.map((c) => (c.id === record.id ? record : c))
    : [...all, record];
  await writeLocalCarriersFallback(updatedList);

  return {
    success: true,
    carrier: toPublicCarrier(record),
    persistedToDb,
  };
}

export async function toggleCarrierActiveServer(
  carrierId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const all = await getAllCarriersServer();
  const target = all.find((c) => c.id === carrierId);
  if (!target) {
    return { success: false, error: "Transporteur introuvable." };
  }

  const now = new Date().toISOString();
  try {
    const admin = createAdminClient();
    await (admin.from("ecotrack_carriers") as any)
      .update({ is_active: isActive, updated_at: now })
      .eq("id", carrierId);
  } catch {
    // Fallback below
  }

  const updatedList = all.map((c) => (c.id === carrierId ? { ...c, isActive } : c));
  await writeLocalCarriersFallback(updatedList);
  return { success: true };
}

export async function deleteCarrierServer(
  carrierId: string
): Promise<{ success: boolean; error?: string }> {
  const all = await getAllCarriersServer();
  const target = all.find((c) => c.id === carrierId);
  if (!target) {
    return { success: false, error: "Transporteur introuvable." };
  }
  if (BUILT_IN_IDS.has(carrierId)) {
    return {
      success: false,
      error: "Les transporteurs par défaut peuvent être désactivés mais pas supprimés.",
    };
  }

  try {
    const admin = createAdminClient();
    await (admin.from("ecotrack_carriers") as any).delete().eq("id", carrierId);
  } catch {
    // Fallback below
  }

  const updatedList = all.filter((c) => c.id !== carrierId);
  await writeLocalCarriersFallback(updatedList);
  return { success: true };
}

/**
 * Tests connectivity & authentication against any EcoTrack v1 tenant URL + API Token.
 */
export async function testEcoTrackConnectionServer(
  rawBaseUrl: string,
  rawToken: string
): Promise<{ success: boolean; totalOrders?: number; error?: string }> {
  const baseUrl = normalizeEcoTrackBaseUrl(rawBaseUrl);
  const apiToken = (rawToken || "").trim();

  if (!baseUrl || !/^https?:\/\/[a-z0-9.-]+/i.test(baseUrl)) {
    return { success: false, error: "URL EcoTrack invalide (ex: https://societe.ecotrack.dz)." };
  }
  if (!apiToken || apiToken.length < 8) {
    return { success: false, error: "Clé API (Token) manquante ou trop courte." };
  }

  try {
    const url = `${baseUrl}/api/v1/get/orders?api_token=${encodeURIComponent(apiToken)}&page=1`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
    });

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        error: "Token API refusé (401/403). Vérifiez la clé API dans votre compte EcoTrack.",
      };
    }

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: `Réponse inattendue de ${baseUrl} (non JSON). Vérifiez que l'URL est bien une plateforme EcoTrack.`,
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: json?.message || `Erreur HTTP ${res.status} depuis ${baseUrl}.`,
      };
    }

    if (Array.isArray(json?.data) || typeof json?.current_page === "number") {
      return {
        success: true,
        totalOrders: Number(json?.total ?? json?.data?.length ?? 0),
      };
    }

    return {
      success: false,
      error: "L'URL répond mais ne semble pas correspondre à l'API EcoTrack v1.",
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.name === "TimeoutError"
          ? "Délai d'attente dépassé (serveur EcoTrack injoignable)."
          : `Impossible de joindre ${baseUrl} (${err?.message || "erreur réseau"}).`,
    };
  }
}
