import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Download, Calendar, User, Eye } from 'lucide-react';
import { formatSAR } from '../../lib/kpiEngine';

export default function EvidenceViewerModal({ document, onClose }) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d1728] shadow-2xl overflow-hidden">
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
              <p className="text-xs text-slate-400 mt-0.5">{document.fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white/2 rounded-2xl border border-white/5 p-4">
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
                {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString('ar-SA') : '2026-09-03'}
              </div>
            </div>
            <div className="space-y-1 col-span-2 pt-2 border-t border-white/5">
              <div className="text-slate-500">نوع المستند المصدر:</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {document.category === 'branch_sales_screenshot' ? 'سكرين شوت تقرير نقاط البيع (POS Z-Report)'
                  : document.category === 'bank_transfers_excel' ? 'كشف حساب الحوالات المصرفية (Excel)'
                  : document.category === 'tabby_tamara_excel' ? 'تقرير تسوية منصات التقسيط تابي وتمارا'
                  : 'مستند محاسبي رسمي معتمد'}
              </div>
            </div>
          </div>

          {/* Document Preview Placeholder Graphic */}
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/40 p-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <FileText className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{document.fileName}</div>
              <div className="text-xs text-slate-400 mt-1">تمت مطابقة وتدقيق الأرقام مع القوائم المالية المعتمدة بنجاح</div>
            </div>
            {document.notes && (
              <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-right w-full mt-2">
                💡 <strong>ملاحظة الاعتماد:</strong> {document.notes}
              </div>
            )}
          </div>

          {/* Audit Verification Stamp */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم تدقيق واعتماد المستند بواسطة يحيى الحربي (المالك)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Audit ID: {document.id}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/2 flex justify-end">
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
