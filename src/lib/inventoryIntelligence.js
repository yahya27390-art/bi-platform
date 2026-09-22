// ============================================================
// INVENTORY INTELLIGENCE & REPORTING ENGINE
// Multi-Branch Real Analytics: Main 100, Rawaf 200, Sulaim 300
// ============================================================

import { REAL_ALL_PARTS, REAL_INVENTORY_STATS } from '../data/realInventoryData';

/**
 * Item Status Classification:
 * - 'dead': Balance > 0 && issued === 0 (Zero movement, capital locked)
 * - 'special': Exactly 1 in-and-out movement (Korea special bespoke orders)
 * - 'fast': High sales volume (issued >= 10 || (issued > 0 && turnover >= 50%))
 * - 'slow': Active sales but slow velocity
 * - 'out_of_stock': Balance === 0 && issued > 0 (high demand, lost sales)
 */
export function classifyInventoryStatus(item) {
  const balance = Number(item.balance || item.totalQty || 0);
  const issued = Number(item.issued || 0);
  const received = Number(item.received || 0);
  const opening = Number(item.opening || 0);

  // 1. Single Movement Special Orders (1 in, 1 out, zero or 1 remaining)
  if (
    issued === 1 &&
    ((received === 1 && balance === 0) || (opening === 1 && balance === 0) || (received <= 1 && balance <= 1))
  ) {
    return 'special';
  }

  // 2. Dead stock: stock on shelf but ZERO sales during period
  if (balance > 0 && issued === 0) {
    return 'dead';
  }

  // 3. Out of stock high demand
  if (balance === 0 && issued > 0) {
    return 'out_of_stock';
  }

  // 4. Fast vs Slow moving
  const totalThroughput = balance + issued;
  const turnoverRatio = totalThroughput > 0 ? issued / totalThroughput : 0;

  if (issued >= 10 || turnoverRatio >= 0.5) {
    return 'fast';
  }

  return 'slow';
}

export const STATUS_META = {
  fast: {
    key: 'fast',
    label: 'سريع الدوران',
    labelEn: 'Fast Moving',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    icon: '⚡',
  },
  slow: {
    key: 'slow',
    label: 'بطيء الدوران',
    labelEn: 'Slow Moving',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    icon: '⏳',
  },
  dead: {
    key: 'dead',
    label: 'راكد / سيولة مجمدة',
    labelEn: 'Dead Stock',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    icon: '🛑',
  },
  special: {
    key: 'special',
    label: 'طلبية خاصة (كوريا)',
    labelEn: 'Special Order',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
    icon: '📦',
  },
  out_of_stock: {
    key: 'out_of_stock',
    label: 'نافد / طلب عالي',
    labelEn: 'Out of Stock',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
    icon: '⚠️',
  },
};

/**
 * Enriches all parts with precalculated status, branch values, and search strings
 */
export function getEnrichedInventory() {
  return REAL_ALL_PARTS.map((p) => {
    const status = classifyInventoryStatus(p);
    const unitCost = Number(p.unitCost || 0);
    const balance = Number(p.balance || p.totalQty || 0);
    const totalCost = Number(p.totalCost || (unitCost * balance));
    const qtyMain = Number(p.qtyMain || 0);
    const qtyRawaf = Number(p.qtyRawaf || 0);
    const qtySulaim = Number(p.qtySulaim || 0);
    const costMain = Number(p.costMain || (qtyMain * unitCost));
    const costRawaf = Number(p.costRawaf || (qtyRawaf * unitCost));
    const costSulaim = Number(p.costSulaim || (qtySulaim * unitCost));

    return {
      ...p,
      isDiesel: !!p.isDiesel,
      status,
      unitCost,
      balance,
      totalCost,
      qtyMain,
      qtyRawaf,
      qtySulaim,
      costMain,
      costRawaf,
      costSulaim,
      searchStr: `${p.sku || ''} ${p.name || ''} ${p.category || ''} ${p.brand || ''} ${p.isDiesel ? 'ديزل diesel' : ''}`.toLowerCase(),
    };
  });
}

