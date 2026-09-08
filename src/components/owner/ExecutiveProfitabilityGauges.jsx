import React from 'react';

function SemiGauge({ label, value, color = '#0284C7', sublabel }) {
  const percentage = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
  // Exact SVG arc: radius 38, semi-circle length = Math.PI * 38 = 119.38
  const arcLength = 119.4;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center transition-all hover:shadow-sm">
      <div className="relative w-32 h-20 flex items-center justify-center">
        <svg className="w-32 h-20 overflow-visible" viewBox="0 0 100 65">
          {/* Background Track (Top semi-circle arch) */}
          <path
            d="M 12 55 A 38 38 0 0 1 88 55"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Active Colored Progress Arc */}
          <path
            d="M 12 55 A 38 38 0 0 1 88 55"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          {/* Centered Value */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="monospace"
            fontWeight="900"
            fontSize="15"
            fill="#0F2744"
          >
            {value}%
          </text>
        </svg>
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
