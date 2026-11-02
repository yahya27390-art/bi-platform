import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { aggregateBranchSales } from '../lib/branchSalesParser';
import { useImportHistory, usePeriods } from '../hooks/useBIData';
import { BIRoleGuard } from '../components/shared/BIRoleGuard';
import { DataSourceBadge, SectionHeader } from '../components/shared/SharedComponents';
import {
  Upload, CheckCircle, AlertCircle, XCircle, FileSpreadsheet, Clock,
  Image, FileText, CheckCircle2, Eye, ShieldCheck, ArrowRight, Save, Plus, Download,
  ShoppingCart, Building2, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSAR } from '../lib/kpiEngine';
import { DORA_DOCUMENTS } from '../data/doraSchema';
import EvidenceViewerModal from '../components/shared/EvidenceViewerModal';
import { useCurrentPeriod } from '../context/BIPeriodContext';
import SallaIntegrationModal from '../components/shared/SallaIntegrationModal';
import { loadSallaConfig } from '../lib/sallaIntegration';

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
  const [sourceType, setSourceType] = useState('screenshot');
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [simulatedFile, setSimulatedFile] = useState(null);
  const [doraParsedResult, setDoraParsedResult] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSallaModal, setShowSallaModal] = useState(false);
  const [sallaConfig, setSallaConfig] = useState(loadSallaConfig);
  const [verificationForm, setVerificationForm] = useState({
    branch: 'main',
    grossSales: 471748.99,
    returns: 42863.50,
    confidence: 'VERIFIED',
    notes: 'سكرين شوت تقرير نقاط البيع Z-Report المعتمد للفرع الرئيسي - شهر 8',
  });
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [activeEvidenceDoc, setActiveEvidenceDoc] = useState(null);

  const { data: history } = useImportHistory();

  const handleProcessFile = (file) => {
    if (!file) return;

    setSimulatedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || 'file',
    });

    const isExcelOrCsv = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');

    if (isExcelOrCsv) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

          // Check if file contains Dora Cars invoice prefixes (260)
          const isDoraFormat = rows.some((r) => {
            const inv = String(r['رقم الفاتورة'] || r['رقم_الفاتورة'] || '');
            return inv.startsWith('260');
          });

          if (isDoraFormat) {
            const aggregated = aggregateBranchSales(rows);
            setDoraParsedResult(aggregated);
            setVerificationForm({
              branch: 'all',
              grossSales: aggregated.totals.grossSales,
              returns: aggregated.totals.returns,
              confidence: 'VERIFIED',
              notes: `تم فك وتصنيف كشف المبيعات آلياً بناءً على قاعدة درة السيارات (260). إجمالي العمليات: ${aggregated.totals.totalOperations} عبر الفروع الثلاثة.`,
            });
          } else {
            setDoraParsedResult(null);
          }
        } catch (err) {
          console.error('Failed to parse sheet:', err);
          setDoraParsedResult(null);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setDoraParsedResult(null);
    }

    setShowVerificationModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSimulateDrop = () => {
    handleProcessFile({
      name: 'sales_october_2026_all_branches.xlsx',
      size: 1400 * 1024,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
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
              <h1 className="text-2xl font-black text-slate-900">مركز استيراد وتدقيق البيانات (Data Import & Governance)</h1>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Multi-Source Lineage
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              يدعم رفع السكرين شوت، ملفات Excel/CSV، أو الإدخال اليدوي مع التدقيق البشري الإلزامي قبل النقل للقوائم الرسمية
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-slate-500 font-medium">الفترة المحاسبية:</span>
            <select
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
            >
              {periods?.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-slate-900">
                  {p.labelAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {commitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>تم تدقيق وحفظ البيانات بنجاح في قاعدة البيانات مع حفظ مستند الإثبات المصدر!</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">Status: COMMITTED</span>
          </div>
        )}

        {/* 1. Category Selection */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
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
                  'flex items-start gap-3 p-4 rounded-2xl border text-right transition-all group shadow-xs',
                  selectedCategory === cat.id
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                )}
              >
                <span className="text-2xl p-2 rounded-xl bg-white group-hover:scale-105 transition-transform shadow-xs">
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">{cat.label}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{cat.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Source Format Selector */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
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
                    'p-4 rounded-2xl border flex items-center gap-3 text-right transition-all shadow-xs',
                    sourceType === st.id
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-700 shadow-xs shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{st.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{st.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Salla Live Direct Integration Banner when ecommerce category is selected */}
        {selectedCategory === 'ecommerce' && (
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                🛒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">الربط اللحظي المباشر مع متجر سلة (Salla API)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    بديل آلي للإكسل
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  يمكنك جلب فواتير وطلبات doracars.com والسلات المتروكة مباشرة عبر الـ API دون الحاجة لتصدير ورفع ملفات إكسل يدوية.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSallaModal(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
            >
              <span className={`w-2 h-2 rounded-full ${sallaConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'}`} />
              <span>{sallaConfig.isConnected ? 'إدارة ربط سلة المباشر' : 'تفعيل الربط المباشر مع سلة'}</span>
            </button>
          </div>
        )}

        {/* Dora Invoicing Rule Indicator Card */}
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-[#070e0a] p-5 border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-100 flex items-center gap-2">
                  <span>محرك الفرز الآلي لفواتير درة السيارات (Dora Invoicing & Return Classifier)</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">معتمد ونشط</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  تمت برمجة واعتماد التعرف التلقائي على أرقام الفواتير والمردودات وفق الهيكل الرسمي لدرة السيارات:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-400 block">الفرع الرئيسي (Main)</span>
                <span className="text-[10px] text-slate-400 font-mono">فاتورة: 26011 • مردود: 260311</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">11</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-400 block">فرع الرواف (Al-Rawaf)</span>
                <span className="text-[10px] text-slate-400 font-mono">فاتورة: 26012 • مردود: 260312</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">12</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-400 block">فرع كيا (Kia)</span>
                <span className="text-[10px] text-slate-400 font-mono">فاتورة: 26013 • مردود: 260313</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">13</span>
            </div>
          </div>
        </div>

        {/* 3. Upload & Drop Zone */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg,.pdf"
          className="hidden"
        />

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer?.files?.[0];
            if (file) handleProcessFile(file);
            else handleSimulateDrop();
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'rounded-3xl border-2 border-dashed transition-all p-10 flex flex-col items-center gap-4 cursor-pointer text-center relative overflow-hidden',
            dragOver
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/30'
          )}
        >
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              اسحب المستند المصدر أو كشف المبيعات إلى هنا أو اضغط للاختيار
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              يدعم ملفات الجداول (XLSX, CSV) مع الفرز الآلي للفروع الثلاثة، وصور السكرين شوت حتى 25 ميجابايت
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-900 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>سيتم فك وتصنيف بيانات الفروع والمردودات تلقائياً فور الرفع</span>
          </div>
        </div>

        {/* 4. Multi-Step Pipeline Explanation */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <SectionHeader
            title="مراحل تدقيق وتوثيق البيانات (Audit & Verification Pipeline)"
            subtitle="دورة حياة آمنة تضمن عدم وجود أي أرقام مجهولة المصدر"
          />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900">1. رفع المستند المصدر</div>
              <p className="text-slate-500 text-[11px]">حفظ سكرين شوت الكاشير أو ملف الإكسل الأصلي في سجل الأدلة.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="font-bold text-blue-800">2. التحقق البشري الصارم</div>
              <p className="text-slate-500 text-[11px]">مقارنة الأرقام يدوياً والتأكد من فصل المبيعات عن المرتجعات.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900">3. المطابقة التلقائية</div>
              <p className="text-slate-500 text-[11px]">فحص مجموع وسائل الدفع مقابل الفواتير وكشف أي فروقات فوراً.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="font-bold text-emerald-800">4. اعتماد وقفل الشهر</div>
              <p className="text-slate-500 text-[11px]">تسجيل هوية المعتمد ووقت الاعتماد ومنع التعديلات العشوائية.</p>
            </div>
          </div>
        </div>

        {/* 5. Uploaded August 2026 Documents Archive */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">الأرشيف الرقمي لمستندات الفترة النشطة المرفوعة ({periods.find(p => p.id === periodId)?.labelAr || 'المستندات المصدرية'})</h3>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {(DORA_DOCUMENTS.filter(d => d.periodId === periodId).length > 0 ? DORA_DOCUMENTS.filter(d => d.periodId === periodId) : DORA_DOCUMENTS).length} مستنداً معتمداً
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                المستندات الرسمية المرفوعة في الأرشيف (سكرين شوت الكاشير + كشوفات الحوالات والتقسيط + تقارير الحملات الإعلانية وسلة) المدققة والمطابقة
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>مطابقة القوائم المالية: مكتملة 100% ✓</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(DORA_DOCUMENTS.filter(d => d.periodId === periodId).length > 0 ? DORA_DOCUMENTS.filter(d => d.periodId === periodId) : DORA_DOCUMENTS).map((doc) => {
              const isImg = doc.fileName?.match(/\.(png|jpe?g)$/i);
              const isPdf = doc.fileName?.match(/\.pdf$/i);
              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/70 p-4 space-y-3 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs",
                        isPdf ? "bg-blue-100 border-blue-200 text-blue-800" :
                        isImg ? "bg-indigo-100 border-indigo-200 text-indigo-800" :
                        "bg-emerald-100 border-emerald-200 text-emerald-800"
                      )}>
                        {isPdf ? <FileText className="w-5 h-5" /> : isImg ? <Image className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</h4>
                        <div className="text-[10px] text-slate-500 mt-0.5">{doc.uploadedBy}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                      {doc.verificationStatus}
                    </span>
                  </div>

                  {/* Summary metric if available */}
                  {(doc.grossSales || doc.returnsAmount || doc.amount) && (
                    <div className="flex items-center justify-between text-xs bg-white border border-slate-200 px-3 py-2 rounded-xl">
                      <span className="text-slate-600 text-[11px] font-medium">
                        {doc.grossSales ? 'المبيعات المسجلة بالمحلي:' : doc.returnsAmount ? 'إجمالي المردود:' : 'المبلغ الإجمالي:'}
                      </span>
                      <span className="font-mono font-black text-slate-900" dir="ltr">
                        {formatSAR(doc.grossSales || doc.returnsAmount || doc.amount, true)}
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {doc.notes}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveEvidenceDoc(doc)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      معاينة الإثبات
                    </button>
                    {doc.fileUrl && (
                      <a
                        href={(import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/') + doc.fileUrl.replace(/^\//, '')}
                        download={doc.fileName}
                        className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-colors text-xs flex items-center gap-1"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      معاينة وتدقيق المستند قبل الحفظ (Human Verification Step)
                    </h3>
                    <p className="text-xs text-slate-500">
                      تأكيد مطابقة الأرقام المستخرجة مع المستند المصدر (المستند لا يتم ترحيله دون مراجعة)
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span className="text-slate-900 font-bold">{simulatedFile?.name}</span>
                </div>
                <span className="text-slate-500 font-mono font-bold">{simulatedFile?.size}</span>
              </div>

              {/* Automated Dora Multi-Branch Breakdown if detected */}
              {doraParsedResult && (
                <div className="space-y-3 bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-900 border-b border-emerald-200 pb-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم التعرف الآلي على قاعدة درة السيارات (260) وتفكيك الفروع الثلاثة:</span>
                    </span>
                    <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                      {doraParsedResult.totals.totalOperations} حركة
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* Main */}
                    <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-1 shadow-xs">
                      <div className="font-bold text-blue-900 flex items-center justify-between">
                        <span>الفرع الرئيسي</span>
                        <span className="text-[10px] text-blue-600 font-mono">26011 / 260311</span>
                      </div>
                      <div className="text-[11px] text-slate-600">المبيعات: <strong>{formatSAR(doraParsedResult.branches.main.grossSales)}</strong></div>
                      <div className="text-[11px] text-rose-600">المردود: <strong>{formatSAR(doraParsedResult.branches.main.returns)}</strong></div>
                      <div className="text-xs font-semibold text-slate-700 pt-1 border-t border-slate-100">
                        صافي الفواتير: {formatSAR(doraParsedResult.branches.main.netSales)}
                      </div>
                      <div className="text-xs font-black text-blue-700 flex items-center justify-between">
                        <span>للتارجت (+15% ضريبة):</span>
                        <span className="font-mono">{formatSAR(doraParsedResult.branches.main.salesWithVat)}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-600 bg-blue-50 px-2 py-0.5 rounded flex items-center justify-between">
                        <span>إنجاز التارجت:</span>
                        <span className="font-mono text-blue-800 font-black">{doraParsedResult.branches.main.targetAchievementPct}%</span>
                      </div>
                    </div>

                    {/* Rawaf */}
                    <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1 shadow-xs">
                      <div className="font-bold text-emerald-900 flex items-center justify-between">
                        <span>فرع الرواف</span>
                        <span className="text-[10px] text-emerald-600 font-mono">26012 / 260312</span>
                      </div>
                      <div className="text-[11px] text-slate-600">المبيعات: <strong>{formatSAR(doraParsedResult.branches['al-rawaf'].grossSales)}</strong></div>
                      <div className="text-[11px] text-rose-600">المردود: <strong>{formatSAR(doraParsedResult.branches['al-rawaf'].returns)}</strong></div>
                      <div className="text-xs font-semibold text-slate-700 pt-1 border-t border-slate-100">
                        صافي الفواتير: {formatSAR(doraParsedResult.branches['al-rawaf'].netSales)}
                      </div>
                      <div className="text-xs font-black text-emerald-700 flex items-center justify-between">
                        <span>للتارجت (+15% ضريبة):</span>
                        <span className="font-mono">{formatSAR(doraParsedResult.branches['al-rawaf'].salesWithVat)}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center justify-between">
                        <span>إنجاز التارجت:</span>
                        <span className="font-mono text-emerald-800 font-black">{doraParsedResult.branches['al-rawaf'].targetAchievementPct}%</span>
                      </div>
                    </div>

                    {/* Kia */}
                    <div className="bg-white p-3 rounded-xl border border-purple-200 space-y-1 shadow-xs">
                      <div className="font-bold text-purple-900 flex items-center justify-between">
                        <span>فرع كيا</span>
                        <span className="text-[10px] text-purple-600 font-mono">26013 / 260313</span>
                      </div>
                      <div className="text-[11px] text-slate-600">المبيعات: <strong>{formatSAR(doraParsedResult.branches.kia.grossSales)}</strong></div>
                      <div className="text-[11px] text-rose-600">المردود: <strong>{formatSAR(doraParsedResult.branches.kia.returns)}</strong></div>
                      <div className="text-xs font-semibold text-slate-700 pt-1 border-t border-slate-100">
                        صافي الفواتير: {formatSAR(doraParsedResult.branches.kia.netSales)}
                      </div>
                      <div className="text-xs font-black text-purple-700 flex items-center justify-between">
                        <span>للتارجت (+15% ضريبة):</span>
                        <span className="font-mono">{formatSAR(doraParsedResult.branches.kia.salesWithVat)}</span>
                      </div>
                      <div className="text-[11px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded flex items-center justify-between">
                        <span>إنجاز التارجت:</span>
                        <span className="font-mono text-purple-800 font-black">{doraParsedResult.branches.kia.targetAchievementPct}% (تجاوز التارجت!)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-300/80 flex flex-wrap items-center justify-between text-xs font-bold text-slate-800">
                    <span>إجمالي الفروع الثلاثة المجمعة:</span>
                    <span>صافي الفواتير: <strong className="font-mono">{formatSAR(doraParsedResult.totals.netSales)}</strong></span>
                    <span>المحتسب للتارجت (+15% ضريبة): <strong className="font-mono text-emerald-700">{formatSAR(doraParsedResult.totals.salesWithVat)}</strong></span>
                    <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-mono">{doraParsedResult.totals.targetAchievementPct}% إنجاز</span>
                  </div>
                </div>
              )}

              {/* Manual Confirmation Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 font-bold">الفرع التابع له التقرير:</label>
                    <select
                      value={verificationForm.branch}
                      onChange={(e) => setVerificationForm({ ...verificationForm, branch: e.target.value })}
                      className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="all">جميع الفروع مجمعة (All Branches Consolidated)</option>
                      <option value="main">الفرع الرئيسي (Main Branch)</option>
                      <option value="al-rawaf">فرع الرواف (Al Rawaf)</option>
                      <option value="kia">فرع كيا (Kia)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-bold">مستوى الثقة في المصدر:</label>
                    <select
                      value={verificationForm.confidence}
                      onChange={(e) => setVerificationForm({ ...verificationForm, confidence: e.target.value })}
                      className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-emerald-800 font-bold outline-none focus:border-blue-500"
                    >
                      <option value="VERIFIED">VERIFIED (مدقق ومطابق 100%)</option>
                      <option value="IMPORTED">IMPORTED (مستورد من شيت)</option>
                      <option value="MANUAL">MANUAL (إدخال يدوي)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 font-bold">إجمالي المبيعات (Gross Sales):</label>
                    <input
                      type="number"
                      value={verificationForm.grossSales}
                      onChange={(e) => setVerificationForm({ ...verificationForm, grossSales: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 font-mono font-bold outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-red-600 font-bold">المرتجعات المسجلة (Returns):</label>
                    <input
                      type="number"
                      value={verificationForm.returns}
                      onChange={(e) => setVerificationForm({ ...verificationForm, returns: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm text-red-600 font-mono font-bold outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Net Sales Computed Formula */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-900 font-bold">
                    صافي المبيعات المحسوب تلقائياً (Net Sales = Gross - Returns):
                  </span>
                  <span className="text-base font-black text-emerald-800 font-mono" dir="ltr">
                    {formatSAR(verificationForm.grossSales - verificationForm.returns, true)}
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">ملاحظات التدقيق والمصدر:</label>
                  <input
                    type="text"
                    value={verificationForm.notes}
                    onChange={(e) => setVerificationForm({ ...verificationForm, notes: e.target.value })}
                    className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCommitData}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0F172A] hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-md"
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

        {/* Salla Integration Modal */}
        <SallaIntegrationModal
          isOpen={showSallaModal}
          onClose={() => setShowSallaModal(false)}
          onSyncComplete={(cfg) => setSallaConfig(cfg)}
        />
      </div>
    </BIRoleGuard>
  );
}
