# منصة ذكاء الأعمال والتحليلات — درة السيارة
## Dora Cars • Business Intelligence & Performance Platform

تطبيق ويب تنفيذي مستقل بالكامل متخصص في ذكاء الأعمال وتحليلات أداء المبيعات والتسويق الرقمي والميديا بايينغ (Media Buying).

---

## 🚀 المميزات الرئيسية (Core Features)

1. **مركز القيادة التنفيذي (Executive Command Center)**:
   - تشخيص فوري يجيب على الأسئلة الـ 8 الإستراتيجية لإدارة الأعمال (What, Why, Where, etc.).
   - مؤشرات الأداء الحيوية: الإيرادات الفعلية، الأرباح، الـ ROAS العام، CPA، ومعدل إنجاز المستهدفات.
2. **شريط صحة وسلامة البيانات (Data Health Status)**:
   - مراقبة لحظية لاكتمال ومطابقة بيانات المنصات والفروع (Meta, Google, TikTok, Snapchat, Salla, Branches).
3. **طبقة المطابقة المالية (Reconciliation Layer)**:
   - عزل صارم يمنع الازدواج المالي ويميز بين الإيراد الفعلي المحاسبي والإيراد المعزو للمنصات الإعلانية.
4. **تحليلات الميديا بايينغ (Media Buying Analytics)**:
   - تحليل متقدم للحملات الإعلانية على مستوى Meta, Google Ads, TikTok, Snapchat.
5. **المتجر الإلكتروني (E-commerce)**:
   - تتبع سلة المشتريات، متوسط قيمة الطلب (AOV)، ومعدلات التحويل.
6. **الفروع والخريطة التفاعلية (Branches & Geospatial Map)**:
   - خريطة تفاعلية مدعومة بـ Leaflet توضح أداء الفروع في مدن المملكة.
7. **المنتجات والمخزون (Products & Margins)**:
   - جدول المنتجات الأكثر مبيعاً، هوامش الربحية، ومستويات وتنبيهات المخزون.
8. **القوائم المالية (P&L & Financials)**:
   - قائمة الدخل الكاملة، المصاريف التشغيلية OPEX، وصافي الربح المحمي بصلاحيات المالك.
9. **نظام صلاحيات متقدم (5 RBAC Roles)**:
   - `OWNER` (المالك والمشرف العام)
   - `ADMIN` (مدير النظام التنفيذي)
   - `ANALYST` (محلل أداء استراتيجي)
   - `MEDIA_BUYER` (مسؤول الميديا بايينغ)
   - `VIEWER` (مشاهد تقارير عام)

---

## 🛠️ التشغيل والتطوير المحلي (Local Development)

```bash
# تثبيت التبعيات
npm install

# تشغيل خادم التطوير (يعمل على المنفذ 5174)
npm run dev

# بناء نسخة الإنتاج
npm run build

# معاينة نسخة الإنتاج
npm run preview
```

---

## 🗄️ قاعدة البيانات (Database & Supabase)

- يحتوي ملف `supabase_bi_schema.sql` على 22 جدول معزول مع سياسات **Row Level Security (RLS)** لحماية البيانات المالية.
- اضبط متغيرات البيئة في `.env.local`:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  VITE_BI_DATA_PROVIDER=mock # أو supabase
  ```
