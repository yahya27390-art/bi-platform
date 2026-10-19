const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Load inventory
const invPath = path.resolve(__dirname, '../src/data/officialWarehouseInventory.json');
const rawInv = JSON.parse(fs.readFileSync(invPath, 'utf8')).items;

function round2(num) {
  return +(Number(num || 0).toFixed(2));
}

// Helper to determine proportional opening quantity based on branch stock & sales velocity
function calculateProportionalQty(item, isTransfer = false) {
  const main = item.qtyMain || 0;
  const rawaf = item.qtyRawaf || 0;
  const sulaim = item.qtySulaim || 0;
  const total = item.totalQty || 0;
  const issued = item.issued || 0;
  const n = (item.name || '').toLowerCase();

  if (isTransfer) {
    // For transfer: take ~30% to 40% of the surplus branch (at least 2, max 8)
    const maxBranchStock = Math.max(main, rawaf, sulaim);
    return Math.max(2, Math.min(8, Math.floor(maxBranchStock * 0.35)));
  }

  // Active branches with stock > 0
  const activeBranches = [main, rawaf, sulaim].filter(q => q > 0).length || 1;
  const avgStockPerActiveBranch = Math.round(total / activeBranches);

  let suggested = Math.max(2, avgStockPerActiveBranch);

  // Proportional fine-tuning by category and velocity
  if (/كلبس|قفيز/.test(n)) {
    suggested = Math.max(50, Math.min(200, Math.round(avgStockPerActiveBranch * 0.8)));
  } else if (/ماء مقطر/.test(n)) {
    suggested = Math.max(24, Math.min(80, avgStockPerActiveBranch));
  } else if (/زيت مكينة|زيت ديزل|5w30|10w40/.test(n)) {
    suggested = Math.max(24, Math.min(48, avgStockPerActiveBranch));
  } else if (/زيت قير|atf/.test(n)) {
    suggested = Math.max(12, Math.min(36, avgStockPerActiveBranch));
  } else if (/بواجي|بوجي/.test(n)) {
    suggested = Math.max(12, Math.min(24, avgStockPerActiveBranch));
  } else if (/سيفون|فلتر زيت/.test(n)) {
    suggested = Math.max(10, Math.min(25, avgStockPerActiveBranch));
  } else if (/فلتر هوا|فلتر مكيف/.test(n)) {
    suggested = Math.max(4, Math.min(12, avgStockPerActiveBranch));
  } else if (/فحمات|قماش/.test(n)) {
    suggested = Math.max(3, Math.min(8, avgStockPerActiveBranch));
  } else {
    // High-sales items get a boost proportional to branch average
    if (issued > 150) suggested = Math.max(4, Math.min(12, Math.round(avgStockPerActiveBranch * 1.1)));
    else if (issued > 50) suggested = Math.max(3, Math.min(8, avgStockPerActiveBranch));
    else suggested = Math.max(2, Math.min(6, avgStockPerActiveBranch));
  }

  return Math.min(suggested, 60); // Cap reasonable single-item opening order
}

// -------------------------------------------------------------
// 1. SECTION 1: CONSUMABLES (الأصناف الاستهلاكية) - 220 items
// -------------------------------------------------------------
const consumablesRaw = rawInv.filter(i => {
  const n = (i.name || '').toLowerCase();
  const c = i.category;
  const isConsumable = c === 'فلاتر ومصفيات' || c === 'كلبسات ومثبتات' || c === 'مكابح وهوبات' ||
    /فلتر|سيفون|صفاية|بواجي|بوجي|شمعة احتراق|مساحة|قفيز|كلبس|بخاخ تنظيف|منظف فرامل|اسيدلكو|فحمات|قماش/.test(n);
  const isOil = /زيت|سائل فرامل|سائل تبريد|ماء مقطر|ماء رديتر|كولانت/.test(n);
  return isConsumable && !isOil && i.unitCost > 0 && ((i.issued || 0) >= 2 || (i.totalQty || 0) >= 2);
}).sort((a,b) => (b.issued || 0) - (a.issued || 0));

