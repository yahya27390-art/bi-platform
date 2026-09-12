// ============================================================
// MOCK PROVIDER — Implements IBIDataProvider with mock data
// All UI components consume this same interface as SupabaseProvider
// ============================================================

import {
  MOCK_PERIODS, MOCK_PLATFORMS, MOCK_AD_ACCOUNTS,
  MOCK_PLATFORM_PERIOD_METRICS, MOCK_CAMPAIGNS,
  MOCK_ECOMMERCE_STATS, MOCK_BRANCHES, MOCK_BRANCH_PERIOD_STATS,
  MOCK_BRANCH_DAILY_SALES, MOCK_PRODUCTS, MOCK_PRODUCT_METRICS,
  MOCK_FINANCIALS, MOCK_REVENUE_TREND, MOCK_TARGETS, MOCK_AD_FUNNELS,
} from '../../data/mockData';

import {
  calcROAS, calcCPA, calcCTR, calcCPC, calcCPM,
  calcConversionRate, calcGrowth, calcTargetAchievement,
  calcGrossProfit, calcGrossMargin, calcNetMargin, calcAOV, calcCAC,
} from '../kpiEngine';

const delay = (ms = 120) => new Promise(r => setTimeout(r, ms));

export class MockProvider {
  // ── Periods ─────────────────────────────────────────────────
  async getPeriods() {
    await delay(80);
    return MOCK_PERIODS;
  }

  async getCurrentPeriod() {
    await delay(60);
    return MOCK_PERIODS.find(p => p.isCurrent) || MOCK_PERIODS[0];
  }

  // ── Executive KPIs (derived from raw data) ───────────────────
  async getExecutiveKPIs(periodId) {
    await delay(150);
    const fin    = MOCK_FINANCIALS[periodId] || MOCK_FINANCIALS['p-2026-09'];
    const prev   = this._getPrevFinancials(periodId);
    const ecm    = MOCK_ECOMMERCE_STATS[periodId] || MOCK_ECOMMERCE_STATS['p-2026-09'];
    const metrics= MOCK_PLATFORM_PERIOD_METRICS[periodId] || MOCK_PLATFORM_PERIOD_METRICS['p-2026-09'];

    const totalAdSpend = metrics.reduce((s, m) => s + m.spend, 0);
    const totalAttrRev = metrics.reduce((s, m) => s + m.attributedRevenue, 0);
    const totalConv    = metrics.reduce((s, m) => s + m.conversions, 0);

    return {
      // Revenue (factual — from bi_orders + bi_branch_daily_sales)
      totalRevenue:       fin.totalRevenue,
      totalRevenueGrowth: fin.totalRevenueGrowth,
      ecommerceRevenue:   fin.ecommerceRevenue,
      branchRevenue:      fin.branchRevenue,

      // Profitability (factual)
      grossProfit:        fin.grossProfit,
      grossMarginPct:     fin.grossMarginPct,
      netProfit:          fin.netProfit,
      netProfitMarginPct: fin.netProfitMarginPct,
      netProfitGrowth:    prev ? calcGrowth(fin.netProfit, prev.netProfit) : 0,

      // Advertising (attributed — NOT total revenue)
      totalAdSpend,
      attributedRevenue:  totalAttrRev,  // platform-attributed
      overallROAS:        calcROAS(totalAttrRev, totalAdSpend),
      totalConversions:   totalConv,
      overallCPA:         calcCPA(totalAdSpend, totalConv),

      // Orders (factual — from bi_orders)
      totalOrders:        ecm.totalOrders,
      totalOrdersGrowth:  ecm.totalOrdersGrowth,
      newCustomers:       320 + Math.round(Math.random() * 50),
      avgOrderValue:      calcAOV(fin.ecommerceRevenue, ecm.totalOrders),
      conversionRate:     ecm.conversionRate,

      // Targets
      targetRevenue:      MOCK_TARGETS[periodId]?.revenue || 500000,
      targetAchievementPct: calcTargetAchievement(fin.totalRevenue, MOCK_TARGETS[periodId]?.revenue || 500000),
    };
  }

  // ── Revenue Trend ────────────────────────────────────────────
  async getRevenueTrend() {
    await delay(100);
    return MOCK_REVENUE_TREND;
  }

  // ── Platforms ────────────────────────────────────────────────
  async getPlatforms() {
    await delay(60);
    return MOCK_PLATFORMS;
  }

  async getAdAccounts() {
    await delay(80);
    return MOCK_AD_ACCOUNTS;
  }

