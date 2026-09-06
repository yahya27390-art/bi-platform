import React from 'react';
import ReactECharts from 'echarts-for-react';
import { formatSAR, formatNum } from '../../lib/kpiEngine';
import { CreditCard, Banknote, Landmark, Smartphone, FileCheck } from 'lucide-react';
import { DORA_SALES_BY_PAYMENT_METHOD } from '../../data/doraSchema';

export default function PaymentMethodMix({ payments, periodId = 'p-2026-08', onInspectDocument }) {
  const filteredFromSchema = DORA_SALES_BY_PAYMENT_METHOD.filter(p => p.periodId === periodId);
  const paymentList = payments || (filteredFromSchema.length > 0 ? filteredFromSchema : DORA_SALES_BY_PAYMENT_METHOD.filter(p => p.periodId === 'p-2026-08'));

  const totalAmount = paymentList.reduce((s, p) => s + (p.amount || 0), 0);
  const totalOrders = paymentList.reduce((s, p) => s + (p.orderCount || 0), 0);
  const installmentTotal = (paymentList.find(p => p.paymentMethodId === 'tabby')?.amount || 0) +
                           (paymentList.find(p => p.paymentMethodId === 'tamara')?.amount || 0);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#fff', fontFamily: 'Cairo', fontSize: 12 },
      formatter: (params) => {
        return `<div dir="rtl" style="text-align:right">
          <strong>${params.name}</strong><br/>
          <span style="color:#10B981;font-weight:bold">${Number(params.value).toLocaleString('ar-SA')} ر.س</span> (${params.percent}%)
        </div>`;
      },
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      left: 'center',
      textStyle: { color: '#334155', fontFamily: 'Cairo', fontSize: 11, fontWeight: 'bold' },
      icon: 'circle',
    },
    series: [
      {
        name: 'مزيج وسائل الدفع',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ffffff',
          borderWidth: 3,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'Cairo',
            color: '#0F172A',
            formatter: '{b}\n{d}%',
          },
        },
        data: paymentList.map(p => ({
          value: p.amount,
          name: p.nameAr,
          itemStyle: { color: p.color },
        })),
      },
    ],
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0F172A]">
              مزيج وهيكل وسائل الدفع والتحصيل (Payment Method Mix)
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              توزيع المبيعات الصافية حسب آلية السداد (شبكة، كاش، تحويلات، وشركات التقسيط تابي وتمارا)
            </p>
          </div>
        </div>

        {/* Installment Callout Badge */}
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl shadow-xs">
          <Smartphone className="w-4 h-4 text-amber-600" />
          <div className="text-right">
            <div className="text-[10px] text-amber-900 font-bold">إجمالي مبيعات التقسيط (تابي + تمارا)</div>
            <div className="text-xs font-black text-amber-800" dir="rtl">
              {formatSAR(installmentTotal, true)} ({((installmentTotal / totalAmount) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Attribution Insight Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
          <span className="text-slate-800 font-bold">
            نموذج الإسناد البيعي للحملات (Attribution Logic):
          </span>
          <span className="text-slate-600 font-medium">
            مبيعات <strong className="text-purple-900">التحويلات البنكية</strong>، <strong className="text-amber-900">تمارا</strong>، و<strong className="text-cyan-900">تابي</strong> (إجمالي <strong className="text-emerald-700">224,558 ر.س</strong>) تعتمد كلياً على إعلانات محادثات ميتا وتيك توك (عائد <strong>47.35×</strong>)، بينما تدعم إعلانات جوجل حركة الزيارات الميدانية للفروع ومبيعات متجر سلة.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-black text-[11px]">
            ميتا وتيك توك: 224.6K ر.س
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px]">
            جوجل: الفروع + سلة
          </span>
        </div>
      </div>

      {/* Grid: Donut Chart on Left, Detail Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Chart Column */}
        <div className="lg:col-span-5 h-[280px]">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
        </div>

        {/* Detailed Breakdown List */}
        <div className="lg:col-span-7 space-y-2">
          {paymentList.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: p.color }} />
                <div>
                  <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                    {p.nameAr}
                    {p.documentId && (
                      <button
                        onClick={() => onInspectDocument && onInspectDocument(p.documentId)}
                        className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1 hover:bg-emerald-100 font-bold"
                        title="عرض كشف الإثبات المصدر"
                      >
                        <FileCheck className="w-3 h-3 text-emerald-600" />
                        مستند معتمد
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">{formatNum(p.orderCount)} عملية سداد</div>
                </div>
              </div>

              <div className="text-left">
                <div className="text-sm font-black text-[#0F172A]" dir="rtl">
                  {formatSAR(p.amount, false)}
                </div>
                <div className="text-xs font-bold text-slate-500" dir="ltr">
                  {p.sharePct.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
