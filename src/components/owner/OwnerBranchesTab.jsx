import React, { useState } from 'react';
import { useCurrentPeriod } from '../../context/BIPeriodContext';

// ── Real Branch Data (August 2026 Official Audited Accounting Reports) ─────────
// Figures strictly verified against Official POS reports & Returns reports:
// • الفرع الرئيسي: إجمالي 471,748.99 | مردود 42,863.50 | صافي 428,885.49 ر.س
// • فرع الرواف (هيونداي): إجمالي 328,996.67 | مردود 37,625.00 | صافي 291,371.67 ر.س
// • فرع كيا المعتمد: إجمالي 304,155.00 | مردود 34,890.00 | صافي 269,265.00 ر.س
// • متجر سلة أونلاين: إجمالي 41,783.00 | مردود 225.00 | صافي 41,558.00 ر.س
// إجمالي مردودات الفروع الميدانية: 115,378.50 ر.س (مطابق 100% لتقرير المردودات العام لشهر 8)
const BRANCHES = [
  {
    id: 'main',
    name: 'الفرع الرئيسي',
    subtitle: 'بريدة — طريق الملك عبد العزيز',
    emoji: '🏪',
    gradient: 'from-[#0A192F] to-[#0F2744]',
    accentColor: '#0284C7',
    grossSales: 471748.99,
    returns: 42863.50,
    sales: 428885.49,
    target: 350000,
    tag: 'الرئيسي',
    tagColor: '#0A192F',
    city: 'بريدة',
    products: 'قطع غيار شاملة',
  },
  {
    id: 'hyundai',
    name: 'فرع الرواف',
    subtitle: 'هيونداي — حي الرواف',
    emoji: '🏬',
    gradient: 'from-[#0369A1] to-[#0284C7]',
    accentColor: '#38BDF8',
    grossSales: 328996.67,
    returns: 37625.00,
    sales: 291371.67,
    target: 250000,
    tag: 'هيونداي',
    tagColor: '#0369A1',
    city: 'بريدة',
    products: 'قطع هيونداي معتمدة',
  },
  {
    id: 'kia',
    name: 'فرع كيا المعتمد',
    subtitle: 'كيا — طريق الملك فهد',
    emoji: '🏪',
    gradient: 'from-[#C2410C] to-[#EA580C]',
    accentColor: '#FB923C',
    grossSales: 304155.00,
    returns: 34890.00,
    sales: 269265.00,
    target: 200000,
    tag: 'كيا',
    tagColor: '#C2410C',
    city: 'بريدة',
    products: 'قطع كيا أصلية',
  },
  {
    id: 'online',
    name: 'متجر سلة أونلاين',
    subtitle: 'doracars.com — سلة',
    emoji: '🛒',
    gradient: 'from-[#065F46] to-[#047857]',
    accentColor: '#34D399',
    grossSales: 41783.00,
    returns: 225.00,
    sales: 41558.00,
    target: 35000,
    tag: 'أونلاين',
    tagColor: '#065F46',
    city: 'المملكة كاملة',
    products: 'منتجات متجر سلة',
  },
];

function TargetProgressBar({ sales, target, accentColor }) {
  const pct = Math.min((sales / target) * 100, 150);
  const achieved = pct >= 100;
  const displayPct = pct.toFixed(1);
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">تحقيق التارجت</span>
        <span
          className="font-black text-sm"
          style={{ color: achieved ? '#15803D' : '#DC2626' }}
        >
          {displayPct}%
        </span>
      </div>
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 right-0 h-3 rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: achieved ? '#22C55E' : accentColor,
          }}
        />
        {/* Target marker at 100% */}
        <div className="absolute top-0 left-0 h-3 w-px bg-slate-400 opacity-50" style={{ right: '0%' }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>التارجت: {target.toLocaleString('ar-SA')} ر.س</span>
        <span className={achieved ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
          {achieved ? `▲ فائض ${(sales - target).toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ر.س` : `▼ فجوة ${(target - sales).toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ر.س`}
        </span>
      </div>
    </div>
  );
}

