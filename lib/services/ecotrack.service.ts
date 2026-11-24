import ecotrackCommunesData from "@/lib/data/ecotrack-communes.json";
import { ALGERIA_WILAYAS, getEcoTrackWilayaCode } from "@/lib/data/algeria-locations";
import {
  CarrierStageKey,
  CARRIER_STAGE_MAP,
  normalizeEcoTrackStage,
  isEcoTrackStatusPaid,
} from "@/lib/shipping/carrier-stages";
import { getCarrierByIdServer } from "@/lib/services/carriers.service";

export interface EcoTrackCommune {
  nom: string;
  wilaya_id: number;
  code_postal?: string;
  has_stop_desk: number;
}

const ALL_ECOTRACK_COMMUNES: EcoTrackCommune[] = ecotrackCommunesData as EcoTrackCommune[];

// Pre-index communes by wilaya_id for instant O(1) lookup
const ECOTRACK_COMMUNES_BY_WILAYA: Record<number, EcoTrackCommune[]> = {};
for (const c of ALL_ECOTRACK_COMMUNES) {
  if (!ECOTRACK_COMMUNES_BY_WILAYA[c.wilaya_id]) {
    ECOTRACK_COMMUNES_BY_WILAYA[c.wilaya_id] = [];
  }
  ECOTRACK_COMMUNES_BY_WILAYA[c.wilaya_id].push(c);
}

/**
 * Normalizes text by lowercasing, stripping accents, and removing non-alphanumeric characters.
 */
function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Computes standard Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = Array(an + 1)
    .fill(0)
    .map(() => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

/**
 * Computes similarity ratio between 0.0 and 1.0.
 */
function similarityRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - levenshteinDistance(a, b) / maxLen;
}

/**
 * Retrieves the official EcoTrack commune list for a given wilaya.
 */
export function getEcoTrackCommunesForWilaya(wilayaCode: string | number): EcoTrackCommune[] {
  const wilayaId = getEcoTrackWilayaCode(wilayaCode);
  return ECOTRACK_COMMUNES_BY_WILAYA[wilayaId] || [];
}

/**
 * Automatically maps and resolves any commune input (French, Arabic, variations, typos, accents)
 * to the exact, official EcoTrack commune spelling recognized by Navex and Anderson.
 */
export function resolveEcoTrackCommune(
  wilayaCode: string | number,
  rawCommune?: string | null
): string {
  const wilayaId = getEcoTrackWilayaCode(wilayaCode);
  const communes = ECOTRACK_COMMUNES_BY_WILAYA[wilayaId] || [];
  if (communes.length === 0) return (rawCommune || "").trim();

  const raw = (rawCommune || "").trim();
  if (!raw) return communes[0]?.nom || "";

  let searchName = raw;

  // 0. If input contains Arabic characters, translate to French using ALGERIA_WILAYAS definitions
  // 0. If input contains Arabic characters, translate to French using ALGERIA_WILAYAS
  if (/[\u0600-\u06FF]/.test(raw)) {
    const wilayaObj = ALGERIA_WILAYAS.find(
      (w) => parseInt(w.code, 10) === parseInt(String(wilayaCode), 10)
    );
    if (wilayaObj) {
      const normInput = raw
        .replace(/[\u064B-\u065F]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, "");

      let bestCommune = null;
      let minArDist = Infinity;

      for (const c of wilayaObj.communes) {
        const cArNorm = (c.ar || "")
          .replace(/[\u064B-\u065F]/g, "")
          .replace(/[أإآٱ]/g, "ا")
          .replace(/ة/g, "ه")
          .replace(/ى/g, "ي")
          .replace(/\s+/g, "");

        if (cArNorm === normInput) {
          bestCommune = c;
          minArDist = 0;
          break;
        }

        const dist = levenshteinDistance(normInput, cArNorm);
        if (dist < minArDist) {
          minArDist = dist;
          bestCommune = c;
        }
      }

      if (bestCommune?.fr && minArDist <= 2) {
        searchName = bestCommune.fr;
      }
    }
  }

  // 1. Exact match (case-insensitive)
  const exact = communes.find((c) => c.nom.toLowerCase() === searchName.toLowerCase());
  if (exact) return exact.nom;

  // 2. Normalized match (accents, hyphens, spaces removed)
  const normRaw = normalizeText(searchName);
  const normMatch = communes.find((c) => normalizeText(c.nom) === normRaw);
  if (normMatch) return normMatch.nom;

  // 3. Best Levenshtein similarity match
  let best: EcoTrackCommune | null = null;
  let bestRatio = 0;
  for (const c of communes) {
    const cNorm = normalizeText(c.nom);
    const ratio = similarityRatio(normRaw, cNorm);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = c;
    }
  }

  if (best && bestRatio >= 0.5) {
    return best.nom;
  }

  // 4. Prefix or containment match
  const prefixMatch = communes.find((c) => {
    const cNorm = normalizeText(c.nom);
    return cNorm.startsWith(normRaw) || normRaw.startsWith(cNorm);
  });
  if (prefixMatch) return prefixMatch.nom;

  // 5. Fallback: Chief town (first commune)
  return communes[0]?.nom || raw;
}

