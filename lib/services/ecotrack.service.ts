import ecotrackCommunesData from "@/lib/data/ecotrack-communes.json";
import { ALGERIA_WILAYAS, getEcoTrackWilayaCode } from "@/lib/data/algeria-locations";

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

export type ShippingCarrierId = "navex" | "anderson";

export interface CarrierConfig {
  id: ShippingCarrierId;
  name: string;
  shortName: string;
  baseUrl: string;
  token: string;
  portalUrl: string;
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
    const carrier = getCarrierConfig(carrierId);
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
export function getEcoTrackLabelUrl(
  tracking: string,
  carrierId: ShippingCarrierId = "navex"
): string {
  const carrier = getCarrierConfig(carrierId);
  return `${carrier.baseUrl}/api/v1/get/order/label?tracking=${encodeURIComponent(tracking)}&api_token=${encodeURIComponent(carrier.token)}`;
}

/**
 * Retrieves tracking info and activity history from EcoTrack
 */
export async function getEcoTrackTrackingInfo(
  tracking: string,
  carrierId: ShippingCarrierId = "navex"
): Promise<EcoTrackTrackingInfoResponse> {
  try {
    const carrier = getCarrierConfig(carrierId);
    const res = await fetch(
      `${carrier.baseUrl}/api/v1/get/tracking/info?tracking=${encodeURIComponent(tracking)}&api_token=${encodeURIComponent(carrier.token)}`,
      {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${carrier.token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok || data.success === false) {
      return { success: false, error: data.message || "Erreur récupération suivi" };
    }

    const activity: EcoTrackTrackingActivity[] = data.activity || [];
    const latestStatus = activity.length > 0 ? activity[activity.length - 1].status : "registered";

    return {
      success: true,
      recipientName: data.recipientName,
      shippedBy: data.shippedBy || carrier.name,
      originCity: data.originCity,
      destLocationCity: data.destLocationCity,
      activity,
      latestStatus,
    };
  } catch (err: any) {
    console.error("EcoTrack get tracking error:", err);
    return { success: false, error: err?.message || "Erreur de communication avec EcoTrack" };
  }
}

/**
 * Deletes or cancels a shipment on EcoTrack
 */
export async function deleteEcoTrackShipment(
  tracking: string,
  carrierId: ShippingCarrierId = "navex"
): Promise<{ success: boolean; error?: string }> {
  try {
    const carrier = getCarrierConfig(carrierId);
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
 * Status mapping from EcoTrack to readable French & Arabic labels and internal status
 */
export function mapEcoTrackStatusToOrder(statusKey: string): {
  internalStatus: "preparing" | "shipped" | "delivered" | "returned" | "cancelled";
  isPaid: boolean;
  labelFr: string;
  labelAr: string;
} {
  switch (statusKey) {
    case "order_information_received_by_carrier":
      return {
        internalStatus: "preparing",
        isPaid: false,
        labelFr: "Colis enregistré (Attente prise en charge)",
        labelAr: "تم تسجيل الطرد (في انتظار الاستلام)",
      };
    case "picked":
    case "accepted_by_carrier":
      return {
        internalStatus: "shipped",
        isPaid: false,
        labelFr: "Pris en charge au Hub Navex",
        labelAr: "تم استلام الطرد في مركز الفرز",
      };
    case "dispatched_to_driver":
    case "attempt_delivery":
      return {
        internalStatus: "shipped",
        isPaid: false,
        labelFr: "En cours de livraison avec le livreur",
        labelAr: "الطرد في الطريق مع الموزع",
      };
    case "livred":
    case "encaissed":
    case "payed":
      return {
        internalStatus: "delivered",
        isPaid: true,
        labelFr: "Livré & Encaissé",
        labelAr: "تم التسليم وتحصيل المبلغ",
      };
    case "return_asked":
    case "return_in_transit":
    case "Return_received":
      return {
        internalStatus: "returned",
        isPaid: false,
        labelFr: "Retour initié / En retour",
        labelAr: "طرد راجع / قيد الإرجاع",
      };
    default:
      return {
        internalStatus: "shipped",
        isPaid: false,
        labelFr: statusKey,
        labelAr: statusKey,
      };
  }
}