/**
 * Report 1: Fast-Moving & Top Selling Items
 */
export function getFastMovingReport(items, branchFilter = 'all') {
  let list = items.filter((p) => p.issued > 0);
  if (branchFilter === '100') list = list.filter((p) => p.qtyMain > 0 || p.issued > 0);
  else if (branchFilter === '200') list = list.filter((p) => p.qtyRawaf > 0 || p.issued > 0);
  else if (branchFilter === '300') list = list.filter((p) => p.qtySulaim > 0 || p.issued > 0);

  return list.sort((a, b) => b.issued - a.issued);
}

/**
 * Report 2: Dead Stock / Zero Movement
 */
export function getDeadStockReport(items, branchFilter = 'all') {
  let list = items.filter((p) => p.balance > 0 && p.issued === 0);
  if (branchFilter === '100') list = list.filter((p) => p.qtyMain > 0);
  else if (branchFilter === '200') list = list.filter((p) => p.qtyRawaf > 0);
  else if (branchFilter === '300') list = list.filter((p) => p.qtySulaim > 0);

  return list.sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Report 3: Out-of-Stock High Demand Items
 */
export function getOutOfStockReport(items, branchFilter = 'all') {
  let list = items.filter((p) => p.balance === 0 && p.issued > 0);
  return list.sort((a, b) => b.issued - a.issued);
}

/**
 * Report 4: Single-Movement Special Orders (Korea direct orders)
 */
export function getSpecialOrdersReport(items) {
  return items.filter((p) => p.status === 'special').sort((a, b) => b.unitCost - a.unitCost);
}

/**
 * Report 5: Category Performance Analytics
 */
export function getCategoryPerformanceReport(items) {
  const map = {};

  items.forEach((p) => {
    const cat = p.category || 'قطع غيار عامة واستقرام';
    if (!map[cat]) {
      map[cat] = {
        category: cat,
        totalSKUs: 0,
        totalBalance: 0,
        totalIssued: 0,
        totalValuation: 0,
        deadCount: 0,
        deadValuation: 0,
        fastCount: 0,
        costMain: 0,
        costRawaf: 0,
        costSulaim: 0,
      };
    }

    map[cat].totalSKUs += 1;
    map[cat].totalBalance += p.balance;
    map[cat].totalIssued += p.issued;
    map[cat].totalValuation += p.totalCost;
    map[cat].costMain += p.costMain;
    map[cat].costRawaf += p.costRawaf;
    map[cat].costSulaim += p.costSulaim;

    if (p.status === 'dead') {
      map[cat].deadCount += 1;
      map[cat].deadValuation += p.totalCost;
    } else if (p.status === 'fast') {
      map[cat].fastCount += 1;
    }
  });

  return Object.values(map)
    .map((c) => {
      const throughput = c.totalBalance + c.totalIssued;
      const turnoverRate = throughput > 0 ? (c.totalIssued / throughput) * 100 : 0;
      const deadRate = c.totalSKUs > 0 ? (c.deadCount / c.totalSKUs) * 100 : 0;
      return {
        ...c,
        turnoverRate,
        deadRate,
      };
    })
    .sort((a, b) => b.totalValuation - a.totalValuation);
}

/**
 * Safe CSV Cell Formatter (Prevent Formula Injection)
 */
export function sanitizeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  // If starts with risky formula chars, prepend apostrophe
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generic Safe CSV Exporter
 */
export function exportToCsv(filename, headers, rows) {
  const headerLine = headers.map(h => sanitizeCsvCell(h.label)).join(',');
  const rowLines = rows.map(row => {
    return headers.map(h => {
      const val = typeof h.accessor === 'function' ? h.accessor(row) : row[h.accessor];
      return sanitizeCsvCell(val);
    }).join(',');
  });

  // UTF-8 BOM for Excel Arabic support
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
