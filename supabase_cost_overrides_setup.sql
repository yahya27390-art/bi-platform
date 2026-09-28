-- ============================================================================
-- DORA CARS: INVENTORY COST OVERRIDES & PURCHASING PRICE DATABASE TABLE
-- جدول تعديل وحفظ آخر أسعار الشراء المعتمدة للأصناف وقطع الغيار
-- يُمكّن مسؤولي المشتريات من تعديل تكلفة الأصناف وتحديث الفروقات فورياً.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_cost_overrides (
    part_number TEXT PRIMARY KEY,
    sku TEXT,
    part_name TEXT,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'فهد الجوعي (مدير المشتريات)'
);

-- إلغاء RLS لتسهيل حفظ وقراءة الأسعار المعدلة مباشرة من أي جهاز
ALTER TABLE public.inventory_cost_overrides DISABLE ROW LEVEL SECURITY;

-- تفعيل البث اللحظي (Realtime) لجميع المتصفحات
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_cost_overrides;
