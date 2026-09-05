// ============================================================
// DATA PROVIDER FACTORY — Returns the active provider
// Phase 1: MockProvider | Phase 2: SupabaseProvider
// ============================================================

import { BI_DATA_PROVIDER } from './biConstants';
import { MockProvider } from './providers/MockProvider';
import { SupabaseProvider } from './providers/SupabaseProvider';

let _provider = null;

export function getDataProvider() {
  if (_provider) return _provider;
  const envProvider = (import.meta.env.VITE_BI_DATA_PROVIDER || BI_DATA_PROVIDER).toLowerCase();
  if (envProvider === 'supabase') {
    _provider = new SupabaseProvider();
  } else {
    _provider = new MockProvider();
  }
  return _provider;
}

export const DataProvider = {
  getPeriods:              (...args) => getDataProvider().getPeriods(...args),
  getCurrentPeriod:        (...args) => getDataProvider().getCurrentPeriod(...args),
  getExecutiveKPIs:        (...args) => getDataProvider().getExecutiveKPIs(...args),
  getRevenueTrend:         (...args) => getDataProvider().getRevenueTrend(...args),
  getPlatforms:            (...args) => getDataProvider().getPlatforms(...args),
  getAdAccounts:           (...args) => getDataProvider().getAdAccounts(...args),
  getCampaigns:            (...args) => getDataProvider().getCampaigns(...args),
  getAdMetricsByPlatform:  (...args) => getDataProvider().getAdMetricsByPlatform(...args),
  getAdFunnel:             (...args) => getDataProvider().getAdFunnel(...args),
  getEcommerceStats:       (...args) => getDataProvider().getEcommerceStats(...args),
  getBranches:             (...args) => getDataProvider().getBranches(...args),
  getBranchById:           (...args) => getDataProvider().getBranchById(...args),
  getBranchPerformance:    (...args) => getDataProvider().getBranchPerformance(...args),
  getBranchDailySales:     (...args) => getDataProvider().getBranchDailySales(...args),
  getBranchesWithPerformance: (...args) => getDataProvider().getBranchesWithPerformance(...args),
  getProducts:             (...args) => getDataProvider().getProducts(...args),
  getProductMetrics:       (...args) => getDataProvider().getProductMetrics(...args),
  getFinancials:           (...args) => getDataProvider().getFinancials(...args),
  getFinancialsTrend:      (...args) => getDataProvider().getFinancialsTrend(...args),
  getTargets:              (...args) => getDataProvider().getTargets(...args),
  getImportHistory:        (...args) => getDataProvider().getImportHistory(...args),
};

export default DataProvider;
