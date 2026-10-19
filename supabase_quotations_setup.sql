-- ============================================================================
-- DORA CARS: SUPPLIER QUOTATIONS PERSISTENCE TABLE
-- جدول حفظ عروض أسعار الموردين للمقارنة والمراجعة السحابية الدائمة
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.supplier_quotations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    supplier_name TEXT,
    date TEXT,
    items_count INT DEFAULT 0,
    badge TEXT,
    icon TEXT,
    analysis_data JSONB,
    raw_items JSONB,
    quotation_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إتاحة القراءة والكتابة بدون قيود RLS لمزامنة كافة أجهزة الإدارة والمشتريات
ALTER TABLE public.supplier_quotations DISABLE ROW LEVEL SECURITY;
