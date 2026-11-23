import { AdminOrder, getOrders } from "@/lib/services/orders.service";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria-locations";

export interface TimeSeriesPoint {
  key: string;
  labelFr: string;
  labelAr: string;
  ordersCount: number;
  confirmedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  grossRevenueDZD: number;       // Non-cancelled total_dzd
  merchandiseNetDZD: number;     // Non-cancelled subtotal_dzd
  deliveryFeesDZD: number;       // Non-cancelled delivery_fee_dzd
  cashCollectedDZD: number;      // isPaid === true (actual cash in hand)
  pendingCodDZD: number;         // Active non-cancelled orders not yet paid
  cancelledValueDZD: number;     // Lost revenue from cancelled/returned
  avgOrderValueDZD: number;
}

export interface PeriodSummary {
  revenueDZD: number;
  collectedDZD: number;
  pendingCodDZD: number;
  ordersCount: number;
  deliveredCount: number;
  cancelledCount: number;
  prevRevenueDZD: number;
  prevOrdersCount: number;
  revenueDeltaPct: number;
  ordersDeltaPct: number;
  sparkline: { label: string; value: number }[];
}

export interface StatusDistributionItem {
  key: string;
  labelFr: string;
  labelAr: string;
  count: number;
  valueDZD: number;
  color: string;
}

export interface SizeBreakdownItem {
  size: string;
  units: number;
  revenueDZD: number;
}

export interface WeekdayBreakdownItem {
  dayIndex: number;
  labelFr: string;
  labelAr: string;
  orders: number;
  revenueDZD: number;
}

export interface CarrierStatsItem {
  carrier: "navex" | "anderson";
  label: string;
  orders: number;
  delivered: number;
  collectedDZD: number;
  pendingCodDZD: number;
  deliveryRatePct: number;
}

export interface TopProductStat {
  name: string;
  units: number;
  revenueDZD: number;
  sharePct: number;
}

export interface TopWilayaStat {
  code: string;
  nameFr: string;
  nameAr: string;
  orders: number;
  delivered: number;
  revenueDZD: number;
  deliveryRatePct: number;
}

export interface DashboardStatisticsData {
  generatedAt: string;
  totalOrdersAllTime: number;

  // Headline Cash Flow Totals (All Time)
  cashFlow: {
    grossOrderedDZD: number;
    merchandiseRevenueDZD: number;
    deliveryFeesTotalDZD: number;
    cashCollectedDZD: number;
    cashInTransitDZD: number;        // Confirmed / Preparing / Shipped / Delivered unpaid
    lostCancelledDZD: number;
    avgOrderValueDZD: number;
    confirmationRatePct: number;
    deliveryRatePct: number;
    collectionRatePct: number;
    cancellationRatePct: number;
  };

  // Period Comparison Cards (Daily / Monthly / Yearly)
  periods: {
    today: PeriodSummary;
    thisMonth: PeriodSummary;
    thisYear: PeriodSummary;
  };

  // Interactive Time-Series Datasets
  dailySeries: TimeSeriesPoint[];     // Last 30 days
  monthlySeries: TimeSeriesPoint[];   // Last 12 months
  yearlySeries: TimeSeriesPoint[];    // Last 4 years (including current)

  // Breakdowns
  statusDistribution: StatusDistributionItem[];
  sizeBreakdown: SizeBreakdownItem[];
  weekdayBreakdown: WeekdayBreakdownItem[];
  carrierStats: CarrierStatsItem[];
  topProducts: TopProductStat[];
  topWilayas: TopWilayaStat[];
}

