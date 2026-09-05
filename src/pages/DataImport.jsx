import { useState } from 'react';
import { useImportHistory, usePeriods } from '../hooks/useBIData';
import { BIRoleGuard } from '../components/shared/BIRoleGuard';
import { DataSourceBadge, SectionHeader } from '../components/shared/SharedComponents';
import { Upload, CheckCircle, AlertCircle, XCircle, FileSpreadsheet, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const IMPORT_TYPES_LABELS = {
  meta_ads:         { label: 'Meta Ads', platform: 'meta' },
  google_ads:       { label: 'Google Ads', platform: 'google' },
  tiktok_ads:       { label: 'TikTok Ads', platform: 'tiktok' },
  ecommerce_orders: { label: 'طلبات المتجر', platform: null },
  branch_sales:     { label: 'مبيعات الفروع', platform: null },
  financials:       { label: 'بيانات مالية', platform: null },
};

const IMPORT_TEMPLATES = [
  { type: 'meta_ads',         label: 'Meta Ads Export', icon: '📘', description: 'تصدير بيانات الحملات من Meta Business Suite' },
  { type: 'google_ads',       label: 'Google Ads Report', icon: '🔍', description: 'تقرير الأداء من Google Ads' },
  { type: 'tiktok_ads',       label: 'TikTok Ads Export', icon: '🎵', description: 'تصدير بيانات الحملات من TikTok Ads Manager' },
  { type: 'ecommerce_orders', label: 'طلبات Salla', icon: '🛒', description: 'تصدير الطلبات من متجر Salla' },
  { type: 'branch_sales',     label: 'مبيعات الفروع', icon: '🏪', description: 'مبيعات يومية للفروع الفعلية' },
  { type: 'financials',       label: 'بيانات مالية', icon: '💰', description: 'قائمة الأرباح والخسائر الشهرية' },
];

export default function DataImport() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const { data: history } = useImportHistory();
  const { data: periods } = usePeriods();

  return (
    <BIRoleGuard permission="canImportData">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white">استيراد البيانات</h1>
          <p className="text-slate-400 text-sm mt-1">رفع ملفات Excel/CSV · 13 خطوة تحقق وتحليل</p>
        </div>

        {/* Import Type Selection */}
        <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
          <SectionHeader title="اختر نوع البيانات" className="mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {IMPORT_TEMPLATES.map(t => (
              <button key={t.type} onClick={() => setSelectedType(t.type)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center',
                  selectedType === t.type
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-white/5 bg-white/2 hover:bg-white/5'
                )}>
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs font-bold text-white">{t.label}</span>
              </button>
            ))}
          </div>
          {selectedType && (
            <p className="mt-3 text-sm text-slate-400">
              {IMPORT_TEMPLATES.find(t => t.type === selectedType)?.description}
            </p>
          )}
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); }}
          className={cn(
            'rounded-2xl border-2 border-dashed transition-all p-12 flex flex-col items-center gap-4 cursor-pointer',
            dragOver
              ? 'border-emerald-500/60 bg-emerald-500/5'
              : 'border-white/10 bg-white/2 hover:border-emerald-500/30 hover:bg-emerald-500/3'
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Upload className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold">اسحب الملف هنا أو اضغط للرفع</p>
            <p className="text-slate-500 text-sm mt-1">يدعم: .xlsx, .xls, .csv — حد أقصى 25MB</p>
          </div>
          {!selectedType && (
            <p className="text-amber-400 text-xs">⚠️ الرجاء اختيار نوع البيانات أولاً</p>
          )}
        </div>

        {/* Pipeline steps info */}
        <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
          <SectionHeader title="مراحل معالجة الاستيراد" subtitle="13 خطوة تحقق وحماية" className="mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              '1. رفع الملف', '2. اكتشاف الصيغة', '3. اختيار المصدر', '4. الفترة الزمنية',
              '5. معاينة', '6. ربط الأعمدة', '7. التحقق', '8. كشف التكرار',
              '9. التحويل', '10. التطبيع', '11. إدخال قاعدة البيانات', '12. سجل التدقيق', '13. تحديث التجميعات'
            ].map((step, i) => (
              <div key={i} className="rounded-lg bg-white/3 px-2 py-2 text-center">
                <div className="text-xs text-slate-400 font-medium">{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Import History */}
        {history?.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
            <SectionHeader title="سجل الاستيراد" subtitle={`${history.length} عملية استيراد`} className="mb-5" />
            <div className="space-y-3">
              {history.map(imp => {
                const StatusIcon = imp.status === 'completed' ? CheckCircle : imp.status === 'warning' ? AlertCircle : XCircle;
                const statusColor = imp.status === 'completed' ? 'text-emerald-400' : imp.status === 'warning' ? 'text-amber-400' : 'text-red-400';
                return (
                  <div key={imp.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/2 border border-white/5">
                    <StatusIcon className={cn('w-5 h-5 shrink-0', statusColor)} />
                    <div className="flex items-center gap-2 shrink-0">
                      <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                      <DataSourceBadge type="XLSX" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{imp.fileName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {IMPORT_TYPES_LABELS[imp.importType]?.label || imp.importType}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                      <span className="text-emerald-400">✅ {imp.successfulRows}</span>
                      {imp.warningRows > 0 && <span className="text-amber-400">⚠️ {imp.warningRows}</span>}
                      {imp.failedRows > 0 && <span className="text-red-400">❌ {imp.failedRows}</span>}
                      {imp.duplicateRows > 0 && <span className="text-slate-400">🔁 {imp.duplicateRows}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(imp.uploadedAt).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BIRoleGuard>
  );
}