  // ── Ad Metrics by Platform ──────────────────────────────────
  async getAdMetricsByPlatform(periodId) {
    await delay(100);
    const rawMetrics = MOCK_PLATFORM_PERIOD_METRICS[periodId] || MOCK_PLATFORM_PERIOD_METRICS['p-2026-09'];
    const prevMetrics = this._getPrevAdMetrics(periodId);

    return (rawMetrics || []).map(m => {
      const prev = prevMetrics?.find(p => p.platformSlug === m.platformSlug);
      const platform = MOCK_PLATFORMS.find(p => p.slug === m.platformSlug);
      const hasSpend = m.spend > 0;
      return {
        ...m,
        ...platform,
        // Calculated KPIs from raw fields
        roas:     hasSpend ? (m.roas || calcROAS(m.attributedRevenue, m.spend)) : 0,
        cpa:      hasSpend ? (m.costPerConversion !== undefined ? m.costPerConversion : calcCPA(m.spend, m.conversions)) : 0,
        ctr:      hasSpend ? (m.ctr !== undefined ? m.ctr : calcCTR(m.clicks, m.impressions)) : 0,
        cpc:      hasSpend ? (m.cpc !== undefined ? m.cpc : calcCPC(m.spend, m.clicks)) : 0,
        cpm:      hasSpend ? (m.cpm !== undefined ? m.cpm : calcCPM(m.spend, m.impressions)) : 0,
        convRate: hasSpend ? calcConversionRate(m.conversions, m.clicks) : 0,
        // Growth vs previous period
        spendGrowth:   prev && hasSpend ? calcGrowth(m.spend, prev.spend) : 0,
        roasGrowth:    prev && hasSpend ? calcGrowth(calcROAS(m.attributedRevenue, m.spend), calcROAS(prev.attributedRevenue, prev.spend)) : 0,
        convGrowth:    prev && hasSpend ? calcGrowth(m.conversions, prev.conversions) : 0,
        revenueGrowth: prev && hasSpend ? calcGrowth(m.attributedRevenue, prev.attributedRevenue) : 0,
      };
    });
  }

  // ── Campaigns ────────────────────────────────────────────────
  async getCampaigns(filters = {}) {
    await delay(120);
    let campaigns = [...MOCK_CAMPAIGNS];
    if (filters.periodId)  campaigns = campaigns.filter(c => c.periodId === filters.periodId);
    if (filters.platform)  campaigns = campaigns.filter(c => {
      const acc = MOCK_AD_ACCOUNTS.find(a => a.id === c.adAccountId);
      const plat = MOCK_PLATFORMS.find(p => p.id === acc?.platformId);
      return plat?.slug === filters.platform;
    });
    if (filters.status)    campaigns = campaigns.filter(c => c.status === filters.status);
    if (filters.branch)    campaigns = campaigns.filter(c => c.branchAttribution === filters.branch);

    return campaigns.map(c => {
      const acc  = MOCK_AD_ACCOUNTS.find(a => a.id === c.adAccountId);
      const plat = MOCK_PLATFORMS.find(p => p.id === acc?.platformId);
      const spend = c.spend !== undefined ? c.spend : (c.totalBudget || 0);
      const conv  = c.conversions !== undefined ? c.conversions : (spend > 0 ? Math.round(spend / 58) : 0);
      const roas  = c.roas !== undefined ? c.roas : (spend > 0 ? 4.2 : 0);
      const cpa   = c.cpa !== undefined ? c.cpa : (conv > 0 ? (spend / conv) : 0);
      return {
        ...c,
        platform: plat?.slug || (c.platformMeta?.platform || 'manual'),
        platformLabel: plat?.nameAr || 'يدوي',
        platformColor: plat?.color || '#6B7280',
        spend,
        conversions: conv,
        attributedRevenue: spend * roas,
        roas,
        cpa,
      };
    });
  }

  // ── Ad Funnel ────────────────────────────────────────────────
  async getAdFunnel(periodId, platform) {
    await delay(120);
    const funnels = MOCK_AD_FUNNELS[periodId] || MOCK_AD_FUNNELS['p-2026-09'];
    if (platform) return funnels[platform] || [];
    return funnels;
  }

  // ── E-commerce ───────────────────────────────────────────────
  async getEcommerceStats(periodId) {
    await delay(140);
    return MOCK_ECOMMERCE_STATS[periodId] || MOCK_ECOMMERCE_STATS['p-2026-09'];
  }

  // ── Branches ─────────────────────────────────────────────────
  async getBranches() {
    await delay(100);
    return MOCK_BRANCHES;
  }

  async getBranchById(branchId) {
    await delay(80);
    return MOCK_BRANCHES.find(b => b.id === branchId) || null;
  }

