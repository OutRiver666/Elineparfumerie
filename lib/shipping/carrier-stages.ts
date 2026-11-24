export type CarrierStageKey =
  | "prete_a_expedier"
  | "en_ramassage"
  | "vers_station"
  | "en_station"
  | "vers_wilaya"
  | "en_preparation"
  | "en_livraison"
  | "suspendus"
  | "livres"
  | "retours";

export interface CarrierStageDefinition {
  key: CarrierStageKey;
  labelFr: string;
  labelAr: string;
  shortFr: string;
  shortAr: string;
  group: "active" | "completed";
  stepOrder: number; // 1..7 for normal transit flow, 8 for delivered, -1 for exceptions
  dotClass: string;
  badgeClass: string;
  activeCardClass: string;
  darkBadgeClass: string;
}

export const CARRIER_STAGES: CarrierStageDefinition[] = [
  {
    key: "prete_a_expedier",
    labelFr: "Prêt à expédier",
    labelAr: "جاهز للشحن",
    shortFr: "Prêt à expédier",
    shortAr: "جاهز للشحن",
    group: "active",
    stepOrder: 1,
    dotClass: "bg-slate-500",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    activeCardClass: "bg-slate-900 text-white border-slate-900",
    darkBadgeClass: "bg-slate-800 text-slate-200 border-slate-700",
  },
  {
    key: "en_ramassage",
    labelFr: "En ramassage",
    labelAr: "قيد الاستلام",
    shortFr: "En ramassage",
    shortAr: "قيد الاستلام",
    group: "active",
    stepOrder: 2,
    dotClass: "bg-sky-500",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    activeCardClass: "bg-sky-600 text-white border-sky-600",
    darkBadgeClass: "bg-sky-950/80 text-sky-300 border-sky-700/60",
  },
  {
    key: "vers_station",
    labelFr: "Vers Station",
    labelAr: "نحو المحطة",
    shortFr: "Vers Station",
    shortAr: "نحو المحطة",
    group: "active",
    stepOrder: 3,
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    activeCardClass: "bg-blue-600 text-white border-blue-600",
    darkBadgeClass: "bg-blue-950/80 text-blue-300 border-blue-700/60",
  },
  {
    key: "en_station",
    labelFr: "En Station",
    labelAr: "في المحطة",
    shortFr: "En Station",
    shortAr: "في المحطة",
    group: "active",
    stepOrder: 4,
    dotClass: "bg-indigo-500",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    activeCardClass: "bg-indigo-600 text-white border-indigo-600",
    darkBadgeClass: "bg-indigo-950/80 text-indigo-300 border-indigo-700/60",
  },
  {
    key: "vers_wilaya",
    labelFr: "Vers Wilaya",
    labelAr: "نحو الولاية",
    shortFr: "Vers Wilaya",
    shortAr: "نحو الولاية",
    group: "active",
    stepOrder: 5,
    dotClass: "bg-violet-500",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    activeCardClass: "bg-violet-600 text-white border-violet-600",
    darkBadgeClass: "bg-violet-950/80 text-violet-300 border-violet-700/60",
  },
  {
    key: "en_preparation",
    labelFr: "En préparation",
    labelAr: "قيد التحضير",
    shortFr: "En préparation",
    shortAr: "قيد التحضير",
    group: "active",
    stepOrder: 6,
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    activeCardClass: "bg-amber-600 text-white border-amber-600",
    darkBadgeClass: "bg-amber-950/80 text-amber-300 border-amber-700/60",
  },
  {
    key: "en_livraison",
    labelFr: "En livraison",
    labelAr: "قيد التوصيل",
    shortFr: "En livraison",
    shortAr: "قيد التوصيل",
    group: "active",
    stepOrder: 7,
    dotClass: "bg-teal-500",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    activeCardClass: "bg-teal-600 text-white border-teal-600",
    darkBadgeClass: "bg-teal-950/80 text-teal-300 border-teal-700/60",
  },
  {
    key: "suspendus",
    labelFr: "Suspendus",
    labelAr: "معلّق",
    shortFr: "Suspendus",
    shortAr: "معلّق",
    group: "active",
    stepOrder: -1,
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    activeCardClass: "bg-rose-600 text-white border-rose-600",
    darkBadgeClass: "bg-rose-950/80 text-rose-300 border-rose-700/60",
  },
  {
    key: "livres",
    labelFr: "Livrés",
    labelAr: "تم التسليم",
    shortFr: "Livrés",
    shortAr: "مسلّم",
    group: "completed",
    stepOrder: 8,
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    activeCardClass: "bg-emerald-600 text-white border-emerald-600",
    darkBadgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
  },
  {
    key: "retours",
    labelFr: "Retours / Annulés",
    labelAr: "مرتجع / ملغى",
    shortFr: "Retours",
    shortAr: "مرتجع",
    group: "completed",
    stepOrder: -1,
    dotClass: "bg-zinc-500",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-300",
    activeCardClass: "bg-zinc-800 text-white border-zinc-800",
    darkBadgeClass: "bg-zinc-800 text-zinc-300 border-zinc-600",
  },
];

export const CARRIER_STAGE_MAP: Record<CarrierStageKey, CarrierStageDefinition> =
  CARRIER_STAGES.reduce((acc, s) => {
    acc[s.key] = s;
    return acc;
  }, {} as Record<CarrierStageKey, CarrierStageDefinition>);

