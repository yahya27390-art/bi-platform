-- ============================================================
-- DORA CARS BI PLATFORM — COMPREHENSIVE POSTGRESQL SCHEMA
-- ISOLATED BI TABLES + ROW LEVEL SECURITY (RLS)
-- Section 5 Directive: 22 Independent BI Tables
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PERIODS
CREATE TABLE IF NOT EXISTS bi_periods (
  id VARCHAR(64) PRIMARY KEY,
  period_key VARCHAR(16) NOT NULL UNIQUE, -- e.g. '2026-09'
  year INT NOT NULL,
  month INT NOT NULL,
  quarter INT NOT NULL,
  label VARCHAR(64) NOT NULL,
  label_en VARCHAR(64),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLATFORMS
CREATE TABLE IF NOT EXISTS bi_platforms (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(32) NOT NULL UNIQUE, -- 'meta', 'google', 'tiktok', 'snapchat', 'manual'
  name VARCHAR(64) NOT NULL,
  name_ar VARCHAR(64) NOT NULL,
  color VARCHAR(16) DEFAULT '#10B981',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AD ACCOUNTS
CREATE TABLE IF NOT EXISTS bi_ad_accounts (
  id VARCHAR(64) PRIMARY KEY,
  platform_id VARCHAR(64) REFERENCES bi_platforms(id) ON DELETE CASCADE,
  account_id_external VARCHAR(128) NOT NULL,
  account_name VARCHAR(128) NOT NULL,
  currency VARCHAR(8) DEFAULT 'SAR',
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGNS
CREATE TABLE IF NOT EXISTS bi_campaigns (
  id VARCHAR(64) PRIMARY KEY,
  ad_account_id VARCHAR(64) REFERENCES bi_ad_accounts(id) ON DELETE CASCADE,
  period_id VARCHAR(64) REFERENCES bi_periods(id),
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  objective VARCHAR(64) DEFAULT 'conversions',
  status VARCHAR(32) DEFAULT 'active', -- 'active', 'paused', 'ended'
  buying_type VARCHAR(32) DEFAULT 'auction',
  daily_budget NUMERIC(12, 2) DEFAULT 0,
  total_budget NUMERIC(12, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  branch_attribution VARCHAR(64),
  platform_meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AD SETS / AD GROUPS
CREATE TABLE IF NOT EXISTS bi_ad_sets (
  id VARCHAR(64) PRIMARY KEY,
  campaign_id VARCHAR(64) REFERENCES bi_campaigns(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(32) DEFAULT 'active',
  targeting JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ADS
CREATE TABLE IF NOT EXISTS bi_ads (
  id VARCHAR(64) PRIMARY KEY,
  ad_set_id VARCHAR(64) REFERENCES bi_ad_sets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  creative_type VARCHAR(64),
  creative_url TEXT,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AD DAILY METRICS
CREATE TABLE IF NOT EXISTS bi_ad_daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id VARCHAR(64) REFERENCES bi_campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  reach BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  attributed_revenue NUMERIC(12, 2) DEFAULT 0,
  attribution_model VARCHAR(32) DEFAULT 'last_click',
  attribution_window VARCHAR(16) DEFAULT '7d_click',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, metric_date)
);

-- 8. ECOMMERCE ORDERS
CREATE TABLE IF NOT EXISTS bi_orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) NOT NULL UNIQUE,
  period_id VARCHAR(64) REFERENCES bi_periods(id),
  order_date TIMESTAMPTZ NOT NULL,
  channel VARCHAR(32) DEFAULT 'ecommerce',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(32) DEFAULT 'completed',
  customer_id VARCHAR(64),
  attributed_platform VARCHAR(32),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS bi_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(64) REFERENCES bi_orders(id) ON DELETE CASCADE,
  product_id VARCHAR(64),
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit_cogs NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRODUCTS
CREATE TABLE IF NOT EXISTS bi_products (
  id VARCHAR(64) PRIMARY KEY,
  sku VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  category VARCHAR(64),
  brand VARCHAR(64),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PRODUCT METRICS
CREATE TABLE IF NOT EXISTS bi_product_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(64) REFERENCES bi_products(id) ON DELETE CASCADE,
  period_id VARCHAR(64) REFERENCES bi_periods(id),
  units_sold INT DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0,
  gross_profit NUMERIC(12, 2) DEFAULT 0,
  gross_margin_pct NUMERIC(6, 2) DEFAULT 0,
  returns_count INT DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, period_id)
);

-- 12. BRANCHES
CREATE TABLE IF NOT EXISTS bi_branches (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  name_en VARCHAR(128),
  brand VARCHAR(32) NOT NULL, -- 'hyundai' | 'kia'
  city VARCHAR(64) NOT NULL,
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BRANCH DAILY SALES
CREATE TABLE IF NOT EXISTS bi_branch_daily_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id VARCHAR(64) REFERENCES bi_branches(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cogs NUMERIC(12, 2) NOT NULL DEFAULT 0,
  gross_profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  invoices_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, sale_date)
);

-- 14. FINANCIAL RECORDS (P&L Source)
CREATE TABLE IF NOT EXISTS bi_financial_records (
  id VARCHAR(64) PRIMARY KEY,
  period_id VARCHAR(64) REFERENCES bi_periods(id) UNIQUE,
  total_revenue NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ecommerce_revenue NUMERIC(14, 2) DEFAULT 0,
  branch_revenue NUMERIC(14, 2) DEFAULT 0,
  cogs NUMERIC(14, 2) NOT NULL DEFAULT 0,
  gross_profit NUMERIC(14, 2) NOT NULL DEFAULT 0,
  gross_margin_pct NUMERIC(6, 2) DEFAULT 0,
  opex NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ad_spend_total NUMERIC(14, 2) DEFAULT 0,
  salaries_total NUMERIC(14, 2) DEFAULT 0,
  rent_total NUMERIC(14, 2) DEFAULT 0,
  net_profit NUMERIC(14, 2) NOT NULL DEFAULT 0,
  net_profit_margin_pct NUMERIC(6, 2) DEFAULT 0,
  cash_flow NUMERIC(14, 2) DEFAULT 0,
  ar_balance NUMERIC(14, 2) DEFAULT 0,
  inventory_value NUMERIC(14, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. EXPENSES (Detailed OPEX)
CREATE TABLE IF NOT EXISTS bi_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id VARCHAR(64) REFERENCES bi_periods(id),
  category VARCHAR(64) NOT NULL, -- 'marketing', 'salaries', 'rent', 'utilities', 'logistics'
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. COGS DETAILS
CREATE TABLE IF NOT EXISTS bi_cogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id VARCHAR(64) REFERENCES bi_periods(id),
  channel VARCHAR(32),
  cogs_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. TARGETS
CREATE TABLE IF NOT EXISTS bi_targets (
  id VARCHAR(64) PRIMARY KEY,
  period_id VARCHAR(64) REFERENCES bi_periods(id) UNIQUE,
  revenue NUMERIC(14, 2) DEFAULT 0,
  net_profit NUMERIC(14, 2) DEFAULT 0,
  ad_spend NUMERIC(14, 2) DEFAULT 0,
  roas NUMERIC(6, 2) DEFAULT 0,
  orders INT DEFAULT 0,
  branch_sales NUMERIC(14, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. DATA SOURCES
CREATE TABLE IF NOT EXISTS bi_data_sources (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  source_type VARCHAR(32) NOT NULL, -- 'MANUAL_UPLOAD', 'CSV', 'XLSX', 'API'
  platform_slug VARCHAR(32),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. IMPORTS
CREATE TABLE IF NOT EXISTS bi_imports (
  id VARCHAR(64) PRIMARY KEY,
  data_source_id VARCHAR(64) REFERENCES bi_data_sources(id),
  import_type VARCHAR(64) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_hash VARCHAR(128),
  total_rows INT DEFAULT 0,
  successful_rows INT DEFAULT 0,
  warning_rows INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  duplicate_rows INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  uploaded_by VARCHAR(64),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 20. IMPORT ROWS (Staging & Validation)
CREATE TABLE IF NOT EXISTS bi_import_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_id VARCHAR(64) REFERENCES bi_imports(id) ON DELETE CASCADE,
  row_index INT NOT NULL,
  raw_data JSONB NOT NULL,
  normalized_data JSONB,
  status VARCHAR(32) DEFAULT 'valid', -- 'valid', 'warning', 'error', 'duplicate'
  validation_errors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. DOCUMENTS & REPORTS
CREATE TABLE IF NOT EXISTS bi_documents (
  id VARCHAR(64) PRIMARY KEY,
  period_id VARCHAR(64) REFERENCES bi_periods(id),
  title VARCHAR(255) NOT NULL,
  doc_type VARCHAR(64) NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. EXECUTIVE INSIGHTS
CREATE TABLE IF NOT EXISTS bi_insights (
  id VARCHAR(64) PRIMARY KEY,
  period_id VARCHAR(64) REFERENCES bi_periods(id),
  insight_type VARCHAR(32), -- 'positive', 'warning', 'action_item'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  metric_key VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. AUDIT LOGS
CREATE TABLE IF NOT EXISTS bi_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64),
  actor_id VARCHAR(64) NOT NULL,
  actor_role VARCHAR(32) NOT NULL,
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Roles: OWNER, ADMIN, ANALYST, MEDIA_BUYER, VIEWER
-- ============================================================

ALTER TABLE bi_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_ad_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_product_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_branch_daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_cogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role
CREATE OR REPLACE FUNCTION get_bi_auth_role()
RETURNS VARCHAR AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'bi_role',
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'bi_role',
    'VIEWER'
  );
$$ LANGUAGE sql STABLE;

-- 1. General Analytics: All authenticated BI roles can READ
CREATE POLICY "bi_read_general_policy" ON bi_periods FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_read_platforms_policy" ON bi_platforms FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_read_campaigns_policy" ON bi_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_read_ad_metrics_policy" ON bi_ad_daily_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_read_orders_policy" ON bi_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_read_products_policy" ON bi_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_read_product_metrics_policy" ON bi_product_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_read_branches_policy" ON bi_branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_read_branch_sales_policy" ON bi_branch_daily_sales FOR SELECT TO authenticated USING (true);

-- 2. Sensitive Financials: Restricted to OWNER and ADMIN only
CREATE POLICY "bi_financials_sensitive_policy" ON bi_financial_records
  FOR SELECT TO authenticated
  USING (get_bi_auth_role() IN ('OWNER', 'ADMIN'));

CREATE POLICY "bi_expenses_sensitive_policy" ON bi_expenses
  FOR SELECT TO authenticated
  USING (get_bi_auth_role() IN ('OWNER', 'ADMIN'));

CREATE POLICY "bi_cogs_sensitive_policy" ON bi_cogs
  FOR SELECT TO authenticated
  USING (get_bi_auth_role() IN ('OWNER', 'ADMIN'));

-- 3. Data Imports: OWNER, ADMIN, and MEDIA_BUYER can insert & manage
CREATE POLICY "bi_imports_read_policy" ON bi_imports FOR SELECT TO authenticated USING (true);
CREATE POLICY "bi_imports_write_policy" ON bi_imports
  FOR INSERT TO authenticated
  WITH CHECK (get_bi_auth_role() IN ('OWNER', 'ADMIN', 'MEDIA_BUYER'));

-- 4. Audit Logs: Restricted to OWNER and ADMIN
CREATE POLICY "bi_audit_read_policy" ON bi_audit_logs
  FOR SELECT TO authenticated
  USING (get_bi_auth_role() IN ('OWNER', 'ADMIN'));
