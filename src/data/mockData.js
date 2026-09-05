// ============================================================
// DORA CARS BI — COMPREHENSIVE MOCK DATA (3 months, consistent)
// All data is internally consistent:
//   Orders → Order Items → Products → Revenue
//   Ad Metrics → Campaigns → Platforms
//   Branches → Daily Sales → Monthly Aggregation
// ============================================================

// ── PERIODS ───────────────────────────────────────────────────
export const MOCK_PERIODS = [
  { id: 'p-2026-09', periodKey: '2026-09', year: 2026, month: 9, quarter: 3,
    label: 'سبتمبر 2026', labelEn: 'Sep 2026',
    startDate: '2026-09-01', endDate: '2026-09-30', isCurrent: true, isClosed: false },
  { id: 'p-2026-08', periodKey: '2026-08', year: 2026, month: 8, quarter: 3,
    label: 'أغسطس 2026', labelEn: 'Aug 2026',
    startDate: '2026-08-01', endDate: '2026-08-31', isCurrent: false, isClosed: true },
  { id: 'p-2026-07', periodKey: '2026-07', year: 2026, month: 7, quarter: 3,
    label: 'يوليو 2026', labelEn: 'Jul 2026',
    startDate: '2026-07-01', endDate: '2026-07-31', isCurrent: false, isClosed: true },
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
  // Sep 2026
  { id: 'camp-001', adAccountId: 'acc-meta-001', periodId: 'p-2026-09',
    name: 'قطع غيار هيونداي – اليوم الوطني 96', nameEn: 'Hyundai Parts – National Day 96',
    objective: 'conversions', status: 'active', buyingType: 'auction',
    dailyBudget: 200, totalBudget: 6000, startDate: '2026-09-01', endDate: '2026-09-30',
    branchAttribution: 'hyundai-rawaf', platformMeta: { platform: 'meta' } },
  { id: 'camp-002', adAccountId: 'acc-meta-001', periodId: 'p-2026-09',
    name: 'كيا – توعية البراند', nameEn: 'Kia – Brand Awareness',
    objective: 'awareness', status: 'active', buyingType: 'reach',
    dailyBudget: 150, totalBudget: 4500, startDate: '2026-09-01', endDate: '2026-09-30',
    branchAttribution: 'kia-sullaim', platformMeta: { platform: 'meta' } },
  { id: 'camp-003', adAccountId: 'acc-google-001', periodId: 'p-2026-09',
    name: 'متجر إلكتروني – شحن المملكة', nameEn: 'Online Store – KSA Shipping',
    objective: 'conversions', status: 'active', buyingType: 'cpc',
    dailyBudget: 266, totalBudget: 8000, startDate: '2026-08-15', endDate: '2026-09-30',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'google' } },
  { id: 'camp-004', adAccountId: 'acc-google-001', periodId: 'p-2026-09',
    name: 'هيونداي – بحث جوجل', nameEn: 'Hyundai – Google Search',
    objective: 'leads', status: 'active', buyingType: 'cpc',
    dailyBudget: 166, totalBudget: 5000, startDate: '2026-09-01', endDate: '2026-09-30',
    branchAttribution: 'hyundai-rawaf', platformMeta: { platform: 'google' } },
  { id: 'camp-005', adAccountId: 'acc-tiktok-001', periodId: 'p-2026-09',
    name: 'قطع كورية أصلية – تيك توك', nameEn: 'Original Korean Parts – TikTok',
    objective: 'awareness', status: 'active', buyingType: 'cpm',
    dailyBudget: 133, totalBudget: 4000, startDate: '2026-09-01', endDate: '2026-09-30',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'tiktok' } },
  { id: 'camp-006', adAccountId: 'acc-tiktok-001', periodId: 'p-2026-09',
    name: 'عروض الصيانة – تيك توك', nameEn: 'Maintenance Offers – TikTok',
    objective: 'traffic', status: 'paused', buyingType: 'cpc',
    dailyBudget: 116, totalBudget: 3500, startDate: '2026-08-20', endDate: '2026-09-20',
    branchAttribution: 'kia-sullaim', platformMeta: { platform: 'tiktok' } },
  // Aug 2026
  { id: 'camp-007', adAccountId: 'acc-meta-001', periodId: 'p-2026-08',
    name: 'صيف الصيانة – هيونداي', nameEn: 'Summer Maintenance – Hyundai',
    objective: 'conversions', status: 'ended', buyingType: 'auction',
    dailyBudget: 180, totalBudget: 5400, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'hyundai-rawaf', platformMeta: { platform: 'meta' } },
  { id: 'camp-008', adAccountId: 'acc-google-001', periodId: 'p-2026-08',
    name: 'متجر – صيف 2026', nameEn: 'Store – Summer 2026',
    objective: 'conversions', status: 'ended', buyingType: 'cpc',
    dailyBudget: 233, totalBudget: 7000, startDate: '2026-08-01', endDate: '2026-08-31',
    branchAttribution: 'ecommerce', platformMeta: { platform: 'google' } },
];