const consumables = consumablesRaw.slice(0, 220).map((item, idx) => {
  const n = item.name.toLowerCase();
  const suggestedQty = calculateProportionalQty(item);

  return {
    index: idx + 1,
    sku: item.sku,
    name: item.name,
    category: 'أصناف استهلاكية',
    subType: /فلتر|سيفون/.test(n) ? 'فلاتر' : /فحمات|قماش/.test(n) ? 'فحمات ومكابح' : /بواجي|بوجي/.test(n) ? 'بواجي' : /مساحة/.test(n) ? 'مساحات' : /كلبس|قفيز/.test(n) ? 'كلبسات وتثبيت' : 'مستهلكات عامة',
    brand: item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس أصلي' : 'عام',
    unitCost: round2(item.unitCost),
    totalStock: item.totalQty || 0,
    qtyMain: item.qtyMain || 0,
    qtyRawaf: item.qtyRawaf || 0,
    qtySulaim: item.qtySulaim || 0,
    issued: item.issued || 0,
    suggestedQty,
    supplySource: 'طلب شراء وتوريد جديد للفرع',
    estCost: round2(suggestedQty * item.unitCost)
  };
});

// -------------------------------------------------------------
// 2. SECTION 2: OILS & FLUIDS (الزيوت والسوائل) - 50 items
// -------------------------------------------------------------
const oilsRaw = rawInv.filter(i => {
  const n = (i.name || '').toLowerCase();
  const c = i.category;
  const isFilterOrCooler = /فلتر|سيفون|مبرد|قاعدة|رديتر|غطا/.test(n);
  const isOil = c === 'زيوت وسوائل' || /زيت|سائل فرامل|سائل تبريد|ماء مقطر|ماء رديتر|كولانت|شحم|اد بلو|يوريا|atf|cvt|dot4/.test(n);
  return isOil && !isFilterOrCooler && i.unitCost > 0;
}).sort((a,b) => (b.issued || 0) - (a.issued || 0));

const oils = oilsRaw.slice(0, 50).map((item, idx) => {
  const n = item.name.toLowerCase();
  const suggestedQty = calculateProportionalQty(item);

  return {
    index: idx + 1,
    sku: item.sku,
    name: item.name,
    category: 'زيوت وسوائل',
    subType: /مكينة|محرك|5w|10w|15w|20w/.test(n) ? 'زيوت محركات' : /قير|جير|atf|cvt/.test(n) ? 'زيوت ناقل الحركة (قير)' : /فرامل/.test(n) ? 'سوائل فرامل' : /ماء|رديتر|كولانت/.test(n) ? 'سوائل تبريد ورديتر' : /اد بلو|يوريا/.test(n) ? 'ماء يوريا AdBlue' : 'سوائل وشحوم',
    brand: item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس أصلي' : 'عام',
    unitCost: round2(item.unitCost),
    totalStock: item.totalQty || 0,
    qtyMain: item.qtyMain || 0,
    qtyRawaf: item.qtyRawaf || 0,
    qtySulaim: item.qtySulaim || 0,
    issued: item.issued || 0,
    suggestedQty,
    supplySource: 'طلب توريد جديد للفرع',
    estCost: round2(suggestedQty * item.unitCost)
  };
});

// -------------------------------------------------------------
// 3. SECTION 3: FAST-MOVING SPARE PARTS (الأصناف سريعة الدوران) - 430 items
// -------------------------------------------------------------
const cSkus = new Set(consumables.map(x => x.sku));
const oSkus = new Set(oils.map(x => x.sku));

const fastMovingRaw = rawInv.filter(i => {
  if (cSkus.has(i.sku) || oSkus.has(i.sku)) return false;
  const n = (i.name || '').toLowerCase();
  const isOil = /زيت|سائل فرامل|سائل تبريد|ماء مقطر|ماء رديتر|كولانت|شحم|اد بلو|يوريا/.test(n);
  const isConsumable = /فلتر|سيفون|صفاية|بواجي|بوجي|شمعة احتراق|مساحة|قفيز|كلبس|بخاخ تنظيف|منظف فرامل|فحمات|قماش/.test(n);
  return !isOil && !isConsumable && (i.issued || 0) >= 4 && i.unitCost > 0;
}).sort((a,b) => (b.issued || 0) - (a.issued || 0));

