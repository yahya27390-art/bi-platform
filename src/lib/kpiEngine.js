// ============================================================
// DORA CARS BI PLATFORM — CENTRALIZED KPI ENGINE v2
// ONE engine, all formulas, all definitions documented
// ============================================================

import { KPI_THRESHOLDS, BI_CURRENCY } from './biConstants';

// ── NUMBER FORMATTERS ─────────────────────────────────────────

export function formatSAR(value, compact = false) {
  if (value == null || isNaN(value)) return '—';
  if (compact) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}م ر.س`;
    if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}ك ر.س`;
    return `${Math.round(value).toLocaleString('ar-SA')} ر.س`;
  }
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency', currency: 'SAR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export function formatNum(value, decimals = 0) {
  if (value == null || isNaN(value)) return '—';
  return value.toLocaleString('ar-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value, { decimals = 1, showSign = true } = {}) {
  if (value == null || isNaN(value)) return '—';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatMultiplier(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}×`;
}

export function formatCompact(value) {
  if (value == null || isNaN(value)) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}K`;
  return Math.round(value).toLocaleString();
}

// ── KPI FORMULA DEFINITIONS ───────────────────────────────────
// Each formula is documented with: name, formula, sources, unit

/**
 * ROAS — Return on Ad Spend
 * Formula: Attributed Revenue / Ad Spend
 * Source:  bi_ad_daily_metrics.attributed_revenue / SUM(spend)
 * Unit:    multiplier (×)
 * NOTE:    Uses ATTRIBUTED revenue from platform, NOT total business revenue
 */
export function calcROAS(attributedRevenue, adSpend) {
  if (!adSpend || adSpend === 0) return 0;
  return attributedRevenue / adSpend;
}

/**
 * CPA — Cost Per Acquisition / Conversion
 * Formula: Ad Spend / Conversions
 * Source:  SUM(spend) / SUM(conversions)
 * Unit:    SAR
 */
export function calcCPA(adSpend, conversions) {
  if (!conversions || conversions === 0) return 0;
  return adSpend / conversions;
}

/**
 * CTR — Click-Through Rate
 * Formula: (Clicks / Impressions) × 100
 * Unit:    %
 */
export function calcCTR(clicks, impressions) {
  if (!impressions || impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

/**
 * CPC — Cost Per Click
 * Formula: Spend / Clicks
 * Unit:    SAR
 */
export function calcCPC(spend, clicks) {
  if (!clicks || clicks === 0) return 0;
  return spend / clicks;
}

/**
 * CPM — Cost Per Mille (1000 Impressions)
 * Formula: (Spend / Impressions) × 1000
 * Unit:    SAR
 */
export function calcCPM(spend, impressions) {
  if (!impressions || impressions === 0) return 0;
  return (spend / impressions) * 1000;
}

/**
 * Conversion Rate
 * Formula: (Conversions / Clicks) × 100
 * Unit:    %
 */
export function calcConversionRate(conversions, clicks) {
  if (!clicks || clicks === 0) return 0;
  return (conversions / clicks) * 100;
}

/**
 * ROI — Return on Investment (Business Level)
 * Formula: (Net Profit / Total Investment) × 100
 * Source:  bi_financial_records — uses TOTAL business revenue, NOT attributed
 * Unit:    %
 */
export function calcROI(netProfit, totalInvestment) {
  if (!totalInvestment || totalInvestment === 0) return 0;
  return (netProfit / totalInvestment) * 100;
}

/**
 * Gross Profit
 * Formula: Revenue - COGS
 * Unit:    SAR
 */
export function calcGrossProfit(revenue, cogs) {
  return (revenue || 0) - (cogs || 0);
}

/**
 * Gross Margin %
 * Formula: (Gross Profit / Revenue) × 100
 * Unit:    %
 */
export function calcGrossMargin(grossProfit, revenue) {
  if (!revenue || revenue === 0) return 0;
  return (grossProfit / revenue) * 100;
}

/**
 * Net Profit Margin %
 * Formula: (Net Profit / Revenue) × 100
 * Unit:    %
 */
export function calcNetMargin(netProfit, revenue) {
  if (!revenue || revenue === 0) return 0;
  return (netProfit / revenue) * 100;
}

/**
 * AOV — Average Order Value
 * Formula: Total Revenue / Total Orders
 * Unit:    SAR
 */
export function calcAOV(totalRevenue, totalOrders) {
  if (!totalOrders || totalOrders === 0) return 0;
  return totalRevenue / totalOrders;
}

/**
 * CAC — Customer Acquisition Cost
 * Formula: Total Marketing Spend / New Customers
 * Unit:    SAR
 */
export function calcCAC(totalMarketingSpend, newCustomers) {
  if (!newCustomers || newCustomers === 0) return 0;
  return totalMarketingSpend / newCustomers;
}

/**
 * Growth %
 * Formula: ((Current - Previous) / Previous) × 100
 * Unit:    %
 */
export function calcGrowth(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Target Achievement %
 * Formula: (Actual / Target) × 100 — capped at 150%
 * Unit:    %
 */
export function calcTargetAchievement(actual, target) {
  if (!target || target === 0) return 0;
  return Math.min((actual / target) * 100, 150);
}

/**
 * Aggregate ad metrics across multiple platforms
 * Returns a unified summary — NOTE: Revenue here is attributed, not total business
 */
export function calcAggregateAdMetrics(platforms) {
  const active = (platforms || []).filter(p => p.spend > 0);
  if (!active.length) return {
    totalSpend: 0, attributedRevenue: 0, totalConversions: 0,
    totalClicks: 0, totalImpressions: 0, roas: 0,
    cpa: 0, ctr: 0, cpm: 0, convRate: 0,
  };

  const totalSpend          = active.reduce((s, p) => s + (p.spend || 0), 0);
  const attributedRevenue   = active.reduce((s, p) => s + (p.revenue || 0), 0);
  const totalConversions    = active.reduce((s, p) => s + (p.conversions || 0), 0);
  const totalClicks         = active.reduce((s, p) => s + (p.clicks || 0), 0);
  const totalImpressions    = active.reduce((s, p) => s + (p.impressions || 0), 0);

  return {
    totalSpend,
    attributedRevenue,
    totalConversions,
    totalClicks,
    totalImpressions,
    roas:     calcROAS(attributedRevenue, totalSpend),
    cpa:      calcCPA(totalSpend, totalConversions),
    ctr:      calcCTR(totalClicks, totalImpressions),
    cpm:      calcCPM(totalSpend, totalImpressions),
    convRate: calcConversionRate(totalConversions, totalClicks),
  };
}

// ── KPI STATUS ────────────────────────────────────────────────

export function getKPIStatus(metric, value) {
  const t = KPI_THRESHOLDS[metric];
  if (!t || value == null) return 'neutral';
  if (t.inverted) {
    if (value <= t.good)    return 'good';
    if (value <= t.warning) return 'warning';
    return 'critical';
  }
  if (value >= t.good)    return 'good';
  if (value >= t.warning) return 'warning';
  return 'critical';
}

export const STATUS_STYLES = {
  good:    { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hex: '#10B981' },
  warning: { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',  hex: '#F59E0B' },
  critical:{ text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',    hex: '#EF4444' },
  neutral: { text: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',  hex: '#6B7280' },
};

export function getTrend(growth) {
  if (growth > 0.5)  return 'up';
  if (growth < -0.5) return 'down';
  return 'flat';
}
