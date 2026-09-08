import React from 'react';

function SemiGauge({ label, value, color = '#0284C7', sublabel }) {
  const percentage = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
  // Radius 36, semi-circle arc length = Math.PI * 36 = 113.1
  const arcLength = 113.1;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-xs text-center transition-all hover:bg-white hover:shadow-sm overflow-hidden">
      {/* Sized SVG container that never overflows */}
      <div className="relative w-full max-w-[140px] h-18 flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full overflow-hidden" viewBox="0 0 100 56">
          {/* Background Track Arc */}
          <path
            d="M 14 50 A 36 36 0 0 1 86 50"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Active Colored Progress Arc */}
          <path
            d="M 14 50 A 36 36 0 0 1 86 50"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          {/* Centered Percentage Value */}
          <text
            x="50"
            y="46"
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

      <div className="text-xs font-black text-[#0F2744] mt-1 truncate max-w-full">
        {label}
      </div>
      {sublabel && (
        <div className="text-[10px] text-slate-400 font-medium truncate max-w-full">
          {sublabel}
        </div>
      )}
    </div>
  );
}

export default function ExecutiveProfitabilityGauges() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black text-[#0F2744]">
            مؤشرات ونسب الربحية (Profitability Ratios)
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            معدلات الربحية والتغطية التشغيلية المعتمدة
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-500 self-start sm:self-auto bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
          4 Real Operational Gauges
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SemiGauge
          label="هامش مجمل الربح"
          value="37.1"
          color="#0F2744"
          sublabel="Gross Margin (367.4K)"
        />
        <SemiGauge
          label="هامش الأرباح التشغيلية"
          value="29.4"
          color="#0284C7"
          sublabel="Operating Margin (EBITDA)"
        />
        <SemiGauge
          label="نسبة المصاريف (OPEX)"
          value="9.1"
          color="#F97316"
          sublabel="OPEX to Sales (90K)"
        />
        <SemiGauge
          label="هامش صافي الربح"
          value="28.0"
          color="#10B981"
          sublabel="Net Margin (277.4K)"
        />
      </div>
    </div>
  );
}
