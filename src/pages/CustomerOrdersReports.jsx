import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  Download,
  Search,
  Building2,
  Boxes,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Flame,
  ArrowRight,
  Copy,
  Check,
  User,
  Phone,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useBIAuth } from '../auth/BIAuthContext';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import { REAL_ALL_PARTS } from '../data/realInventoryData';
import {
  BRANCHES,
  ORDER_STATUSES,
  getLocalCustomerOrders,
  syncCustomerOrdersFromServer,
  getOrderDelayStatus
} from '../lib/customerOrdersStore';
import { sanitizeCsvCell } from '../lib/inventoryIntelligence';

export default function CustomerOrdersReports() {
  const { user } = useBIAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState(getLocalCustomerOrders);
  const [syncLoading, setSyncLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('top_requested'); // 'top_requested' | 'stocking_recommendations' | 'financials'
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL'); // 'ALL' | 'LOCAL' | 'KOREA'
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('requests'); // 'requests' | 'qty' | 'value'
  const [selectedPartForDetails, setSelectedPartForDetails] = useState(null);
  const [copiedSku, setCopiedSku] = useState(null);

  // Sync with Hostinger on mount
  useEffect(() => {
    setSyncLoading(true);
    syncCustomerOrdersFromServer()
      .then((data) => {
        setOrders(data);
      })
      .finally(() => {
        setSyncLoading(false);
      });
  }, []);

  const handleCopySku = (sku) => {
    if (!sku) return;
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  // Filter orders according to branch, type, and period
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      // Branch filter
      if (branchFilter !== 'ALL' && (o.branch || BRANCHES[0]) !== branchFilter) {
        return false;
      }
      // Order type filter
      if (orderTypeFilter === 'KOREA' && o.orderType !== 'KOREA') return false;
      if (orderTypeFilter === 'LOCAL' && o.orderType === 'KOREA') return false;

      // Period filter
      if (periodFilter === 'LAST_30_DAYS') {
        const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        if (orderTime > 0 && now - orderTime > thirtyDaysMs) return false;
      } else if (periodFilter === 'THIS_MONTH') {
        const d = o.createdAt ? new Date(o.createdAt) : null;
        if (d && !isNaN(d.getTime())) {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
        }
      }

      return true;
    });
  }, [orders, branchFilter, orderTypeFilter, periodFilter]);

  // Aggregate items across all filtered orders
  const aggregatedItems = useMemo(() => {
    const itemMap = new Map();

    filteredOrders.forEach((ord) => {
      const items = ord.items || [];
      items.forEach((it) => {
        const rawSku = (it.sku || '').trim();
        const rawName = (it.name || '').trim();
        const cleanSku = rawSku && rawSku !== '—' ? rawSku.toUpperCase() : '';
        const key = cleanSku || rawName.toLowerCase();
        if (!key) return;

        const qty = Number(it.qty) || 1;
        const sellingPrice = Number(it.sellingPrice) || 0;
        const expectedCost = Number(it.expectedCost) || 0;
        const branchName = ord.branch || BRANCHES[0];

        if (!itemMap.has(key)) {
          // Check stock in catalog if available
          let catalogMatch = null;
          if (cleanSku && Array.isArray(REAL_ALL_PARTS)) {
            catalogMatch = REAL_ALL_PARTS.find((p) => p.sku && String(p.sku).toUpperCase() === cleanSku);
          }

          itemMap.set(key, {
            key,
            sku: cleanSku || '—',
            name: rawName || catalogMatch?.name || 'صنف غير مسمى',
            totalRequests: 0,
            totalQty: 0,
            totalEstimatedValue: 0,
            totalExpectedCost: 0,
            branchesCount: {},
            suppliers: new Set(),
            orderRecords: [],
            isStockingCandidate: false,
            catalogStock: catalogMatch ? (Number(catalogMatch.stock) || 0) : null
          });
        }

        const rec = itemMap.get(key);
        rec.totalRequests += 1;
        rec.totalQty += qty;
        rec.totalEstimatedValue += sellingPrice * qty;
        rec.totalExpectedCost += expectedCost * qty;

        rec.branchesCount[branchName] = (rec.branchesCount[branchName] || 0) + qty;
        if (it.supplierName) rec.suppliers.add(it.supplierName);

        rec.orderRecords.push({
          orderId: ord.id,
          orderNumber: ord.orderNumber || ord.id,
          orderDate: ord.orderDate || ord.createdAt?.split('T')[0],
          customerName: ord.customerName,
          customerPhone: ord.customerPhone,
          branch: branchName,
          status: ord.status,
          orderType: ord.orderType,
          qty,
          sellingPrice,
          expectedCost,
          supplierName: it.supplierName
        });
      });
    });

    // Mark candidates with >= 3 requests as stocking candidates
    const list = Array.from(itemMap.values()).map((it) => {
      it.isStockingCandidate = it.totalRequests >= 3;
      it.suppliersList = Array.from(it.suppliers);
      it.avgSellingPrice = it.totalQty > 0 ? Math.round(it.totalEstimatedValue / it.totalQty) : 0;
      it.avgCost = it.totalQty > 0 ? Math.round(it.totalExpectedCost / it.totalQty) : 0;
      // Recommended reorder quantity: minimum 5 units or 1.5x requested qty
      it.recommendedStockQty = Math.max(5, Math.ceil(it.totalQty * 1.5));
      return it;
    });

    return list;
  }, [filteredOrders]);

  // Filtered and sorted items
  const sortedItems = useMemo(() => {
    let list = aggregatedItems;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));
    }

    if (activeTab === 'stocking_recommendations') {
      list = list.filter((it) => it.isStockingCandidate);
    }

    return list.sort((a, b) => {
      if (sortBy === 'requests') return b.totalRequests - a.totalRequests;
      if (sortBy === 'qty') return b.totalQty - a.totalQty;
      if (sortBy === 'value') return b.totalEstimatedValue - a.totalEstimatedValue;
      return 0;
    });
  }, [aggregatedItems, searchQuery, activeTab, sortBy]);

  // Overall Financial & Demand Statistics
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalItemsRequested = aggregatedItems.reduce((sum, it) => sum + it.totalQty, 0);
    const totalUniqueParts = aggregatedItems.length;
    const totalDemandValue = aggregatedItems.reduce((sum, it) => sum + it.totalEstimatedValue, 0);
    const totalDeposits = filteredOrders.reduce((sum, o) => sum + (Number(o.deposit) || 0), 0);
    const remainingReceivables = Math.max(0, totalDemandValue - totalDeposits);
    const stockingCandidatesCount = aggregatedItems.filter((it) => it.isStockingCandidate).length;

    // Delayed orders analysis
    const overdueOrders = filteredOrders.filter((o) => getOrderDelayStatus(o).isOverdue).length;

    return {
      totalOrders,
      totalItemsRequested,
      totalUniqueParts,
      totalDemandValue,
      totalDeposits,
      remainingReceivables,
      stockingCandidatesCount,
      overdueOrders
    };
  }, [filteredOrders, aggregatedItems]);

  // Export report to CSV with UTF-8 BOM
  const handleExportCsv = () => {
    const headers = [
      'الترتيب',
      'رقم الصنف (SKU)',
      'اسم الصنف',
      'عدد مرات الطلب',
      'إجمالي الكمية المطلوبة',
      'متوسط التكلفة (ر.س)',
      'متوسط سعر البيع (ر.س)',
      'إجمالي القيمة التقديرية (ر.س)',
      'الفرع الرئيسي',
      'فرع الرواف',
      'فرع كيا',
      'توصية المخزون الدائم',
      'الكمية المقترحة للمستودع'
    ];

    const rows = sortedItems.map((it, idx) => [
      sanitizeCsvCell(idx + 1),
      sanitizeCsvCell(it.sku),
      sanitizeCsvCell(it.name),
      sanitizeCsvCell(it.totalRequests),
      sanitizeCsvCell(it.totalQty),
      sanitizeCsvCell(it.avgCost),
      sanitizeCsvCell(it.avgSellingPrice),
      sanitizeCsvCell(it.totalEstimatedValue),
      sanitizeCsvCell(it.branchesCount[BRANCHES[0]] || 0),
      sanitizeCsvCell(it.branchesCount[BRANCHES[1]] || 0),
      sanitizeCsvCell(it.branchesCount[BRANCHES[2]] || 0),
      sanitizeCsvCell(it.isStockingCandidate ? 'نعم - مرشح للمخزون' : 'طلب فردي'),
      sanitizeCsvCell(it.isStockingCandidate ? it.recommendedStockQty : '—')
    ]);

    const csvContent = '\uFEFF' + [headers.map(h => sanitizeCsvCell(h)).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_القطع_الأكثر_طلبا_درة_السيارة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900" dir="rtl">
      {/* ── Top Header Bar ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>ذكاء المشتريات والمالية</span>
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
              بيانات حية من الفروع
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>تقرير الأصناف الأكثر طلباً وتوصيات المخزون الدائم</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            كشف دقيق ومفصل لكافة القطع غير المتوفرة التي يطلبها العملاء في الفروع الثلاثة، مع تحديد الأصناف المتكررة (≥ 3 مرات) المؤهلة للشراء كأصناف مخزنية دائمة لمنع فقدان المبيعات.
          </p>
        </div>

        {/* Header Actions */}
        <div className="relative z-10 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/customer-orders')}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/15 transition-all cursor-pointer shadow-xs"
          >
            <Boxes className="w-4 h-4 text-emerald-400" />
            <span>كشف الطلبات الميداني</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel معتمد</span>
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Unique Parts */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>الأصناف المطلوبة</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatNum(stats.totalUniqueParts)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            إجمالي {formatNum(stats.totalItemsRequested)} قطعة مطلوبة
          </div>
        </div>

        {/* Stocking Candidates Recommendation (>= 3 requests) */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white border border-purple-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-700">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>توصيات المخزون (≥ 3)</span>
            </span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900">
            {formatNum(stats.stockingCandidatesCount)}
          </div>
          <div className="text-[11px] text-purple-700 font-bold">
            أصناف مؤهلة للاعتماد المخزني
          </div>
        </div>

        {/* Total Estimated Demand Value */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>إجمالي قيمة الطلب التقديرية</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {formatSAR(stats.totalDemandValue)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            فرصة بيعية مبنية على طلبات العملاء
          </div>
        </div>

        {/* Collected Deposits */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>العربين المحصلة بالخزائن</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-700">
            {formatSAR(stats.totalDeposits)}
          </div>
          <div className="text-[11px] text-teal-600 font-medium">
            سيولة نقدية مستلمة كعربون
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>المتبقي للتحصيل عند التسليم</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">
            {formatSAR(stats.remainingReceivables)}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            يُحصّل عند استلام العميل للقطعة
          </div>
        </div>
      </div>

      {/* ── Main Controls & Filtering Deck ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('top_requested')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'top_requested'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>كشف الأصناف الأكثر طلباً ({aggregatedItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stocking_recommendations')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'stocking_recommendations'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-500/20'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>توصيات المخزون الدائم (≥ 3 طلبات)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200 text-purple-950 font-black">
                {stats.stockingCandidatesCount}
              </span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>ترتيب حسب:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="requests">عدد مرات الطلب (الأعلى)</option>
              <option value="qty">إجمالي الكمية المطلوبة</option>
              <option value="value">القيمة التقديرية الإجمالية</option>
            </select>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
          {/* Search box */}
          <div className="relative col-span-1 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم الصنف (SKU) أو اسم القطعة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">جميع الفروع (الرئيسي، الرواف، كيا)</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">كافة الفترات المسجلة</option>
              <option value="THIS_MONTH">الشهر الحالي فقط</option>
              <option value="LAST_30_DAYS">آخر 30 يوماً</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table & Intelligence View ── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h2 className="font-black text-sm sm:text-base text-slate-900">
              {activeTab === 'stocking_recommendations'
                ? '⭐ توصيات الإضافة للمخزون الدائم (الأصناف المطلوبة 3 مرات فأكثر)'
                : 'كشف الأصناف الميدانية الأكثر طلباً'}
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {sortedItems.length} صنف
            </span>
          </div>

          {activeTab === 'stocking_recommendations' && (
            <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
              <span>💡 توصية النظام: طلب كميات تجارية لتأمين متطلبات العملاء المتكررة</span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm divide-y divide-slate-100">
            <thead className="bg-slate-100/70 text-slate-600 text-xs font-bold">
              <tr>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">#</th>
                <th className="py-3.5 px-4 whitespace-nowrap">رقم الصنف (SKU)</th>
                <th className="py-3.5 px-4">اسم القطعة</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">مرات الطلب</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">إجمالي الكمية</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">توزيع الفروع</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">متوسط السعر</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">إجمالي القيمة</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">الحالة والتوصية</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold">لا توجد أصناف مطابقة لمعايير التصفية الحالية</p>
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, idx) => {
                  return (
                    <tr
                      key={item.key}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.isStockingCandidate ? 'bg-purple-50/15' : ''
                      }`}
                    >
                      {/* Rank Number */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900'
                              : idx === 2
                              ? 'bg-amber-700/30 text-amber-900'
                              : 'text-slate-400 font-mono'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>

                      {/* SKU with Copy button */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-xs">
                            {item.sku}
                          </span>
                          {item.sku !== '—' && (
                            <button
                              onClick={() => handleCopySku(item.sku)}
                              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                              title="نسخ رقم الصنف"
                            >
                              {copiedSku === item.sku ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 max-w-xs">{item.name}</div>
                        {item.suppliersList.length > 0 && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            الموردين: {item.suppliersList.join('، ')}
                          </div>
                        )}
                      </td>

                      {/* Request Count */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                            item.totalRequests >= 5
                              ? 'bg-rose-500/15 text-rose-700 border border-rose-300'
                              : item.totalRequests >= 3
                              ? 'bg-purple-500/15 text-purple-700 border border-purple-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.totalRequests >= 3 && <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          <span>{item.totalRequests} طلبات</span>
                        </span>
                      </td>

                      {/* Total Qty */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-black font-mono text-slate-900">
                        {item.totalQty} حبة
                      </td>

                      {/* Branches Distribution Chips */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {BRANCHES.map((br) => {
                            const count = item.branchesCount[br] || 0;
                            if (count === 0) return null;
                            const isMain = br.includes('الرئيسي');
                            const isRawaf = br.includes('الرواف');
                            const isKia = br.includes('كيا');

                            return (
                              <span
                                key={br}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                  isMain
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : isRawaf
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}
                                title={br}
                              >
                                {isMain ? 'الرئيسي' : isRawaf ? 'الرواف' : 'كيا'}: {count}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Avg Selling Price */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-slate-700">
                        {item.avgSellingPrice > 0 ? `${formatNum(item.avgSellingPrice)} ر.س` : '—'}
                      </td>

                      {/* Total Estimated Value */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-bold text-emerald-700">
                        {item.totalEstimatedValue > 0 ? formatSAR(item.totalEstimatedValue) : '—'}
                      </td>

                      {/* Status / Stocking Recommendation */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.isStockingCandidate ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>توصية: طلب {item.recommendedStockQty} للمخزون</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold">
                            طلب فردي معتاد
                          </span>
                        )}
                      </td>

                      {/* Details button */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPartForDetails(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          عرض الطلبات
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Order Records Details for Selected Part ── */}
      {selectedPartForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    {selectedPartForDetails.sku}
                  </span>
                  {selectedPartForDetails.isStockingCandidate && (
                    <span className="text-xs bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>مرشح للمخزون الدائم (≥ 3)</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {selectedPartForDetails.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPartForDetails(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Stats for this item */}
            <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs text-center">
              <div>
                <div className="text-slate-400">مرات الطلب</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {selectedPartForDetails.totalRequests} مرات
                </div>
              </div>
              <div>
                <div className="text-slate-400">إجمالي الكمية</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {selectedPartForDetails.totalQty} حبة
                </div>
              </div>
              <div>
                <div className="text-slate-400">الكمية الموصى بها</div>
                <div className="text-sm font-black text-purple-700 mt-0.5">
                  {selectedPartForDetails.recommendedStockQty} حبة للمستودع
                </div>
              </div>
            </div>

            {/* List of customer orders for this item */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500">سجل طلبات العملاء لهذا الصنف:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedPartForDetails.orderRecords.map((ord, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">#{ord.orderNumber}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{ord.orderDate}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                          {ord.branch}
                        </span>
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{ord.customerName}</span>
                        <span className="font-mono text-slate-500 text-[11px]">({ord.customerPhone})</span>
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <div className="font-black text-slate-900">{ord.qty} حبة</div>
                      <div className="text-[11px] text-emerald-600 font-bold">{formatSAR(ord.sellingPrice * ord.qty)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSelectedPartForDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