function calcDeltaPct(current: number, previous: number): number {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function isCancelledStatus(status: string): boolean {
  return status === "cancelled" || status === "returned" || status === "failed_delivery";
}

function isConfirmedOrBeyond(status: string): boolean {
  return ["confirmed", "preparing", "shipped", "delivered"].includes(status);
}

function createEmptyPoint(key: string, labelFr: string, labelAr: string): TimeSeriesPoint {
  return {
    key,
    labelFr,
    labelAr,
    ordersCount: 0,
    confirmedCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
    grossRevenueDZD: 0,
    merchandiseNetDZD: 0,
    deliveryFeesDZD: 0,
    cashCollectedDZD: 0,
    pendingCodDZD: 0,
    cancelledValueDZD: 0,
    avgOrderValueDZD: 0,
  };
}

function accumulateOrderIntoPoint(point: TimeSeriesPoint, order: AdminOrder) {
  point.ordersCount += 1;
  const total = Number(order.total) || 0;
  const subtotal = Number(order.subtotal) || 0;
  const deliveryFee = Number(order.deliveryFee) || 0;

  if (isCancelledStatus(order.status)) {
    point.cancelledCount += 1;
    point.cancelledValueDZD += total;
    return;
  }

  point.grossRevenueDZD += total;
  point.merchandiseNetDZD += subtotal;
  point.deliveryFeesDZD += deliveryFee;

  if (isConfirmedOrBeyond(order.status)) {
    point.confirmedCount += 1;
  }
  if (order.status === "delivered") {
    point.deliveredCount += 1;
  }
  if (order.isPaid) {
    point.cashCollectedDZD += total;
  } else {
    point.pendingCodDZD += total;
  }
}

function finalizePoint(point: TimeSeriesPoint): TimeSeriesPoint {
  const activeOrders = Math.max(0, point.ordersCount - point.cancelledCount);
  point.avgOrderValueDZD =
    activeOrders > 0 ? Math.round(point.grossRevenueDZD / activeOrders) : 0;
  return point;
}

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const MONTHS_AR = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const WEEKDAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function getDashboardStatistics(): Promise<DashboardStatisticsData> {
  const orders = await getOrders();
  const now = new Date();

  // 1. Build time buckets
  // Daily: last 30 days
  const dailyMap = new Map<string, TimeSeriesPoint>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = toDayKey(d);
    const dayNum = String(d.getDate()).padStart(2, "0");
    dailyMap.set(
      key,
      createEmptyPoint(
        key,
        `${dayNum} ${MONTHS_FR[d.getMonth()]}`,
        `${dayNum} ${MONTHS_AR[d.getMonth()]}`
      )
    );
  }

  // Monthly: last 12 months
  const monthlyMap = new Map<string, TimeSeriesPoint>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = toMonthKey(d);
    const shortYear = String(d.getFullYear()).slice(-2);
    monthlyMap.set(
      key,
      createEmptyPoint(
        key,
        `${MONTHS_FR[d.getMonth()]} ${shortYear}`,
        `${MONTHS_AR[d.getMonth()]} ${shortYear}`
      )
    );
  }

  // Yearly: last 4 years including current year (and any older year found in DB)
  const yearlyMap = new Map<string, TimeSeriesPoint>();
  for (let i = 3; i >= 0; i--) {
    const yr = String(now.getFullYear() - i);
    yearlyMap.set(yr, createEmptyPoint(yr, yr, yr));
  }

  // 2. Aggregators
  let grossOrderedDZD = 0;
  let merchandiseRevenueDZD = 0;
  let deliveryFeesTotalDZD = 0;
  let cashCollectedDZD = 0;
  let cashInTransitDZD = 0;
  let lostCancelledDZD = 0;
  let activeOrdersCount = 0;
  let confirmedOrdersCount = 0;
  let deliveredOrdersCount = 0;
  let cancelledOrdersCount = 0;

  const statusCounts: Record<string, { count: number; valueDZD: number }> = {
    new: { count: 0, valueDZD: 0 },
    confirmed: { count: 0, valueDZD: 0 },
    preparing: { count: 0, valueDZD: 0 },
    shipped: { count: 0, valueDZD: 0 },
    delivered: { count: 0, valueDZD: 0 },
    cancelled: { count: 0, valueDZD: 0 },
  };

  const sizeMap = new Map<string, { units: number; revenueDZD: number }>();
  const weekdayList: WeekdayBreakdownItem[] = WEEKDAYS_FR.map((fr, idx) => ({
    dayIndex: idx,
    labelFr: fr,
    labelAr: WEEKDAYS_AR[idx],
    orders: 0,
    revenueDZD: 0,
  }));

  const carrierMap: Record<
    "navex" | "anderson",
    { orders: number; delivered: number; collectedDZD: number; pendingCodDZD: number }
  > = {
    navex: { orders: 0, delivered: 0, collectedDZD: 0, pendingCodDZD: 0 },
    anderson: { orders: 0, delivered: 0, collectedDZD: 0, pendingCodDZD: 0 },
  };

  const productMap = new Map<string, { units: number; revenueDZD: number }>();
  const wilayaMap = new Map<
    string,
    { orders: number; delivered: number; revenueDZD: number }
  >();

  // Today / Yesterday / This Month / Last Month / This Year / Last Year keys
  const todayKey = toDayKey(now);
  const yesterdayKey = toDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const thisMonthKey = toMonthKey(now);
  const lastMonthKey = toMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const thisYearKey = String(now.getFullYear());
  const lastYearKey = String(now.getFullYear() - 1);

  for (const order of orders) {
    const dt = new Date(order.createdAt);
    const validDate = !Number.isNaN(dt.getTime()) ? dt : now;
    const dKey = toDayKey(validDate);
    const mKey = toMonthKey(validDate);
    const yKey = String(validDate.getFullYear());

    // Time series accumulation
    const dPoint = dailyMap.get(dKey);
    if (dPoint) accumulateOrderIntoPoint(dPoint, order);

    const mPoint = monthlyMap.get(mKey);
    if (mPoint) accumulateOrderIntoPoint(mPoint, order);

    if (!yearlyMap.has(yKey)) {
      yearlyMap.set(yKey, createEmptyPoint(yKey, yKey, yKey));
    }
    accumulateOrderIntoPoint(yearlyMap.get(yKey)!, order);

    // Status distribution
    const bucketKey = isCancelledStatus(order.status) ? "cancelled" : order.status;
    if (statusCounts[bucketKey]) {
      statusCounts[bucketKey].count += 1;
      statusCounts[bucketKey].valueDZD += Number(order.total) || 0;
    }

    const total = Number(order.total) || 0;
    const subtotal = Number(order.subtotal) || 0;
    const deliveryFee = Number(order.deliveryFee) || 0;

    if (isCancelledStatus(order.status)) {
      cancelledOrdersCount += 1;
      lostCancelledDZD += total;
      continue;
    }

    // Active (non-cancelled) metrics
    activeOrdersCount += 1;
    grossOrderedDZD += total;
    merchandiseRevenueDZD += subtotal;
    deliveryFeesTotalDZD += deliveryFee;

    if (isConfirmedOrBeyond(order.status)) confirmedOrdersCount += 1;
    if (order.status === "delivered") deliveredOrdersCount += 1;

    if (order.isPaid) {
      cashCollectedDZD += total;
    } else {
      cashInTransitDZD += total;
    }

    // Weekday activity
    const wd = weekdayList[validDate.getDay()];
    if (wd) {
      wd.orders += 1;
      wd.revenueDZD += total;
    }

    // Carrier stats (for dispatched or carrier-tagged orders)
    if (order.trackingCode || order.status === "shipped" || order.status === "delivered") {
      const cKey: "navex" | "anderson" =
        order.shippingCarrier === "anderson" ||
        order.deliveryService?.toLowerCase().includes("anderson")
          ? "anderson"
          : "navex";
      carrierMap[cKey].orders += 1;
      if (order.status === "delivered") carrierMap[cKey].delivered += 1;
      if (order.isPaid) carrierMap[cKey].collectedDZD += total;
      else carrierMap[cKey].pendingCodDZD += total;
    }

    // Product & Size stats
    for (const item of order.items) {
      const qty = Number(item.qty) || 1;
      const lineRev = (Number(item.unitPrice) || 0) * qty;

      const sizeKey = item.size || "50ml";
      const existingSize = sizeMap.get(sizeKey) || { units: 0, revenueDZD: 0 };
      sizeMap.set(sizeKey, {
        units: existingSize.units + qty,
        revenueDZD: existingSize.revenueDZD + lineRev,
      });

      const existingProd = productMap.get(item.name) || { units: 0, revenueDZD: 0 };
      productMap.set(item.name, {
        units: existingProd.units + qty,
        revenueDZD: existingProd.revenueDZD + lineRev,
      });
    }

    // Wilaya stats
    const wCode = String(order.wilaya || "").padStart(2, "0");
    const existingW = wilayaMap.get(wCode) || { orders: 0, delivered: 0, revenueDZD: 0 };
    wilayaMap.set(wCode, {
      orders: existingW.orders + 1,
      delivered: existingW.delivered + (order.status === "delivered" ? 1 : 0),
      revenueDZD: existingW.revenueDZD + total,
    });
  }

  const dailySeries = Array.from(dailyMap.values()).map(finalizePoint);
  const monthlySeries = Array.from(monthlyMap.values()).map(finalizePoint);
  const yearlySeries = Array.from(yearlyMap.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(finalizePoint);

  // Build Period Comparison Summaries
  const todayPoint = dailyMap.get(todayKey) || createEmptyPoint(todayKey, todayKey, todayKey);
  const yesterdayPoint =
    dailyMap.get(yesterdayKey) || createEmptyPoint(yesterdayKey, yesterdayKey, yesterdayKey);
  const thisMonthPoint =
    monthlyMap.get(thisMonthKey) || createEmptyPoint(thisMonthKey, thisMonthKey, thisMonthKey);
  const lastMonthPoint =
    monthlyMap.get(lastMonthKey) || createEmptyPoint(lastMonthKey, lastMonthKey, lastMonthKey);
  const thisYearPoint =
    yearlyMap.get(thisYearKey) || createEmptyPoint(thisYearKey, thisYearKey, thisYearKey);
  const lastYearPoint =
    yearlyMap.get(lastYearKey) || createEmptyPoint(lastYearKey, lastYearKey, lastYearKey);

  const todaySummary: PeriodSummary = {
    revenueDZD: todayPoint.grossRevenueDZD,
    collectedDZD: todayPoint.cashCollectedDZD,
    pendingCodDZD: todayPoint.pendingCodDZD,
    ordersCount: todayPoint.ordersCount,
    deliveredCount: todayPoint.deliveredCount,
    cancelledCount: todayPoint.cancelledCount,
    prevRevenueDZD: yesterdayPoint.grossRevenueDZD,
    prevOrdersCount: yesterdayPoint.ordersCount,
    revenueDeltaPct: calcDeltaPct(todayPoint.grossRevenueDZD, yesterdayPoint.grossRevenueDZD),
    ordersDeltaPct: calcDeltaPct(todayPoint.ordersCount, yesterdayPoint.ordersCount),
    sparkline: dailySeries.slice(-7).map((d) => ({ label: d.labelFr, value: d.grossRevenueDZD })),
  };

  const thisMonthSummary: PeriodSummary = {
    revenueDZD: thisMonthPoint.grossRevenueDZD,
    collectedDZD: thisMonthPoint.cashCollectedDZD,
    pendingCodDZD: thisMonthPoint.pendingCodDZD,
    ordersCount: thisMonthPoint.ordersCount,
    deliveredCount: thisMonthPoint.deliveredCount,
    cancelledCount: thisMonthPoint.cancelledCount,
    prevRevenueDZD: lastMonthPoint.grossRevenueDZD,
    prevOrdersCount: lastMonthPoint.ordersCount,
    revenueDeltaPct: calcDeltaPct(thisMonthPoint.grossRevenueDZD, lastMonthPoint.grossRevenueDZD),
    ordersDeltaPct: calcDeltaPct(thisMonthPoint.ordersCount, lastMonthPoint.ordersCount),
    sparkline: dailySeries.slice(-14).map((d) => ({ label: d.labelFr, value: d.grossRevenueDZD })),
  };

  const thisYearSummary: PeriodSummary = {
    revenueDZD: thisYearPoint.grossRevenueDZD,
    collectedDZD: thisYearPoint.cashCollectedDZD,
    pendingCodDZD: thisYearPoint.pendingCodDZD,
    ordersCount: thisYearPoint.ordersCount,
    deliveredCount: thisYearPoint.deliveredCount,
    cancelledCount: thisYearPoint.cancelledCount,
    prevRevenueDZD: lastYearPoint.grossRevenueDZD,
    prevOrdersCount: lastYearPoint.ordersCount,
    revenueDeltaPct: calcDeltaPct(thisYearPoint.grossRevenueDZD, lastYearPoint.grossRevenueDZD),
    ordersDeltaPct: calcDeltaPct(thisYearPoint.ordersCount, lastYearPoint.ordersCount),
    sparkline: monthlySeries.map((m) => ({ label: m.labelFr, value: m.grossRevenueDZD })),
  };

  const totalCount = orders.length;
  const statusDistribution: StatusDistributionItem[] = [
    { key: "new", labelFr: "Nouvelles", labelAr: "جديدة", color: "#3b82f6", ...statusCounts.new },
    { key: "confirmed", labelFr: "Confirmées", labelAr: "مؤكدة", color: "#f59e0b", ...statusCounts.confirmed },
    { key: "preparing", labelFr: "Préparation", labelAr: "تحضير", color: "#6366f1", ...statusCounts.preparing },
    { key: "shipped", labelFr: "Expédiées", labelAr: "مشحونة", color: "#a855f7", ...statusCounts.shipped },
    { key: "delivered", labelFr: "Livrées", labelAr: "مسلمة", color: "#10b981", ...statusCounts.delivered },
    { key: "cancelled", labelFr: "Annulées / Retours", labelAr: "ملغاة / مرتجع", color: "#f43f5e", ...statusCounts.cancelled },
  ];

  const sizeOrder = ["25ml", "30ml", "50ml", "80ml", "100ml", "Pack"];
  const sizeBreakdown: SizeBreakdownItem[] = Array.from(sizeMap.entries())
    .map(([size, stats]) => ({ size, ...stats }))
    .sort((a, b) => {
      const ia = sizeOrder.indexOf(a.size);
      const ib = sizeOrder.indexOf(b.size);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return b.revenueDZD - a.revenueDZD;
    });

  const carrierStats: CarrierStatsItem[] = (["navex", "anderson"] as const).map((c) => {
    const stats = carrierMap[c];
    return {
      carrier: c,
      label: c === "navex" ? "Navex Delivery" : "Anderson Logistique",
      orders: stats.orders,
      delivered: stats.delivered,
      collectedDZD: stats.collectedDZD,
      pendingCodDZD: stats.pendingCodDZD,
      deliveryRatePct: stats.orders > 0 ? Math.round((stats.delivered / stats.orders) * 100) : 0,
    };
  });

  const totalProdRev = Array.from(productMap.values()).reduce((s, p) => s + p.revenueDZD, 0) || 1;
  const topProducts: TopProductStat[] = Array.from(productMap.entries())
    .map(([name, stats]) => ({
      name,
      units: stats.units,
      revenueDZD: stats.revenueDZD,
      sharePct: Math.round((stats.revenueDZD / totalProdRev) * 1000) / 10,
    }))
    .sort((a, b) => b.revenueDZD - a.revenueDZD)
    .slice(0, 8);

  const topWilayas: TopWilayaStat[] = Array.from(wilayaMap.entries())
    .map(([code, stats]) => {
      const info = ALGERIA_WILAYAS.find((w) => w.code === code);
      return {
        code,
        nameFr: info?.name_fr || `Wilaya ${code}`,
        nameAr: info?.name_ar || `ولاية ${code}`,
        orders: stats.orders,
        delivered: stats.delivered,
        revenueDZD: stats.revenueDZD,
        deliveryRatePct: stats.orders > 0 ? Math.round((stats.delivered / stats.orders) * 100) : 0,
      };
    })
    .sort((a, b) => b.revenueDZD - a.revenueDZD)
    .slice(0, 8);

  return {
    generatedAt: now.toISOString(),
    totalOrdersAllTime: totalCount,
    cashFlow: {
      grossOrderedDZD,
      merchandiseRevenueDZD,
      deliveryFeesTotalDZD,
      cashCollectedDZD,
      cashInTransitDZD,
      lostCancelledDZD,
      avgOrderValueDZD:
        activeOrdersCount > 0 ? Math.round(grossOrderedDZD / activeOrdersCount) : 0,
      confirmationRatePct:
        totalCount > 0 ? Math.round((confirmedOrdersCount / totalCount) * 100) : 0,
      deliveryRatePct:
        totalCount > 0 ? Math.round((deliveredOrdersCount / totalCount) * 100) : 0,
      collectionRatePct:
        grossOrderedDZD > 0 ? Math.round((cashCollectedDZD / grossOrderedDZD) * 100) : 0,
      cancellationRatePct:
        totalCount > 0 ? Math.round((cancelledOrdersCount / totalCount) * 100) : 0,
    },
    periods: {
      today: todaySummary,
      thisMonth: thisMonthSummary,
      thisYear: thisYearSummary,
    },
    dailySeries,
    monthlySeries,
    yearlySeries,
    statusDistribution,
    sizeBreakdown,
    weekdayBreakdown: weekdayList,
    carrierStats,
    topProducts,
    topWilayas,
  };
}
