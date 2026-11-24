export type CarrierAccentColor =
  | "amber"
  | "orange"
  | "blue"
  | "emerald"
  | "violet"
  | "rose"
  | "cyan"
  | "zinc";

export interface EcoTrackCarrierPublic {
  id: string;
  name: string;
  shortName: string;
  baseUrl: string;
  portalUrl: string;
  accentColor: CarrierAccentColor;
  isActive: boolean;
  isBuiltIn: boolean;
  tokenMasked: string;
  hasToken: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface EcoTrackCarrierSecret extends EcoTrackCarrierPublic {
  apiToken: string;
}

export const CARRIER_ACCENT_OPTIONS: {
  key: CarrierAccentColor;
  labelFr: string;
  labelAr: string;
  swatchClass: string;
}[] = [
  { key: "amber", labelFr: "Ambre", labelAr: "عنبر", swatchClass: "bg-amber-500" },
  { key: "orange", labelFr: "Orange", labelAr: "برتقالي", swatchClass: "bg-orange-500" },
  { key: "blue", labelFr: "Bleu", labelAr: "أزرق", swatchClass: "bg-blue-600" },
  { key: "emerald", labelFr: "Émeraude", labelAr: "زمردي", swatchClass: "bg-emerald-600" },
  { key: "violet", labelFr: "Violet", labelAr: "بنفسجي", swatchClass: "bg-violet-600" },
  { key: "cyan", labelFr: "Cyan", labelAr: "سماوي", swatchClass: "bg-cyan-600" },
  { key: "rose", labelFr: "Rose", labelAr: "وردي", swatchClass: "bg-rose-600" },
  { key: "zinc", labelFr: "Noir", labelAr: "أسود", swatchClass: "bg-zinc-800" },
];

export interface CarrierColorTheme {
  buttonBg: string;
  activeTab: string;
  chipClass: string;
  darkBadgeClass: string;
  lightBadgeClass: string;
  textDarkAccent: string;
  dotClass: string;
}

const COLOR_THEMES: Record<CarrierAccentColor, CarrierColorTheme> = {
  amber: {
    buttonBg: "bg-amber-600 hover:bg-amber-700 text-white",
    activeTab: "bg-amber-600 text-white shadow-xs",
    chipClass: "bg-zinc-900 text-amber-300 border border-zinc-700",
    darkBadgeClass: "bg-amber-950/80 text-amber-300 border-amber-700/60",
    lightBadgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    textDarkAccent: "text-amber-400",
    dotClass: "bg-amber-500",
  },
  orange: {
    buttonBg: "bg-orange-600 hover:bg-orange-700 text-white",
    activeTab: "bg-orange-600 text-white shadow-xs",
    chipClass: "bg-orange-950 text-orange-300 border border-orange-800/60",
    darkBadgeClass: "bg-orange-950/80 text-orange-300 border-orange-700/60",
    lightBadgeClass: "bg-orange-50 text-orange-800 border-orange-200",
    textDarkAccent: "text-orange-400",
    dotClass: "bg-orange-500",
  },
  blue: {
    buttonBg: "bg-blue-600 hover:bg-blue-700 text-white",
    activeTab: "bg-blue-600 text-white shadow-xs",
    chipClass: "bg-blue-950 text-blue-300 border border-blue-800/60",
    darkBadgeClass: "bg-blue-950/80 text-blue-300 border-blue-700/60",
    lightBadgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    textDarkAccent: "text-blue-400",
    dotClass: "bg-blue-500",
  },
  emerald: {
    buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
    activeTab: "bg-emerald-600 text-white shadow-xs",
    chipClass: "bg-emerald-950 text-emerald-300 border border-emerald-800/60",
    darkBadgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
    lightBadgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    textDarkAccent: "text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  violet: {
    buttonBg: "bg-violet-600 hover:bg-violet-700 text-white",
    activeTab: "bg-violet-600 text-white shadow-xs",
    chipClass: "bg-violet-950 text-violet-300 border border-violet-800/60",
    darkBadgeClass: "bg-violet-950/80 text-violet-300 border-violet-700/60",
    lightBadgeClass: "bg-violet-50 text-violet-800 border-violet-200",
    textDarkAccent: "text-violet-400",
    dotClass: "bg-violet-500",
  },
  cyan: {
    buttonBg: "bg-cyan-600 hover:bg-cyan-700 text-white",
    activeTab: "bg-cyan-600 text-white shadow-xs",
    chipClass: "bg-cyan-950 text-cyan-300 border border-cyan-800/60",
    darkBadgeClass: "bg-cyan-950/80 text-cyan-300 border-cyan-700/60",
    lightBadgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
    textDarkAccent: "text-cyan-400",
    dotClass: "bg-cyan-500",
  },
  rose: {
    buttonBg: "bg-rose-600 hover:bg-rose-700 text-white",
    activeTab: "bg-rose-600 text-white shadow-xs",
    chipClass: "bg-rose-950 text-rose-300 border border-rose-800/60",
    darkBadgeClass: "bg-rose-950/80 text-rose-300 border-rose-700/60",
    lightBadgeClass: "bg-rose-50 text-rose-800 border-rose-200",
    textDarkAccent: "text-rose-400",
    dotClass: "bg-rose-500",
  },
  zinc: {
    buttonBg: "bg-zinc-800 hover:bg-zinc-900 text-white",
    activeTab: "bg-zinc-800 text-white shadow-xs",
    chipClass: "bg-zinc-900 text-zinc-200 border border-zinc-700",
    darkBadgeClass: "bg-zinc-800 text-zinc-200 border-zinc-600",
    lightBadgeClass: "bg-zinc-100 text-zinc-800 border-zinc-300",
    textDarkAccent: "text-zinc-300",
    dotClass: "bg-zinc-500",
  },
};

export function getCarrierColorTheme(color?: string | null): CarrierColorTheme {
  if (color && color in COLOR_THEMES) {
    return COLOR_THEMES[color as CarrierAccentColor];
  }
  return COLOR_THEMES.blue;
}
