// ============================================================
// DORA CARS BI — COMPREHENSIVE MOCK DATA (3 months, consistent)
// All data is internally consistent:
//   Orders → Order Items → Products → Revenue
//   Ad Metrics → Campaigns → Platforms
//   Branches → Daily Sales → Monthly Aggregation
// ============================================================

// ── PERIODS ───────────────────────────────────────────────────
export const MOCK_PERIODS = [
  { id: 'p-2026-10', periodKey: '2026-10', year: 2026, month: 10, quarter: 4,
    label: 'أكتوبر 2026 (المعتمد بالفواتير)', labelEn: 'Oct 2026 (Audited)',
    startDate: '2026-10-01', endDate: '2026-10-31', isCurrent: true, isClosed: true, isAudited: true },
  { id: 'p-2026-09', periodKey: '2026-09', year: 2026, month: 9, quarter: 3,
    label: 'سبتمبر 2026 (المعتمد بالفواتير)', labelEn: 'Sep 2026 (Audited)',
    startDate: '2026-09-01', endDate: '2026-09-30', isCurrent: false, isClosed: true, isAudited: true },
  { id: 'p-2026-08', periodKey: '2026-08', year: 2026, month: 8, quarter: 3,
    label: 'أغسطس 2026 (المعتمد بالفواتير)', labelEn: 'Aug 2026 (Audited)',
    startDate: '2026-08-01', endDate: '2026-08-31', isCurrent: false, isClosed: true, isAudited: true },
  { id: 'p-2026-07', periodKey: '2026-07', year: 2026, month: 7, quarter: 3,
    label: 'يوليو 2026 (مقفل)', labelEn: 'Jul 2026 (Closed)',
    startDate: '2026-07-01', endDate: '2026-07-31', isCurrent: false, isClosed: true, isAudited: true },
];

// ── PLATFORMS (seed) ──────────────────────────────────────────
export const MOCK_PLATFORMS = [
  { id: 'plat-meta',     slug: 'meta',     name: 'Meta Ads', nameAr: 'ميتا',      color: '#3B82F6', isActive: true },
  { id: 'plat-google',   slug: 'google',   name: 'Google Ads', nameAr: 'جوجل',    color: '#10B981', isActive: true },
  { id: 'plat-tiktok',   slug: 'tiktok',   name: 'TikTok Ads', nameAr: 'تيك توك', color: '#8B5CF6', isActive: true },
  { id: 'plat-manual',   slug: 'manual',   name: 'Manual', nameAr: 'يدوي',        color: '#6B7280', isActive: true },
];

// ── AD ACCOUNTS ───────────────────────────────────────────────
export const MOCK_AD_ACCOUNTS = [
  { id: 'acc-meta-001', platformId: 'plat-meta',   accountIdExternal: 'act_123456789', accountName: 'Dora Cars - Meta Main', currency: 'SAR', status: 'active' },
  { id: 'acc-google-001', platformId: 'plat-google', accountIdExternal: '7891234567', accountName: 'Dora Cars - Google Main', currency: 'SAR', status: 'active' },
  { id: 'acc-tiktok-001', platformId: 'plat-tiktok', accountIdExternal: 'TT-DC-001', accountName: 'Dora Cars - TikTok Main', currency: 'SAR', status: 'active' },
];

// ── DATA SOURCES ──────────────────────────────────────────────
export const MOCK_DATA_SOURCES = [
  { id: 'ds-meta-manual',   name: 'Meta Ads Export', type: 'XLSX', platformSlug: 'meta',   isActive: true },
  { id: 'ds-google-manual', name: 'Google Ads Export', type: 'XLSX', platformSlug: 'google', isActive: true },
  { id: 'ds-tiktok-manual', name: 'TikTok Ads Export', type: 'XLSX', platformSlug: 'tiktok', isActive: true },
  { id: 'ds-salla',         name: 'Salla Orders Export', type: 'XLSX', platformSlug: null,   isActive: true },
  { id: 'ds-branch-manual', name: 'Branch Sales Entry', type: 'MANUAL_ENTRY', platformSlug: null, isActive: true },
  { id: 'ds-finance',       name: 'Finance Monthly', type: 'XLSX', platformSlug: null,      isActive: true },
];

