import React from 'react';
import { formatSAR, formatNum, formatMultiplier } from '../../lib/kpiEngine';
import { MapPin, ShieldAlert, CheckCircle, Navigation, Globe } from 'lucide-react';
import { DORA_GEO_PERFORMANCE } from '../../data/doraSchema';

export default function GeoPerformanceView({ geoData = DORA_GEO_PERFORMANCE }) {
  const CONFIDENCE_BADGES = {
    Known: { text: 'بيانات مؤكدة (Known POS)', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
    Estimated: { text: 'تقدير إسناد (Estimated)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
    Unavailable: { text: 'غير متوفر (Unavailable)', color: 'text-slate-400 bg-slate-500/15 border-slate-500/30' },
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c162a] to-[#080d18] p-6 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">الأداء الجغرافي للمدن (Geographic & City Intelligence)</h3>
            <p className="text-xs text-slate-400">
              تحليل شامل لكفاءة المدن مع تطبيق مبدأ الشفافية الصارمة (تمييز البيانات المؤكدة عن التقديرية)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-bold">
            ✓ Known: نقاط بيع فعلية
          </span>
          <span className="px-2.5 py-1 rounded-lg border text-amber-400 bg-amber-500/10 border-amber-500/20 font-bold">
            ⚡ Estimated: شحنات متجر
          </span>
        </div>
      </div>

      {/* City Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-right text-xs text-slate-500 font-semibold">
              <th className="py-3 px-3">المدينة والمنطقة</th>
              <th className="py-3 px-3">المبيعات المحققة</th>
              <th className="py-3 px-3">الإنفاق الإعلاني</th>
              <th className="py-3 px-3">التحويلات</th>
              <th className="py-3 px-3">العائد (ROAS)</th>
              <th className="py-3 px-3">مستوى الثقة (Confidence)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {geoData.map((item, idx) => {
              const badge = CONFIDENCE_BADGES[item.confidence] || CONFIDENCE_BADGES.Known;
              return (
                <tr key={idx} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.isPhysicalHub ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          {item.cityAr} ({item.cityEn})
                          {item.isPhysicalHub && (
                            <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                              مركز الفروع
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.region}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-white font-mono font-bold text-xs" dir="ltr">
                    {formatSAR(item.sales, true)}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-xs" dir="ltr">
                    {formatSAR(item.spend, true)}
                  </td>
                  <td className="py-3 px-3 text-white font-mono text-xs">
                    {formatNum(item.conversions)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-bold text-emerald-400 font-mono" dir="ltr">
                      {formatMultiplier(item.roas)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
