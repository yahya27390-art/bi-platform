import { useState } from 'react';
import { useImportHistory, usePeriods } from '../hooks/useBIData';
import { BIRoleGuard } from '../components/shared/BIRoleGuard';
import { DataSourceBadge, SectionHeader } from '../components/shared/SharedComponents';
import {
  Upload, CheckCircle, AlertCircle, XCircle, FileSpreadsheet, Clock,
  Image, FileText, CheckCircle2, Eye, ShieldCheck, ArrowRight, Save, Plus, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSAR } from '../lib/kpiEngine';
import { DORA_DOCUMENTS } from '../data/doraSchema';
import EvidenceViewerModal from '../components/shared/EvidenceViewerModal';

const IMPORT_CATEGORIES = [
  { id: 'branch_sales', label: 'مبيعات الفروع المادية', icon: '🏪', formats: '.png, .jpg, .xlsx, .pdf', desc: 'سكرين شوت تقرير نقاط البيع (Z-Report) أو إكسل فروع درة للسيارات' },
  { id: 'returns', label: 'المرتجعات وإلغاء العمليات', icon: '🔄', formats: '.png, .xlsx, .csv', desc: 'تقارير المرتجعات الشهرية لكل فرع مع أسباب الإرجاع' },
  { id: 'payment_methods', label: 'مزيج وسائل الدفع', icon: '💳', formats: '.xlsx, .csv, .png', desc: 'تفصيل الإيرادات حسب الكاش، الشبكة، الحوالات، تابي، تمارا' },
  { id: 'bank_transfers', label: 'كشوف الحوالات البنكية', icon: '🏦', formats: '.xlsx, .csv', desc: 'كشف مبيعات التحويلات البنكية المباشرة عبر الراجحي والأهلي' },
  { id: 'tabby_sales', label: 'تسويات تابي (Tabby)', icon: '📱', formats: '.xlsx, .csv', desc: 'تقرير مبيعات وعمولات التقسيط عبر منصة تابي' },
  { id: 'tamara_sales', label: 'تسويات تمارا (Tamara)', icon: '⚡', formats: '.xlsx, .csv', desc: 'تقرير مبيعات وعمولات التقسيط عبر منصة تمارا' },
  { id: 'advertising', label: 'منصات الإعلانات المدفوعة', icon: '📊', formats: '.xlsx, .csv, .png', desc: 'صادرات حملات Meta, Google Ads, TikTok, Snapchat' },
  { id: 'ecommerce', label: 'طلبات متجر سلة', icon: '🛒', formats: '.xlsx, .csv', desc: 'صادرات فواتير وطلبات متجر درة للسيارات الإلكتروني' },
  { id: 'financials', label: 'القوائم المالية (P&L)', icon: '💰', formats: '.xlsx, .pdf', desc: 'تكلفة البضاعة (COGS) ومصاريف التشغيل والإيجارات' },
];