const fastMoving = fastMovingRaw.slice(0, 430).map((item, idx) => {
  const suggestedQty = calculateProportionalQty(item);

  return {
    index: idx + 1,
    sku: item.sku,
    name: item.name,
    category: 'أصناف سريعة الدوران',
    subType: item.category || 'قطع ميكانيكية وكهربائية',
    brand: item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس أصلي' : 'عام',
    unitCost: round2(item.unitCost),
    totalStock: item.totalQty || 0,
    qtyMain: item.qtyMain || 0,
    qtyRawaf: item.qtyRawaf || 0,
    qtySulaim: item.qtySulaim || 0,
    issued: item.issued || 0,
    suggestedQty,
    supplySource: 'طلب شراء جديد / مخزون افتتاحي',
    estCost: round2(suggestedQty * item.unitCost)
  };
});

// -------------------------------------------------------------
// 4. SECTION 4: STAGNANT & SURPLUS TRANSFERS (التحويلات المقترحة) - 250 items
// -------------------------------------------------------------
const allPriorSkus = new Set([...cSkus, ...oSkus, ...fastMoving.map(x => x.sku)]);

const transfersRaw = rawInv.filter(i => {
  if (allPriorSkus.has(i.sku)) return false;
  const main = i.qtyMain || 0;
  const rawaf = i.qtyRawaf || 0;
  const sulaim = i.qtySulaim || 0;
  const max = Math.max(main, rawaf, sulaim);
  return max >= 3 && ((i.issued || 0) / Math.max(1, i.totalQty || 0)) <= 0.4 && i.unitCost >= 15;
}).map(item => {
  const main = item.qtyMain || 0;
  const rawaf = item.qtyRawaf || 0;
  const sulaim = item.qtySulaim || 0;
  
  let sourceBranch = 'الفرع الرئيسي (مستودع 100)';
  let sourceCode = 'main';
  let sourceQty = main;

  if (rawaf > main && rawaf >= sulaim) {
    sourceBranch = 'فرع الرواف (مستودع 200)';
    sourceCode = 'rawaf';
    sourceQty = rawaf;
  } else if (sulaim > main && sulaim > rawaf) {
    sourceBranch = 'فرع السليم (مستودع 300)';
    sourceCode = 'sulaim';
    sourceQty = sulaim;
  }

  const suggestedTransfer = calculateProportionalQty(item, true);

  return {
    sku: item.sku,
    name: item.name,
    category: 'تحويلات داخلية للأصناف الراكدة',
    subType: item.category || 'قطع غيار راكدة/فائضة',
    brand: item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس أصلي' : 'عام',
    unitCost: round2(item.unitCost),
    totalStock: item.totalQty || 0,
    sourceBranch,
    sourceCode,
    sourceQty,
    qtyMain: main,
    qtyRawaf: rawaf,
    qtySulaim: sulaim,
    issued: item.issued || 0,
    suggestedQty: suggestedTransfer,
    supplySource: `تحويل داخلي من ${sourceBranch}`,
    estCost: round2(suggestedTransfer * item.unitCost)
  };
}).sort((a,b) => (b.estCost || 0) - (a.estCost || 0));

const transfers = transfersRaw.slice(0, 250).map((t, idx) => ({
  ...t,
  index: idx + 1
}));

// Summary Calculations
const summary = {
  totalItems: consumables.length + oils.length + fastMoving.length + transfers.length,
  consumablesCount: consumables.length,
  consumablesSuggestedQty: consumables.reduce((s, i) => s + i.suggestedQty, 0),
  consumablesEstCost: round2(consumables.reduce((s, i) => s + i.estCost, 0)),

  oilsCount: oils.length,
  oilsSuggestedQty: oils.reduce((s, i) => s + i.suggestedQty, 0),
  oilsEstCost: round2(oils.reduce((s, i) => s + i.estCost, 0)),

  fastMovingCount: fastMoving.length,
  fastMovingSuggestedQty: fastMoving.reduce((s, i) => s + i.suggestedQty, 0),
  fastMovingEstCost: round2(fastMoving.reduce((s, i) => s + i.estCost, 0)),

  transfersCount: transfers.length,
  transfersSuggestedQty: transfers.reduce((s, i) => s + i.suggestedQty, 0),
  transfersEstSavings: round2(transfers.reduce((s, i) => s + i.estCost, 0)),

  totalNewPurchaseCost: round2(
    consumables.reduce((s, i) => s + i.estCost, 0) +
    oils.reduce((s, i) => s + i.estCost, 0) +
    fastMoving.reduce((s, i) => s + i.estCost, 0)
  ),
  totalCombinedQty: consumables.reduce((s, i) => s + i.suggestedQty, 0) +
    oils.reduce((s, i) => s + i.suggestedQty, 0) +
    fastMoving.reduce((s, i) => s + i.suggestedQty, 0) +
    transfers.reduce((s, i) => s + i.suggestedQty, 0)
};

