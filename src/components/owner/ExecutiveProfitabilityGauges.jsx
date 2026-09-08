import React from 'react';

function SemiGauge({ label, value, color = '#0284C7', target = '100%', sublabel }) {
  const percentage = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
  // SVG arc calculation for semi-circle
  const radius = 42;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-xs text-center">
      <div className="relative w-28 h-16 flex items-end justify-center overflow-hidden">
        <svg className="w-28 h-28 transform -rotate-180" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset="0"
          />
          {/* Colored Progress Arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-base font-black font-mono text-[#0F2744]">
            {value}%
          </span>
        </div>
      </div>
      <div className="text-xs font-bold text-slate-800 mt-1">{label}</div>
      {sublabel && (
        <div className="text-[10px] text-slate-400 font-medium">{sublabel}</div>
      )}
    </div>
  );
}

export default function ExecutiveProfitabilityGauges() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-black text-[#0F2744]">
          مؤشرات ونسب الربحية (Profitability Ratios)
        </h3>
        <span className="text-[10px] font-mono font-bold text-slate-400">
          4 Real Operational Gauges
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SemiGauge
          label="هامش مجمل الربح"
          value="37.5"
          color="#0F2744"
          sublabel="Gross Margin"
        />
        <SemiGauge
          label="تغطية التشغيل"
          value="75.2"
          color="#0284C7"
          sublabel="OPEX Coverage"
        />
        <SemiGauge
          label="هامش قبل الفوائد"
          value="29.4"
          color="#F97316"
          sublabel="Operating Margin"
        />
        <SemiGauge
          label="هامش صافي الربح"
          value="28.0"
          color="#10B981"
          sublabel="Net Profit Margin"
        />
      </div>
    </div>
  );
}