function BranchCard({ branch, isSelected, onSelect }) {
  const achievementPct = ((branch.sales / branch.target) * 100).toFixed(1);
  const isAchieved = branch.sales >= branch.target;

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-offset-2 scale-[1.02]' : 'hover:shadow-lg'
      }`}
      style={isSelected ? { ringColor: branch.accentColor } : {}}
      onClick={() => onSelect(branch.id)}
    >
      {/* Shop Header */}
      <div className={`bg-gradient-to-l ${branch.gradient} p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{branch.emoji}</div>
            <div>
              <div className="font-black text-white text-sm">{branch.name}</div>
              <div className="text-white/60 text-[10px]">{branch.subtitle}</div>
              <div className="text-white/50 text-[9px] mt-0.5">📍 {branch.city}</div>
            </div>
          </div>
          <div className="text-left">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {branch.tag}
            </span>
            <div className="mt-1.5 text-right">
              <div className={`text-xs font-bold ${isAchieved ? 'text-green-300' : 'text-red-300'}`}>
                {isAchieved ? '✅' : '⚠️'} {achievementPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Sales Figure */}
        <div className="mt-3 pt-3 border-t border-white/15">
          <div className="text-white/60 text-[10px]">صافي المبيعات الفعلية — أغسطس 2026</div>
          <div className="text-white font-black text-xl mt-0.5">
            {branch.sales.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold text-white/70">ر.س</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white p-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] text-slate-400">إجمالي المبيعات</div>
          <div className="text-xs font-black text-slate-900">{(branch.grossSales / 1000).toFixed(1)}K</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">المرتجعات</div>
          <div className="text-xs font-black text-red-600">{branch.returns.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">التارجت</div>
          <div className="text-xs font-black text-slate-900">{(branch.target / 1000).toFixed(0)}K</div>
        </div>
      </div>

      {/* Target Progress (always visible) */}
      <div className="bg-slate-50 px-3 pb-3">
        <TargetProgressBar sales={branch.sales} target={branch.target} accentColor={branch.accentColor} />
      </div>
    </div>
  );
}

export default function OwnerBranchesTab({ viewMode = 'mobile' }) {
  const [selectedId, setSelectedId] = useState(null);
  const { activePeriodObj } = useCurrentPeriod();

  const totalGross = BRANCHES.reduce((s, b) => s + b.grossSales, 0);
  const totalSales = BRANCHES.reduce((s, b) => s + b.sales, 0); // صافي المبيعات
  const totalReturns = BRANCHES.reduce((s, b) => s + b.returns, 0);
  const totalTarget = activePeriodObj?.target || BRANCHES.reduce((s, b) => s + b.target, 0);
  const totalPct = ((totalSales / totalTarget) * 100).toFixed(1);

  return (
    <div className="space-y-4 pb-2" dir="rtl">

      {/* ── Summary Header ── */}
      <div className="bg-gradient-to-l from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xl">🏪</div>
          <div>
            <h2 className="font-black text-base">الفروع والتارجت</h2>
            <p className="text-slate-300 text-xs">
              {activePeriodObj?.label || 'أغسطس 2026'} — {activePeriodObj?.isAudited ? '4 فروع معتمدة ومطابقة محاسبياً' : 'ربط ومتابعة المبيعات الحية'}
            </p>
          </div>
        </div>

        {/* Aggregate */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-300">صافي المبيعات</div>
            <div className="font-black text-sm">{(totalSales / 1000).toFixed(1)}K</div>
            <div className="text-[9px] text-slate-400 mt-0.5">الإجمالي {(totalGross / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-300">التارجت الكلي</div>
            <div className="font-black text-sm">{(totalTarget / 1000).toFixed(0)}K</div>
            <div className="text-[9px] text-slate-400 mt-0.5">مستهدف الفروع</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-300">إنجاز التارجت</div>
            <div className="font-black text-sm text-green-300">{totalPct}%</div>
            <div className="text-[9px] text-green-400/80 mt-0.5">فائض مستهدف</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-3">
          <div className="h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full bg-green-400 transition-all duration-1000"
              style={{ width: `${Math.min(parseFloat(totalPct), 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-300 mt-1.5 font-medium">
            <span>إجمالي المرتجعات المعتمدة:</span>
            <span className="font-bold text-red-300 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-800/30">
              {totalReturns.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
            </span>
          </div>
        </div>
      </div>

      {/* ── Branch Cards ── */}
      <div className={viewMode === 'desktop' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
        {BRANCHES.map(branch => (
          <BranchCard
            key={branch.id}
            branch={branch}
            isSelected={selectedId === branch.id}
            onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
          />
        ))}
      </div>

      {/* ── Branch Ranking ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="text-xs font-bold text-slate-500 mb-3">🏆 ترتيب الفروع حسب الإنجاز</div>
        {[...BRANCHES]
          .sort((a, b) => (b.sales / b.target) - (a.sales / a.target))
          .map((b, i) => {
            const pct = ((b.sales / b.target) * 100).toFixed(1);
            const medals = ['🥇', '🥈', '🥉', '4️⃣'];
            return (
              <div key={b.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="text-lg">{medals[i]}</span>
                <span className="text-sm font-bold text-slate-800 flex-1">{b.name}</span>
                <span className="text-sm font-black text-green-600">{pct}%</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