console.log('Grand Summary of 950 Requisition Items:');
console.log(summary);

// Save JSON for Web App
const fullData = {
  metadata: {
    title: 'كشف طلبية وافتتاح الفرع الجديد الشامل (950 صنفاً متنوعاً) — شركة درة السيارة لقطع الغيار',
    generatedAt: new Date().toISOString(),
    preparedBy: 'إدارة ذكاء الأعمال والتحليل المالي (BI Intelligence)',
    summary
  },
  sections: {
    consumables,
    oils,
    fastMoving,
    transfers
  }
};

const outputJsonPath = path.resolve(__dirname, '../src/data/newBranchRequisitionData.json');
fs.writeFileSync(outputJsonPath, JSON.stringify(fullData, null, 2), 'utf8');

// -------------------------------------------------------------
// 5. GENERATE ADVANCED EXCEL WORKBOOK WITH DYNAMIC FORMULAS
// -------------------------------------------------------------
const wb = XLSX.utils.book_new();

function createFormulaWorksheet(items, sectionTitle, isTransfer = false) {
  const headerLines = [
    ['شركة درة السيارة للتجارة — كشف طلبيات وتجهيز افتتاح الفرع الجديد'],
    [`القسم: ${sectionTitle} | الصيغة: تفاعلية بالمعادلات المحاسبية الكاملة (SUM, PRODUCT, IF)`],
    [`تاريخ الكشف: ${new Date().toLocaleDateString('ar-SA')} | ملاحظة: عند تعبئة عمود "الكمية المطلوبة الفعلية" تُحسب التكلفة تلقائياً`],
    []
  ];

  const colHeaders = [
    'م',
    'رقم الصنف (SKU)',
    'اسم وتوصيف الصنف',
    'الفئة / التصنيف',
    'الماركة',
    'آخر سعر شراء (ر.س)',
    isTransfer ? 'رصيد فرع المصدر' : 'الرصيد الكلي بالفروع',
    'الكمية المقترحة',
    'التكلفة المقترحة (ر.س)',
    'الكمية المطلوبة الفعلية (اكتب هنا)',
    'التكلفة الفعلية المعتمدة (ر.س)',
    isTransfer ? 'الفرع المقترح التحويل منه' : 'مصدر التوفير'
  ];

  const rows = [...headerLines, colHeaders];
  const startRow = 6;

  items.forEach((item, idx) => {
    const rowNum = startRow + idx;
    rows.push([
      idx + 1,
      item.sku,
      item.name,
      item.subType,
      item.brand,
      item.unitCost,
      isTransfer ? item.sourceQty : item.totalStock,
      item.suggestedQty,
      { t: 'n', f: `F${rowNum}*H${rowNum}`, v: round2(item.unitCost * item.suggestedQty) },
      null,
      { t: 'n', f: `IF(ISNUMBER(J${rowNum}), F${rowNum}*J${rowNum}, 0)`, v: 0 },
      isTransfer ? item.sourceBranch : item.supplySource
    ]);
  });

  const lastDataRow = startRow + items.length - 1;
  const totalsRow = lastDataRow + 2;

  rows.push([]);
  rows.push([
    'الإجمالي العام للقسم',
    '',
    '',
    '',
    '',
    '',
    '',
    { t: 'n', f: `SUM(H${startRow}:H${lastDataRow})`, v: items.reduce((s, i) => s + i.suggestedQty, 0) },
    { t: 'n', f: `SUM(I${startRow}:I${lastDataRow})`, v: round2(items.reduce((s, i) => s + i.estCost, 0)) },
    { t: 'n', f: `SUM(J${startRow}:J${lastDataRow})`, v: 0 },
    { t: 'n', f: `SUM(K${startRow}:K${lastDataRow})`, v: 0 },
    isTransfer ? 'إجمالي وفر السيولة من التحويلات' : 'إجمالي ميزانية الشراء للقسم'
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 19 },
    { wch: 42 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 19 },
    { wch: 22 },
    { wch: 21 },
    { wch: 32 }
  ];

  ws['!views'] = [{ rightToLeft: true }];

  return { ws, totalsRow };
}

