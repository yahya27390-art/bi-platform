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
      backgroundColor: '#0D1E36',
      borderColor: 'rgba(255,255,255,0.15)',
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
      textStyle: { color: '#94A3B8', fontFamily: 'Cairo', fontSize: 11 },
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
          borderColor: '#0c162a',
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
            color: '#fff',
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
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c162a] to-[#080d18] p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              مزيج وهيكل وسائل الدفع والتحصيل (Payment Method Mix)
            </h3>
            <p className="text-xs text-slate-400">
              توزيع المبيعات الصافية حسب آلية السداد (شبكة، كاش، تحويلات، وشركات التقسيط تابي وتمارا)
            </p>
          </div>
        </div>

        {/* Installment Callout Badge */}
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-2xl">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium">إجمالي مبيعات التقسيط (تابي + تمارا)</div>
            <div className="text-xs font-black text-amber-300 font-mono" dir="ltr">
              {formatSAR(installmentTotal, true)} ({((installmentTotal / totalAmount) * 100).toFixed(1)}%)
            </div>
          </div>
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
              className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {p.nameAr}
                    {p.documentId && (
                      <button
                        onClick={() => onInspectDocument && onInspectDocument(p.documentId)}
                        className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-emerald-500/20"
                        title="عرض كشف الإثبات المصدر"
                      >
                        <FileCheck className="w-3 h-3" />
                        مستند معتمد
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{formatNum(p.orderCount)} عملية سداد</div>
                </div>
              </div>

              <div className="text-left">
                <div className="text-sm font-black text-white font-mono" dir="ltr">
                  {formatSAR(p.amount, true)}
                </div>
                <div className="text-xs font-bold text-slate-400 font-mono" dir="ltr">
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