// ── CAMPAIGNS ─────────────────────────────────────────────────
export const MOCK_CAMPAIGNS = [
  // Oct 2026 (Actual Authentic Dora Cars Campaigns from Google, Meta, TikTok official reports)
  // Meta Ads (From "ميتا شهر 10 2026 انفاق.csv" - Spend: 2,901.45 SAR, Reach: 200,058, Impressions: 525,662)
  { id: 'camp-oct-01', adAccountId: 'acc-meta-001', periodId: 'p-2026-10',
    name: 'حملة تفاعل واتساب 14/4/2026', nameEn: 'WhatsApp Engagement Campaign Oct',
    objective: 'messages', status: 'ended', buyingType: 'auction',
    dailyBudget: 90, totalBudget: 2831.52, startDate: '2026-10-01', endDate: '2026-10-31',
    branchAttribution: 'all', platformMeta: { platform: 'meta' } },
  { id: 'camp-oct-02', adAccountId: 'acc-meta-001', periodId: 'p-2026-10',
    name: 'حملة وعي لبريدة', nameEn: 'Buraydah Awareness Campaign Oct',
    objective: 'awareness', status: 'ended', buyingType: 'reach',
    dailyBudget: 10, totalBudget: 69.93, startDate: '2026-10-01', endDate: '2026-10-31',
    branchAttribution: 'all', platformMeta: { platform: 'meta' } },

  // Google Ads (From "تقرير أداء الحملة جوجل.xlsx" - Spend: 5,105.97 SAR, 135,797 Impr, 40,619 Inter, 9,662 Clicks)
  { id: 'camp-oct-03', adAccountId: 'acc-google-001', periodId: 'p-2026-10',
    name: 'DEC Search Campaign', nameEn: 'DEC Search Campaign Oct',
    objective: 'search', status: 'ended', buyingType: 'cpc',
    dailyBudget: 65, totalBudget: 1996.19, startDate: '2026-10-01', endDate: '2026-10-31',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'google' } },
  { id: 'camp-oct-04', adAccountId: 'acc-google-001', periodId: 'p-2026-10',
    name: 'Google Maps KIA', nameEn: 'Google Maps KIA Oct',
    objective: 'local_store_visits', status: 'ended', buyingType: 'pmax',
    dailyBudget: 40, totalBudget: 1180.87, startDate: '2026-10-01', endDate: '2026-10-31',
    branchAttribution: 'kia', platformMeta: { platform: 'google' } },
  { id: 'camp-oct-05', adAccountId: 'acc-google-001', periodId: 'p-2026-10',
    name: 'Google Maps Main (الفرع الرئيسي)', nameEn: 'Google Maps Main Oct',
    objective: 'local_store_visits', status: 'ended', buyingType: 'pmax',
    dailyBudget: 35, totalBudget: 1028.00, startDate: '2026-10-01', endDate: '2026-10-31',
    branchAttribution: 'main', platformMeta: { platform: 'google' } },
  { id: 'camp-oct-06', adAccountId: 'acc-google-001', periodId: 'p-2026-10',
    name: 'Google Maps Hyundai (الرواف)', nameEn: 'Google Maps Hyundai Rawaf Oct',
    objective: 'local_store_visits', status: 'ended', buyingType: 'pmax',
    dailyBudget: 30, totalBudget: 900.91, startDate: '2026-10-01', endDate: '2026-10-31',
    branchAttribution: 'al-rawaf', platformMeta: { platform: 'google' } },

  // TikTok Ads (From "تقرير حملة تيك توك أكتوبر.xlsx" - Spend: 1,062.58 SAR, 400,700 Impr, 7,583 Clicks)
  { id: 'camp-oct-07', adAccountId: 'acc-tiktok-001', periodId: 'p-2026-10',
    name: 'Traffic22/7/2026', nameEn: 'TikTok Traffic Oct',
    objective: 'traffic', status: 'ended', buyingType: 'cpc',
    dailyBudget: 30, totalBudget: 935.74, startDate: '2026-10-01', endDate: '2026-10-31',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'tiktok' } },
  { id: 'camp-oct-08', adAccountId: 'acc-tiktok-001', periodId: 'p-2026-10',
    name: 'Community الوعي 10/8/2026', nameEn: 'TikTok Community Awareness Oct',
    objective: 'community', status: 'ended', buyingType: 'cpm',
    dailyBudget: 5, totalBudget: 126.84, startDate: '2026-10-01', endDate: '2026-10-31',
    branchAttribution: 'all', platformMeta: { platform: 'tiktok' } },

  // Sep 2026 (Actual Authentic Dora Cars Campaigns from Meta, Google, TikTok reports)
  // Meta Ads (From Ads-Dora-Campaigns-Sep-1-2026-Sep-30-2026 ميتا.csv - Spend: 2,725.77 SAR, 1,477 Contacts)
  { id: 'camp-sep-01', adAccountId: 'acc-meta-001', periodId: 'p-2026-09',
    name: 'حملة تفاعل واتساب 14/4/2026', nameEn: 'WhatsApp Engagement Campaign Sep',
    objective: 'messages', status: 'ended', buyingType: 'auction',
    dailyBudget: 50, totalBudget: 1238.47, startDate: '2026-09-01', endDate: '2026-09-30',
    branchAttribution: 'all', platformMeta: { platform: 'meta' } },
  { id: 'camp-sep-02', adAccountId: 'acc-meta-001', periodId: 'p-2026-09',
    name: 'New Sales Campaign 1/9/2026', nameEn: 'New Sales Campaign Sep',
    objective: 'sales', status: 'ended', buyingType: 'auction',
    dailyBudget: 50, totalBudget: 1176.28, startDate: '2026-09-01', endDate: '2026-09-30',
    branchAttribution: 'all', platformMeta: { platform: 'meta' } },
  { id: 'camp-sep-03', adAccountId: 'acc-meta-001', periodId: 'p-2026-09',
    name: 'اليوم الوطني 96', nameEn: 'National Day 96 Campaign',
    objective: 'awareness', status: 'ended', buyingType: 'reach',
    dailyBudget: 30, totalBudget: 311.02, startDate: '2026-09-15', endDate: '2026-09-30',
    branchAttribution: 'all', platformMeta: { platform: 'meta' } },

  // Google Ads (From أداء الحملة جوجل.png - Spend: 4,480.11 SAR, 9,521 clicks, 2,503 convs)
  { id: 'camp-sep-04', adAccountId: 'acc-google-001', periodId: 'p-2026-09',
    name: 'حملات البحث والخرائط الموحدة شهر 9', nameEn: 'Unified Search & Local Maps Campaign Sep',
    objective: 'local_store_visits', status: 'ended', buyingType: 'cpc',
    dailyBudget: 150, totalBudget: 4480.11, startDate: '2026-09-01', endDate: '2026-09-30',
    branchAttribution: 'all', platformMeta: { platform: 'google' } },

  // TikTok Ads (From Screenshot 2026-10-02 184727 تيك توك.png - Spend: 1,117.14 SAR, 13,915 clicks)
  { id: 'camp-sep-05', adAccountId: 'acc-tiktok-001', periodId: 'p-2026-09',
    name: 'حملة الترافيك والتحويلات تيك توك شهر 9', nameEn: 'TikTok Traffic & Conversions Sep',
    objective: 'traffic', status: 'ended', buyingType: 'cpc',
    dailyBudget: 40, totalBudget: 1117.14, startDate: '2026-09-01', endDate: '2026-09-30',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'tiktok' } },

  // Aug 2026 (Actual Authentic Dora Cars Campaigns from Meta, Google, TikTok reports)
  // Meta Ads (From تقرير حملات ميتا شهر 8.xlsx - Spend: 3,221.60 SAR, 1,617 WhatsApp convs)
  { id: 'camp-aug-01', adAccountId: 'acc-meta-001', periodId: 'p-2026-08',
    name: 'حملة تفاعل واتساب 14/4/2026', nameEn: 'WhatsApp Engagement Campaign',
    objective: 'messages', status: 'ended', buyingType: 'auction',
    dailyBudget: 100, totalBudget: 2930.42, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'all', platformMeta: { platform: 'meta' } },
  { id: 'camp-aug-02', adAccountId: 'acc-meta-001', periodId: 'p-2026-08',
    name: 'حملة وعي لبريدة', nameEn: 'Buraydah Awareness Campaign',
    objective: 'awareness', status: 'ended', buyingType: 'reach',
    dailyBudget: 50, totalBudget: 291.18, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'all', platformMeta: { platform: 'meta' } },

  // Google Ads (From تقرير أداء الحملة شهر أغسطس.xlsx - Spend: 4,660.27 SAR, 89,820 interactions)
  { id: 'camp-aug-03', adAccountId: 'acc-google-001', periodId: 'p-2026-08',
    name: 'DEC Search Campaign', nameEn: 'DEC Search Campaign',
    objective: 'search', status: 'ended', buyingType: 'cpc',
    dailyBudget: 100, totalBudget: 1730.97, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'google' } },
  { id: 'camp-aug-04', adAccountId: 'acc-google-001', periodId: 'p-2026-08',
    name: 'Google Maps KIA', nameEn: 'Google Maps KIA',
    objective: 'local_store_visits', status: 'ended', buyingType: 'pmax',
    dailyBudget: 56, totalBudget: 599.56, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'kia', platformMeta: { platform: 'google' } },
  { id: 'camp-aug-05', adAccountId: 'acc-google-001', periodId: 'p-2026-08',
    name: 'Google Maps', nameEn: 'Google Maps General',
    objective: 'local_store_visits', status: 'ended', buyingType: 'pmax',
    dailyBudget: 49, totalBudget: 1146.32, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'all', platformMeta: { platform: 'google' } },
  { id: 'camp-aug-06', adAccountId: 'acc-google-001', periodId: 'p-2026-08',
    name: 'Google Maps Hyundai', nameEn: 'Google Maps Hyundai',
    objective: 'local_store_visits', status: 'ended', buyingType: 'pmax',
    dailyBudget: 50, totalBudget: 807.52, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'al-rawaf', platformMeta: { platform: 'google' } },
  { id: 'camp-aug-07', adAccountId: 'acc-google-001', periodId: 'p-2026-08',
    name: 'حملة خرائط الفرع الثالث', nameEn: 'Branch 3 Google Maps',
    objective: 'local_store_visits', status: 'ended', buyingType: 'pmax',
    dailyBudget: 60, totalBudget: 316.84, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'al-rawaf', platformMeta: { platform: 'google' } },
  { id: 'camp-aug-08', adAccountId: 'acc-google-001', periodId: 'p-2026-08',
    name: 'حملة الفرع الرئيسي', nameEn: 'Main Branch Local Campaign',
    objective: 'local_store_visits', status: 'ended', buyingType: 'pmax',
    dailyBudget: 40, totalBudget: 59.06, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'main', platformMeta: { platform: 'google' } },

  // TikTok Ads (From تقرير مفصل حملات التيكتوك شهر 8.xlsx - Spend: 1,521.13 SAR, 23,132 clicks)
  { id: 'camp-aug-09', adAccountId: 'acc-tiktok-001', periodId: 'p-2026-08',
    name: 'Traffic22/7/2026', nameEn: 'TikTok Traffic Campaign',
    objective: 'traffic', status: 'ended', buyingType: 'cpc',
    dailyBudget: 50, totalBudget: 1389.20, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'tiktok' } },
  { id: 'camp-aug-10', adAccountId: 'acc-tiktok-001', periodId: 'p-2026-08',
    name: 'المبيعات 3/8/2026', nameEn: 'TikTok Sales Conversions',
    objective: 'conversions', status: 'ended', buyingType: 'cpc',
    dailyBudget: 20, totalBudget: 36.14, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'tiktok' } },
  { id: 'camp-aug-11', adAccountId: 'acc-tiktok-001', periodId: 'p-2026-08',
    name: 'Community الوعي 10/8/2026', nameEn: 'TikTok Community Awareness',
    objective: 'community', status: 'ended', buyingType: 'cpm',
    dailyBudget: 10, totalBudget: 95.79, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'all', platformMeta: { platform: 'tiktok' } },
];

