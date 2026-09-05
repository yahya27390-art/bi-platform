// ============================================================
// BI PLATFORM — CONSTANTS & CONFIGURATION
// ============================================================

export const BI_COMPANY_ID = 'dora-cars-001';
export const BI_COMPANY_NAME = 'درة السيارة';
export const BI_COMPANY_NAME_EN = 'Dora Cars';
export const BI_CURRENCY = 'SAR';
export const BI_LOCALE = 'ar-SA';

// Provider mode: 'mock' | 'supabase' | 'api'
export const BI_DATA_PROVIDER = 'mock';

// Platform slugs
export const PLATFORMS = {
  META:     'meta',
  GOOGLE:   'google',
  TIKTOK:   'tiktok',
  SNAPCHAT: 'snapchat',
  MANUAL:   'manual',
};

export const PLATFORM_LABELS = {
  meta:     { ar: 'ميتا', en: 'Meta', color: '#3B82F6', bgColor: '#1D4ED815' },
  google:   { ar: 'جوجل', en: 'Google', color: '#10B981', bgColor: '#05966915' },
  tiktok:   { ar: 'تيك توك', en: 'TikTok', color: '#8B5CF6', bgColor: '#5B21B615' },
  snapchat: { ar: 'سناب شات', en: 'Snapchat', color: '#FBBF24', bgColor: '#92400E15' },
  manual:   { ar: 'يدوي', en: 'Manual', color: '#6B7280', bgColor: '#37415115' },
};

// Campaign status
export const CAMPAIGN_STATUS = {
  ACTIVE:   'active',
  PAUSED:   'paused',
  ENDED:    'ended',
  DRAFT:    'draft',
};

// Import types
export const IMPORT_TYPES = {
  META_ADS:        'meta_ads',
  GOOGLE_ADS:      'google_ads',
  TIKTOK_ADS:      'tiktok_ads',
  ECOMMERCE_ORDERS:'ecommerce_orders',
  BRANCH_SALES:    'branch_sales',
  FINANCIALS:      'financials',
  PRODUCTS:        'products',
};

// Data source types
export const DATA_SOURCE_TYPES = {
  MANUAL_UPLOAD: 'MANUAL_UPLOAD',
  CSV:           'CSV',
  XLSX:          'XLSX',
  PDF:           'PDF',
  MANUAL_ENTRY:  'MANUAL_ENTRY',
  API:           'API',
};

// Attribution models
export const ATTRIBUTION_MODELS = {
  LAST_CLICK:   'last_click',
  LINEAR:       'linear',
  DATA_DRIVEN:  'data_driven',
  FIRST_CLICK:  'first_click',
};

export const ATTRIBUTION_WINDOWS = {
  '1d_click':  '1 يوم نقر',
  '7d_click':  '7 أيام نقر',
  '28d_click': '28 يوم نقر',
  '1d_view':   '1 يوم مشاهدة',
};

// KPI threshold config
export const KPI_THRESHOLDS = {
  roas:            { good: 3,   warning: 1.5,  inverted: false, unit: 'x' },
  cpa:             { good: 200, warning: 400,  inverted: true,  unit: 'SAR' },
  ctr:             { good: 2,   warning: 1,    inverted: false, unit: '%' },
  cpc:             { good: 1,   warning: 3,    inverted: true,  unit: 'SAR' },
  cpm:             { good: 30,  warning: 60,   inverted: true,  unit: 'SAR' },
  convRate:        { good: 3,   warning: 1,    inverted: false, unit: '%' },
  netProfitMargin: { good: 15,  warning: 8,    inverted: false, unit: '%' },
  grossMargin:     { good: 40,  warning: 25,   inverted: false, unit: '%' },
};

// Branch brands
export const BRANCH_BRANDS = {
  HYUNDAI: 'hyundai',
  KIA:     'kia',
};

// Channels
export const CHANNELS = {
  ECOMMERCE: 'ecommerce',
  BRANCH:    'branch',
  PHONE:     'phone',
  WHATSAPP:  'whatsapp',
};