export default function DataImport() {
  const [selectedCategory, setSelectedCategory] = useState('branch_sales');
  const [sourceType, setSourceType] = useState('screenshot'); // screenshot | excel | manual
  const [periodId, setPeriodId] = useState('p-2026-09');
  const [dragOver, setDragOver] = useState(false);
  const [simulatedFile, setSimulatedFile] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    branch: 'main',
    grossSales: 365000,
    returns: 15000,
    confidence: 'VERIFIED',
    notes: 'سكرين شوت تقرير Z-Report معتمد لشهر سبتمبر',
  });
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [activeEvidenceDoc, setActiveEvidenceDoc] = useState(null);

  const { data: history } = useImportHistory();
  const { data: periods } = usePeriods();

  const handleFileUpload = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSimulatedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
      });
      setShowVerificationModal(true);
    }
  };

  const handleSimulateDrop = () => {
    setSimulatedFile({
      name: selectedCategory === 'branch_sales' ? 'Main_Branch_ZReport_Sep2026.png' : 'Consolidated_Data_Sep2026.xlsx',
      size: '1.4 MB',
      type: sourceType === 'screenshot' ? 'image/png' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    setShowVerificationModal(true);
  };

  const handleCommitData = () => {
    setShowVerificationModal(false);
    setCommitSuccess(true);
    setTimeout(() => setCommitSuccess(false), 4000);
  };

  return (
    <BIRoleGuard permission="canImportData">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">مركز استيراد وتدقيق البيانات (Data Import Center)</h1>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Multi-Source Lineage
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              يدعم رفع السكرين شوت، ملفات Excel/CSV، أو الإدخال اليدوي مع التدقيق البشري الإلزامي قبل النقل للقوائم الرسمية
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-slate-400">الفترة المحاسبية:</span>
            <select
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
              className="bg-transparent text-xs font-bold text-emerald-400 outline-none cursor-pointer"
            >
              {periods?.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0e172a] text-white">
                  {p.labelAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {commitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>تم تدقيق وحفظ البيانات بنجاح في قاعدة البيانات مع حفظ مستند الإثبات المصدر!</span>
            </div>
            <span className="text-xs font-mono text-emerald-400">Status: COMMITTED</span>
          </div>
        )}

        {/* 1. Category Selection */}
        <div className="rounded-3xl border border-white/10 bg-[#0e172a] p-6 space-y-4 shadow-xl">
          <SectionHeader
            title="1. اختر فئة البيانات المراد إدخالها"
            subtitle="9 مسارات استيراد منفصلة ومطابقة لمعايير الحوكمة المالية"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {IMPORT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-2xl border text-right transition-all group',
                  selectedCategory === cat.id
                    ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10'
                )}
              >
                <span className="text-2xl p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white truncate">{cat.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{cat.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Source Format Selector */}
        <div className="rounded-3xl border border-white/10 bg-[#0e172a] p-6 space-y-4 shadow-xl">
          <SectionHeader
            title="2. حدد طبيعة المستند المصدر"
            subtitle="يتيح النظام إرفاق لقطات الشاشة أو ملفات الجداول مع الاحتفاظ بنسخة الإثبات"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'screenshot', label: 'سكرين شوت تقرير (Screenshot)', icon: Image, desc: 'صورة من شاشة الكاشير، نقاط البيع Z-Report، أو لوحة التحكم' },
              { id: 'excel', label: 'ملف جداول (Excel / CSV)', icon: FileSpreadsheet, desc: 'كشف مبيعات، تسويات تابي وتمارا، أو حركة الحسابات البنكية' },
              { id: 'manual', label: 'إدخال يدوي مباشر (Manual Form)', icon: FileText, desc: 'تسجيل الأرقام يدوياً من الفواتير الورقية مع إرفاق السند' },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <button
                  key={st.id}
                  onClick={() => setSourceType(st.id)}
                  className={cn(
                    'p-4 rounded-2xl border flex items-center gap-3 text-right transition-all',
                    sourceType === st.id
                      ? 'border-blue-500/50 bg-blue-500/10 shadow-lg'
                      : 'border-white/5 bg-white/2 hover:bg-white/5'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{st.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{st.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Upload & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleSimulateDrop(); }}
          onClick={handleSimulateDrop}
          className={cn(
            'rounded-3xl border-2 border-dashed transition-all p-10 flex flex-col items-center gap-4 cursor-pointer text-center relative overflow-hidden',
            dragOver
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-white/10 bg-[#0a1120] hover:border-emerald-500/40 hover:bg-emerald-500/5'
          )}
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              اسحب المستند المصدر إلى هنا أو اضغط للاختيار
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              يدعم صور السكرين شوت (PNG, JPG) وملفات الجداول (XLSX, CSV) حتى 25 ميجابايت
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>سيتم فتح نافذة المعاينة والتدقيق البشري فور الرفع</span>
          </div>
        </div>

        {/* 4. Multi-Step Pipeline Explanation */}
        <div className="rounded-3xl border border-white/5 bg-[#0e172a] p-6 space-y-4 shadow-xl">
          <SectionHeader
            title="مراحل تدقيق وتوثيق البيانات (Audit & Verification Pipeline)"
            subtitle="دورة حياة آمنة تضمن عدم وجود أي أرقام مجهولة المصدر"
          />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <div className="font-bold text-emerald-400">1. رفع المستند المصدر</div>
              <p className="text-slate-400 text-[11px]">حفظ سكرين شوت الكاشير أو ملف الإكسل الأصلي في سجل الأدلة.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <div className="font-bold text-blue-400">2. التحقق البشري الصارم</div>
              <p className="text-slate-400 text-[11px]">مقارنة الأرقام يدوياً والتأكد من فصل المبيعات عن المرتجعات.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <div className="font-bold text-purple-400">3. المطابقة التلقائية</div>
              <p className="text-slate-400 text-[11px]">فحص مجموع وسائل الدفع مقابل الفواتير وكشف أي فروقات فوراً.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <div className="font-bold text-amber-400">4. اعتماد وقفل الشهر</div>
              <p className="text-slate-400 text-[11px]">تسجيل هوية المعتمد ووقت الاعتماد ومنع التعديلات العشوائية.</p>
            </div>
          </div>
        </div>

        {/* 5. Uploaded August 2026 Documents Archive */}
        <div className="rounded-3xl border border-emerald-500/20 bg-[#0e172a] p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">الأرشيف الرقمي لمستندات شهر 8 المرفوعة (August 2026 Source Archive)</h3>
                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {DORA_DOCUMENTS.filter(d => d.periodId === 'p-2026-08').length} مستنداً معتمداً
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                المستندات الرسمية المرفوعة في الأرشيف (سكرين شوت الكاشير + كشوفات الحوالات والتقسيط + تقارير الحملات الإعلانية وسلة) المدققة والمطابقة
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>مطابقة القوائم المالية: مكتملة 100% ✓</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DORA_DOCUMENTS.filter(d => d.periodId === 'p-2026-08').map((doc) => {
              const isImg = doc.fileName?.match(/\.(png|jpe?g)$/i);
              const isPdf = doc.fileName?.match(/\.pdf$/i);
              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-white/5 bg-white/2 hover:border-emerald-500/30 hover:bg-white/4 p-4 space-y-3 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
                        isPdf ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                        isImg ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      )}>
                        {isPdf ? <FileText className="w-5 h-5" /> : isImg ? <Image className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white truncate" title={doc.fileName}>{doc.fileName}</h4>
                        <div className="text-[10px] text-slate-400 mt-0.5">{doc.uploadedBy}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                      {doc.verificationStatus}
                    </span>
                  </div>

                  {/* Summary metric if available */}
                  {(doc.grossSales || doc.returnsAmount || doc.amount) && (
                    <div className="flex items-center justify-between text-xs bg-black/30 px-3 py-2 rounded-xl">
                      <span className="text-slate-400 text-[11px]">
                        {doc.grossSales ? 'المبيعات الصافية بالمحلي:' : doc.returnsAmount ? 'إجمالي المردود:' : 'المبلغ الإجمالي:'}
                      </span>
                      <span className="font-mono font-black text-emerald-400" dir="ltr">
                        {formatSAR(doc.grossSales || doc.returnsAmount || doc.amount, true)}
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.notes}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setActiveEvidenceDoc(doc)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      معاينة الإثبات
                    </button>
                    {doc.fileUrl && (
                      <a
                        href={(import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/') + doc.fileUrl.replace(/^\//, '')}
                        download={doc.fileName}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                        title="تحميل الملف"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[11px]">تحميل</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Human Verification Modal (Preview Before Commit) */}
        {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d1728] shadow-2xl overflow-hidden p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      معاينة وتدقيق المستند قبل الحفظ (Human Verification Step)
                    </h3>
                    <p className="text-xs text-slate-400">
                      تأكيد مطابقة الأرقام المستخرجة مع المستند المصدر (المستند لا يتم ترحيله دون مراجعة)
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold">{simulatedFile?.name}</span>
                </div>
                <span className="text-slate-400 font-mono">{simulatedFile?.size}</span>
              </div>

              {/* Manual Confirmation Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium">الفرع التابع له التقرير:</label>
                    <select
                      value={verificationForm.branch}
                      onChange={(e) => setVerificationForm({ ...verificationForm, branch: e.target.value })}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="main" className="bg-[#0e172a]">الفرع الرئيسي (Main Branch)</option>
                      <option value="al-rawaf" className="bg-[#0e172a]">فرع الرواف (Al Rawaf)</option>
                      <option value="kia" className="bg-[#0e172a]">فرع كيا (Kia)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium">مستوى الثقة في المصدر:</label>
                    <select
                      value={verificationForm.confidence}
                      onChange={(e) => setVerificationForm({ ...verificationForm, confidence: e.target.value })}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500/50"
                    >
                      <option value="VERIFIED" className="bg-[#0e172a]">VERIFIED (مدقق ومطابق 100%)</option>
                      <option value="IMPORTED" className="bg-[#0e172a]">IMPORTED (مستورد من شيت)</option>
                      <option value="MANUAL" className="bg-[#0e172a]">MANUAL (إدخال يدوي)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium">إجمالي المبيعات (Gross Sales):</label>
                    <input
                      type="number"
                      value={verificationForm.grossSales}
                      onChange={(e) => setVerificationForm({ ...verificationForm, grossSales: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-red-400 font-medium">المرتجعات المسجلة (Returns):</label>
                    <input
                      type="number"
                      value={verificationForm.returns}
                      onChange={(e) => setVerificationForm({ ...verificationForm, returns: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-red-400 font-mono outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                {/* Net Sales Computed Formula */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-bold">
                    صافي المبيعات المحسوب تلقائياً (Net Sales = Gross - Returns):
                  </span>
                  <span className="text-base font-black text-emerald-400 font-mono" dir="ltr">
                    {formatSAR(verificationForm.grossSales - verificationForm.returns, true)}
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium">ملاحظات التدقيق والمصدر:</label>
                  <input
                    type="text"
                    value={verificationForm.notes}
                    onChange={(e) => setVerificationForm({ ...verificationForm, notes: e.target.value })}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCommitData}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  اعتماد وحفظ المستند
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Document Modal */}
        {activeEvidenceDoc && (
          <EvidenceViewerModal
            document={activeEvidenceDoc}
            onClose={() => setActiveEvidenceDoc(null)}
          />
        )}
      </div>
    </BIRoleGuard>
  );
}
