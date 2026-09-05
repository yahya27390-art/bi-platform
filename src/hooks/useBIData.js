// ============================================================
// BI HOOKS — Centralized data hooks consuming DataProvider
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { DataProvider } from '../lib/dataProvider';

// Generic async data hook
function useAsync(asyncFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (e) {
      setError(e.message || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}

// ── PERIODS ──────────────────────────────────────────────────
export function usePeriods() {
  return useAsync(() => DataProvider.getPeriods(), []);
}

// ── EXECUTIVE KPIs ────────────────────────────────────────────
export function useExecutiveKPIs(periodId) {
  return useAsync(() => DataProvider.getExecutiveKPIs(periodId), [periodId]);
}

// ── REVENUE TREND ─────────────────────────────────────────────
export function useRevenueTrend() {
  return useAsync(() => DataProvider.getRevenueTrend(), []);
}

// ── AD METRICS ────────────────────────────────────────────────
export function useAdMetrics(periodId) {
  return useAsync(() => DataProvider.getAdMetricsByPlatform(periodId), [periodId]);
}

export function useCampaigns(filters = {}) {
  const key = JSON.stringify(filters);
  return useAsync(() => DataProvider.getCampaigns(filters), [key]);
}

export function useAdFunnel(periodId, platform) {
  return useAsync(() => DataProvider.getAdFunnel(periodId, platform), [periodId, platform]);
}

// ── ECOMMERCE ─────────────────────────────────────────────────
export function useEcommerceStats(periodId) {
  return useAsync(() => DataProvider.getEcommerceStats(periodId), [periodId]);
}

// ── BRANCHES ──────────────────────────────────────────────────
export function useBranches() {
  return useAsync(() => DataProvider.getBranches(), []);
}

export function useBranchPerformance(branchId, periodId) {
  return useAsync(() => DataProvider.getBranchPerformance(branchId, periodId), [branchId, periodId]);
}

export function useBranchesWithPerformance(periodId) {
  return useAsync(
    () => DataProvider.getBranchesWithPerformance ? DataProvider.getBranchesWithPerformance(periodId) : Promise.resolve([]),
    [periodId]
  );
}

export function useBranchDailySales(branchId, periodId) {
  return useAsync(() => DataProvider.getBranchDailySales(branchId, periodId), [branchId, periodId]);
}

// ── PRODUCTS ──────────────────────────────────────────────────
export function useProducts(filters = {}) {
  const key = JSON.stringify(filters);
  return useAsync(() => DataProvider.getProducts(filters), [key]);
}

// ── FINANCIALS ────────────────────────────────────────────────
export function useFinancials(periodId) {
  return useAsync(() => DataProvider.getFinancials(periodId), [periodId]);
}

export function useFinancialsTrend() {
  return useAsync(() => DataProvider.getFinancialsTrend(), []);
}

// ── TARGETS ───────────────────────────────────────────────────
export function useTargets(periodId) {
  return useAsync(() => DataProvider.getTargets(periodId), [periodId]);
}

// ── IMPORT HISTORY ────────────────────────────────────────────
export function useImportHistory() {
  return useAsync(() => DataProvider.getImportHistory(), []);
}

// ── COMBINED: Main BI Data (for overview) ─────────────────────
export function useBIData(periodId) {
  const kpis      = useExecutiveKPIs(periodId);
  const trend     = useRevenueTrend();
  const adMetrics = useAdMetrics(periodId);
  const targets   = useTargets(periodId);

  return {
    kpis:      kpis.data,
    trend:     trend.data,
    adMetrics: adMetrics.data,
    targets:   targets.data,
    loading:   kpis.loading || trend.loading || adMetrics.loading,
    error:     kpis.error || trend.error || adMetrics.error,
  };
}
