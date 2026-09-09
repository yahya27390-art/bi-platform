import React, { useState, useMemo } from 'react';
import {
  Package,
  Clock,
  Flame,
  AlertTriangle,
  Search,
  Layers,
  ChevronDown,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Boxes,
  Sparkles
} from 'lucide-react';
import { REAL_ALL_PARTS, REAL_INVENTORY_STATS } from '../../data/realInventoryData';
import { formatNum } from '../../lib/kpiEngine';

const BRAND_FILTERS = [
  { key: 'all', label: 'الكل' },
  { key: 'hyundai', label: 'هيونداي' },
  { key: 'kia', label: 'كيا' },
  { key: 'mobis', label: 'موبيس' },
  { key: 'general', label: 'عامة' },
];

export default function OwnerInventoryTab({ viewMode = 'mobile' }) {
  const [activeSubView, setActiveSubView] = useState('stagnant'); // 'stagnant' | 'categories' | 'top_moving'
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(15);
  const [copiedSku, setCopiedSku] = useState(null);

  const handleCopySku = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  // 1. All Stagnant Parts (balance > 0 & issued === 0)
  const stagnantParts = useMemo(() => {
    return REAL_ALL_PARTS
      .filter((p) => p.balance > 0 && p.issued === 0)
      .sort((a, b) => b.balance - a.balance);
  }, []);

  // Total balance locked in stagnant stock
  const totalStagnantUnits = useMemo(() => {
    return stagnantParts.reduce((acc, p) => acc + p.balance, 0);
  }, [stagnantParts]);

  // 2. Filtered Stagnant Items
  const filteredStagnant = useMemo(() => {
    let list = stagnantParts;
    if (brandFilter !== 'all') {
      list = list.filter((p) => p.brand === brandFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    return list;
  }, [stagnantParts, brandFilter, search]);

  // 3. Top Moving Parts
  const topMovingParts = useMemo(() => {
    return [...REAL_ALL_PARTS]
      .sort((a, b) => b.issued - a.issued)
      .slice(0, 30);
  }, []);

  // 4. Category Analytics
  const categoryAnalytics = useMemo(() => {
    const map = {};
    REAL_ALL_PARTS.forEach((p) => {
      const cat = p.category || 'قطع غيار عامة واستقرام';
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          totalItems: 0,
          issued: 0,
          balance: 0,
          stagnantCount: 0,
        };
      }
      map[cat].totalItems += 1;
      map[cat].issued += p.issued;
      map[cat].balance += p.balance;
      if (p.balance > 0 && p.issued === 0) {
        map[cat].stagnantCount += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.issued - a.issued);
  }, []);

  const displayedStagnant = filteredStagnant.slice(0, visibleCount);

  return (
    <div className="space-y-4 pb-2" dir="rtl">

      {/* ── Executive Inventory Header ── */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-xl text-amber-400">
            📦
          </div>
          <div>
            <h2 className="font-black text-base text-white">تقرير حركة الأصناف والمخزون</h2>
            <p className="text-slate-300 text-xs">8,693 صنف — مراجعة المستودع (سبتمبر 2026)</p>
          </div>
        </div>

        {/* 3 Strategic Indicator Pills */}
        <div className={`grid ${viewMode === 'desktop' ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
          <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
            <div className="text-[10px] text-slate-300">إجمالي الأصناف</div>
            <div className="font-black text-sm font-mono text-white">8,693</div>
            <div className="text-[9px] text-slate-400">صنف مسجل</div>
          </div>

          <div className="bg-amber-500/20 rounded-xl p-2.5 text-center border border-amber-500/30">
            <div className="text-[10px] text-amber-300 font-bold">الأصناف الراكدة</div>
            <div className="font-black text-sm font-mono text-amber-300">2,082</div>
            <div className="text-[9px] text-amber-200/80">بدون مبيعات</div>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
            <div className="text-[10px] text-slate-300">رصيد المخزن</div>
            <div className="font-black text-sm font-mono text-emerald-300">39,233</div>
            <div className="text-[9px] text-slate-400">قطعة متوفرة</div>
          </div>

          {viewMode === 'desktop' && (
            <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
              <div className="text-[10px] text-slate-300">إجمالي المنصرف</div>
              <div className="font-black text-sm font-mono text-blue-300">77,047</div>
              <div className="text-[9px] text-slate-400">قطعة تم بيعها</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-view Selector Tabs (Designed for Mobile Thumb Taps) ── */}
      <div className="flex gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveSubView('stagnant');
            setVisibleCount(15);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubView === 'stagnant'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>الراكد (2,082)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('categories')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubView === 'categories'
              ? 'bg-indigo-600 text-white shadow-md font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>الفئات (9)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('top_moving')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubView === 'top_moving'
              ? 'bg-emerald-600 text-white shadow-md font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>الأكثر مبيعاً</span>
        </button>
      </div>

      {/* ── 1. STAGNANT ITEMS SUB-VIEW (الأصناف الراكدة) ── */}
      {activeSubView === 'stagnant' && (
        <div className="space-y-3">
          {/* Executive Alert Banner */}
          <div className="bg-gradient-to-l from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 text-base">
                ⚠️
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-amber-900 mb-0.5">
                  تنبيه تجميد السيولة في الأصناف الراكدة
                </div>
                <div className="text-[11px] text-amber-800 leading-relaxed">
                  يوجد <strong className="font-mono">{stagnantParts.length.toLocaleString('ar-SA')}</strong> صنفاً بالمستودع بإجمالي <strong className="font-mono">{totalStagnantUnits.toLocaleString('ar-SA')}</strong> قطعة متراكمة بدون أي مبيعات. يُوصى بإنشاء حملات تصفية أو خصومات مركّزة لتحرير السيولة المجمدة.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Search & Brand Filter */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(15);
                }}
                placeholder="ابحث بالاسم أو رقم الصنف (SKU)..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 pr-9 text-xs text-slate-800 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {BRAND_FILTERS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => {
                    setBrandFilter(b.key);
                    setVisibleCount(15);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap border ${
                    brandFilter === b.key
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {b.label}
                </button>
              ))}
              <span className="text-[10px] text-slate-400 mr-auto font-mono">
                {filteredStagnant.length} صنف
              </span>
            </div>
          </div>

          {/* Stagnant Items Card List */}
          <div className={`space-y-2.5 ${viewMode === 'desktop' ? 'grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0' : ''}`}>
            {displayedStagnant.map((item, idx) => (
              <div
                key={item.sku || idx}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-2.5"
              >
                {/* Header: Title + Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900 leading-snug">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {/* SKU with Copy button */}
                      <button
                        type="button"
                        onClick={() => handleCopySku(item.sku)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 transition-all"
                        title="نسخ رقم الصنف"
                      >
                        <span>{item.sku}</span>
                        {copiedSku === item.sku ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>

                      {/* Brand Pill */}
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس' : 'عامة'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    راكد ⏳
                  </span>
                </div>

                {/* Stock vs Sales Grid */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <div className="text-[9px] text-slate-400">الرصيد المجمد</div>
                    <div className="text-xs font-black text-amber-700 font-mono">
                      {item.balance} <span className="text-[9px] font-normal">قطعة</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400">المنصرف / مبيعات</div>
                    <div className="text-xs font-black text-slate-400 font-mono">
                      0
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400">رصيد البداية</div>
                    <div className="text-xs font-black text-slate-700 font-mono">
                      {item.opening}
                    </div>
                  </div>
                </div>

                {/* Category & Status Footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-100">
                  <span className="truncate">{item.category}</span>
                  <span className="text-amber-700 font-bold">توصية: حزم تصفية</span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredStagnant.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <ChevronDown className="w-4 h-4 text-amber-600" />
              <span>عرض المزيد من الأصناف الراكدة ({filteredStagnant.length - visibleCount} صنف متبقي)</span>
            </button>
          )}
        </div>
      )}

      {/* ── 2. CATEGORY ANALYTICS SUB-VIEW (تقرير الفئات) ── */}
      {activeSubView === 'categories' && (
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-500 px-1">تحليل حركة ومخزون الفئات التسع (أغسطس/سبتمبر 2026)</div>
          <div className={`space-y-2.5 ${viewMode === 'desktop' ? 'grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0' : ''}`}>
            {categoryAnalytics.map((cat, idx) => {
              const totalMovement = cat.issued + cat.balance;
              const turnoverPct = totalMovement > 0 ? ((cat.issued / totalMovement) * 100).toFixed(1) : '0';
              const stagnantPct = cat.totalItems > 0 ? ((cat.stagnantCount / cat.totalItems) * 100).toFixed(1) : '0';

              return (
                <div
                  key={cat.name || idx}
                  className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🗂️</span>
                      <h4 className="text-xs font-black text-slate-900">{cat.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {cat.totalItems} صنف
                    </span>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <div className="text-[9px] text-slate-400">المنصرف والمبيعات</div>
                      <div className="text-xs font-black text-blue-700 font-mono">
                        {cat.issued.toLocaleString('ar-SA')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">الرصيد الحالي</div>
                      <div className="text-xs font-black text-slate-800 font-mono">
                        {cat.balance.toLocaleString('ar-SA')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">أصناف راكدة</div>
                      <div className="text-xs font-black text-amber-600 font-mono">
                        {cat.stagnantCount}
                      </div>
                    </div>
                  </div>

                  {/* Turnover progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">معدل تصريف المخزون:</span>
                      <span className="font-mono font-bold text-slate-700">{turnoverPct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${Math.min(parseFloat(turnoverPct), 100)}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-amber-700 text-left pt-0.5 font-bold">
                      نسبة الركود في الفئة: {stagnantPct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. TOP MOVING ITEMS SUB-VIEW (الأكثر مبيعاً وحركة) ── */}
      {activeSubView === 'top_moving' && (
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-500 px-1">أعلى الأصناف طلباً وحركة في المستودع</div>
          <div className={`space-y-2 ${viewMode === 'desktop' ? 'grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0' : ''}`}>
            {topMovingParts.map((item, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={item.sku || idx}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{medals[idx] || `${idx + 1}.`}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate leading-snug">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[9px] text-slate-400 truncate">
                          {item.sku}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="font-black text-xs text-emerald-700 font-mono">
                      {item.issued.toLocaleString('ar-SA')} مباع
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      رصيد: {item.balance}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
