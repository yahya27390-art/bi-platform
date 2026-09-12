// ============================================================
// DORA CARS BI — COMPREHENSIVE MOCK DATA (3 months, consistent)
// All data is internally consistent:
//   Orders → Order Items → Products → Revenue
//   Ad Metrics → Campaigns → Platforms
//   Branches → Daily Sales → Monthly Aggregation
// ============================================================

// ── PERIODS ───────────────────────────────────────────────────
export const MOCK_PERIODS = [
  { id: 'p-2026-08', periodKey: '2026-08', year: 2026, month: 8, quarter: 3,
    label: 'أغسطس 2026 (المعتمد بالفواتير)', labelEn: 'Aug 2026 (Audited)',
    startDate: '2026-08-01', endDate: '2026-08-31', isCurrent: false, isClosed: true, isAudited: true },
  { id: 'p-2026-09', periodKey: '2026-09', year: 2026, month: 9, quarter: 3,
    label: 'سبتمبر 2026 (قيد التشغيل)', labelEn: 'Sep 2026 (In Progress)',
    startDate: '2026-09-01', endDate: '2026-09-30', isCurrent: true, isClosed: false, isAudited: false },
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
  'p-2026-09': [
    { platformSlug: 'meta', spend: 0, impressions: 0, reach: 0,
      clicks: 0, linkClicks: 0, attributedRevenue: 0,
      conversions: 0, videoViews: 0, frequency: 0,
      cpc: 0, cpm: 0, ctr: 0, cpa: 0, roas: 0,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-meta-api', isLiveReady: true },
    { platformSlug: 'google', spend: 0, impressions: 0, reach: 0,
      clicks: 0, linkClicks: 0, attributedRevenue: 0,
      conversions: 0, videoViews: 0, frequency: 0,
      cpc: 0, cpm: 0, ctr: 0, cpa: 0, roas: 0,
      attributionModel: 'last_click', attributionWindow: '30d_click',
      dataSourceId: 'ds-google-api', isLiveReady: true },
    { platformSlug: 'tiktok', spend: 0, impressions: 0, reach: 0,
      clicks: 0, linkClicks: 0, attributedRevenue: 0,
      conversions: 0, videoViews: 0, frequency: 0,
      cpc: 0, cpm: 0, ctr: 0, cpa: 0, roas: 0,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-tiktok-api', isLiveReady: true },
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
    'p-2026-09': { revenue: 0, grossSales: 0, returns: 0, revenueGrowth: 0, cogs: 0, grossProfit: 0,
      orders: 0, ordersGrowth: 0, customers: 0, newCustomers: 0, avgOrderValue: 0,
      targetRevenue: 350000, targetAchievement: 0, satisfaction: 5.0 },
    'p-2026-08': { revenue: 428885.49, grossSales: 471748.99, returns: 42863.50, revenueGrowth: 14.8, cogs: 223000, grossProfit: 205885.49,
      orders: 1050, ordersGrowth: 12.5, customers: 890, newCustomers: 240, avgOrderValue: 408.4,
      targetRevenue: 350000, targetAchievement: 122.54, satisfaction: 4.8 },
  },
  'al-rawaf': {
    'p-2026-09': { revenue: 0, grossSales: 0, returns: 0, revenueGrowth: 0, cogs: 0, grossProfit: 0,
      orders: 0, ordersGrowth: 0, customers: 0, newCustomers: 0, avgOrderValue: 0,
      targetRevenue: 250000, targetAchievement: 0, satisfaction: 5.0 },
    'p-2026-08': { revenue: 291371.67, grossSales: 328996.67, returns: 37625.00, revenueGrowth: 11.2, cogs: 151500, grossProfit: 139871.67,
      orders: 715, ordersGrowth: 9.8, customers: 580, newCustomers: 165, avgOrderValue: 407.5,
      targetRevenue: 250000, targetAchievement: 116.55, satisfaction: 4.7 },
  },
  'kia': {
    'p-2026-09': { revenue: 0, grossSales: 0, returns: 0, revenueGrowth: 0, cogs: 0, grossProfit: 0,
      orders: 0, ordersGrowth: 0, customers: 0, newCustomers: 0, avgOrderValue: 0,
      targetRevenue: 200000, targetAchievement: 0, satisfaction: 5.0 },
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
    'p-2026-09': [],
    'p-2026-08': genDailySales(428885),
  },
  'al-rawaf': {
    'p-2026-09': [],
    'p-2026-08': genDailySales(291371),
  },
  'kia': {
    'p-2026-09': [],
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
    { productId: 'prod-001', unitsSold: 0, revenue: 0, cogs: 0, grossProfit: 0, marginPct: 0, rating: 4.8, reviewCount: 0, growth: 0 },
    { productId: 'prod-002', unitsSold: 0, revenue: 0, cogs: 0, grossProfit: 0, marginPct: 0, rating: 4.9, reviewCount: 0, growth: 0 },
    { productId: 'prod-003', unitsSold: 0, revenue: 0, cogs: 0, grossProfit: 0, marginPct: 0, rating: 4.7, reviewCount: 0, growth: 0 },
    { productId: 'prod-004', unitsSold: 0, revenue: 0, cogs: 0, grossProfit: 0, marginPct: 0, rating: 4.6, reviewCount: 0, growth: 0 },
    { productId: 'prod-005', unitsSold: 0, revenue: 0, cogs: 0, grossProfit: 0, marginPct: 0, rating: 4.5, reviewCount: 0, growth: 0 },
    { productId: 'prod-006', unitsSold: 0, revenue: 0, cogs: 0, grossProfit: 0, marginPct: 0, rating: 4.8, reviewCount: 0, growth: 0 },
    { productId: 'prod-007', unitsSold: 0, revenue: 0, cogs: 0, grossProfit: 0, marginPct: 0, rating: 4.6, reviewCount: 0, growth: 0 },
    { productId: 'prod-008', unitsSold: 0, revenue: 0, cogs: 0, grossProfit: 0, marginPct: 0, rating: 4.4, reviewCount: 0, growth: 0 },
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
  'p-2026-09': {
    totalOrders: 0, totalOrdersGrowth: 0,
    totalRevenue: 0, totalRevenueGrowth: 0,
    avgOrderValue: 0, avgOrderValueGrowth: 0,
    sessions: 0, sessionsGrowth: 0,
    conversionRate: 0, conversionRateGrowth: 0,
    cartAbandonmentRate: 0, cartAbandonmentChange: 0,
    returningCustomerRate: 0,
    topCategories: [],
    ordersTimeline: [],
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
  'p-2026-09': {
    totalRevenue: 0,
    totalRevenueGrowth: 0,
    ecommerceRevenue: 0,
    branchRevenue: 0,
    cogs: 0,
    grossProfit: 0,
    grossMarginPct: 0,
    operatingExpenses: {
      salaries: 60000,
      rent: 20000,
      utilities: 5000,
      marketing: 0,
      logistics: 0,
      other: 5000,
    },
    totalOpex: 90000,
    ebitda: 0,
    ebitdaMarginPct: 0,
    depreciation: 0,
    ebit: 0,
    interest: 0,
    ebt: 0,
    tax: 0,
    netProfit: 0,
    netProfitMarginPct: 0,
    cashFlow: 0,
    accountsReceivable: 0,
    inventoryValue: 0,
    monthlyTarget: 1000000,
    targetAchievementPct: 0,
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
  { month: 'سبتمبر', monthEn: 'Sep', revenue: 487200, grossProfit: 218240, netProfit: 57494, adSpend: 38500 },
];

// ── TARGETS ───────────────────────────────────────────────────
export const MOCK_TARGETS = {
  'p-2026-09': {
    revenue: 800000, netProfit: 180000, adSpend: 0,
    roas: 0, orders: 0, newCustomers: 0, cpa: 0,
    hyundaiRevenue: 350000, kiaRevenue: 200000, ecommerceRevenue: 0,
    metaROAS: 0, googleROAS: 0, tiktokROAS: 0,
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
      { stage: 'الوصول (Reach)', stageEn: 'Reach', value: 0, color: '#1877F2' },
      { stage: 'المشاهدات والظهور', stageEn: 'Impressions', value: 0, color: '#3B82F6' },
      { stage: 'النقرات', stageEn: 'Clicks', value: 0, color: '#60A5FA' },
      { stage: 'التحويلات', stageEn: 'Conversions', value: 0, color: '#22C55E' },
    ],
    google: [
      { stage: 'الظهور (Impressions)', stageEn: 'Impressions', value: 0, color: '#10B981' },
      { stage: 'النقرات', stageEn: 'Clicks', value: 0, color: '#34D399' },
      { stage: 'التحويلات', stageEn: 'Conversions', value: 0, color: '#059669' },
    ],
    tiktok: [
      { stage: 'المشاهدات', stageEn: 'Impressions', value: 0, color: '#8B5CF6' },
      { stage: 'النقرات', stageEn: 'Clicks', value: 0, color: '#A78BFA' },
      { stage: 'التحويلات', stageEn: 'Conversions', value: 0, color: '#7C3AED' },
    ],
  },
};