export const CARRIER_TRANSIT_STEPS: CarrierStageDefinition[] = CARRIER_STAGES.filter(
  (s) => s.stepOrder >= 1 && s.stepOrder <= 8
);

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Normalizes any raw EcoTrack (Navex / Anderson) status key or label into one of the
 * 10 canonical carrier stages (8 active delivery stages + Livrés + Retours/Annulés).
 */
export function normalizeEcoTrackStage(
  rawStatus?: string | null,
  fallbackOrderStatus?: string | null
): CarrierStageKey {
  const s = rawStatus ? normalizeSlug(rawStatus) : "";

  if (s) {
    // 1. Retours / Annulés (check early because strings like "retour_en_station" contain station/preparation)
    if (
      s.includes("retour") ||
      s.includes("return") ||
      s === "annule" ||
      s === "annulee" ||
      s === "cancelled" ||
      s === "canceled"
    ) {
      return "retours";
    }

    // 2. Livrés / Encaissés / Payés
    if (
      s === "livred" ||
      s === "livre" ||
      s === "livres" ||
      s === "delivered" ||
      s.startsWith("livre_") ||
      s.includes("encaisse") ||
      s.includes("paye") ||
      s.includes("paiement")
    ) {
      return "livres";
    }

    // 3. Suspendus / Échecs / En attente / Reportés
    if (
      s.includes("suspend") ||
      s.includes("echou") ||
      s.includes("echec") ||
      s.includes("fail") ||
      s.includes("report") ||
      s.includes("hold") ||
      s.includes("block") ||
      s.includes("injoign") ||
      s.includes("no_answer") ||
      s.includes("absent") ||
      s.includes("alerte") ||
      s.includes("tentative_echouee")
    ) {
      return "suspendus";
    }

    // 4. En livraison (out with courier)
    if (
      s === "en_livraison" ||
      s === "dispatched_to_driver" ||
      s === "out_for_delivery" ||
      s === "attempt_delivery" ||
      s.includes("sorti_en_livraison") ||
      s.includes("en_cours_de_livraison") ||
      s.includes("livreur") ||
      s.includes("tentative")
    ) {
      return "en_livraison";
    }

    // 5. En préparation (at destination wilaya desk / preparing for driver)
    if (
      s === "en_preparation" ||
      s === "en_preparation_stock" ||
      s === "preparation" ||
      s === "en_bureau" ||
      s === "stop_desk" ||
      s === "recu_wilaya" ||
      s === "arrive_wilaya" ||
      s.includes("preparation") ||
      s.includes("destination_hub") ||
      s.includes("pret_pour_livraison")
    ) {
      return "en_preparation";
    }

    // 6. Vers Wilaya (inter-wilaya transit)
    if (
      s === "vers_wilaya" ||
      s === "in_transit" ||
      s === "en_transit" ||
      s.includes("vers_wilaya") ||
      s.includes("transfert") ||
      s.includes("acheminement")
    ) {
      return "vers_wilaya";
    }

    // 7. En Station (at sorting hub / station)
    if (
      s === "en_station" ||
      s === "en_hub" ||
      s === "at_hub" ||
      s === "in_hub" ||
      s === "accepted_by_carrier" ||
      s.includes("en_station") ||
      s.includes("en_hub") ||
      s.includes("recu_au_hub") ||
      s.includes("centre_de_tri")
    ) {
      return "en_station";
    }

    // 8. Vers Station (picked up and heading to hub/station)
    if (
      s === "vers_station" ||
      s === "vers_hub" ||
      s === "picked" ||
      s === "ramasse" ||
      s.includes("vers_station") ||
      s.includes("vers_hub") ||
      s.includes("towards_hub") ||
      s.includes("transit_to_hub")
    ) {
      return "vers_station";
    }

    // 9. En ramassage (pickup in progress)
    if (
      s === "en_ramassage" ||
      s === "ramassage" ||
      s === "pickup" ||
      s === "picking" ||
      s.includes("ramassage") ||
      s.includes("pickup")
    ) {
      return "en_ramassage";
    }

    // 10. Prêt à expédier (created / registered / ready to ship)
    if (
      s === "prete_a_expedier" ||
      s === "pret_a_expedier" ||
      s === "order_information_received_by_carrier" ||
      s === "registered" ||
      s === "created" ||
      s === "ready_to_ship" ||
      s.includes("expedier") ||
      s.includes("order_information") ||
      s.includes("attente_ramassage")
    ) {
      return "prete_a_expedier";
    }
  }

  // Fallback from internal order status if raw carrier status is missing or unrecognized
  if (fallbackOrderStatus === "delivered") return "livres";
  if (fallbackOrderStatus === "returned" || fallbackOrderStatus === "cancelled") return "retours";
  if (fallbackOrderStatus === "failed_delivery") return "suspendus";

  return "prete_a_expedier";
}

export function isEcoTrackStatusPaid(rawStatus?: string | null): boolean {
  const s = rawStatus ? normalizeSlug(rawStatus) : "";
  if (!s) return false;
  if (s === "livre_non_encaisse") return false;
  return (
    s === "livred" ||
    s === "livre" ||
    s === "delivered" ||
    s === "encaissed" ||
    s === "encaisse" ||
    s === "encaisse_non_paye" ||
    s === "paiements_prets" ||
    s === "payed" ||
    s === "paye" ||
    s === "paye_et_archive"
  );
}