export interface CreateEcoTrackOrderPayload {
  reference: string;
  nom_client: string;
  telephone: string;
  telephone_2?: string;
  adresse: string;
  commune: string;
  code_wilaya: number;
  montant: number;
  remarque?: string;
  produit?: string;
  stock?: number;
  type?: number; // 1 = Livraison, 2 = Echange, 3 = PICKUP, 4 = Recouvrement
  stop_desk?: number; // 0 = A domicile, 1 = Stop desk
  fragile?: number; // 1 = Fragile
}

export interface EcoTrackCreateResponse {
  success: boolean;
  tracking?: string;
  reference?: string;
  resolvedCommune?: string;
  error?: string;
  raw?: any;
}

export interface EcoTrackTrackingActivity {
  date: string;
  time: string;
  status: string;
}

export interface EcoTrackTrackingInfoResponse {
  success: boolean;
  recipientName?: string;
  shippedBy?: string;
  originCity?: number;
  destLocationCity?: number;
  activity?: EcoTrackTrackingActivity[];
  latestStatus?: string;
  error?: string;
}

export type ShippingCarrierId = string;

export interface CarrierConfig {
  id: ShippingCarrierId;
  name: string;
  shortName: string;
  baseUrl: string;
  token: string;
  portalUrl: string;
}

export async function resolveCarrierConfig(
  carrierId: ShippingCarrierId = "navex"
): Promise<CarrierConfig> {
  const rec = await getCarrierByIdServer(carrierId);
  return {
    id: rec.id,
    name: rec.name,
    shortName: rec.shortName,
    baseUrl: rec.baseUrl,
    token: rec.apiToken,
    portalUrl: rec.portalUrl,
  };
}

export function getCarrierConfig(carrierId: ShippingCarrierId = "navex"): CarrierConfig {
  if (carrierId === "anderson") {
    const baseUrl = (
      process.env.ANDERSON_BASE_URL || "https://anderson-ecommerce.ecotrack.dz"
    ).replace(/\/+$/, "");
    const token =
      process.env.ANDERSON_API_TOKEN || "qjP6BI13RQnyd4ff0IFKjGjGnLe8e6puJ7fHGqkywTLPqkOFnWm9kCYUvlBk";
    return {
      id: "anderson",
      name: "Anderson Logistique",
      shortName: "Anderson",
      baseUrl,
      token,
      portalUrl: `${baseUrl}/tracking/info?tracking=`,
    };
  }

  // Default: Navex Delivery
  const baseUrl = (
    process.env.NAVEX_BASE_URL ||
    process.env.ECOTRACK_BASE_URL ||
    "https://navexdelivery.ecotrack.dz"
  ).replace(/\/+$/, "");
  const token =
    process.env.NAVEX_API_TOKEN ||
    process.env.ECOTRACK_API_TOKEN ||
    "fPPdVFNKnm23s2ekbLT018v5Tafrn4ulJBjjEDVbB02FLG8yaRm0Tx4oUch5";
  return {
    id: "navex",
    name: "Navex Delivery",
    shortName: "Navex",
    baseUrl,
    token,
    portalUrl: `${baseUrl}/tracking/info?tracking=`,
  };
}

