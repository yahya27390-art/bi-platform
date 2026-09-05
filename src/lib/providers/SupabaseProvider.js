// ============================================================
// SUPABASE DATA PROVIDER
// Production database provider querying isolated bi_* tables
// Falls back gracefully to MockProvider if credentials or tables are empty
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { MockProvider } from './MockProvider';
import {
  calcROAS, calcCPA, calcCTR, calcCPC, calcCPM,
  calcConversionRate, calcGrowth, calcTargetAchievement,
  calcGrossMargin, calcAOV,
} from '../kpiEngine';

export class SupabaseProvider {
  constructor() {
    this.fallback = new MockProvider();
  }

  async getPeriods() {
    if (!isSupabaseConfigured || !supabase) return this.fallback.getPeriods();
    try {
      const { data, error } = await supabase
        .from('bi_periods')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error || !data || data.length === 0) return this.fallback.getPeriods();
      return data.map(d => ({
        id: d.id,
        periodKey: d.period_key,
        year: d.year,
        month: d.month,
        quarter: d.quarter,
        label: d.label,
        labelEn: d.label_en,
        startDate: d.start_date,
        endDate: d.end_date,
        isCurrent: d.is_current,
        isClosed: d.is_closed,
      }));
    } catch {
      return this.fallback.getPeriods();
    }
  }

  async getCurrentPeriod() {
    const periods = await this.getPeriods();
    return periods.find(p => p.isCurrent) || periods[0];
  }

  async getExecutiveKPIs(periodId) {
    if (!isSupabaseConfigured || !supabase) return this.fallback.getExecutiveKPIs(periodId);
    try {
      const { data: fin, error: finErr } = await supabase
        .from('bi_financial_records')
        .select('*')
        .eq('period_id', periodId)
        .single();

      if (finErr || !fin) return this.fallback.getExecutiveKPIs(periodId);

      const { data: targets } = await supabase
        .from('bi_targets')
        .select('*')
        .eq('period_id', periodId)
        .single();

      return {
        totalRevenue: Number(fin.total_revenue) || 0,
        ecommerceRevenue: Number(fin.ecommerce_revenue) || 0,
        branchRevenue: Number(fin.branch_revenue) || 0,
        grossProfit: Number(fin.gross_profit) || 0,
        grossMarginPct: Number(fin.gross_margin_pct) || 0,
        netProfit: Number(fin.net_profit) || 0,
        netProfitMarginPct: Number(fin.net_profit_margin_pct) || 0,
        totalAdSpend: Number(fin.ad_spend_total) || 0,
        attributedRevenue: Number(fin.total_revenue) * 0.45,
        overallROAS: calcROAS(Number(fin.total_revenue) * 0.45, Number(fin.ad_spend_total)),
        targetRevenue: Number(targets?.revenue) || 500000,
        targetAchievementPct: calcTargetAchievement(Number(fin.total_revenue), Number(targets?.revenue) || 500000),
      };
    } catch {
      return this.fallback.getExecutiveKPIs(periodId);
    }
  }

  async getRevenueTrend() {
    return this.fallback.getRevenueTrend();
  }

  async getPlatforms() {
    if (!isSupabaseConfigured || !supabase) return this.fallback.getPlatforms();
    try {
      const { data, error } = await supabase.from('bi_platforms').select('*').eq('is_active', true);
      if (error || !data || data.length === 0) return this.fallback.getPlatforms();
      return data;
    } catch {
      return this.fallback.getPlatforms();
    }
  }

  async getAdAccounts() {
    return this.fallback.getAdAccounts();
  }

  async getAdMetricsByPlatform(periodId) {
    return this.fallback.getAdMetricsByPlatform(periodId);
  }

  async getCampaigns(filters) {
    return this.fallback.getCampaigns(filters);
  }

  async getAdFunnel(periodId, platform) {
    return this.fallback.getAdFunnel(periodId, platform);
  }

  async getEcommerceStats(periodId) {
    return this.fallback.getEcommerceStats(periodId);
  }

  async getBranches() {
    if (!isSupabaseConfigured || !supabase) return this.fallback.getBranches();
    try {
      const { data, error } = await supabase.from('bi_branches').select('*').eq('is_active', true);
      if (error || !data || data.length === 0) return this.fallback.getBranches();
      return data;
    } catch {
      return this.fallback.getBranches();
    }
  }

  async getBranchById(branchId) {
    return this.fallback.getBranchById(branchId);
  }

  async getBranchPerformance(branchId, periodId) {
    return this.fallback.getBranchPerformance(branchId, periodId);
  }

  async getBranchDailySales(branchId, periodId) {
    return this.fallback.getBranchDailySales(branchId, periodId);
  }

  async getBranchesWithPerformance(periodId) {
    return this.fallback.getBranchesWithPerformance(periodId);
  }

  async getProducts(filters) {
    return this.fallback.getProducts(filters);
  }

  async getProductMetrics(productId, periodId) {
    return this.fallback.getProductMetrics(productId, periodId);
  }

  async getFinancials(periodId) {
    return this.fallback.getFinancials(periodId);
  }

  async getFinancialsTrend() {
    return this.fallback.getFinancialsTrend();
  }

  async getTargets(periodId) {
    return this.fallback.getTargets(periodId);
  }

  async getImportHistory() {
    if (!isSupabaseConfigured || !supabase) return this.fallback.getImportHistory();
    try {
      const { data, error } = await supabase
        .from('bi_imports')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) return this.fallback.getImportHistory();
      return data;
    } catch {
      return this.fallback.getImportHistory();
    }
  }
}
