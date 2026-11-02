/**
 * Dora Cars - Branch Sales & Invoices Classification Engine
 * (محرك فك وتصنيف فواتير ومردودات فروع درة السيارات المعتمد)
 * 
 * Rules defined by Dora Cars Management:
 * 1. Company Prefix: 260
 * 2. Sales Invoices:
 *    - 26011... => الفرع الرئيسي (Main Branch)
 *    - 26012... => فرع الرواف (Al-Rawaf Branch)
 *    - 26013... => فرع كيا (Kia Branch)
 * 3. Returns (المردودات):
 *    - 260311... => مردود الفرع الرئيسي (Main Branch Return - unlinked)
 *    - 260312... => مردود فرع الرواف (Al-Rawaf Return - unlinked)
 *    - 260313... => مردود فرع كيا (Kia Branch Return - unlinked)
 *    - Any invoice (e.g. 26011..., 26012..., 26013...) where returnNet > 0 or netSales < 0 is also counted as a return for that branch.
 * 4. Target Calculation Rule (اعتماد الإدارة الرسمي):
 *    - التارجت الشهري معتمد على أساس المبيعات شاملة ضريبة القيمة المضافة 15%.
 *    - بما أن فواتير نظام ERP معفاة / غير شاملة الضريبة:
 *      المبيعات المحتسبة للتارجت = صافي المبيعات (غير شامل الضريبة) × 1.15
 *      نسبة تحقيق التارجت = (المبيعات شاملة الضريبة 15% ÷ التارجت) × 100
 */

export const DORA_BRANCH_RULES = {
  companyPrefix: '260',
  vatRate: 0.15, // ضريبة القيمة المضافة 15%
  branches: {
    '11': { id: 'main', name: 'الفرع الرئيسي', color: '#3B82F6', targetRevenue: 350000 },
    '12': { id: 'al-rawaf', name: 'فرع الرواف', color: '#10B981', targetRevenue: 250000 },
    '13': { id: 'kia', name: 'فرع كيا', color: '#8B5CF6', targetRevenue: 200000 },
  },
  unlinkedReturnPrefix: '3', // 260311, 260312, 260313
};

/**
 * Classify a single invoice row according to official Dora Cars rules
 */
export function classifyDoraInvoice(row) {
  const invoiceNo = String(
    row['رقم الفاتورة'] || 
    row['رقم_الفاتورة'] || 
    row['InvoiceNo'] || 
    row['invoice_no'] || 
    ''
  ).trim();

  const dateStr = String(row['التاريخ'] || row['date'] || '').trim();
  const payType = String(row['النوع'] || row['payment_type'] || 'نقد').trim();
  const currency = String(row['العملة'] || row['currency'] || 'SAR').trim();

  const invoiceNet = Number(row['صافي مبلغ الفاتورة'] || row['صافي_مبلغ_الفاتورة'] || row['gross'] || 0);
  const returnNet = Number(row['صافي مبلغ المردود'] || row['صافي_مبلغ_المردود'] || row['returns'] || 0);
  const netSales = Number(row['صافي المبيعات'] || row['صافي_المبيعات'] || (invoiceNet - returnNet));
  const localNet = Number(row['مبلغ الصافي بالمحلي'] || row['مبلغ_الصافي_بالمحلي'] || netSales);

  let branchId = 'unknown';
  let branchName = 'غير محدد';
  let isReturn = false;
  let isUnlinkedReturn = false;

  // Check prefix 260
  if (invoiceNo.startsWith('260311')) {
    branchId = 'main';
    branchName = 'الفرع الرئيسي';
    isReturn = true;
    isUnlinkedReturn = true;
  } else if (invoiceNo.startsWith('260312')) {
    branchId = 'al-rawaf';
    branchName = 'فرع الرواف';
    isReturn = true;
    isUnlinkedReturn = true;
  } else if (invoiceNo.startsWith('260313')) {
    branchId = 'kia';
    branchName = 'فرع كيا';
    isReturn = true;
    isUnlinkedReturn = true;
  } else if (invoiceNo.startsWith('26011')) {
    branchId = 'main';
    branchName = 'الفرع الرئيسي';
    isReturn = returnNet > 0 || netSales < 0 || invoiceNet === 0;
  } else if (invoiceNo.startsWith('26012')) {
    branchId = 'al-rawaf';
    branchName = 'فرع الرواف';
    isReturn = returnNet > 0 || netSales < 0 || invoiceNet === 0;
  } else if (invoiceNo.startsWith('26013')) {
    branchId = 'kia';
    branchName = 'فرع كيا';
    isReturn = returnNet > 0 || netSales < 0 || invoiceNet === 0;
  }

  // Clean payment method
  const cleanPayType = payType.replace(/-بدون تحديد رقم الفاتورة/g, '').trim();

  return {
    invoiceNo,
    dateStr,
    payType: cleanPayType,
    rawPayType: payType,
    currency,
    invoiceNet,
    returnNet,
    netSales,
    localNet,
    branchId,
    branchName,
    isReturn,
    isUnlinkedReturn
  };
}