/**
 * Normalizes Algerian phone number to 10 digits starting with 0 (e.g. 0542785174)
 */
export function normalizeAlgerianPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("213") && cleaned.length >= 11) {
    cleaned = "0" + cleaned.slice(3);
  }
  if (!cleaned.startsWith("0") && cleaned.length === 9) {
    cleaned = "0" + cleaned;
  }
  return cleaned;
}

/**
 * Creates a shipment on Navex or Anderson (EcoTrack)
 */
export async function createEcoTrackShipment(
  payload: CreateEcoTrackOrderPayload,
  carrierId: ShippingCarrierId = "navex"
): Promise<EcoTrackCreateResponse & { carrier?: ShippingCarrierId }> {
  try {
    const carrier = await resolveCarrierConfig(carrierId);
    if (!carrier.token) {
      return { success: false, error: `Clé API ${carrier.name} non configurée` };
    }

    const cleanPhone = normalizeAlgerianPhone(payload.telephone);
    const cleanPhone2 = payload.telephone_2 ? normalizeAlgerianPhone(payload.telephone_2) : "";

    // 1. Resolve canonical Wilaya code (1-58) and official EcoTrack commune name
    const targetWilayaCode = getEcoTrackWilayaCode(payload.code_wilaya);
    const resolvedCommune = resolveEcoTrackCommune(targetWilayaCode, payload.commune);

    const requestBody = {
      api_token: carrier.token,
      reference: payload.reference,
      nom_client: payload.nom_client,
      telephone: cleanPhone,
      telephone_2: cleanPhone2 || undefined,
      adresse: payload.adresse,
      commune: resolvedCommune,
      code_wilaya: targetWilayaCode,
      montant: Number(payload.montant),
      remarque: payload.remarque || "Fragile - Flacons de Parfum d'Exception Éline",
      produit: payload.produit || "Créations Parfumerie Éline",
      stock: payload.stock ?? 0,
      type: payload.type ?? 1, // 1 = Livraison
      stop_desk: payload.stop_desk ?? 0, // 0 = A domicile, 1 = Stop desk
      fragile: payload.fragile ?? 1, // 1 = Fragile
    };

    const res = await fetch(`${carrier.baseUrl}/api/v1/create/order`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${carrier.token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg =
        (data.errors && typeof data.errors === "object"
          ? Object.values(data.errors).flat().join(" | ")
          : null) ||
        data.message ||
        `Erreur création colis chez ${carrier.name}`;
      return { success: false, error: errorMsg, raw: data };
    }

    return {
      success: true,
      tracking: data.tracking,
      reference: data.reference || payload.reference,
      resolvedCommune,
      carrier: carrier.id,
      raw: data,
    };
  } catch (err: any) {
    console.error("EcoTrack create shipment error:", err);
    return { success: false, error: err?.message || "Erreur réseau EcoTrack" };
  }
}

/**
 * Returns direct URL to download/view official shipping label PDF
 */
export function buildEcoTrackLabelUrl(
  tracking: string,
  baseUrl: string,
  token: string
): string {
  const cleanBase = (baseUrl || "").replace(/\/+$/, "");
  return `${cleanBase}/api/v1/get/order/label?tracking=${encodeURIComponent(tracking)}&api_token=${encodeURIComponent(token)}`;
}

export function getEcoTrackLabelUrl(
  tracking: string,
  carrierId: ShippingCarrierId = "navex"
): string {
  const carrier = getCarrierConfig(carrierId);
  return buildEcoTrackLabelUrl(tracking, carrier.baseUrl, carrier.token);
}

export async function getEcoTrackLabelUrlAsync(
  tracking: string,
  carrierId: ShippingCarrierId = "navex"
): Promise<string> {
  const carrier = await resolveCarrierConfig(carrierId);
  return buildEcoTrackLabelUrl(tracking, carrier.baseUrl, carrier.token);
}

/**
 * Retrieves real dashboard order status from EcoTrack (/api/v1/get/orders?tracking=...)
 * and tracking activity from /api/v1/get/tracking/info.
 * Note: EcoTrack's /get/orders returns the exact dashboard stage (e.g. prete_a_expedier,
 * en_ramassage, vers_hub, en_hub, vers_wilaya, en_preparation, en_livraison, suspendu),
 * whereas /get/tracking/info can lag behind on early transitions like Prêt à expédier -> Vers Station.
 */
export async function getEcoTrackTrackingInfo(
  tracking: string,
  carrierId: ShippingCarrierId = "navex"
): Promise<EcoTrackTrackingInfoResponse> {
  try {
    const carrier = await resolveCarrierConfig(carrierId);
    const headers = {
      "Accept": "application/json",
      "Authorization": `Bearer ${carrier.token}`,
    };

    const [orderRes, trackingRes] = await Promise.allSettled([
      fetch(
        `${carrier.baseUrl}/api/v1/get/orders?api_token=${encodeURIComponent(carrier.token)}&tracking=${encodeURIComponent(tracking)}`,
        { headers, cache: "no-store", signal: AbortSignal.timeout(8000) }
      ),
      fetch(
        `${carrier.baseUrl}/api/v1/get/tracking/info?tracking=${encodeURIComponent(tracking)}&api_token=${encodeURIComponent(carrier.token)}`,
        { headers, cache: "no-store", signal: AbortSignal.timeout(8000) }
      ),
    ]);

    let orderStatus: string | undefined;
    let orderRecipient: string | undefined;
    let orderDestWilaya: number | undefined;

    if (orderRes.status === "fulfilled" && orderRes.value.ok) {
      try {
        const orderJson = await orderRes.value.json();
        const rows = Array.isArray(orderJson?.data) ? orderJson.data : [];
        const matched =
          rows.find((r: any) => String(r?.tracking || "").toLowerCase() === tracking.toLowerCase()) ||
          rows[0];
        if (matched) {
          if (typeof matched.status === "string" && matched.status.trim()) {
            orderStatus = matched.status.trim();
          }
          if (matched.client) orderRecipient = String(matched.client);
          if (matched.wilaya_id) orderDestWilaya = Number(matched.wilaya_id);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    let activity: EcoTrackTrackingActivity[] = [];
    let trackingData: any = null;

    if (trackingRes.status === "fulfilled" && trackingRes.value.ok) {
      try {
        const tJson = await trackingRes.value.json();
        if (tJson && tJson.success !== false) {
          trackingData = tJson;
          activity = Array.isArray(tJson.activity) ? tJson.activity : [];
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (!orderStatus && !trackingData) {
      return { success: false, error: `Erreur récupération suivi chez ${carrier.name}` };
    }

    const activityLatest = activity.length > 0 ? activity[activity.length - 1]?.status : undefined;
    const directTrackingStatus =
      typeof trackingData?.status === "string" &&
      trackingData.status.trim() &&
      trackingData.status !== "200"
        ? trackingData.status.trim()
        : undefined;

    // Prioritize the exact dashboard status from /api/v1/get/orders
    const latestStatus = orderStatus || directTrackingStatus || activityLatest || "prete_a_expedier";

    return {
      success: true,
      recipientName: trackingData?.recipientName || orderRecipient,
      shippedBy: trackingData?.shippedBy || carrier.name,
      originCity: trackingData?.originCity,
      destLocationCity: trackingData?.destLocationCity || orderDestWilaya,
      activity,
      latestStatus,
    };
  } catch (err: any) {
    console.error("EcoTrack get tracking error:", err);
    return { success: false, error: err?.message || "Erreur de communication avec EcoTrack" };
  }
}

/**
 * Bulk fetches live dashboard parcel statuses from Navex or Anderson EcoTrack.
 * Primary: pages through GET /api/v1/get/orders (40 parcels/page, exact dashboard status),
 * stopping as soon as all requested trackings are found.
 * Fallback: queries /api/v1/get/orders?tracking=... for any older tracking not in the first pages.
 */
export async function fetchEcoTrackBulkStatuses(
  trackings: string[],
  carrierId: ShippingCarrierId = "navex"
): Promise<Record<string, string>> {
  const uniqueTrackings = Array.from(new Set(trackings.filter(Boolean)));
  const results: Record<string, string> = {};
  if (uniqueTrackings.length === 0) return results;

  const carrier = await resolveCarrierConfig(carrierId);
  if (!carrier.token) return results;

  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${carrier.token}`,
  };

  // Map lowercase tracking -> original tracking string
  const wantedMap = new Map<string, string>();
  for (const t of uniqueTrackings) {
    wantedMap.set(t.toLowerCase(), t);
  }

  // 1. Page through /api/v1/get/orders (40 orders per page, newest first)
  const MAX_PAGES = 5;
  for (let page = 1; page <= MAX_PAGES; page++) {
    if (wantedMap.size === 0) break;
    try {
      const url = `${carrier.baseUrl}/api/v1/get/orders?api_token=${encodeURIComponent(carrier.token)}&page=${page}`;
      const res = await fetch(url, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) break;
      const payload = await res.json();
      const rows = Array.isArray(payload?.data) ? payload.data : [];

      for (const row of rows) {
        const rawTrk = typeof row?.tracking === "string" ? row.tracking.trim() : "";
        const rawStatus = typeof row?.status === "string" ? row.status.trim() : "";
        if (!rawTrk || !rawStatus) continue;

        const originalKey = wantedMap.get(rawTrk.toLowerCase());
        if (originalKey) {
          results[originalKey] = rawStatus;
          wantedMap.delete(rawTrk.toLowerCase());
        }
      }

      const lastPage = Number(payload?.last_page || 1);
      if (page >= lastPage || rows.length === 0) break;
    } catch {
      break;
    }
  }

  // 2. Query any remaining older trackings directly via /api/v1/get/orders?tracking=...
  const missing = Array.from(wantedMap.values());
  const CONCURRENCY = 6;
  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    const batch = missing.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (trk) => {
        const info = await getEcoTrackTrackingInfo(trk, carrierId);
        return { trk, info };
      })
    );
    for (const item of settled) {
      if (item.status === "fulfilled" && item.value.info.success && item.value.info.latestStatus) {
        results[item.value.trk] = item.value.info.latestStatus;
      }
    }
  }

  return results;
}

/**
 * Deletes or cancels a shipment on EcoTrack
 */
export async function deleteEcoTrackShipment(
  tracking: string,
  carrierId: ShippingCarrierId = "navex"
): Promise<{ success: boolean; error?: string }> {
  try {
    const carrier = await resolveCarrierConfig(carrierId);
    const res = await fetch(
      `${carrier.baseUrl}/api/v1/delete/order?tracking=${encodeURIComponent(tracking)}&api_token=${encodeURIComponent(carrier.token)}`,
      {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${carrier.token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok || data.delete !== "success") {
      return {
        success: false,
        error: data.message || `Impossible d'annuler le colis chez ${carrier.name}`,
      };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur réseau EcoTrack" };
  }
}

/**
 * Status mapping from EcoTrack to canonical carrier stage, readable French & Arabic labels, and internal order status
 */
export function mapEcoTrackStatusToOrder(statusKey: string): {
  stageKey: CarrierStageKey;
  internalStatus: "preparing" | "shipped" | "delivered" | "returned" | "cancelled";
  isPaid: boolean;
  labelFr: string;
  labelAr: string;
} {
  const stageKey = normalizeEcoTrackStage(statusKey);
  const stageDef = CARRIER_STAGE_MAP[stageKey];
  const isPaid = isEcoTrackStatusPaid(statusKey);

  const normalizedRaw = (statusKey || "").toLowerCase();
  let internalStatus: "preparing" | "shipped" | "delivered" | "returned" | "cancelled" = "shipped";

  if (stageKey === "livres") {
    internalStatus = "delivered";
  } else if (stageKey === "retours") {
    internalStatus =
      normalizedRaw.includes("annul") || normalizedRaw.includes("cancel")
        ? "cancelled"
        : "returned";
  } else {
    // Active carrier stages (prete_a_expedier .. en_livraison & suspendus) remain "shipped" internally
    internalStatus = "shipped";
  }

  return {
    stageKey,
    internalStatus,
    isPaid,
    labelFr: stageDef.labelFr,
    labelAr: stageDef.labelAr,
  };
}

export interface EcoTrackWilayaFeeItem {
  wilayaId: number;
  homeFeeDZD: number;
  stopDeskFeeDZD: number;
}

/**
 * Fetches live delivery tariffs per wilaya from any EcoTrack carrier via GET /api/v1/get/fees
 * and expands the 58 canonical EcoTrack wilayas to all 69 wilayas defined in ALGERIA_WILAYAS.
 */
export async function fetchEcoTrackCarrierFees(
  carrierId: ShippingCarrierId
): Promise<{
  success: boolean;
  carrierId?: string;
  carrierName?: string;
  ratesByWilayaCode?: Record<string, { homeFeeDZD: number; stopDeskFeeDZD: number }>;
  canonicalCount?: number;
  error?: string;
}> {
  try {
    const carrier = await resolveCarrierConfig(carrierId);
    if (!carrier.token || !carrier.baseUrl) {
      return {
        success: false,
        error: `Configuration API manquante pour ${carrier.name || carrierId}`,
      };
    }

    const url = `${carrier.baseUrl}/api/v1/get/fees?api_token=${encodeURIComponent(carrier.token)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${carrier.token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.message || `Erreur HTTP ${res.status} lors de la récupération des tarifs ${carrier.name}`,
      };
    }

    const rawList: any[] = Array.isArray(data?.livraison)
      ? data.livraison
      : Array.isArray(data?.tarifs)
      ? data.tarifs
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

    if (rawList.length === 0) {
      return {
        success: false,
        error: `Aucun tarif trouvé chez ${carrier.name}. Vérifiez les tarifs dans votre compte EcoTrack.`,
      };
    }

    const canonicalMap = new Map<number, EcoTrackWilayaFeeItem>();
    for (const item of rawList) {
      const wid = Number(item?.wilaya_id ?? item?.wilaya ?? item?.id);
      if (!Number.isFinite(wid) || wid < 1 || wid > 69) continue;

      const rawHome =
        item?.tarif ?? item?.home_price ?? item?.domicile ?? item?.price ?? item?.home;
      const rawStopDesk =
        item?.tarif_stopdesk ??
        item?.stop_desk_price ??
        item?.stopdesk_price ??
        item?.stopdesk ??
        rawHome;

      const homeFeeDZD = Math.max(0, Math.round(Number(rawHome) || 0));
      const stopDeskFeeDZD = Math.max(0, Math.round(Number(rawStopDesk) || homeFeeDZD));

      canonicalMap.set(wid, { wilayaId: wid, homeFeeDZD, stopDeskFeeDZD });
    }

    if (canonicalMap.size === 0) {
      return {
        success: false,
        error: `Format de tarifs non reconnu depuis ${carrier.name}.`,
      };
    }

    // Expand to all 69 wilayas in ALGERIA_WILAYAS (mapping 59..69 to canonical parent 1..58 if not directly listed)
    const ratesByWilayaCode: Record<string, { homeFeeDZD: number; stopDeskFeeDZD: number }> = {};
    for (const w of ALGERIA_WILAYAS) {
      const numericCode = parseInt(w.code, 10);
      const direct = canonicalMap.get(numericCode);
      const canonical = canonicalMap.get(getEcoTrackWilayaCode(numericCode));
      const matched = direct || canonical;
      if (matched) {
        ratesByWilayaCode[w.code] = {
          homeFeeDZD: matched.homeFeeDZD,
          stopDeskFeeDZD: matched.stopDeskFeeDZD,
        };
      }
    }

    return {
      success: true,
      carrierId: carrier.id,
      carrierName: carrier.name,
      ratesByWilayaCode,
      canonicalCount: canonicalMap.size,
    };
  } catch (err: any) {
    console.error("[fetchEcoTrackCarrierFees] Error:", err);
    return {
      success: false,
      error: err?.message || "Erreur réseau lors de la récupération des tarifs EcoTrack.",
    };
  }
}