// ── PLATFORM DAILY METRICS (aggregated per platform per period) ────
// These are derived/summarized — real system would use daily rows
export const MOCK_PLATFORM_PERIOD_METRICS = {
  'p-2026-10': [
    { platformSlug: 'google', spend: 5105.97, impressions: 135797, reach: 110000,
      clicks: 9662, linkClicks: 5250, attributedRevenue: 26713.62,
      conversions: 40619, costPerConversion: 0.13, videoViews: 0, frequency: 1.23,
      cpc: 0.53, ctr: 29.91, searchCtr: 16.76,
      mobileShare: 97.0, crossNetworkShare: 60.9, searchShare: 39.1,
      attributionModel: 'last_click', attributionWindow: '30d_click',
      dataSourceId: 'ds-google-manual', isLiveReady: true },
    { platformSlug: 'meta', spend: 2901.45, impressions: 525662, reach: 200058,
      clicks: 2930, linkClicks: 2930, attributedRevenue: 85000.00,
      conversions: 1736, videoViews: 445000, frequency: 2.63,
      cpc: 0.99, ctr: 0.56, costPerConversion: 1.67,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-meta-manual', isLiveReady: true },
    { platformSlug: 'tiktok', spend: 1062.58, impressions: 400700, reach: 320000,
      clicks: 7583, linkClicks: 7583, attributedRevenue: 12000.00,
      conversions: 12, videoViews: 380000, frequency: 1.25,
      cpc: 0.14, ctr: 1.89, cpm: 2.65,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-tiktok-manual', isLiveReady: true },
  ],
  'p-2026-09': [
    { platformSlug: 'google', spend: 4480.11, impressions: 99703, reach: 75000,
      clicks: 9521, linkClicks: 3200, attributedRevenue: 37725.08,
      conversions: 2503, costPerConversion: 1.79, videoViews: 0, frequency: 1.33,
      cpc: 0.47, ctr: 9.55, searchCtr: 14.2,
      mobileShare: 96.2, crossNetworkShare: 64.5, searchShare: 35.5,
      attributionModel: 'last_click', attributionWindow: '30d_click',
      dataSourceId: 'ds-google-manual', isLiveReady: true },
    { platformSlug: 'meta', spend: 2725.77, impressions: 482095, reach: 203154,
      clicks: 2840, linkClicks: 2840, attributedRevenue: 97871.09,
      conversions: 1477, videoViews: 412000, frequency: 2.37,
      cpc: 0.96, ctr: 1.48, costPerConversion: 1.85,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-meta-manual', isLiveReady: true },
    { platformSlug: 'tiktok', spend: 1117.14, impressions: 483951, reach: 350000,
      clicks: 13915, linkClicks: 13620, attributedRevenue: 15000,
      conversions: 18, videoViews: 420000, frequency: 1.38,
      cpc: 0.08, ctr: 2.88, cpm: 2.31,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-tiktok-manual', isLiveReady: true },
  ],
  'p-2026-08': [
    { platformSlug: 'google', spend: 4660.27, impressions: 234672, reach: 180000,
      clicks: 89820, linkClicks: 11885, attributedRevenue: 36660.19,
      conversions: 2160, costPerConversion: 2.16, videoViews: 0, frequency: 1.3,
      cpc: 0.05, ctr: 5.11, searchCtr: 13.71,
      mobileShare: 95.8, crossNetworkShare: 62.9, searchShare: 37.1,
      attributionModel: 'last_click', attributionWindow: '30d_click',
      dataSourceId: 'ds-google-manual' },
    { platformSlug: 'meta', spend: 3221.60, impressions: 752961, reach: 236648,
      clicks: 3467, linkClicks: 3467, attributedRevenue: 130931.08,
      conversions: 1617, videoViews: 744183, frequency: 3.18,
      cpc: 0.35, ctr: 1.22, costPerConversion: 1.99,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-meta-manual' },
    { platformSlug: 'tiktok', spend: 1521.13, impressions: 1139772, reach: 780000,
      clicks: 23132, linkClicks: 22819, attributedRevenue: 18500,
      conversions: 7, videoViews: 980000, frequency: 1.46,
      cpc: 0.07, ctr: 2.03, cpm: 1.33,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-tiktok-manual' },
  ],
};

// ── BRANCHES ──────────────────────────────────────────────────
export const MOCK_BRANCHES = [
  { id: 'main', businessUnitId: 'bu-retail', name: 'الفرع الرئيسي',
    nameEn: 'Main Branch', brand: 'all', region: 'القصيم',
    city: 'بريدة', address: 'طريق الملك عبد العزيز، بريدة', latitude: 26.3450, longitude: 43.9630,
    status: 'active', phone: '0530051001', managerName: 'إدارة الفرع الرئيسي', openingDate: '2016-01-10',
    color: '#3B82F6', targetRevenue: 350000 },
  { id: 'al-rawaf', businessUnitId: 'bu-retail', name: 'فرع الرواف',
    nameEn: 'Al Rawaf Branch', brand: 'hyundai', region: 'القصيم',
    city: 'بريدة', address: 'طريق الرواف، حي الرواف، بريدة', latitude: 26.3597, longitude: 43.9756,
    status: 'active', phone: '0530051360', managerName: 'إدارة فرع الرواف', openingDate: '2018-03-01',
    color: '#10B981', targetRevenue: 250000 },
  { id: 'kia', businessUnitId: 'bu-retail', name: 'فرع كيا',
    nameEn: 'Kia Branch', brand: 'kia', region: 'القصيم',
    city: 'بريدة', address: 'طريق الملك فهد، بريدة', latitude: 26.3280, longitude: 43.9512,
    status: 'active', phone: '0539454377', managerName: 'إدارة فرع كيا', openingDate: '2019-07-15',
    color: '#8B5CF6', targetRevenue: 200000 },
];

// ── BRANCH PERIOD STATS (Gross, Returns, Net, Targets) ───────────────
export const MOCK_BRANCH_PERIOD_STATS = {
  'main': {
    'p-2026-10': { revenue: 274978.46, grossSales: 305520.03, returns: 30541.57, revenueGrowth: -13.48, cogs: 191110.03, grossProfit: 83868.43,
      orders: 1695, ordersGrowth: -1.17, customers: 1410, newCustomers: 360, avgOrderValue: 162.23,
      targetRevenue: 350000, targetAchievement: 78.57, satisfaction: 4.8 },
    'p-2026-09': { revenue: 317816.51, grossSales: 358779.51, returns: 40963.00, revenueGrowth: -25.9, cogs: 228733, grossProfit: 89083.51,
      orders: 1715, ordersGrowth: 63.3, customers: 1420, newCustomers: 380, avgOrderValue: 209.2,
      targetRevenue: 350000, targetAchievement: 90.80, satisfaction: 4.8 },
    'p-2026-08': { revenue: 428885.49, grossSales: 471748.99, returns: 42863.50, revenueGrowth: 14.8, cogs: 223000, grossProfit: 205885.49,
      orders: 1050, ordersGrowth: 12.5, customers: 890, newCustomers: 240, avgOrderValue: 408.4,
      targetRevenue: 350000, targetAchievement: 122.54, satisfaction: 4.8 },
  },
  'al-rawaf': {
    'p-2026-10': { revenue: 191174.79, grossSales: 218526.97, returns: 27352.17, revenueGrowth: -34.59, cogs: 132866.48, grossProfit: 58308.31,
      orders: 830, ordersGrowth: -19.10, customers: 720, newCustomers: 210, avgOrderValue: 230.33,
      targetRevenue: 250000, targetAchievement: 76.47, satisfaction: 4.8 },
    'p-2026-09': { revenue: 292288.13, grossSales: 361365.13, returns: 69077.00, revenueGrowth: 0.31, cogs: 210359, grossProfit: 81928.13,
      orders: 1026, ordersGrowth: 43.5, customers: 840, newCustomers: 260, avgOrderValue: 352.2,
      targetRevenue: 250000, targetAchievement: 116.92, satisfaction: 4.8 },
    'p-2026-08': { revenue: 291371.67, grossSales: 328996.67, returns: 37625.00, revenueGrowth: 11.2, cogs: 151500, grossProfit: 139871.67,
      orders: 715, ordersGrowth: 9.8, customers: 580, newCustomers: 165, avgOrderValue: 407.5,
      targetRevenue: 250000, targetAchievement: 116.55, satisfaction: 4.7 },
  },
  'kia': {
    'p-2026-10': { revenue: 178988.68, grossSales: 214917.81, returns: 35929.13, revenueGrowth: -26.01, cogs: 124397.13, grossProfit: 54591.55,
      orders: 548, ordersGrowth: -11.47, customers: 480, newCustomers: 150, avgOrderValue: 326.62,
      targetRevenue: 200000, targetAchievement: 89.49, satisfaction: 4.8 },
    'p-2026-09': { revenue: 241897.00, grossSales: 279437.00, returns: 37540.00, revenueGrowth: -10.16, cogs: 174093, grossProfit: 67803.00,
      orders: 619, ordersGrowth: -6.2, customers: 520, newCustomers: 180, avgOrderValue: 451.4,
      targetRevenue: 200000, targetAchievement: 120.95, satisfaction: 4.7 },
    'p-2026-08': { revenue: 269265.00, grossSales: 304155.00, returns: 34890.00, revenueGrowth: 18.4, cogs: 140000, grossProfit: 129265.00,
      orders: 660, ordersGrowth: 15.2, customers: 530, newCustomers: 175, avgOrderValue: 407.9,
      targetRevenue: 200000, targetAchievement: 134.63, satisfaction: 4.7 },
  },
};

// Generate branch daily sales (Deterministic distribution based on audited monthly totals)
function genDailySales(baseRevenue, days = 30) {
  const daily = [];
  const avgDaily = baseRevenue / days;
  for (let d = 1; d <= days; d++) {
    const isWeekend = [5, 6].includes((d - 1) % 7); // Fri/Sat higher
    const factor = isWeekend ? 1.25 : (0.85 + (((d * 17 + 5) % 11) / 35));
    const rev = Math.round(avgDaily * factor);
    const orders = Math.round(rev / 380);
    daily.push({
      day: d, revenue: rev, cogs: Math.round(rev * 0.52),
      grossProfit: Math.round(rev * 0.48), orders, customers: Math.round(orders * 0.9),
    });
  }
  return daily;
}

export const MOCK_BRANCH_DAILY_SALES = {
  'main': {
    'p-2026-10': [{"day":1,"revenue":12225,"cogs":8496,"grossProfit":3729,"orders":64,"customers":56},{"day":2,"revenue":5703,"cogs":3964,"grossProfit":1739,"orders":35,"customers":31},{"day":3,"revenue":9813,"cogs":6820,"grossProfit":2993,"orders":61,"customers":54},{"day":4,"revenue":8302,"cogs":5770,"grossProfit":2532,"orders":77,"customers":68},{"day":5,"revenue":9072,"cogs":6305,"grossProfit":2767,"orders":57,"customers":50},{"day":6,"revenue":12324,"cogs":8565,"grossProfit":3759,"orders":51,"customers":45},{"day":7,"revenue":10244,"cogs":7120,"grossProfit":3124,"orders":64,"customers":56},{"day":8,"revenue":5695,"cogs":3958,"grossProfit":1737,"orders":54,"customers":48},{"day":9,"revenue":1971,"cogs":1370,"grossProfit":601,"orders":18,"customers":16},{"day":10,"revenue":10533,"cogs":7320,"grossProfit":3213,"orders":77,"customers":68},{"day":11,"revenue":10395,"cogs":7225,"grossProfit":3170,"orders":66,"customers":58},{"day":12,"revenue":6000,"cogs":4170,"grossProfit":1830,"orders":60,"customers":53},{"day":13,"revenue":7499,"cogs":5212,"grossProfit":2287,"orders":60,"customers":53},{"day":14,"revenue":7350,"cogs":5108,"grossProfit":2242,"orders":62,"customers":55},{"day":15,"revenue":8429,"cogs":5858,"grossProfit":2571,"orders":58,"customers":51},{"day":16,"revenue":1944,"cogs":1351,"grossProfit":593,"orders":12,"customers":11},{"day":17,"revenue":9355,"cogs":6502,"grossProfit":2853,"orders":62,"customers":55},{"day":18,"revenue":5796,"cogs":4028,"grossProfit":1768,"orders":56,"customers":49},{"day":19,"revenue":6345,"cogs":4410,"grossProfit":1935,"orders":45,"customers":40},{"day":20,"revenue":6140,"cogs":4267,"grossProfit":1873,"orders":65,"customers":57},{"day":21,"revenue":11893,"cogs":8266,"grossProfit":3627,"orders":57,"customers":50},{"day":22,"revenue":9572,"cogs":6653,"grossProfit":2919,"orders":77,"customers":68},{"day":23,"revenue":2222,"cogs":1544,"grossProfit":678,"orders":19,"customers":17},{"day":24,"revenue":19380,"cogs":13469,"grossProfit":5911,"orders":90,"customers":79},{"day":25,"revenue":12594,"cogs":8753,"grossProfit":3841,"orders":88,"customers":77},{"day":26,"revenue":7856,"cogs":5460,"grossProfit":2396,"orders":65,"customers":57},{"day":27,"revenue":16252,"cogs":11295,"grossProfit":4957,"orders":85,"customers":75},{"day":28,"revenue":12000,"cogs":8340,"grossProfit":3660,"orders":116,"customers":102},{"day":29,"revenue":10715,"cogs":7447,"grossProfit":3268,"orders":87,"customers":77},{"day":30,"revenue":1991,"cogs":1384,"grossProfit":607,"orders":18,"customers":16},{"day":31,"revenue":15369,"cogs":10681,"grossProfit":4688,"orders":80,"customers":70}],
    'p-2026-09': genDailySales(317816),
    'p-2026-08': genDailySales(428885),
  },
  'al-rawaf': {
    'p-2026-10': [{"day":1,"revenue":7573,"cogs":5263,"grossProfit":2310,"orders":43,"customers":38},{"day":2,"revenue":1010,"cogs":702,"grossProfit":308,"orders":12,"customers":11},{"day":3,"revenue":5670,"cogs":3941,"grossProfit":1729,"orders":36,"customers":32},{"day":4,"revenue":10321,"cogs":7173,"grossProfit":3148,"orders":39,"customers":34},{"day":5,"revenue":10406,"cogs":7232,"grossProfit":3174,"orders":31,"customers":27},{"day":6,"revenue":6850,"cogs":4761,"grossProfit":2089,"orders":31,"customers":27},{"day":7,"revenue":5968,"cogs":4148,"grossProfit":1820,"orders":47,"customers":41},{"day":8,"revenue":3063,"cogs":2129,"grossProfit":934,"orders":21,"customers":18},{"day":9,"revenue":1109,"cogs":771,"grossProfit":338,"orders":5,"customers":4},{"day":10,"revenue":6022,"cogs":4185,"grossProfit":1837,"orders":28,"customers":25},{"day":11,"revenue":7202,"cogs":5005,"grossProfit":2197,"orders":38,"customers":33},{"day":12,"revenue":5026,"cogs":3493,"grossProfit":1533,"orders":25,"customers":22},{"day":13,"revenue":7349,"cogs":5108,"grossProfit":2241,"orders":33,"customers":29},{"day":14,"revenue":6803,"cogs":4728,"grossProfit":2075,"orders":26,"customers":23},{"day":15,"revenue":5570,"cogs":3871,"grossProfit":1699,"orders":27,"customers":24},{"day":16,"revenue":291,"cogs":202,"grossProfit":89,"orders":4,"customers":4},{"day":17,"revenue":6860,"cogs":4768,"grossProfit":2092,"orders":56,"customers":49},{"day":18,"revenue":3995,"cogs":2777,"grossProfit":1218,"orders":16,"customers":14},{"day":19,"revenue":5216,"cogs":3625,"grossProfit":1591,"orders":28,"customers":25},{"day":20,"revenue":7737,"cogs":5377,"grossProfit":2360,"orders":38,"customers":33},{"day":21,"revenue":8659,"cogs":6018,"grossProfit":2641,"orders":37,"customers":33},{"day":22,"revenue":5456,"cogs":3792,"grossProfit":1664,"orders":33,"customers":29},{"day":23,"revenue":52,"cogs":36,"grossProfit":16,"orders":1,"customers":1},{"day":24,"revenue":11773,"cogs":8182,"grossProfit":3591,"orders":42,"customers":37},{"day":25,"revenue":8797,"cogs":6114,"grossProfit":2683,"orders":37,"customers":33},{"day":26,"revenue":7845,"cogs":5452,"grossProfit":2393,"orders":36,"customers":32},{"day":27,"revenue":6752,"cogs":4693,"grossProfit":2059,"orders":50,"customers":44},{"day":28,"revenue":10708,"cogs":7442,"grossProfit":3266,"orders":36,"customers":32},{"day":29,"revenue":6034,"cogs":4194,"grossProfit":1840,"orders":37,"customers":33},{"day":30,"revenue":565,"cogs":393,"grossProfit":172,"orders":4,"customers":4},{"day":31,"revenue":10493,"cogs":7293,"grossProfit":3200,"orders":42,"customers":37}],
    'p-2026-09': genDailySales(292288),
    'p-2026-08': genDailySales(291371),
  },
  'kia': {
    'p-2026-10': [{"day":1,"revenue":11023,"cogs":7661,"grossProfit":3362,"orders":33,"customers":29},{"day":2,"revenue":1730,"cogs":1202,"grossProfit":528,"orders":4,"customers":4},{"day":3,"revenue":16807,"cogs":11681,"grossProfit":5126,"orders":25,"customers":22},{"day":4,"revenue":3817,"cogs":2653,"grossProfit":1164,"orders":28,"customers":25},{"day":5,"revenue":2491,"cogs":1731,"grossProfit":760,"orders":17,"customers":15},{"day":6,"revenue":4510,"cogs":3134,"grossProfit":1376,"orders":19,"customers":17},{"day":7,"revenue":10757,"cogs":7476,"grossProfit":3281,"orders":28,"customers":25},{"day":8,"revenue":5548,"cogs":3856,"grossProfit":1692,"orders":21,"customers":18},{"day":9,"revenue":152,"cogs":106,"grossProfit":46,"orders":3,"customers":3},{"day":10,"revenue":10583,"cogs":7355,"grossProfit":3228,"orders":38,"customers":33},{"day":11,"revenue":11252,"cogs":7820,"grossProfit":3432,"orders":32,"customers":28},{"day":12,"revenue":9217,"cogs":6406,"grossProfit":2811,"orders":25,"customers":22},{"day":13,"revenue":7039,"cogs":4892,"grossProfit":2147,"orders":20,"customers":18},{"day":14,"revenue":3245,"cogs":2255,"grossProfit":990,"orders":23,"customers":20},{"day":15,"revenue":4116,"cogs":2861,"grossProfit":1255,"orders":19,"customers":17},{"day":16,"revenue":-1178,"cogs":-819,"grossProfit":-359,"orders":2,"customers":2},{"day":17,"revenue":8022,"cogs":5575,"grossProfit":2447,"orders":15,"customers":13},{"day":18,"revenue":8113,"cogs":5639,"grossProfit":2474,"orders":28,"customers":25},{"day":19,"revenue":3996,"cogs":2777,"grossProfit":1219,"orders":14,"customers":12},{"day":20,"revenue":3428,"cogs":2382,"grossProfit":1046,"orders":24,"customers":21},{"day":21,"revenue":5247,"cogs":3647,"grossProfit":1600,"orders":25,"customers":22},{"day":22,"revenue":3070,"cogs":2134,"grossProfit":936,"orders":20,"customers":18},{"day":23,"revenue":1635,"cogs":1136,"grossProfit":499,"orders":5,"customers":4},{"day":24,"revenue":5605,"cogs":3895,"grossProfit":1710,"orders":15,"customers":13},{"day":25,"revenue":7039,"cogs":4892,"grossProfit":2147,"orders":21,"customers":18},{"day":26,"revenue":9853,"cogs":6848,"grossProfit":3005,"orders":17,"customers":15},{"day":27,"revenue":7258,"cogs":5044,"grossProfit":2214,"orders":27,"customers":24},{"day":28,"revenue":6209,"cogs":4315,"grossProfit":1894,"orders":37,"customers":33},{"day":29,"revenue":1035,"cogs":719,"grossProfit":316,"orders":21,"customers":18},{"day":30,"revenue":304,"cogs":211,"grossProfit":93,"orders":5,"customers":4},{"day":31,"revenue":7066,"cogs":4911,"grossProfit":2155,"orders":27,"customers":24}],
    'p-2026-09': genDailySales(241897),
    'p-2026-08': genDailySales(269265),
  },
};

// ── PRODUCTS ──────────────────────────────────────────────────
export const MOCK_PRODUCTS = [
  { id: 'prod-001', sku: 'HY-FILT-001', name: 'فلاتر هيونداي أصلية', nameEn: 'Hyundai OEM Filters',
    category: 'فلاتر', brand: 'Hyundai', make: 'Hyundai', unitPrice: 85, unitCost: 42,
    stockQty: 340, reorderPoint: 100, status: 'active' },
  { id: 'prod-002', sku: 'KI-BRAK-002', name: 'مكابح بريمبو كيا', nameEn: 'Brembo Brake Discs Kia',
    category: 'مكابح', brand: 'Brembo', make: 'Kia', unitPrice: 320, unitCost: 178,
    stockQty: 82, reorderPoint: 30, status: 'active' },
  { id: 'prod-003', sku: 'HY-PLUG-003', name: 'بلوجات NGK هيونداي', nameEn: 'NGK Spark Plugs Hyundai',
    category: 'إشعال', brand: 'NGK', make: 'Hyundai', unitPrice: 45, unitCost: 21,
    stockQty: 520, reorderPoint: 150, status: 'active' },
  { id: 'prod-004', sku: 'KI-OIL-004', name: 'زيت موتر Genuine كيا', nameEn: 'Kia Genuine Engine Oil',
    category: 'زيوت', brand: 'Kia Genuine', make: 'Kia', unitPrice: 148, unitCost: 84,
    stockQty: 210, reorderPoint: 80, status: 'active' },
  { id: 'prod-005', sku: 'KI-PADS-005', name: 'بطانات مكابح أمامية كيا', nameEn: 'Kia Front Brake Pads',
    category: 'مكابح', brand: 'Ferodo', make: 'Kia', unitPrice: 185, unitCost: 98,
    stockQty: 145, reorderPoint: 50, status: 'active' },
  { id: 'prod-006', sku: 'HY-AIR-006', name: 'فلتر هواء K&N هيونداي', nameEn: 'K&N Air Filter Hyundai',
    category: 'فلاتر', brand: 'K&N', make: 'Hyundai', unitPrice: 220, unitCost: 128,
    stockQty: 68, reorderPoint: 25, status: 'active' },
  { id: 'prod-007', sku: 'HY-BELT-007', name: 'حزام توقيت هيونداي', nameEn: 'Hyundai Timing Belt Kit',
    category: 'أحزمة', brand: 'Gates', make: 'Hyundai', unitPrice: 420, unitCost: 242,
    stockQty: 34, reorderPoint: 15, status: 'active' },
  { id: 'prod-008', sku: 'KI-CAB-008', name: 'فلتر كابينة كيا', nameEn: 'Kia Cabin Air Filter',
    category: 'فلاتر', brand: 'Kia OEM', make: 'Kia', unitPrice: 55, unitCost: 28,
    stockQty: 280, reorderPoint: 100, status: 'active' },
];

export const MOCK_PRODUCT_METRICS = {
  'p-2026-09': [
    { productId: 'prod-001', unitsSold: 580, revenue: 49300, cogs: 24360, grossProfit: 24940, marginPct: 50.6, rating: 4.8, reviewCount: 135, growth: -15.9 },
    { productId: 'prod-002', unitsSold: 165, revenue: 52800, cogs: 29370, grossProfit: 23430, marginPct: 44.4, rating: 4.8, reviewCount: 92,  growth: -8.8 },
    { productId: 'prod-003', unitsSold: 810, revenue: 36450, cogs: 17010, grossProfit: 19440, marginPct: 53.3, rating: 4.7, reviewCount: 198, growth: -14.3 },
    { productId: 'prod-004', unitsSold: 310, revenue: 45880, cogs: 26040, grossProfit: 19840, marginPct: 43.2, rating: 4.6, reviewCount: 160, growth: -9.3 },
    { productId: 'prod-005', unitsSold: 220, revenue: 40700, cogs: 21560, grossProfit: 19140, marginPct: 47.0, rating: 4.5, reviewCount: 104, growth: -12.0 },
    { productId: 'prod-006', unitsSold: 115, revenue: 25300, cogs: 14720, grossProfit: 10580, marginPct: 41.8, rating: 4.7, reviewCount: 65,  growth: -8.0 },
    { productId: 'prod-007', unitsSold: 65,  revenue: 27300, cogs: 15730, grossProfit: 11570, marginPct: 42.4, rating: 4.6, reviewCount: 45,  growth: -8.4 },
    { productId: 'prod-008', unitsSold: 360, revenue: 19800, cogs: 10080, grossProfit: 9720,  marginPct: 49.1, rating: 4.4, reviewCount: 82,  growth: -10.9 },
  ],
  'p-2026-08': [
    { productId: 'prod-001', unitsSold: 690, revenue: 58650, cogs: 28980, grossProfit: 29670, marginPct: 50.6, rating: 4.8, reviewCount: 110, growth: 12.4 },
    { productId: 'prod-002', unitsSold: 181, revenue: 57920, cogs: 32218, grossProfit: 25702, marginPct: 44.4, rating: 4.8, reviewCount: 78,  growth: 9.8 },
    { productId: 'prod-003', unitsSold: 946, revenue: 42570, cogs: 19866, grossProfit: 22704, marginPct: 53.3, rating: 4.7, reviewCount: 174, growth: 15.1 },
    { productId: 'prod-004', unitsSold: 342, revenue: 50616, cogs: 28728, grossProfit: 21888, marginPct: 43.2, rating: 4.6, reviewCount: 141, growth: 7.2 },
    { productId: 'prod-005', unitsSold: 250, revenue: 46250, cogs: 24500, grossProfit: 21750, marginPct: 47.0, rating: 4.5, reviewCount: 85,  growth: 8.9 },
    { productId: 'prod-006', unitsSold: 125, revenue: 27500, cogs: 16000, grossProfit: 11500, marginPct: 41.8, rating: 4.7, reviewCount: 55,  growth: 4.1 },
    { productId: 'prod-007', unitsSold: 71,  revenue: 29820, cogs: 17182, grossProfit: 12638, marginPct: 42.4, rating: 4.6, reviewCount: 38,  growth: 2.8 },
    { productId: 'prod-008', unitsSold: 404, revenue: 22220, cogs: 11312, grossProfit: 10908, marginPct: 49.1, rating: 4.4, reviewCount: 68,  growth: 11.0 },
  ],
};

// ── E-COMMERCE STATS ──────────────────────────────────────────
export const MOCK_ECOMMERCE_STATS = {
  'p-2026-10': {
    totalOrders: 43, totalOrdersGrowth: -29.5,
    totalRevenue: 26713.62, totalRevenueGrowth: -29.2,
    grossSales: 28070.00, discounts: 105.00, returns: 0, returnRatePct: 0.0,
    cogs: 140.00, shippingFees: 970.00, paymentGatewayFees: 141.38,
    avgOrderValue: 621.25, avgOrderValueGrowth: -6.1,
    sessions: 14496, sessionsGrowth: -21.4,
    conversionRate: 0.30, conversionRateGrowth: -0.03,
    cartAbandonmentRate: 73.1, cartAbandonmentChange: 1.3,
    returningCustomerRate: 2.38,
    cityBreakdown: [
      { cityAr: 'جدة', cityEn: 'Jeddah', visits: 5017, sharePct: 34.61 },
      { cityAr: 'الرياض', cityEn: 'Riyadh', visits: 3374, sharePct: 23.28 },
      { cityAr: 'الدمام', cityEn: 'Dammam', visits: 1973, sharePct: 13.61 },
      { cityAr: 'المدينة المنورة', cityEn: 'Madinah', visits: 1100, sharePct: 7.59 },
      { cityAr: 'بريدة (القصيم)', cityEn: 'Buraydah', visits: 847, sharePct: 5.84 },
      { cityAr: 'مدن أخرى', cityEn: 'Other', visits: 2185, sharePct: 15.07 },
    ],
    trafficSources: [
      { source: 'Google', visits: 9452, sharePct: 65.20, color: '#10B981' },
      { source: 'Direct (مباشر)', visits: 3813, sharePct: 26.30, color: '#3B82F6' },
      { source: 'TikTok', visits: 615, sharePct: 4.24, color: '#8B5CF6' },
      { source: 'Snapchat', visits: 313, sharePct: 2.16, color: '#F59E0B' },
      { source: 'Instagram / Meta', visits: 174, sharePct: 1.20, color: '#06B6D4' },
      { source: 'أخرى', visits: 129, sharePct: 0.90, color: '#64748B' },
    ],
    topCategories: [
      { name: 'قطع غيار هيونداي الأصلية', orders: 19, revenue: 11850, share: 44.3 },
      { name: 'قطع غيار كيا الأصلية', orders: 15, revenue: 9420, share: 35.3 },
      { name: 'فلاتر وزيوت صيانة', orders: 6, revenue: 3840, share: 14.4 },
      { name: 'مكابح وبطانات', orders: 3, revenue: 1603.62, share: 6.0 },
    ],
    ordersTimeline: [1, 2, 1, 0, 2, 1, 3, 1, 0, 2, 1, 1, 2, 1, 0, 2, 1, 3, 2, 1, 0, 2, 1, 2, 3, 1, 2, 1, 2, 1, 2].map((orders, i) => ({
      day: String(i + 1),
      orders,
    })),
  },
  'p-2026-09': {
    totalOrders: 61, totalOrdersGrowth: -16.4,
    totalRevenue: 37725.08, totalRevenueGrowth: 2.9,
    grossSales: 39888.00, discounts: 93.00, returns: 1, returnRatePct: 1.6,
    cogs: 550.00, shippingFees: 1424.00, paymentGatewayFees: 188.92,
    avgOrderValue: 692.27, avgOrderValueGrowth: 30.3,
    sessions: 18450, sessionsGrowth: 2.5,
    conversionRate: 0.33, conversionRateGrowth: -0.08,
    cartAbandonmentRate: 71.8, cartAbandonmentChange: -0.6,
    returningCustomerRate: 5.0,
    cityBreakdown: [
      { cityAr: 'جدة', cityEn: 'Jeddah', visits: 5850, sharePct: 31.7 },
      { cityAr: 'الرياض', cityEn: 'Riyadh', visits: 4120, sharePct: 22.3 },
      { cityAr: 'الدمام', cityEn: 'Dammam', visits: 2310, sharePct: 12.5 },
      { cityAr: 'القصيم (بريدة)', cityEn: 'Buraydah', visits: 1820, sharePct: 9.9 },
      { cityAr: 'المدينة المنورة', cityEn: 'Madinah', visits: 1350, sharePct: 7.3 },
      { cityAr: 'مدن أخرى', cityEn: 'Other', visits: 3000, sharePct: 16.3 },
    ],
    trafficSources: [
      { source: 'Google', visits: 8720, sharePct: 47.3, color: '#10B981' },
      { source: 'Direct (مباشر)', visits: 6380, sharePct: 34.6, color: '#3B82F6' },
      { source: 'TikTok', visits: 2150, sharePct: 11.6, color: '#8B5CF6' },
      { source: 'Facebook / Meta', visits: 420, sharePct: 2.3, color: '#06B6D4' },
      { source: 'أخرى', visits: 780, sharePct: 4.2, color: '#64748B' },
    ],
    topCategories: [
      { name: 'قطع غيار هيونداي الأصلية', orders: 24, revenue: 15200, share: 40.3 },
      { name: 'قطع غيار كيا الأصلية', orders: 20, revenue: 12450, share: 33.0 },
      { name: 'فلاتر وزيوت صيانة', orders: 11, revenue: 5900, share: 15.6 },
      { name: 'مكابح وبطانات', orders: 6, revenue: 4175.08, share: 11.1 },
    ],
    ordersTimeline: [2, 1, 3, 2, 2, 4, 1, 3, 2, 2, 1, 3, 2, 2, 3, 1, 2, 3, 2, 1, 3, 2, 1, 2, 3, 2, 2, 3, 2, 2].map((orders, i) => ({
      day: String(i + 1),
      orders,
    })),
  },
  'p-2026-08': {
    totalOrders: 73, totalOrdersGrowth: 14.8,
    totalRevenue: 36660.19, totalRevenueGrowth: 18.2,
    grossSales: 39425.00, discounts: 163.00, returns: 4, returnRatePct: 5.5,
    cogs: 660.00, shippingFees: 1715.00, paymentGatewayFees: 226.81,
    avgOrderValue: 531.36, avgOrderValueGrowth: 6.5,
    sessions: 17998, sessionsGrowth: 12.4,
    conversionRate: 0.41, conversionRateGrowth: 0.05,
    cartAbandonmentRate: 72.4, cartAbandonmentChange: -1.8,
    returningCustomerRate: 38.5,
    cityBreakdown: [
      { cityAr: 'جدة', cityEn: 'Jeddah', visits: 5712, sharePct: 31.7 },
      { cityAr: 'الرياض', cityEn: 'Riyadh', visits: 3878, sharePct: 21.5 },
      { cityAr: 'الإمارات', cityEn: 'UAE', visits: 2416, sharePct: 13.4 },
      { cityAr: 'الدمام', cityEn: 'Dammam', visits: 2256, sharePct: 12.5 },
      { cityAr: 'المدينة المنورة', cityEn: 'Madinah', visits: 1288, sharePct: 7.2 },
      { cityAr: 'مدن أخرى', cityEn: 'Other', visits: 2448, sharePct: 13.6 },
    ],
    trafficSources: [
      { source: 'Google', visits: 8660, sharePct: 48.1, color: '#10B981' },
      { source: 'Direct (مباشر)', visits: 6173, sharePct: 34.3, color: '#3B82F6' },
      { source: 'TikTok', visits: 1909, sharePct: 10.6, color: '#8B5CF6' },
      { source: 'Facebook / Meta', visits: 294, sharePct: 1.6, color: '#06B6D4' },
      { source: 'أخرى', visits: 962, sharePct: 5.4, color: '#64748B' },
    ],
    topCategories: [
      { name: 'قطع غيار هيونداي الأصلية', orders: 28, revenue: 14850, share: 40.5 },
      { name: 'قطع غيار كيا الأصلية', orders: 22, revenue: 11690, share: 31.9 },
      { name: 'فلاتر وزيوت صيانة', orders: 14, revenue: 5820, share: 15.9 },
      { name: 'مكابح وبطانات', orders: 9, revenue: 4300.19, share: 11.7 },
    ],
    ordersTimeline: [2, 3, 2, 1, 4, 3, 2, 2, 3, 1, 2, 3, 2, 1, 4, 3, 2, 2, 3, 2, 1, 3, 2, 4, 1, 2, 3, 2, 3, 2, 4].map((orders, i) => ({
      day: String(i + 1),
      orders,
    })),
  },
};

// ── FINANCIALS ────────────────────────────────────────────────
// IMPORTANT: totalRevenue here is factual business revenue (branches 989,522.16 + Salla 36,660.19)
// NOT platform-attributed revenue
export const MOCK_FINANCIALS = {
  'p-2026-10': {
    totalRevenue: 671855.55,
    totalRevenueGrowth: -24.49,
    grossSales: 780164.80,
    returns: 93932.87,
    ecommerceRevenue: 26713.62,
    branchRevenue: 645141.93,
    cogs: 466922.78,
    grossProfit: 204932.77,
    grossMarginPct: 30.50,
    operatingExpenses: {
      salaries: 60000,
      rent: 12000,
      utilities: 4000,
      logistics: 4000,
      marketing: 9070.00,
      other: 10000,
    },
    totalOpex: 99070.00,
    ebitda: 105862.77,
    ebitdaMarginPct: 15.76,
    depreciation: 0,
    ebit: 105862.77,
    interest: 0,
    ebt: 105862.77,
    tax: 0,
    netProfit: 105862.77,
    netProfitMarginPct: 15.76,
    cashFlow: 105862.77,
    accountsReceivable: 42000,
    inventoryValue: 198000,
    monthlyTarget: 800000,
    branchRevenueWithVat: 741913.22,
    consolidatedRevenueWithVat: 768626.84,
    targetAchievementPct: 92.74,
    consolidatedTargetAchievementPct: 96.08,
    blendedMER: 74.07,
  },
  'p-2026-09': {
    totalRevenue: 889726.72,
    totalRevenueGrowth: -10.08,
    grossSales: 1039469.64,
    returns: 147580.00,
    ecommerceRevenue: 37725.08,
    branchRevenue: 852001.64,
    // Factual Dora Cars Rule: Profit margin on net sales from official margin report (Screenshot 2026-10-02 184035.png)
    // Official Report: Net Sales = 740,870.99 SAR, COGS = 514,887.07 SAR, Gross Profit = 225,983.92 SAR
    // Profit Margin = 30.50% | Cost Ratio (COGS) = 69.50%
    // Applied to total net sales (889,726.72 SAR):
    // COGS (69.4975%): 618,338.14 SAR
    // Gross Profit (30.5025%): 271,388.58 SAR
    cogs: 618338.14,
    grossProfit: 271388.58,
    grossMarginPct: 30.50,
    operatingExpenses: {
      salaries: 60000,
      rent: 12000,
      utilities: 4000,
      logistics: 4000,
      marketing: 8323.02, // Google: 4,480.11 + Meta: 2,725.77 + TikTok: 1,117.14
      other: 10000,
    },
    totalOpex: 90000.00,
    ebitda: 181388.58,
    ebitdaMarginPct: 20.39,
    depreciation: 0,
    ebit: 181388.58,
    interest: 0,
    ebt: 181388.58,
    tax: 0,
    netProfit: 181388.58,
    netProfitMarginPct: 20.39,
    cashFlow: 181388.58,
    accountsReceivable: 45000,
    inventoryValue: 195000,
    monthlyTarget: 850000,
    targetAchievementPct: 104.67,
    blendedMER: 106.90, // 889,726.72 / 8,323.02
  },
  'p-2026-08': {
    totalRevenue: 989522.16, totalRevenueGrowth: 22.4,
    grossSales: 1104900.66, returns: 115378.50,
    ecommerceRevenue: 36660.19, // Already consolidated within total company sales
    branchRevenue: 989522.16,
    // Factual Dora Cars Rule: Profit margin on net sales (sales - returns) is 28.03%
    // Net Sales: 989,522.16 SAR
    // Cost (71.97%): 712,159.10 SAR
    // Profit (28.03%): 277,363.06 SAR
    cogs: 712159.10, 
    grossProfit: 277363.06, 
    grossMarginPct: 28.03,
    operatingExpenses: {
      salaries: 60000, // رواتب كامل الفروع
      rent: 12000,     // إيجارات الفروع
      utilities: 4000, // كهرباء ومرافق
      logistics: 4000, // شحن وتوصيل (إجمالي إيجار + كهرباء + شحن = 20,000)
      marketing: 9403.00, // Google: 4,660.27 + Meta: 3,221.60 + TikTok: 1,521.13
      other: 10000     // احتياطي زيادة ونقصان ونثريات
    },
    totalOpex: 90000.00, // 60,000 (رواتب) + 20,000 (تشغيل/إيجار/كهرباء/شحن) + 10,000 (احتياطي)
    ebitda: 187363.06, ebitdaMarginPct: 18.93, depreciation: 0,
    ebit: 187363.06, interest: 0, ebt: 187363.06, tax: 0,
    netProfit: 187363.06, netProfitMarginPct: 18.93, // 277,363.06 (مجمل الربح 28.03%) - 90,000 (المصروفات التشغيلية) = 187,363.06 SAR
    cashFlow: 187363.06, accountsReceivable: 31200, inventoryValue: 190400,
    monthlyTarget: 800000, targetAchievementPct: 123.69,
    blendedMER: 105.23, // 989,522.16 / 9,403.00
  },
  'p-2026-07': {
    totalRevenue: 404000, totalRevenueGrowth: 4.8,
    ecommerceRevenue: 228000, branchRevenue: 176000,
    cogs: 224000, grossProfit: 180000, grossMarginPct: 44.6,
    operatingExpenses: { salaries: 62400, rent: 18000, utilities: 4000, marketing: 31800, logistics: 7800, other: 10800 },
    totalOpex: 134800,
    ebitda: 45200, ebitdaMarginPct: 11.2, depreciation: 3800,
    ebit: 41400, interest: 2100, ebt: 39300, tax: 5895,
    netProfit: 33405, netProfitMarginPct: 8.3,
    cashFlow: 52100, accountsReceivable: 28800, inventoryValue: 195000,
    monthlyTarget: 420000, targetAchievementPct: 96.2,
  },
};

// ── REVENUE TREND (6 months) ──────────────────────────────────
export const MOCK_REVENUE_TREND = [
  { month: 'أبريل', monthEn: 'Apr', revenue: 312000, grossProfit: 138600, netProfit: 21800, adSpend: 28000 },
  { month: 'مايو', monthEn: 'May', revenue: 358000, grossProfit: 159700, netProfit: 26400, adSpend: 30500 },
  { month: 'يونيو', monthEn: 'Jun', revenue: 385000, grossProfit: 173250, netProfit: 28900, adSpend: 29200 },
  { month: 'يوليو', monthEn: 'Jul', revenue: 404000, grossProfit: 180000, netProfit: 33405, adSpend: 31800 },
  { month: 'أغسطس', monthEn: 'Aug', revenue: 989522, grossProfit: 277363, netProfit: 187363, adSpend: 9403 },
  { month: 'سبتمبر', monthEn: 'Sep', revenue: 889727, grossProfit: 271389, netProfit: 181389, adSpend: 8323 },
  { month: 'أكتوبر', monthEn: 'Oct', revenue: 671856, grossProfit: 204933, netProfit: 105863, adSpend: 9070 },
];

// ── TARGETS ───────────────────────────────────────────────────
export const MOCK_TARGETS = {
  'p-2026-10': {
    revenue: 800000,
    netProfit: 105862.77,
    adSpend: 9070.00,
    blendedMER: 74.07,
    roas: 15.0,
    orders: 43,
    newCustomers: 1394,
    cpa: 2.08,
    hyundaiRevenue: 191174.79,
    kiaRevenue: 178988.68,
    ecommerceRevenue: 26713.62,
    omnichannelRevenue: 85000,
    omnichannelROAS: 29.3,
    metaROAS: 29.3,
    metaConversations: 1736,
    googleROAS: 5.23,
    googleConversions: 40619,
    tiktokROAS: 11.29,
  },
  'p-2026-09': {
    revenue: 850000,
    netProfit: 181388.58,
    adSpend: 8323.02,
    blendedMER: 95.0, // Blended MER: Total Company Sales (889.7K) / Total Ad Spend (8.32K) = 106.90x
    roas: 16.0,
    orders: 61,
    newCustomers: 1477,
    cpa: 3.34,
    hyundaiRevenue: 250000,
    kiaRevenue: 200000,
    ecommerceRevenue: 35000,
    omnichannelRevenue: 180000,
    omnichannelROAS: 35.0,
    metaROAS: 35.0, // 97,871 / 2,725.77 = 35.9x
    metaConversations: 1200, // Actual: 1,477
    googleROAS: 8.0, // Actual Salla Store: 37,725.08 / 4,480.11 = 8.42x
    googleConversions: 2000, // Actual: 2,503 (Local calls + Directions + Store actions)
    tiktokROAS: 12.0, // Actual: 15,000 / 1,117.14 = 13.43x
  },
  'p-2026-08': {
    revenue: 800000, netProfit: 187363.06, adSpend: 9403,
    blendedMER: 85.0, // Blended MER: Total Company Sales (989.5K) / Total Ad Spend (9.4K) = 105.23x
    roas: 15.0, // Overall direct platform-attributed ROAS (Actual: 19.79x)
    orders: 73, newCustomers: 1617, cpa: 5.81,
    hyundaiRevenue: 350000, kiaRevenue: 200000, ecommerceRevenue: 35000,
    // Meta & TikTok Omnichannel Attribution: 100% of Bank Transfers (130.9K) + Tamara (60.5K) + Tabby (33.1K) = 224,558.08 SAR
    omnichannelRevenue: 180000,
    omnichannelROAS: 35.0, // Actual: 224,558.08 / 4,742.73 = 47.35x
    metaROAS: 30.0, // Actual: 130,931.08 / 3,221.60 = 40.64x
    metaConversations: 1200, // Actual: 1,617 conversations
    googleROAS: 5.0, // Actual Salla Store ROAS: 36,660.19 / 4,660.27 = 7.87x
    googleConversions: 1800, // Actual: 2,160 conversions (Maps local visits + Store actions)
    tiktokROAS: 8.0, // Actual: 18,500 / 1,521.13 = 12.16x
  },
};

// ── AD FUNNELS ────────────────────────────────────────────────
export const MOCK_AD_FUNNELS = {
  'p-2026-08': {
    meta: [
      { stage: 'الوصول (Reach)', stageEn: 'Reach', value: 236648, color: '#1877F2' },
      { stage: 'المشاهدات والظهور', stageEn: 'Impressions', value: 752961, color: '#3B82F6' },
      { stage: 'نقرات الرابط والمتجر', stageEn: 'Link Clicks', value: 3467, color: '#60A5FA' },
      { stage: 'محادثات واتساب البيعية', stageEn: 'WhatsApp Conversations', value: 1617, color: '#22C55E' },
    ],
    google: [
      { stage: 'الظهور والبحث والخرائط', stageEn: 'Impressions', value: 234672, color: '#10B981' },
      { stage: 'التفاعلات والنقرات', stageEn: 'Interactions', value: 89820, color: '#34D399' },
      { stage: 'التحويلات والاتصالات المحلية', stageEn: 'Conversions', value: 2160, color: '#059669' },
    ],
    tiktok: [
      { stage: 'المشاهدات والظهور', stageEn: 'Impressions', value: 1139772, color: '#8B5CF6' },
      { stage: 'النقرات للرابط', stageEn: 'Clicks', value: 23132, color: '#A78BFA' },
      { stage: 'التحويلات المسجلة', stageEn: 'Conversions', value: 82, color: '#7C3AED' },
    ],
  },
  'p-2026-09': {
    meta: [
      { stage: 'الوصول (Reach)', stageEn: 'Reach', value: 203154, color: '#1877F2' },
      { stage: 'المشاهدات والظهور', stageEn: 'Impressions', value: 482095, color: '#3B82F6' },
      { stage: 'النقرات والتفاعل', stageEn: 'Clicks', value: 2840, color: '#60A5FA' },
      { stage: 'محادثات وتواصل واتساب', stageEn: 'WhatsApp Contacts', value: 1477, color: '#22C55E' },
    ],
    google: [
      { stage: 'الظهور والبحث والخرائط', stageEn: 'Impressions', value: 99703, color: '#10B981' },
      { stage: 'التفاعلات والنقرات', stageEn: 'Interactions', value: 9521, color: '#34D399' },
      { stage: 'التحويلات والاتصالات المحلية', stageEn: 'Conversions', value: 2503, color: '#059669' },
    ],
    tiktok: [
      { stage: 'المشاهدات والظهور', stageEn: 'Impressions', value: 483951, color: '#8B5CF6' },
      { stage: 'النقرات للرابط والمتجر', stageEn: 'Clicks', value: 13915, color: '#A78BFA' },
      { stage: 'التحويلات المسجلة', stageEn: 'Conversions', value: 18, color: '#7C3AED' },
    ],
  },
  'p-2026-10': {
    meta: [
      { stage: 'الوصول (Reach)', stageEn: 'Reach', value: 200058, color: '#1877F2' },
      { stage: 'المشاهدات والظهور', stageEn: 'Impressions', value: 525662, color: '#3B82F6' },
      { stage: 'النقرات والتفاعل', stageEn: 'Clicks', value: 2930, color: '#60A5FA' },
      { stage: 'محادثات واتساب البيعية', stageEn: 'WhatsApp Conversations', value: 1736, color: '#22C55E' },
    ],
    google: [
      { stage: 'الظهور والبحث والخرائط', stageEn: 'Impressions', value: 135797, color: '#10B981' },
      { stage: 'التفاعلات والزيارات', stageEn: 'Interactions', value: 40619, color: '#34D399' },
      { stage: 'النقرات والمشتريات', stageEn: 'Clicks & Orders', value: 9662, color: '#059669' },
    ],
    tiktok: [
      { stage: 'المشاهدات والظهور', stageEn: 'Impressions', value: 400700, color: '#8B5CF6' },
      { stage: 'النقرات للرابط والمتجر', stageEn: 'Clicks', value: 7583, color: '#A78BFA' },
      { stage: 'التحويلات المسجلة', stageEn: 'Conversions', value: 12, color: '#7C3AED' },
    ],
  },
};