/**
 * Aggregate an array of raw rows into full branch business intelligence metrics
 */
export function aggregateBranchSales(rows) {
  const branches = {
    'main': {
      id: 'main',
      name: 'الفرع الرئيسي',
      grossSales: 0,
      returns: 0,
      netSales: 0,
      salesInvoicesCount: 0,
      returnCount: 0,
      paymentMethods: {},
      daily: {}
    },
    'al-rawaf': {
      id: 'al-rawaf',
      name: 'فرع الرواف',
      grossSales: 0,
      returns: 0,
      netSales: 0,
      salesInvoicesCount: 0,
      returnCount: 0,
      paymentMethods: {},
      daily: {}
    },
    'kia': {
      id: 'kia',
      name: 'فرع كيا',
      grossSales: 0,
      returns: 0,
      netSales: 0,
      salesInvoicesCount: 0,
      returnCount: 0,
      paymentMethods: {},
      daily: {}
    }
  };

  let totalGross = 0;
  let totalReturns = 0;
  let totalNet = 0;
  let totalSalesCount = 0;
  let totalReturnsCount = 0;

  for (const raw of rows) {
    const item = classifyDoraInvoice(raw);
    if (!branches[item.branchId]) continue;

    const b = branches[item.branchId];

    // Daily
    let day = '01';
    if (item.dateStr) {
      const parts = item.dateStr.split('/');
      if (parts.length >= 1) day = parts[0].padStart(2, '0');
    }
    b.daily[day] = (b.daily[day] || 0) + item.netSales;

    // Payment methods
    const method = item.payType || 'نقد';
    b.paymentMethods[method] = (b.paymentMethods[method] || 0) + item.netSales;

    // Sales vs Returns
    if (item.isReturn) {
      const retAmt = item.returnNet > 0 ? item.returnNet : Math.abs(item.netSales);
      b.returns += retAmt;
      b.returnCount += 1;
      totalReturns += retAmt;
      totalReturnsCount += 1;
    } else {
      b.grossSales += item.invoiceNet;
      b.salesInvoicesCount += 1;
      totalGross += item.invoiceNet;
      totalSalesCount += 1;
    }

    b.netSales += item.netSales;
    totalNet += item.netSales;
  }

  // Calculate salesWithVat (15% VAT) & Target Achievement per official Dora Cars rule
  const targetMap = { main: 350000, 'al-rawaf': 250000, kia: 200000 };
  for (const bid of Object.keys(branches)) {
    const b = branches[bid];
    b.salesWithVat = Number((b.netSales * 1.15).toFixed(2));
    b.targetRevenue = targetMap[bid] || 0;
    b.targetAchievementPct = b.targetRevenue > 0
      ? Number(((b.salesWithVat / b.targetRevenue) * 100).toFixed(2))
      : 0;
    b.varianceWithVat = Number((b.salesWithVat - b.targetRevenue).toFixed(2));
  }

  const totalWithVat = Number((totalNet * 1.15).toFixed(2));
  const totalTarget = 800000;
  const totalAchievementPct = Number(((totalWithVat / totalTarget) * 100).toFixed(2));

  return {
    branches,
    totals: {
      grossSales: totalGross,
      returns: totalReturns,
      netSales: totalNet,
      salesWithVat: totalWithVat,
      targetRevenue: totalTarget,
      targetAchievementPct: totalAchievementPct,
      varianceWithVat: Number((totalWithVat - totalTarget).toFixed(2)),
      salesInvoicesCount: totalSalesCount,
      returnsCount: totalReturnsCount,
      totalOperations: totalSalesCount + totalReturnsCount
    }
  };
}

export default {
  DORA_BRANCH_RULES,
  classifyDoraInvoice,
  aggregateBranchSales
};

