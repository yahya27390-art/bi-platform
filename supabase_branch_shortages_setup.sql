-- ============================================================================
-- DORA CARS: MULTI-BRANCH SHORTAGES & PURCHASING LIVE SYNC TABLES
-- يُمكّن المزامنة اللحظية الحية بين كافة أجهزة الفروع التسعة (3 أجهزة لكل فرع)
-- وشاشة مدير المشتريات لاعتماد الطلبيات على نفس قاعدة البيانات المركزية.
-- ============================================================================

-- 1. جدول دورات وقوائم طلب النواقص للفروع
CREATE TABLE IF NOT EXISTS public.branch_shortage_batches (
    id TEXT PRIMARY KEY,
    branch_key TEXT NOT NULL,
    batch_number INT NOT NULL DEFAULT 1,
    batch_title TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' (نشطة للتسجيل) أو 'ORDERED' (معتمدة ومطلوبة)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ordered_at TIMESTAMPTZ,
    ordered_by TEXT,
    supplier_notes TEXT
);

-- 2. جدول أصناف النواقص المسجلة من الكاونترات
CREATE TABLE IF NOT EXISTS public.branch_shortage_items (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES public.branch_shortage_batches(id) ON DELETE CASCADE,
    branch_key TEXT NOT NULL,
    part_number TEXT NOT NULL,
    part_name TEXT NOT NULL,
    requested_qty INT NOT NULL DEFAULT 1,
    priority TEXT NOT NULL DEFAULT 'NORMAL', -- 'NORMAL' | 'URGENT' | 'CUSTOMER_REQUEST'
    created_by_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_new_to_inventory BOOLEAN DEFAULT false
);

-- 3. إلغاء قيود RLS لتسهيل حفظ وقراءة كافة أجهزة الفروع بدون تسجيل دخول (Anon Key)
ALTER TABLE public.branch_shortage_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_shortage_items DISABLE ROW LEVEL SECURITY;

-- 4. تفعيل البث اللحظي السحابي (Realtime) لجميع الأجهزة في نفس اللحظة
ALTER PUBLICATION supabase_realtime ADD TABLE public.branch_shortage_batches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.branch_shortage_items;
