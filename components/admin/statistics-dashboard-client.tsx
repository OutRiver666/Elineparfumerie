"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import type {
  DashboardStatisticsData,
  TimeSeriesPoint,
} from "@/lib/services/statistics.service";
import { ChartContainer, ReuiChartTooltip } from "@/components/ui/chart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  CalendarDays,
  Truck,
  Package,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Layers,
  Activity,
  Banknote,
  ShoppingBag,
  Percent,
} from "lucide-react";

interface StatisticsDashboardClientProps {
  data: DashboardStatisticsData;
  locale: Locale;
}

type Granularity = "daily" | "monthly" | "yearly";
type MainChartStyle = "area" | "cashflow";

function compactDZD(val: number): string {
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `${Math.round(val / 1_000)}k`;
  return String(val);
}

export function StatisticsDashboardClient({
  data,
  locale,
}: StatisticsDashboardClientProps) {
  const isAr = locale === "ar";
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [chartStyle, setChartStyle] = useState<MainChartStyle>("area");

  const activeSeries: TimeSeriesPoint[] = useMemo(() => {
    if (granularity === "monthly") return data.monthlySeries;
    if (granularity === "yearly") return data.yearlySeries;
    return data.dailySeries;
  }, [granularity, data]);

  // Normalized chart rows with localized label
  const chartRows = useMemo(
    () =>
      activeSeries.map((pt) => ({
        ...pt,
        label: isAr ? pt.labelAr : pt.labelFr,
      })),
    [activeSeries, isAr]
  );

  // Totals for the currently selected timeframe
  const selectedPeriodTotals = useMemo(() => {
    return activeSeries.reduce(
      (acc, p) => ({
        orders: acc.orders + p.ordersCount,
        gross: acc.gross + p.grossRevenueDZD,
        merchandise: acc.merchandise + p.merchandiseNetDZD,
        delivery: acc.delivery + p.deliveryFeesDZD,
        collected: acc.collected + p.cashCollectedDZD,
        pending: acc.pending + p.pendingCodDZD,
        cancelled: acc.cancelled + p.cancelledValueDZD,
      }),
      {
        orders: 0,
        gross: 0,
        merchandise: 0,
        delivery: 0,
        collected: 0,
        pending: 0,
        cancelled: 0,
      }
    );
  }, [activeSeries]);

  // Peak weekday for highlighted bar design
  const peakWeekdayIndex = useMemo(() => {
    let bestIdx = 0;
    let bestVal = -1;
    data.weekdayBreakdown.forEach((d, idx) => {
      if (d.orders > bestVal) {
        bestVal = d.orders;
        bestIdx = idx;
      }
    });
    return bestVal > 0 ? bestIdx : -1;
  }, [data.weekdayBreakdown]);

  // Cash flow allocation percentages (total = collected + inTransit + lost)
  const totalVolumeWithCancelled =
    data.cashFlow.cashCollectedDZD +
    data.cashFlow.cashInTransitDZD +
    data.cashFlow.lostCancelledDZD;
  const collectedShare =
    totalVolumeWithCancelled > 0
      ? Math.round((data.cashFlow.cashCollectedDZD / totalVolumeWithCancelled) * 100)
      : 0;
  const transitShare =
    totalVolumeWithCancelled > 0
      ? Math.round((data.cashFlow.cashInTransitDZD / totalVolumeWithCancelled) * 100)
      : 0;
  const lostShare =
    totalVolumeWithCancelled > 0
      ? Math.max(0, 100 - collectedShare - transitShare)
      : 0;

  const nonZeroStatusData = useMemo(
    () => data.statusDistribution.filter((s) => s.count > 0),
    [data.statusDistribution]
  );

  // Export CSV for currently active granularity (Daily / Monthly / Yearly)
  const handleExportCsv = () => {
    const headers = [
      "Periode",
      "Commandes",
      "Livrees",
      "Annulees",
      "Ventes_Brutes_DZD",
      "Produits_Net_DZD",
      "Frais_Livraison_DZD",
      "Cash_Encaisse_DZD",
      "COD_En_Attente_DZD",
      "Pertes_Annulees_DZD",
      "Panier_Moyen_DZD",
    ];
    const rows = activeSeries.map((r) => [
      r.key,
      r.ordersCount,
      r.deliveredCount,
      r.cancelledCount,
      r.grossRevenueDZD,
      r.merchandiseNetDZD,
      r.deliveryFeesDZD,
      r.cashCollectedDZD,
      r.pendingCodDZD,
      r.cancelledValueDZD,
      r.avgOrderValueDZD,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eline-statistics-${granularity}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tooltipLabels: Record<string, string> = {
    grossRevenueDZD: isAr ? "إجمالي المبيعات" : "Ventes Brutes",
    cashCollectedDZD: isAr ? "الكاش المحصّل" : "Cash Encaissé",
    pendingCodDZD: isAr ? "COD قيد التحصيل" : "COD En Attente",
    merchandiseNetDZD: isAr ? "صافي العطور" : "Produits (Net)",
    deliveryFeesDZD: isAr ? "رسوم التوصيل" : "Frais Livraison",
    cancelledValueDZD: isAr ? "ملغاة / مرتجعة" : "Annulées / Retours",
    ordersCount: isAr ? "عدد الطلبيات" : "Commandes",
    revenueDZD: isAr ? "المداخيل" : "Revenus",
    orders: isAr ? "الطلبيات" : "Commandes",
    units: isAr ? "القوارير" : "Flacons",
  };

  const formatTooltipValue = (val: number, key: string) => {
    if (key === "ordersCount" || key === "orders" || key === "units") {
      return String(val);
    }
    return formatPrice(val, locale);
  };

  // ReUI Radial Gauge data
  const radialGaugeData = [
    {
      name: "collection",
      value: data.cashFlow.collectionRatePct,
      fill: "#10b981",
    },
  ];

  // Reverse chronological ledger rows (most recent first, hiding empty future/zero rows optionally)
  const ledgerRows = useMemo(() => {
    const nonEmpty = [...activeSeries].reverse().filter((r) => r.ordersCount > 0);
    return nonEmpty.length > 0 ? nonEmpty : [...activeSeries].reverse().slice(0, 7);
  }, [activeSeries]);

  return (
    <div className="space-y-6 sm:space-y-7 font-outfit">
      {/* ─── HEADER ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
              <BarChart3 className="w-3 h-3 text-amber-600" />
              {isAr ? "التحليلات المتقدمة والتدفق المالي" : "Analytics & Cash Flow"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {isAr ? "الإحصائيات والتدفق النقدي (Cash Flow)" : "Statistiques & Flux de Trésorerie"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isAr
              ? "رؤية شاملة للأداء اليومي، الشهري والسنوي، متابعة تحصيل الكاش، أداء شركات التوصيل وأكثر العطور ربحية."
              : "Analyse complète journalière, mensuelle et annuelle : encaissements COD, trésorerie en transit, transporteurs et rentabilité."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 rounded-lg border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 text-xs font-semibold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAr ? "تصدير CSV (Excel)" : "Exporter CSV"}</span>
          </Button>
        </div>
      </div>

      {/* ─── ROW 1: REUI SPARKLINE PERIOD CARDS (DAILY / MONTHLY / YEARLY) + RADIAL GAUGE ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Daily (Area Sparkline) */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {isAr ? "اليوم (يومي)" : "Aujourd'hui (Jour)"}
              </span>
              <p className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                {formatPrice(data.periods.today.revenueDZD, locale)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                data.periods.today.revenueDeltaPct >= 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                  : "bg-rose-50 text-rose-700 border-rose-200/70"
              }`}
            >
              {data.periods.today.revenueDeltaPct >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {data.periods.today.revenueDeltaPct >= 0 ? "+" : ""}
              {data.periods.today.revenueDeltaPct}%
            </span>
          </div>

          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data.periods.today.sparkline}>
                <defs>
                  <linearGradient id="sparkDay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#d97706"
                  strokeWidth={2}
                  fill="url(#sparkDay)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
            <span>
              <strong className="text-zinc-900">{data.periods.today.ordersCount}</strong>{" "}
              {isAr ? "طلبية اليوم" : "cmd aujourd'hui"}
            </span>
            <span className="text-zinc-400">
              {isAr ? "أمس:" : "Hier:"} {formatPrice(data.periods.today.prevRevenueDZD, locale)}
            </span>
          </div>
        </div>

        {/* Card 2: Monthly (Mini Bar Sparkline) */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {isAr ? "هذا الشهر (شهري)" : "Ce Mois (Mensuel)"}
              </span>
              <p className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                {formatPrice(data.periods.thisMonth.revenueDZD, locale)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                data.periods.thisMonth.revenueDeltaPct >= 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                  : "bg-rose-50 text-rose-700 border-rose-200/70"
              }`}
            >
              {data.periods.thisMonth.revenueDeltaPct >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {data.periods.thisMonth.revenueDeltaPct >= 0 ? "+" : ""}
              {data.periods.thisMonth.revenueDeltaPct}%
            </span>
          </div>

          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data.periods.thisMonth.sparkline}>
                <Bar
                  dataKey="value"
                  fill="#4f46e5"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
            <span>
              <strong className="text-zinc-900">{data.periods.thisMonth.ordersCount}</strong>{" "}
              {isAr ? "طلبية هذا الشهر" : "cmd ce mois"}
            </span>
            <span className="text-emerald-700 font-semibold">
              {isAr ? "محصّل:" : "Cash:"}{" "}
              {formatPrice(data.periods.thisMonth.collectedDZD, locale)}
            </span>
          </div>
        </div>

        {/* Card 3: Yearly (Line Sparkline) */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {isAr ? "هذه السنة (سنوي)" : "Cette Année (Annuel)"}
              </span>
              <p className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                {formatPrice(data.periods.thisYear.revenueDZD, locale)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                data.periods.thisYear.revenueDeltaPct >= 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                  : "bg-rose-50 text-rose-700 border-rose-200/70"
              }`}
            >
              {data.periods.thisYear.revenueDeltaPct >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {data.periods.thisYear.revenueDeltaPct >= 0 ? "+" : ""}
              {data.periods.thisYear.revenueDeltaPct}%
            </span>
          </div>

          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={data.periods.thisYear.sparkline}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
            <span>
              <strong className="text-zinc-900">{data.periods.thisYear.ordersCount}</strong>{" "}
              {isAr ? "طلبية سنوياً" : "cmd cette année"}
            </span>
            <span className="text-emerald-700 font-semibold">
              {data.periods.thisYear.deliveredCount} {isAr ? "مسلّمة" : "livrées"}
            </span>
          </div>
        </div>

        {/* Card 4: ReUI Radial Cash Collection Gauge */}
        <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                {isAr ? "معدل تحصيل الكاش" : "Taux d'Encaissement"}
              </span>
              <p className="text-lg font-bold text-emerald-950 tracking-tight mt-0.5">
                {formatPrice(data.cashFlow.cashCollectedDZD, locale)}
              </p>
            </div>
            <div className="relative h-16 w-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadialBarChart
                  innerRadius="72%"
                  outerRadius="100%"
                  data={radialGaugeData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: "#d1fae5" }}
                    dataKey="value"
                    cornerRadius={8}
                    isAnimationActive={false}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-extrabold text-emerald-800">
                  {data.cashFlow.collectionRatePct}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-emerald-100 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">
                {isAr ? "قيد التحصيل (شركات الشحن):" : "COD chez transporteurs:"}
              </span>
              <span className="font-bold text-amber-700">
                {formatPrice(data.cashFlow.cashInTransitDZD, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">
                {isAr ? "متوسط قيمة الطلب:" : "Panier Moyen (AOV):"}
              </span>
              <span className="font-bold text-zinc-900">
                {formatPrice(data.cashFlow.avgOrderValueDZD, locale)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: MASTER INTERACTIVE REVENUE & CASH FLOW EXPLORER (DAILY / MONTHLY / YEARLY) ── */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)] overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-zinc-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900">
                  {isAr
                    ? "تطور المبيعات والتدفق النقدي (Cash Flow)"
                    : "Évolution des Revenus & Flux de Trésorerie"}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-zinc-500 mt-0.5">
                {granularity === "daily"
                  ? isAr
                    ? "تفاصيل آخر 30 يوماً — مقارنة المبيعات اليومية بالكاش المحصل فعلياً."
                    : "Détail des 30 derniers jours — comparez les commandes brutes au cash réellement encaissé."
                  : granularity === "monthly"
                  ? isAr
                    ? "الأداء الشهري لآخر 12 شهراً — تتبع النمو الموسمي وتدفق السيولة."
                    : "Performance mensuelle sur les 12 derniers mois — tendances saisonnières et trésorerie."
                  : isAr
                  ? "مقارنة الأداء السنوي وإجمالي النمو المالي."
                  : "Comparaison pluriannuelle du chiffre d'affaires et des encaissements."}
              </CardDescription>
            </div>

            {/* Interactive Controls: Timeframe Tabs + Chart Design Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Daily / Monthly / Yearly */}
              <div className="inline-flex rounded-lg bg-zinc-100/90 p-1 text-xs font-semibold border border-zinc-200/60">
                {[
                  { key: "daily" as Granularity, fr: "Journalier (30j)", ar: "يومي (30 يوم)" },
                  { key: "monthly" as Granularity, fr: "Mensuel (12m)", ar: "شهري (12 شهر)" },
                  { key: "yearly" as Granularity, fr: "Annuel", ar: "سنوي" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setGranularity(tab.key)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      granularity === tab.key
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    {isAr ? tab.ar : tab.fr}
                  </button>
                ))}
              </div>

              {/* Design Switch: Smooth Area vs Stacked Cash Flow */}
              <div className="inline-flex rounded-lg bg-zinc-100/90 p-1 text-xs font-semibold border border-zinc-200/60">
                <button
                  type="button"
                  onClick={() => setChartStyle("area")}
                  className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    chartStyle === "area"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {isAr ? "منحنى الإيرادات" : "Courbes"}
                </button>
                <button
                  type="button"
                  onClick={() => setChartStyle("cashflow")}
                  className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    chartStyle === "cashflow"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {isAr ? "أعمدة الكاش" : "Cash Flow"}
                </button>
              </div>
            </div>
          </div>

          {/* Period KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
            <div className="rounded-lg bg-zinc-50/90 border border-zinc-200/60 px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block">
                {isAr ? "إجمالي المبيعات" : "Ventes Brutes"}
              </span>
              <span className="text-sm sm:text-base font-bold text-zinc-900">
                {formatPrice(selectedPeriodTotals.gross, locale)}
              </span>
            </div>
            <div className="rounded-lg bg-emerald-50/60 border border-emerald-200/60 px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 block">
                {isAr ? "كاش محصّل" : "Cash Encaissé"}
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-900">
                {formatPrice(selectedPeriodTotals.collected, locale)}
              </span>
            </div>
            <div className="rounded-lg bg-amber-50/60 border border-amber-200/60 px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-800 block">
                {isAr ? "COD قيد التحصيل" : "COD En Attente"}
              </span>
              <span className="text-sm sm:text-base font-bold text-amber-900">
                {formatPrice(selectedPeriodTotals.pending, locale)}
              </span>
            </div>
            <div className="rounded-lg bg-indigo-50/50 border border-indigo-200/60 px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-700 block">
                {isAr ? "صافي العطور / الشحن" : "Produits / Livraison"}
              </span>
              <span className="text-xs sm:text-sm font-bold text-indigo-950 block truncate">
                {compactDZD(selectedPeriodTotals.merchandise)} / {compactDZD(selectedPeriodTotals.delivery)} DA
              </span>
            </div>
            <div className="col-span-2 lg:col-span-1 rounded-lg bg-rose-50/50 border border-rose-200/60 px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-700 block">
                {isAr ? "ملغاة / مرتجعة" : "Annulées / Retours"}
              </span>
              <span className="text-sm sm:text-base font-bold text-rose-800">
                {formatPrice(selectedPeriodTotals.cancelled, locale)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-zinc-600 mb-4">
            {chartStyle === "area" ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  {isAr ? "إجمالي المبيعات (DZD)" : "Ventes Brutes (DZD)"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {isAr ? "الكاش المحصّل (Cash)" : "Cash Encaissé (DZD)"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  {isAr ? "صافي العطور (بدون شحن)" : "Produits Net (Hors Livraison)"}
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  {isAr ? "كاش محصّل" : "Cash Encaissé"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
                  {isAr ? "COD قيد التحصيل" : "COD En Attente"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />
                  {isAr ? "ملغاة / مرتجعة" : "Pertes Annulées"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-zinc-900 rounded-full" />
                  {isAr ? "عدد الطلبيات" : "Nb Commandes"}
                </span>
              </>
            )}
          </div>

          <ChartContainer
            height={320}
            config={{
              grossRevenueDZD: { label: "Ventes Brutes", color: "#f59e0b" },
              cashCollectedDZD: { label: "Cash Encaissé", color: "#10b981" },
              merchandiseNetDZD: { label: "Produits Net", color: "#6366f1" },
              pendingCodDZD: { label: "COD En Attente", color: "#fbbf24" },
              cancelledValueDZD: { label: "Annulées", color: "#fb7185" },
            }}
          >
            {chartStyle === "area" ? (
              <AreaChart
                data={chartRows}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gradCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={granularity === "daily" ? 18 : 6}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={compactDZD}
                  width={48}
                  fontSize={11}
                />
                <Tooltip
                  content={
                    <ReuiChartTooltip
                      labelMap={tooltipLabels}
                      valueFormatter={formatTooltipValue}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="grossRevenueDZD"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#gradGross)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#f59e0b" }}
                />
                <Area
                  type="monotone"
                  dataKey="merchandiseNetDZD"
                  stroke="#6366f1"
                  strokeWidth={1.75}
                  strokeDasharray="4 3"
                  fill="url(#gradNet)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: "#6366f1" }}
                />
                <Area
                  type="monotone"
                  dataKey="cashCollectedDZD"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gradCash)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#10b981" }}
                />
              </AreaChart>
            ) : (
              <ComposedChart
                data={chartRows}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={granularity === "daily" ? 18 : 6}
                  fontSize={11}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={compactDZD}
                  width={48}
                  fontSize={11}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  fontSize={11}
                />
                <Tooltip
                  content={
                    <ReuiChartTooltip
                      labelMap={tooltipLabels}
                      valueFormatter={formatTooltipValue}
                    />
                  }
                />
                <Bar
                  yAxisId="left"
                  dataKey="cashCollectedDZD"
                  stackId="cash"
                  fill="#10b981"
                  radius={[0, 0, 4, 4]}
                  maxBarSize={36}
                />
                <Bar
                  yAxisId="left"
                  dataKey="pendingCodDZD"
                  stackId="cash"
                  fill="#fbbf24"
                  maxBarSize={36}
                />
                <Bar
                  yAxisId="left"
                  dataKey="cancelledValueDZD"
                  stackId="cash"
                  fill="#fb7185"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ordersCount"
                  stroke="#18181b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#18181b" }}
                  activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                />
              </ComposedChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ─── ROW 3: REUI CASH FLOW HEALTH STRIP (ALLOCATION METER) ─────────────── */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-zinc-900">
                {isAr
                  ? "توزيع التدفق النقدي الإجمالي (أين توجد أموالك الآن؟)"
                  : "Répartition Globale de la Trésorerie (Où est votre argent ?)"}
              </h3>
            </div>
            <span className="text-xs font-semibold text-zinc-500">
              {isAr ? "صافي البضاعة:" : "Revenu Parfums:"}{" "}
              <strong className="text-zinc-900">
                {formatPrice(data.cashFlow.merchandiseRevenueDZD, locale)}
              </strong>{" "}
              • {isAr ? "الشحن:" : "Livraison:"}{" "}
              <strong className="text-zinc-700">
                {formatPrice(data.cashFlow.deliveryFeesTotalDZD, locale)}
              </strong>
            </span>
          </div>

          {/* Segmented Cash Flow Progress Strip */}
          <div className="h-3.5 w-full rounded-full bg-zinc-100 overflow-hidden flex gap-0.5 p-0.5">
            {collectedShare > 0 && (
              <div
                style={{ width: `${collectedShare}%` }}
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                title={`Cash Encaissé: ${collectedShare}%`}
              />
            )}
            {transitShare > 0 && (
              <div
                style={{ width: `${transitShare}%` }}
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                title={`COD En Transit: ${transitShare}%`}
              />
            )}
            {lostShare > 0 && (
              <div
                style={{ width: `${lostShare}%` }}
                className="h-full rounded-full bg-rose-400 transition-all duration-500"
                title={`Annulées / Retours: ${lostShare}%`}
              />
            )}
          </div>

          {/* 4 Operational Conversion Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {isAr ? "نسبة التأكيد" : "Taux Confirmation"}
                </p>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">
                  {data.cashFlow.confirmationRatePct}%
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {isAr ? "نسبة التسليم" : "Taux Livraison"}
                </p>
                <p className="text-lg font-bold text-emerald-700 mt-0.5">
                  {data.cashFlow.deliveryRatePct}%
                </p>
              </div>
              <Truck className="w-5 h-5 text-emerald-500 shrink-0" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {isAr ? "في انتظار التسوية" : "Cash en Transit"}
                </p>
                <p className="text-base sm:text-lg font-bold text-amber-700 mt-0.5">
                  {formatPrice(data.cashFlow.cashInTransitDZD, locale)}
                </p>
              </div>
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {isAr ? "نسبة الإلغاء / المرتجع" : "Taux Annul. / Retour"}
                </p>
                <p className="text-lg font-bold text-rose-600 mt-0.5">
                  {data.cashFlow.cancellationRatePct}%
                </p>
              </div>
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── ROW 4: ORDER STATUS DONUT + PEAK WEEKDAY BAR CHART ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Design 3: ReUI Donut Chart with Center Total */}
        <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100">
            <CardTitle className="text-sm font-bold text-zinc-900">
              {isAr ? "توزيع حالات الطلبيات" : "Répartition par Statut de Commande"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              {isAr
                ? "نظرة دائرية على مراحل الطلبيات من الحجز حتى التسليم أو الإلغاء."
                : "Vue consolidée du cycle de vie de toutes les commandes enregistrées."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {nonZeroStatusData.length === 0 ? (
              <div className="h-[240px] flex flex-col items-center justify-center text-zinc-400 text-xs">
                <ShoppingBag className="w-7 h-7 mb-2 text-zinc-300" />
                <span>{isAr ? "لا توجد طلبيات بعد" : "Aucune commande enregistrée"}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={nonZeroStatusData}
                        dataKey="count"
                        nameKey={isAr ? "labelAr" : "labelFr"}
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {nonZeroStatusData.map((entry) => (
                          <Cell key={entry.key} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <ReuiChartTooltip
                            valueFormatter={(v) =>
                              `${v} ${isAr ? "طلبية" : "cmd"}`
                            }
                          />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Donut Total */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-zinc-900">
                      {data.totalOrdersAllTime}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                      {isAr ? "إجمالي" : "Total"}
                    </span>
                  </div>
                </div>

                {/* Custom Legend with Values */}
                <div className="space-y-2">
                  {data.statusDistribution.map((st) => {
                    const pct =
                      data.totalOrdersAllTime > 0
                        ? Math.round((st.count / data.totalOrdersAllTime) * 100)
                        : 0;
                    return (
                      <div
                        key={st.key}
                        className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded-lg hover:bg-zinc-50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: st.color }}
                          />
                          <span className="font-medium text-zinc-700 truncate">
                            {isAr ? st.labelAr : st.labelFr}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-zinc-900">{st.count}</span>
                          <span className="text-[10px] font-semibold text-zinc-400 w-8 text-end">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Design 4: Peak Ordering Days of the Week (Highlighted Column Bar Chart) */}
        <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 sm:p-5 pb-3 border-b border-zinc-100">
            <div>
              <CardTitle className="text-sm font-bold text-zinc-900">
                {isAr ? "أيام الذروة في الطلبيات" : "Jours de Pic d'Activité"}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                {isAr
                  ? "اكتشف أفضل أيام الأسبوع مبيعاً لتوجيه ميزانية الإعلانات."
                  : "Identifiez les meilleurs jours de vente pour optimiser vos campagnes pub."}
              </CardDescription>
            </div>
            {peakWeekdayIndex >= 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-[10px] font-bold text-amber-800 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {isAr
                  ? data.weekdayBreakdown[peakWeekdayIndex].labelAr
                  : data.weekdayBreakdown[peakWeekdayIndex].labelFr}
              </span>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <ChartContainer
              height={220}
              config={{
                orders: { label: "Commandes", color: "#f59e0b" },
              }}
            >
              <BarChart
                data={data.weekdayBreakdown.map((d) => ({
                  ...d,
                  label: isAr ? d.labelAr : d.labelFr,
                }))}
                margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={11} />
                <Tooltip
                  content={
                    <ReuiChartTooltip
                      labelMap={tooltipLabels}
                      valueFormatter={formatTooltipValue}
                    />
                  }
                />
                <Bar dataKey="orders" radius={[8, 8, 2, 2]} maxBarSize={38}>
                  {data.weekdayBreakdown.map((entry, idx) => (
                    <Cell
                      key={entry.dayIndex}
                      fill={idx === peakWeekdayIndex ? "#d97706" : "#e4e4e7"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 5: BOTTLE SIZE HORIZONTAL BAR CHART + CARRIER SCORECARDS ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Design 5: Horizontal Bar Chart — Bottle Size Demand */}
        <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-zinc-900">
                {isAr ? "المبيعات حسب حجم القارورة" : "Performance par Contenance (Format)"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500">
              {isAr
                ? "الأحجام الأكثر طلباً وإيراداً (25ml – 100ml وباقات)."
                : "Revenus générés par format de flacon pour anticiper vos achats de packaging."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {data.sizeBreakdown.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-zinc-400 text-xs">
                {isAr ? "لا توجد بيانات مبيعات للأحجام بعد" : "Aucune donnée de format enregistrée"}
              </div>
            ) : (
              <ChartContainer
                height={230}
                config={{
                  revenueDZD: { label: "Revenus", color: "#18181b" },
                }}
              >
                <BarChart
                  data={data.sizeBreakdown}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={compactDZD}
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey="size"
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    fontSize={11}
                  />
                  <Tooltip
                    content={
                      <ReuiChartTooltip
                        labelMap={tooltipLabels}
                        valueFormatter={formatTooltipValue}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenueDZD"
                    fill="#18181b"
                    radius={[0, 6, 6, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Design 6: Carrier Performance & COD Settlement Cards (Navex vs Anderson) */}
        <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-zinc-900">
                {isAr
                  ? "أداء شركات الشحن وتحصل الأموال (Navex & Anderson)"
                  : "Trésorerie & Performance Transporteurs"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500">
              {isAr
                ? "مقارنة الطرود المسلمة، الكاش المحصل والأموال العالقة لدى كل شركة توصيل."
                : "Suivi des colis livrés, fonds virés et montants COD restant à récupérer par transporteur."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3.5">
            {data.carrierStats.map((carrier) => {
              const isAnderson = carrier.carrier === "anderson";
              return (
                <div
                  key={carrier.carrier}
                  className={`rounded-xl border p-4 space-y-3 ${
                    isAnderson
                      ? "bg-orange-50/35 border-orange-200/70"
                      : "bg-zinc-50/70 border-zinc-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold ${
                          isAnderson ? "bg-orange-600" : "bg-zinc-900"
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{carrier.label}</p>
                        <p className="text-[11px] text-zinc-500">
                          {carrier.orders} {isAr ? "طرد مرسل" : "colis expédiés"} •{" "}
                          {carrier.delivered} {isAr ? "مسلّم" : "livrés"}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white border border-zinc-200 text-zinc-900">
                      {carrier.deliveryRatePct}% {isAr ? "تسليم" : "livré"}
                    </span>
                  </div>

                  {/* Delivery progress bar */}
                  <div className="h-1.5 bg-white rounded-full overflow-hidden border border-zinc-200/50">
                    <div
                      className={`h-full rounded-full ${
                        isAnderson ? "bg-orange-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${carrier.deliveryRatePct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-white rounded-lg p-2.5 border border-zinc-200/60">
                      <span className="text-[10px] text-zinc-400 font-semibold block">
                        {isAr ? "محصّل (Cash)" : "Encaissé"}
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatPrice(carrier.collectedDZD, locale)}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-zinc-200/60">
                      <span className="text-[10px] text-zinc-400 font-semibold block">
                        {isAr ? "عند الشركة (COD)" : "Reste à Encaisser"}
                      </span>
                      <span className="font-bold text-amber-700">
                        {formatPrice(carrier.pendingCodDZD, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 6: TOP PERFUMES & TOP WILAYAS RANKINGS ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Perfumes */}
        <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 pb-3 border-b border-zinc-100">
            <CardTitle className="text-sm font-bold text-zinc-900">
              {isAr ? "العطور الأكثر توليـداً للمداخيل" : "Top Parfums par Chiffre d'Affaires"}
            </CardTitle>
            <span className="text-[11px] font-semibold text-zinc-400">Top 8</span>
          </CardHeader>
          <CardContent className="p-0">
            {data.topProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                {isAr ? "لا توجد مبيعات مسجلة بعد" : "Aucune vente enregistrée"}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {data.topProducts.map((p, idx) => (
                  <div key={p.name} className="p-3.5 sm:px-5 space-y-1.5 text-xs hover:bg-zinc-50/60">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-zinc-900 truncate">{p.name}</span>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="font-bold text-zinc-900">
                          {formatPrice(p.revenueDZD, locale)}
                        </span>
                        <span className="ms-2 text-[11px] text-zinc-400">
                          ({p.units} {isAr ? "قارورة" : "u."})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full"
                          style={{ width: `${Math.min(100, p.sharePct)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-400 w-10 text-end">
                        {p.sharePct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Wilayas */}
        <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-zinc-900">
                {isAr ? "أفضل الولايات (المداخيل ومعدل التسليم)" : "Top Wilayas (Revenus & Livraison)"}
              </CardTitle>
            </div>
            <span className="text-[11px] font-semibold text-zinc-400">Top 8</span>
          </CardHeader>
          <CardContent className="p-0">
            {data.topWilayas.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                {isAr ? "لا توجد طلبيات مسجلة بعد" : "Aucune commande enregistrée"}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {data.topWilayas.map((w, idx) => (
                  <div
                    key={w.code}
                    className="p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-xs hover:bg-zinc-50/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 truncate">
                          {w.code} — {isAr ? w.nameAr : w.nameFr}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {w.orders} {isAr ? "طلبية" : "cmd"} •{" "}
                          <span className="text-emerald-700 font-semibold">
                            {w.deliveryRatePct}% {isAr ? "مسلمة" : "livrées"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 shrink-0">
                      {formatPrice(w.revenueDZD, locale)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 7: PERIOD CASH FLOW LEDGER TABLE (DAILY / MONTHLY / YEARLY) ───── */}
      <Card className="border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_24px_rgba(0,0,0,0.03)]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 pb-4 border-b border-zinc-100">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              <span>
                {granularity === "daily"
                  ? isAr
                    ? "دفتر التدفق النقدي اليومي"
                    : "Journal de Trésorerie Journalier"
                  : granularity === "monthly"
                  ? isAr
                    ? "دفتر التدفق النقدي الشهري"
                    : "Bilan de Trésorerie Mensuel"
                  : isAr
                  ? "دفتر التدفق النقدي السنوي"
                  : "Bilan de Trésorerie Annuel"}
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              {isAr
                ? "تفصيل رقمي لكل فترة (الطلبيات، صافي العطور، الشحن، الكاش المحصل، COD العالق)."
                : "Détail comptable par période : commandes, produits net, frais livraison, cash encaissé et COD en attente."}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="self-start sm:self-auto gap-1.5 text-xs rounded-lg border-zinc-200"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>CSV</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile Ledger Cards (< md) */}
          <div className="md:hidden divide-y divide-zinc-100">
            {ledgerRows.map((row) => {
              const colPct =
                row.grossRevenueDZD > 0
                  ? Math.round((row.cashCollectedDZD / row.grossRevenueDZD) * 100)
                  : 0;
              return (
                <div key={row.key} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">
                      {isAr ? row.labelAr : row.labelFr}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold text-[10px]">
                      {row.ordersCount} {isAr ? "طلبية" : "cmd"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">
                        {isAr ? "المبيعات" : "Ventes Brutes"}
                      </span>
                      <span className="font-bold text-zinc-900">
                        {formatPrice(row.grossRevenueDZD, locale)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 block">
                        {isAr ? "الكاش المحصل" : "Cash Encaissé"} ({colPct}%)
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatPrice(row.cashCollectedDZD, locale)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 block">
                        {isAr ? "COD معلق" : "COD En Attente"}
                      </span>
                      <span className="font-semibold text-amber-700">
                        {formatPrice(row.pendingCodDZD, locale)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">
                        {isAr ? "الشحن" : "Frais Livraison"}
                      </span>
                      <span className="font-semibold text-zinc-700">
                        {formatPrice(row.deliveryFeesDZD, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Ledger Table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-zinc-50/80 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">{isAr ? "الفترة" : "Période"}</th>
                  <th className="py-3 px-3 text-center">{isAr ? "الطلبيات" : "Cmd"}</th>
                  <th className="py-3 px-3 text-end">{isAr ? "المبيعات" : "Ventes Brutes"}</th>
                  <th className="py-3 px-3 text-end">{isAr ? "صافي العطور" : "Produits Net"}</th>
                  <th className="py-3 px-3 text-end">{isAr ? "التوصيل" : "Livraison"}</th>
                  <th className="py-3 px-3 text-end">{isAr ? "كاش محصل" : "Cash Encaissé"}</th>
                  <th className="py-3 px-3 text-end">{isAr ? "COD معلق" : "COD Attente"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "% التحصيل" : "% Cash"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                {ledgerRows.map((row) => {
                  const colPct =
                    row.grossRevenueDZD > 0
                      ? Math.round((row.cashCollectedDZD / row.grossRevenueDZD) * 100)
                      : 0;
                  return (
                    <tr key={row.key} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-900">
                        {isAr ? row.labelAr : row.labelFr}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 font-semibold text-zinc-700">
                          {row.ordersCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end font-bold text-zinc-900">
                        {formatPrice(row.grossRevenueDZD, locale)}
                      </td>
                      <td className="py-3 px-3 text-end text-zinc-600">
                        {formatPrice(row.merchandiseNetDZD, locale)}
                      </td>
                      <td className="py-3 px-3 text-end text-zinc-500">
                        {formatPrice(row.deliveryFeesDZD, locale)}
                      </td>
                      <td className="py-3 px-3 text-end font-bold text-emerald-700">
                        {formatPrice(row.cashCollectedDZD, locale)}
                      </td>
                      <td className="py-3 px-3 text-end font-semibold text-amber-700">
                        {formatPrice(row.pendingCodDZD, locale)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            colPct >= 75
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                              : colPct >= 40
                              ? "bg-amber-50 text-amber-800 border border-amber-200/70"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {colPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