// 1. Executive Summary Sheet
const summaryHeader = [
  ['شركة درة السيارة للتجارة — الإدارة العامة ومجلس الإدارة'],
  ['الملخص التنفيذي لخطة توريد وافتتاح الفرع الجديد الشاملة (950 صنفاً متنوعاً)'],
  [`تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')} | مربوط بالمعادلات الحية تلقائياً`],
  [],
  ['البيان والتبويب', 'عدد الأصناف', 'الكمية المقترحة', 'الميزانية التقديرية (ر.س)', 'الكمية الفعلية المطلوبة', 'الميزانية الفعلية المعتمدة (ر.س)', 'الملاحظات الاستراتيجية والتنفيذية'],
  [
    '1. الأصناف الاستهلاكية (فلاتر، فحمات، بواجي، مساحات، كلبسات)',
    consumables.length,
    { t: 'n', f: `'1_الأصناف_الاستهلاكية'!H${consumables.length + 7}`, v: summary.consumablesSuggestedQty },
    { t: 'n', f: `'1_الأصناف_الاستهلاكية'!I${consumables.length + 7}`, v: summary.consumablesEstCost },
    { t: 'n', f: `'1_الأصناف_الاستهلاكية'!J${consumables.length + 7}`, v: 0 },
    { t: 'n', f: `'1_الأصناف_الاستهلاكية'!K${consumables.length + 7}`, v: 0 },
    'طلب شراء جديد للموردين (مستهلكات سريعة الحركة والنفاذ لكافة الموديلات)'
  ],
  [
    '2. الزيوت والسوائل (محركات، قير، سوائل تبريد وفرامل، يوريا)',
    oils.length,
    { t: 'n', f: `'2_الزيوت_والسوائل'!H${oils.length + 7}`, v: summary.oilsSuggestedQty },
    { t: 'n', f: `'2_الزيوت_والسوائل'!I${oils.length + 7}`, v: summary.oilsEstCost },
    { t: 'n', f: `'2_الزيوت_والسوائل'!J${oils.length + 7}`, v: 0 },
    { t: 'n', f: `'2_الزيوت_والسوائل'!K${oils.length + 7}`, v: 0 },
    'طلب توريد مباشر لزيوت وكولانت وماء مقطر ويوريا وشحوم'
  ],
  [
    '3. الأصناف سريعة الدوران (ميكانيك، تعليق، كهرباء، محركات)',
    fastMoving.length,
    { t: 'n', f: `'3_سريعة_الدوران'!H${fastMoving.length + 7}`, v: summary.fastMovingSuggestedQty },
    { t: 'n', f: `'3_سريعة_الدوران'!I${fastMoving.length + 7}`, v: summary.fastMovingEstCost },
    { t: 'n', f: `'3_سريعة_الدوران'!J${fastMoving.length + 7}`, v: 0 },
    { t: 'n', f: `'3_سريعة_الدوران'!K${fastMoving.length + 7}`, v: 0 },
    'تشكيلة شاملة تغطي كافة موديلات هيونداي وكيا والديزل'
  ],
  [
    '4. التحويلات الداخلية للأصناف الراكدة والفائضة من الفروع',
    transfers.length,
    { t: 'n', f: `'4_تحويلات_الفروع_الراكدة'!H${transfers.length + 7}`, v: summary.transfersSuggestedQty },
    { t: 'n', f: `'4_تحويلات_الفروع_الراكدة'!I${transfers.length + 7}`, v: summary.transfersEstSavings },
    { t: 'n', f: `'4_تحويلات_الفروع_الراكدة'!J${transfers.length + 7}`, v: 0 },
    { t: 'n', f: `'4_تحويلات_الفروع_الراكدة'!K${transfers.length + 7}`, v: 0 },
    'وفر نقدي مباشر: استغلال وتسييل المخزون الفائض من الفروع الحالية دون دفع سيولة للموردين!'
  ],
  [],
  [
    'إجمالي ميزانية الشراء الجديدة المطلوبة (القسم 1 + 2 + 3):',
    '',
    { t: 'n', f: 'SUM(C6:C8)', v: summary.consumablesSuggestedQty + summary.oilsSuggestedQty + summary.fastMovingSuggestedQty },
    { t: 'n', f: 'SUM(D6:D8)', v: summary.totalNewPurchaseCost },
    { t: 'n', f: 'SUM(E6:E8)', v: 0 },
    { t: 'n', f: 'SUM(F6:F8)', v: 0 },
    'ر.س (المطلوب اعتماده وتعميده للموردين للطلبيات الجديدة)'
  ],
  [
    'وفر السيولة النقدية المحقق من التحويلات الداخلية (القسم 4):',
    '',
    { t: 'n', f: 'C9', v: summary.transfersSuggestedQty },
    { t: 'n', f: 'D9', v: summary.transfersEstSavings },
    { t: 'n', f: 'E9', v: 0 },
    { t: 'n', f: 'F9', v: 0 },
    'ر.س (توفير نقدي مباشر ومخزون منقول من الفروع الحالية)'
  ],
  [],
  ['تعليمات وتوجيهات الاستخدام:'],
  ['1. ملف الإكسل مدعوم بالكامل بالمعادلات الحسابية التفاعلية؛ بمجرد أن يكتب مسئول المشتريات الكمية المطلوبة في أي شيت تتحدث التكلفة والإجماليات فوراً.'],
  ['2. أصناف التبويب الرابع (التحويلات) يتم إرسالها لمستودعات الفروع (الرئيسي، الرواف، السليم) لإصدار أذونات تحويل واستلام للفرع الجديد.'],
  [],
  ['إعداد ومطابقة: إدارة ذكاء الأعمال (BI)       اعتماد ومراجعة: مسئول المشتريات والتوريد       الموافقة النهائية: المدير العام / المالك']
];