  async getBranchPerformance(branchId, periodId) {
    await delay(120);
    const branch = MOCK_BRANCHES.find(b => b.id === branchId);
    const stats  = MOCK_BRANCH_PERIOD_STATS[branchId]?.[periodId];
    if (!branch || !stats) return null;
    return {
      ...branch,
      ...stats,
      grossMarginPct: calcGrossMargin(stats.grossProfit, stats.revenue),
    };
  }

  async getBranchDailySales(branchId, periodId) {
    await delay(130);
    return MOCK_BRANCH_DAILY_SALES[branchId]?.[periodId] || [];
  }

  // Get all branches with performance for a period (map view)
  async getBranchesWithPerformance(periodId) {
    await delay(150);
    return MOCK_BRANCHES.map(b => {
      const stats = MOCK_BRANCH_PERIOD_STATS[b.id]?.[periodId] || {};
      return {
        ...b,
        ...stats,
        grossMarginPct: calcGrossMargin(stats.grossProfit || 0, stats.revenue || 0),
      };
    });
  }

  // ── Products ─────────────────────────────────────────────────
  async getProducts(filters = {}) {
    await delay(140);
    let products = MOCK_PRODUCTS.map(p => {
      const metrics = MOCK_PRODUCT_METRICS['p-2026-09'].find(m => m.productId === p.id) || {};
      return { ...p, ...metrics };
    });
    if (filters.category) products = products.filter(p => p.category === filters.category);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || (p.nameEn || '').toLowerCase().includes(q));
    }
    if (filters.sortBy) {
      products.sort((a, b) => filters.sortDesc ? (b[filters.sortBy] - a[filters.sortBy]) : (a[filters.sortBy] - b[filters.sortBy]));
    }
    return products;
  }

  async getProductMetrics(productId, periodId) {
    await delay(100);
    const metrics = MOCK_PRODUCT_METRICS[periodId] || MOCK_PRODUCT_METRICS['p-2026-09'];
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    const m = metrics.find(m => m.productId === productId);
    return product && m ? { ...product, ...m } : null;
  }

  // ── Financials ───────────────────────────────────────────────
  async getFinancials(periodId) {
    await delay(140);
    return MOCK_FINANCIALS[periodId] || MOCK_FINANCIALS['p-2026-09'];
  }

  async getFinancialsTrend() {
    await delay(110);
    return MOCK_REVENUE_TREND;
  }

  // ── Targets ──────────────────────────────────────────────────
  async getTargets(periodId) {
    await delay(90);
    return MOCK_TARGETS[periodId] || MOCK_TARGETS['p-2026-09'];
  }

  // ── Import History (Phase 1: empty) ─────────────────────────
  async getImportHistory() {
    await delay(80);
    return [
      { id: 'imp-001', importType: 'meta_ads', fileName: 'meta-ads-aug-2026.xlsx',
        status: 'completed', totalRows: 180, successfulRows: 178, warningRows: 2, failedRows: 0, duplicateRows: 0,
        uploadedAt: '2026-09-01T10:30:00Z', dataSourceId: 'ds-meta-manual' },
      { id: 'imp-002', importType: 'ecommerce_orders', fileName: 'salla-orders-aug-2026.xlsx',
        status: 'completed', totalRows: 1012, successfulRows: 1011, warningRows: 1, failedRows: 0, duplicateRows: 0,
        uploadedAt: '2026-09-02T09:15:00Z', dataSourceId: 'ds-salla' },
      { id: 'imp-003', importType: 'branch_sales', fileName: 'hyundai-sales-aug-2026.xlsx',
        status: 'completed', totalRows: 31, successfulRows: 31, warningRows: 0, failedRows: 0, duplicateRows: 0,
        uploadedAt: '2026-09-03T11:00:00Z', dataSourceId: 'ds-branch-manual' },
    ];
  }

  // ── Private Helpers ──────────────────────────────────────────
  _getPrevPeriodId(periodId) {
    const idx = MOCK_PERIODS.findIndex(p => p.id === periodId);
    return idx < MOCK_PERIODS.length - 1 ? MOCK_PERIODS[idx + 1]?.id : null;
  }

  _getPrevFinancials(periodId) {
    const prevId = this._getPrevPeriodId(periodId);
    return prevId ? MOCK_FINANCIALS[prevId] : null;
  }

  _getPrevAdMetrics(periodId) {
    const prevId = this._getPrevPeriodId(periodId);
    return prevId ? MOCK_PLATFORM_PERIOD_METRICS[prevId] : null;
  }
}
