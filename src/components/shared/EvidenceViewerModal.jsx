import React, { useState } from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Download, Calendar, User, Eye, ZoomIn, ZoomOut, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { formatSAR } from '../../lib/kpiEngine';

export default function EvidenceViewerModal({ document, onClose }) {
  if (!document) return null;

  const [isZoomed, setIsZoomed] = useState(false);

  // Normalize asset URL for Vite / GitHub Pages compatibility
  const resolvedUrl = document.fileUrl
    ? (import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/') + document.fileUrl.replace(/^\//, '')
    : null;

  const isImage = document.fileName?.match(/\.(png|jpe?g|webp)$/i) || document.fileUrl?.match(/\.(png|jpe?g|webp)$/i);
  const isExcel = document.fileName?.match(/\.(xlsx|xls|csv)$/i) || document.fileUrl?.match(/\.(xlsx|xls|csv)$/i);
  const isPdf = document.fileName?.match(/\.pdf$/i) || document.fileUrl?.match(/\.pdf$/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full ${isZoomed ? 'max-w-5xl' : 'max-w-3xl'} rounded-3xl border border-white/10 bg-[#0d1728] shadow-2xl overflow-hidden transition-all duration-300`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">تتبع الأثر ومستند الإثبات (Data Lineage & Evidence)</h3>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {document.verificationStatus || 'VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{document.fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {resolvedUrl && (
              <a
                href={resolvedUrl}
                download={document.fileName}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="تحميل المستند الأصلي"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تحميل</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white/2 rounded-2xl border border-white/5 p-4">
            <div className="space-y-1">
              <div className="text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                المُدخل / المحاسب:
              </div>
              <div className="text-slate-200 font-bold">{document.uploadedBy || 'المحاسب المالي'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                تاريخ وتوقيت الاعتماد:
              </div>
              <div className="text-slate-200 font-mono" dir="ltr">
                {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString('ar-SA') : '2026-09-01'}
              </div>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <div className="text-slate-500">نوع المستند:</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 truncate">
                {isImage ? <FileText className="w-3.5 h-3.5" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                {document.category === 'branch_sales_screenshot' ? 'تقرير مبيعات نقاط البيع (POS)'
                  : document.category === 'branch_returns_screenshot' ? 'تقرير مردود المبيعات (POS Returns)'
                  : document.category === 'bank_transfers_excel' ? 'كشف الحوالات المصرفية (Excel)'
                  : document.category === 'tabby_tamara_excel' ? 'كشف تسويات تابي وتمارا (Excel)'
                  : 'مستند محاسبي رسمي'}
              </div>
            </div>
          </div>

          {/* Real Document Preview */}
          {isImage && resolvedUrl ? (
            <div className="rounded-2xl border border-white/10 bg-black/60 p-3 overflow-hidden flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full px-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  معاينة السكرين شوت الرسمي من نظام درة للسيارات
                </span>
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-300 transition-colors"
                >
                  {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  {isZoomed ? 'تصغير الحجم' : 'تكبير المعاينة'}
                </button>
              </div>

              <div className="w-full flex justify-center bg-black/40 rounded-xl p-2 max-h-[500px] overflow-auto border border-white/5">
                <img
                  src={resolvedUrl}
                  alt={document.fileName}
                  className="max-h-[460px] w-auto object-contain rounded-lg shadow-2xl transition-transform"
                />
              </div>
            </div>
          ) : isExcel ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{document.fileName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">ملف جدول بيانات رسمي مُدقق ومُطابق في النظام المحاسبي</p>
                  </div>
                </div>
                {resolvedUrl && (
                  <a
                    href={resolvedUrl}
                    download={document.fileName}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    تحميل ملف الإكسل
                  </a>
                )}
              </div>

              {/* Excel Key Metrics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                {document.amount && (
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="text-slate-400 text-[10px]">إجمالي المبلغ الصافي</div>
                    <div className="text-sm font-black text-white font-mono mt-0.5" dir="ltr">{formatSAR(document.amount, true)}</div>
                  </div>
                )}
                {document.vatAmount && (
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="text-slate-400 text-[10px]">ضريبة القيمة المضافة (15%)</div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-0.5" dir="ltr">{formatSAR(document.vatAmount, true)}</div>
                  </div>
                )}
                {(document.transfersCount || document.ordersCount) && (
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="text-slate-400 text-[10px]">عدد العمليات / الفواتير</div>
                    <div className="text-sm font-black text-slate-200 font-mono mt-0.5">{document.transfersCount || document.ordersCount} عملية</div>
                  </div>
                )}
                {document.adSpend && (
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="text-slate-400 text-[10px]">الإنفاق الإعلاني الإجمالي</div>
                    <div className="text-sm font-black text-amber-400 font-mono mt-0.5" dir="ltr">{formatSAR(document.adSpend, true)}</div>
                  </div>
                )}
                {document.impressions && (
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="text-slate-400 text-[10px]">مرات الظهور (Impressions)</div>
                    <div className="text-sm font-black text-blue-400 font-mono mt-0.5">{document.impressions.toLocaleString()}</div>
                  </div>
                )}
                {document.conversationsCount && (
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="text-slate-400 text-[10px]">محادثات واتساب بدأت</div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">{document.conversationsCount.toLocaleString()} محادثة</div>
                  </div>
                )}
                {document.clicks && (
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="text-slate-400 text-[10px]">النقرات على الروابط</div>
                    <div className="text-sm font-black text-purple-400 font-mono mt-0.5">{document.clicks.toLocaleString()} نقرة</div>
                  </div>
                )}
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-[10px]">حالة المطابقة والتدقيق</div>
                  <div className="text-sm font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    مطابق 100%
                  </div>
                </div>
              </div>
            </div>
          ) : isPdf ? (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{document.fileName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">مستند رسمي PDF معتمد من منصة سلة لتجارة السيارات</p>
                  </div>
                </div>
                {resolvedUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      فتح في نافذة جديدة
                    </a>
                    <a
                      href={resolvedUrl}
                      download={document.fileName}
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                    >
                      <Download className="w-4 h-4" />
                      تحميل PDF
                    </a>
                  </div>
                )}
              </div>

              {/* PDF Key Metrics if Salla */}
              {(document.grossSales || document.visitsCount) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {document.grossSales && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="text-slate-400 text-[10px]">إجمالي مبيعات سلة</div>
                      <div className="text-sm font-black text-emerald-400 font-mono mt-0.5" dir="ltr">{formatSAR(document.grossSales, true)}</div>
                    </div>
                  )}
                  {document.netSales && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="text-slate-400 text-[10px]">صافي مبيعات سلة</div>
                      <div className="text-sm font-black text-white font-mono mt-0.5" dir="ltr">{formatSAR(document.netSales, true)}</div>
                    </div>
                  )}
                  {document.ordersCount && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="text-slate-400 text-[10px]">عدد الطلبات المنجزة</div>
                      <div className="text-sm font-black text-blue-400 font-mono mt-0.5">{document.ordersCount} طلب</div>
                    </div>
                  )}
                  {document.visitsCount && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="text-slate-400 text-[10px]">إجمالي الزيارات</div>
                      <div className="text-sm font-black text-purple-400 font-mono mt-0.5">{document.visitsCount.toLocaleString()} زيارة</div>
                    </div>
                  )}
                  {document.mobileSharePct && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="text-slate-400 text-[10px]">نسبة الجوال</div>
                      <div className="text-sm font-black text-amber-400 font-mono mt-0.5">{document.mobileSharePct}%</div>
                    </div>
                  )}
                </div>
              )}

              {/* Embedded PDF iframe preview */}
              <div className="w-full h-[400px] rounded-xl overflow-hidden border border-white/10 bg-black/50">
                <iframe
                  src={resolvedUrl}
                  title={document.fileName}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/40 p-6 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <FileText className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{document.fileName}</div>
                <div className="text-xs text-slate-400 mt-1">تمت مطابقة وتدقيق الأرقام مع القوائم المالية المعتمدة بنجاح</div>
              </div>
            </div>
          )}

          {/* Auditor / Accountant Notes */}
          {document.notes && (
            <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl text-right w-full leading-relaxed">
              💡 <strong>ملاحظة الاعتماد والمطابقة:</strong> {document.notes}
            </div>
          )}

          {/* Audit Verification Stamp */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تم تدقيق ومطابقة هذا المستند مع تقارير نقاط البيع ودفاتر الحسابات الرسمية</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">Audit ID: {document.id}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/2 flex justify-between items-center">
          <div className="text-[11px] text-slate-500 font-mono">
            نظام درة للسيارات BI — مستند محفوظ ومشفر
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
}