const wsSummary = XLSX.utils.aoa_to_sheet(summaryHeader);
wsSummary['!cols'] = [{ wch: 48 }, { wch: 14 }, { wch: 18 }, { wch: 25 }, { wch: 22 }, { wch: 26 }, { wch: 65 }];
wsSummary['!views'] = [{ rightToLeft: true }];
XLSX.utils.book_append_sheet(wb, wsSummary, 'الملخص التنفيذي');

// 2. Consumables Sheet (220 items)
const sConsumables = createFormulaWorksheet(consumables, '1_الأصناف_الاستهلاكية');
XLSX.utils.book_append_sheet(wb, sConsumables.ws, '1_الأصناف_الاستهلاكية');

// 3. Oils Sheet (50 items)
const sOils = createFormulaWorksheet(oils, '2_الزيوت_والسوائل');
XLSX.utils.book_append_sheet(wb, sOils.ws, '2_الزيوت_والسوائل');

// 4. Fast Moving Sheet (430 items)
const sFast = createFormulaWorksheet(fastMoving, '3_سريعة_الدوران');
XLSX.utils.book_append_sheet(wb, sFast.ws, '3_سريعة_الدوران');

// 5. Transfers Sheet (250 items)
const sTransfers = createFormulaWorksheet(transfers, '4_تحويلات_الفروع_الراكدة', true);
XLSX.utils.book_append_sheet(wb, sTransfers.ws, '4_تحويلات_الفروع_الراكدة');

// Save Excel file to Root, Public, Dist
const rootExcelPath = path.resolve(__dirname, '../../كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx');
XLSX.writeFile(wb, rootExcelPath);
console.log(`Excel file with formulas written to: ${rootExcelPath}`);

const publicDownloadsDir = path.resolve(__dirname, '../public/downloads');
if (!fs.existsSync(publicDownloadsDir)) fs.mkdirSync(publicDownloadsDir, { recursive: true });
const publicExcelPath = path.join(publicDownloadsDir, 'كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx');
XLSX.writeFile(wb, publicExcelPath);

const distDownloadsDir = path.resolve(__dirname, '../dist/downloads');
if (!fs.existsSync(distDownloadsDir)) fs.mkdirSync(distDownloadsDir, { recursive: true });
const distExcelPath = path.join(distDownloadsDir, 'كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx');
XLSX.writeFile(wb, distExcelPath);

console.log('✓ All 950-item Excel files and JSON updated with proportional quantities and formulas!');