// ── PLATFORM DAILY METRICS (aggregated per platform per period) ────
// These are derived/summarized — real system would use daily rows
export const MOCK_PLATFORM_PERIOD_METRICS = {
  'p-2026-09': [
    { platformSlug: 'meta', spend: 18200, impressions: 1842000, reach: 928000,
      clicks: 38682, linkClicks: 22000, attributedRevenue: 83420,
      conversions: 314, videoViews: 412000, frequency: 1.98,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-meta-manual' },
    { platformSlug: 'google', spend: 12400, impressions: 624000, reach: 0,
      clicks: 17472, linkClicks: 17472, attributedRevenue: 55100,
      conversions: 228, videoViews: 0, frequency: 0,
      attributionModel: 'last_click', attributionWindow: '30d_click',
      dataSourceId: 'ds-google-manual' },
    { platformSlug: 'tiktok', spend: 7900, impressions: 2187000, reach: 1450000,
      clicks: 43740, linkClicks: 21000, attributedRevenue: 24380,
      conversions: 118, videoViews: 1820000, frequency: 1.51,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-tiktok-manual' },
  ],
  'p-2026-08': [
    { platformSlug: 'meta', spend: 16800, impressions: 1620000, reach: 845000,
      clicks: 34020, linkClicks: 19200, attributedRevenue: 71400,
      conversions: 276, videoViews: 370000, frequency: 1.92,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-meta-manual' },
    { platformSlug: 'google', spend: 11600, impressions: 580000, reach: 0,
      clicks: 16240, linkClicks: 16240, attributedRevenue: 49800,
      conversions: 207, videoViews: 0, frequency: 0,
      attributionModel: 'last_click', attributionWindow: '30d_click',
      dataSourceId: 'ds-google-manual' },
    { platformSlug: 'tiktok', spend: 6800, impressions: 1940000, reach: 1280000,
      clicks: 38800, linkClicks: 18400, attributedRevenue: 20900,
      conversions: 99, videoViews: 1620000, frequency: 1.52,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-tiktok-manual' },
  ],
  'p-2026-07': [
    { platformSlug: 'meta', spend: 15200, impressions: 1480000, reach: 760000,
      clicks: 31080, linkClicks: 17200, attributedRevenue: 62800,
      conversions: 244, videoViews: 320000, frequency: 1.95,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-meta-manual' },
    { platformSlug: 'google', spend: 10800, impressions: 524000, reach: 0,
      clicks: 14672, linkClicks: 14672, attributedRevenue: 44600,
      conversions: 185, videoViews: 0, frequency: 0,
      attributionModel: 'last_click', attributionWindow: '30d_click',
      dataSourceId: 'ds-google-manual' },
    { platformSlug: 'tiktok', spend: 5800, impressions: 1680000, reach: 1100000,
      clicks: 33600, linkClicks: 15800, attributedRevenue: 17400,
      conversions: 84, videoViews: 1420000, frequency: 1.53,
      attributionModel: 'last_click', attributionWindow: '7d_click',
      dataSourceId: 'ds-tiktok-manual' },
  ],
};

// ── BRANCHES ──────────────────────────────────────────────────
export const MOCK_BRANCHES = [
  { id: 'main', businessUnitId: 'bu-retail', name: 'الفرع الرئيسي',
    nameEn: 'Main Branch', brand: 'all', region: 'القصيم',
    city: 'بريدة', address: 'طريق الملك عبد العزيز، بريدة', latitude: 26.3450, longitude: 43.9630,
    status: 'active', phone: '0530051001', managerName: 'أحمد التميمي', openingDate: '2016-01-10',
    color: '#3B82F6', targetRevenue: 350000 },
  { id: 'al-rawaf', businessUnitId: 'bu-retail', name: 'فرع الرواف',
    nameEn: 'Al Rawaf Branch', brand: 'hyundai', region: 'القصيم',
    city: 'بريدة', address: 'طريق الرواف، حي الرواف، بريدة', latitude: 26.3597, longitude: 43.9756,
    status: 'active', phone: '0530051360', managerName: 'سليمان الرواف', openingDate: '2018-03-01',
    color: '#10B981', targetRevenue: 250000 },
  { id: 'kia', businessUnitId: 'bu-retail', name: 'فرع كيا',
    nameEn: 'Kia Branch', brand: 'kia', region: 'القصيم',
    city: 'بريدة', address: 'طريق الملك فهد، بريدة', latitude: 26.3280, longitude: 43.9512,
    status: 'active', phone: '0539454377', managerName: 'خالد المنصور', openingDate: '2019-07-15',
    color: '#8B5CF6', targetRevenue: 200000 },
];

// ── BRANCH PERIOD STATS (Gross, Returns, Net, Targets) ───────────────
export const MOCK_BRANCH_PERIOD_STATS = {
  'main': {
    'p-2026-09': { revenue: 350000, grossSales: 365000, returns: 15000, revenueGrowth: 12.5, cogs: 182000, grossProfit: 168000,
      orders: 820, ordersGrowth: 11.2, customers: 680, newCustomers: 185, avgOrderValue: 426.8,
      targetRevenue: 350000, targetAchievement: 100.0, satisfaction: 4.8 },
    'p-2026-08': { revenue: 311000, grossSales: 326000, returns: 15000, revenueGrowth: 7.2, cogs: 161720, grossProfit: 149280,
      orders: 740, ordersGrowth: 6.1, customers: 610, newCustomers: 152, avgOrderValue: 420.2,
      targetRevenue: 330000, targetAchievement: 94.2, satisfaction: 4.7 },
  },
  'al-rawaf': {
    'p-2026-09': { revenue: 250000, grossSales: 262000, returns: 12000, revenueGrowth: 8.7, cogs: 130000, grossProfit: 120000,
      orders: 610, ordersGrowth: 8.4, customers: 495, newCustomers: 130, avgOrderValue: 409.8,
      targetRevenue: 250000, targetAchievement: 100.0, satisfaction: 4.7 },
    'p-2026-08': { revenue: 230000, grossSales: 242000, returns: 12000, revenueGrowth: 5.5, cogs: 119600, grossProfit: 110400,
      orders: 565, ordersGrowth: 5.0, customers: 460, newCustomers: 115, avgOrderValue: 407.0,
      targetRevenue: 240000, targetAchievement: 95.8, satisfaction: 4.6 },
  },
  'kia': {
    'p-2026-09': { revenue: 200000, grossSales: 211000, returns: 11000, revenueGrowth: 14.3, cogs: 104000, grossProfit: 96000,
      orders: 490, ordersGrowth: 12.1, customers: 390, newCustomers: 110, avgOrderValue: 408.1,
      targetRevenue: 200000, targetAchievement: 100.0, satisfaction: 4.6 },
    'p-2026-08': { revenue: 175000, grossSales: 184000, returns: 9000, revenueGrowth: 4.8, cogs: 91000, grossProfit: 84000,
      orders: 435, ordersGrowth: 4.0, customers: 350, newCustomers: 92, avgOrderValue: 402.3,
      targetRevenue: 190000, targetAchievement: 92.1, satisfaction: 4.5 },
  },
};

// Generate branch daily sales (30 days realistic variation)
function genDailySales(baseRevenue, days = 30) {
  const daily = [];
  const avgDaily = baseRevenue / days;
  for (let d = 1; d <= days; d++) {
    const isWeekend = [5, 6].includes((d - 1) % 7); // Fri/Sat higher
    const factor = isWeekend ? 1.3 : (0.8 + Math.random() * 0.4);
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
    'p-2026-09': genDailySales(350000),
    'p-2026-08': genDailySales(311000),
  },
  'al-rawaf': {
    'p-2026-09': genDailySales(250000),
    'p-2026-08': genDailySales(230000),
  },
  'kia': {
    'p-2026-09': genDailySales(200000),
    'p-2026-08': genDailySales(175000),
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
    { productId: 'prod-001', unitsSold: 842, revenue: 71570, cogs: 35364, grossProfit: 36206, marginPct: 50.6, rating: 4.8, reviewCount: 124, growth: 22.1 },
    { productId: 'prod-002', unitsSold: 214, revenue: 68480, cogs: 38092, grossProfit: 30388, marginPct: 44.4, rating: 4.9, reviewCount: 87,  growth: 18.4 },
    { productId: 'prod-003', unitsSold: 1240, revenue: 55800, cogs: 26040, grossProfit: 29760, marginPct: 53.3, rating: 4.7, reviewCount: 198, growth: 31.2 },
    { productId: 'prod-004', unitsSold: 376, revenue: 55648, cogs: 31584, grossProfit: 24064, marginPct: 43.2, rating: 4.6, reviewCount: 156, growth: 9.7 },
    { productId: 'prod-005', unitsSold: 287, revenue: 53095, cogs: 28126, grossProfit: 24969, marginPct: 47.0, rating: 4.5, reviewCount: 93,  growth: 14.6 },
    { productId: 'prod-006', unitsSold: 134, revenue: 29480, cogs: 17152, grossProfit: 12328, marginPct: 41.8, rating: 4.8, reviewCount: 62,  growth: 7.2 },
    { productId: 'prod-007', unitsSold: 68,  revenue: 28560, cogs: 16456, grossProfit: 12104, marginPct: 42.4, rating: 4.6, reviewCount: 41,  growth: -3.4 },
    { productId: 'prod-008', unitsSold: 484, revenue: 26620, cogs: 13552, grossProfit: 13068, marginPct: 49.1, rating: 4.4, reviewCount: 78,  growth: 19.8 },
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
    totalOrders: 1124, totalOrdersGrowth: 11.2,
    totalRevenue: 287400, totalRevenueGrowth: 13.8,
    avgOrderValue: 255.7, avgOrderValueGrowth: 2.3,
    sessions: 33060, sessionsGrowth: 8.4,
    conversionRate: 3.4, conversionRateGrowth: 0.3,
    cartAbandonmentRate: 68.2, cartAbandonmentChange: -2.1,
    returningCustomerRate: 44.3,
    topCategories: [
      { name: 'فلاتر زيت وهواء', orders: 342, revenue: 62480, share: 21.7 },
      { name: 'مكابح أقراص وبطانات', orders: 218, revenue: 71240, share: 24.8 },
      { name: 'بلوجات إشعال', orders: 194, revenue: 29820, share: 10.4 },
      { name: 'زيوت محركات', orders: 178, revenue: 51380, share: 17.9 },
      { name: 'أحزمة ووصلات', orders: 102, revenue: 28940, share: 10.1 },
      { name: 'أخرى', orders: 90, revenue: 43540, share: 15.1 },
    ],
    // Daily orders for chart (30 days)
    ordersTimeline: Array.from({ length: 30 }, (_, i) => ({
      day: String(i + 1),
      orders: Math.round(28 + Math.random() * 42 + (i === 22 ? 30 : 0)),
    })),
  },
  'p-2026-08': {
    totalOrders: 1011, totalOrdersGrowth: 7.4,
    totalRevenue: 252400, totalRevenueGrowth: 9.6,
    avgOrderValue: 249.7, avgOrderValueGrowth: 2.0,
    sessions: 30500, sessionsGrowth: 5.2,
    conversionRate: 3.1, conversionRateGrowth: 0.2,
    cartAbandonmentRate: 70.3, cartAbandonmentChange: -1.4,
    returningCustomerRate: 42.1,
    topCategories: [
      { name: 'فلاتر زيت وهواء', orders: 308, revenue: 56240, share: 22.3 },
      { name: 'مكابح أقراص وبطانات', orders: 196, revenue: 62720, share: 24.8 },
      { name: 'بلوجات إشعال', orders: 175, revenue: 26425, share: 10.5 },
      { name: 'زيوت محركات', orders: 161, revenue: 46688, share: 18.5 },
      { name: 'أحزمة ووصلات', orders: 92, revenue: 25392, share: 10.1 },
      { name: 'أخرى', orders: 79, revenue: 34935, share: 13.8 },
    ],
    ordersTimeline: Array.from({ length: 31 }, (_, i) => ({
      day: String(i + 1),
      orders: Math.round(24 + Math.random() * 36),
    })),
  },
};

// ── FINANCIALS ────────────────────────────────────────────────
// IMPORTANT: totalRevenue here is factual business revenue (orders + branches)
// NOT platform-attributed revenue
export const MOCK_FINANCIALS = {
  'p-2026-09': {
    // Revenue — factual, from orders + branch sales
    totalRevenue: 487200,         // ecommerce 287400 + hyundai 112400 + kia 87400
    totalRevenueGrowth: 12.4,
    ecommerceRevenue: 287400,
    branchRevenue: 199800,        // 112400 + 87400
    // Total ad attributed is separate (163900) — NEVER mixed with total revenue

    cogs: 268960,
    grossProfit: 218240,
    grossMarginPct: 44.8,

    operatingExpenses: {
      salaries: 62400,
      rent: 18000,
      utilities: 4200,
      marketing: 38500,   // = total ad spend
      logistics: 8900,
      other: 12700,
    },
    totalOpex: 144700,

    ebitda: 73540,
    ebitdaMarginPct: 15.1,
    depreciation: 3800,
    ebit: 69740,
    interest: 2100,
    ebt: 67640,
    tax: 10146,
    netProfit: 57494,
    netProfitMarginPct: 11.8,

    cashFlow: 71200,
    accountsReceivable: 34800,
    inventoryValue: 184200,
    monthlyTarget: 500000,
    targetAchievementPct: 97.4,
  },
  'p-2026-08': {
    totalRevenue: 433500, totalRevenueGrowth: 7.1,
    ecommerceRevenue: 252400, branchRevenue: 181100,
    cogs: 241000, grossProfit: 192500, grossMarginPct: 44.4,
    operatingExpenses: { salaries: 62400, rent: 18000, utilities: 4100, marketing: 35200, logistics: 8100, other: 11200 },
    totalOpex: 139000,
    ebitda: 53500, ebitdaMarginPct: 12.3, depreciation: 3800,
    ebit: 49700, interest: 2100, ebt: 47600, tax: 7140,
    netProfit: 40460, netProfitMarginPct: 9.3,
    cashFlow: 58200, accountsReceivable: 31200, inventoryValue: 190400,
    monthlyTarget: 450000, targetAchievementPct: 96.3,
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
  { month: 'أغسطس', monthEn: 'Aug', revenue: 433500, grossProfit: 192500, netProfit: 40460, adSpend: 35200 },
  { month: 'سبتمبر', monthEn: 'Sep', revenue: 487200, grossProfit: 218240, netProfit: 57494, adSpend: 38500 },
];

// ── TARGETS ───────────────────────────────────────────────────
export const MOCK_TARGETS = {
  'p-2026-09': {
    revenue: 500000, netProfit: 65000, adSpend: 40000,
    roas: 4.0, orders: 2000, newCustomers: 450, cpa: 55,
    hyundaiRevenue: 120000, kiaRevenue: 95000, ecommerceRevenue: 300000,
    metaROAS: 4.5, googleROAS: 4.2, tiktokROAS: 3.5,
  },
  'p-2026-08': {
    revenue: 450000, netProfit: 48000, adSpend: 36000,
    roas: 3.8, orders: 1800, newCustomers: 400, cpa: 58,
    hyundaiRevenue: 100000, kiaRevenue: 90000, ecommerceRevenue: 260000,
    metaROAS: 4.2, googleROAS: 3.9, tiktokROAS: 3.2,
  },
};

// ── AD FUNNELS ────────────────────────────────────────────────
export const MOCK_AD_FUNNELS = {
  'p-2026-09': {
    meta: [
      { stage: 'وصول (Reach)', stageEn: 'Reach', value: 928000, color: '#3B82F6' },
      { stage: 'مشاهدات', stageEn: 'Impressions', value: 1842000, color: '#60A5FA' },
      { stage: 'نقرات', stageEn: 'Clicks', value: 38682, color: '#93C5FD' },
      { stage: 'نقرات الرابط', stageEn: 'Link Clicks', value: 22000, color: '#BFDBFE' },
      { stage: 'إضافة للسلة', stageEn: 'Add to Cart', value: 4840, color: '#DBEAFE' },
      { stage: 'تحويلات', stageEn: 'Conversions', value: 314, color: '#EFF6FF' },
    ],
    google: [
      { stage: 'ظهور (Impressions)', stageEn: 'Impressions', value: 624000, color: '#10B981' },
      { stage: 'نقرات', stageEn: 'Clicks', value: 17472, color: '#34D399' },
      { stage: 'صفحة الهبوط', stageEn: 'Landing Page', value: 13202, color: '#6EE7B7' },
      { stage: 'تفاعل', stageEn: 'Engagement', value: 5281, color: '#A7F3D0' },
      { stage: 'تحويلات', stageEn: 'Conversions', value: 228, color: '#D1FAE5' },
    ],
    tiktok: [
      { stage: 'وصول (Reach)', stageEn: 'Reach', value: 1450000, color: '#8B5CF6' },
      { stage: 'مشاهدات', stageEn: 'Impressions', value: 2187000, color: '#A78BFA' },
      { stage: 'نقرات', stageEn: 'Clicks', value: 43740, color: '#C4B5FD' },
      { stage: 'نقرات الرابط', stageEn: 'Link Clicks', value: 21000, color: '#DDD6FE' },
      { stage: 'تحويلات', stageEn: 'Conversions', value: 118, color: '#EDE9FE' },
    ],
  },
};
