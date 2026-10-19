const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Load inventory
const invPath = path.resolve(__dirname, '../src/data/officialWarehouseInventory.json');
const rawInv = JSON.parse(fs.readFileSync(invPath, 'utf8')).items;

console.log(`Loaded ${rawInv.length} inventory items for New Branch Planning.`);

// Helper to clean price and numbers
function round2(num) {
  return +(Number(num || 0).toFixed(2));
}

// -------------------------------------------------------------
// 1. SECTION 1: CONSUMABLES (الأصناف الاستهلاكية)
// -------------------------------------------------------------
// Filters, spark plugs, wipers, clips, cleaner sprays
const consumablesRaw = rawInv.filter(i => {
  const n = (i.name || '').toLowerCase();
  const c = i.category;
  const isConsumable = c === 'فلاتر ومصفيات' || c === 'كلبسات ومثبتات' || 
    /فلتر|سيفون|صفاية|بواجي|بوجي|شمعة احتراق|مساحة|قفيز|كلبس|بخاخ تنظيف|منظف فرامل|اسيدلكو/.test(n);
  const isOil = /زيت|سائل فرامل|سائل تبريد|ماء مقطر|ماء رديتر|كولانت/.test(n);
  return isConsumable && !isOil && i.unitCost > 0;
}).sort((a,b) => (b.issued || 0) - (a.issued || 0));

// Select top 60 essential consumables
const consumables = consumablesRaw.slice(0, 60).map((item, idx) => {
  const n = item.name.toLowerCase();
  let suggestedQty = 10;
  if (/كلبس|قفيز/.test(n)) suggestedQty = 200;
  else if (/بواجي|بوجي|شمعة/.test(n)) suggestedQty = 24; // 6 sets of 4
  else if (/سيفون|فلتر زيت/.test(n)) suggestedQty = 25;
  else if (/فلتر هوا|فلتر مكيف/.test(n)) suggestedQty = 12;
  else if (/فلتر ديزل|صفاية/.test(n)) suggestedQty = 10;
  else if (/مساحة/.test(n)) suggestedQty = 8;
  else if (/بخاخ/.test(n)) suggestedQty = 30;
  else if (/مسمار|صامولة/.test(n)) suggestedQty = 40;

  return {
    index: idx + 1,
    sku: item.sku,
    name: item.name,
    category: 'أصناف استهلاكية',
    subType: /فلتر|سيفون/.test(n) ? 'فلاتر' : /بواجي|بوجي/.test(n) ? 'بواجي' : /مساحة/.test(n) ? 'مساحات' : /كلبس|قفيز/.test(n) ? 'كلبسات وتثبيت' : 'مستهلكات عامة',
    brand: item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس أصلي' : 'عام',
    unitCost: round2(item.unitCost),
    totalStock: item.totalQty || 0,
    qtyMain: item.qtyMain || 0,
    qtyRawaf: item.qtyRawaf || 0,
    qtySulaim: item.qtySulaim || 0,
    issued: item.issued || 0,
    suggestedQty,
    actualQty: '', // Empty for purchasing manager
    supplySource: 'طلب شراء وتوريد جديد للفرع',
    estCost: round2(suggestedQty * item.unitCost)
  };
});

// -------------------------------------------------------------
// 2. SECTION 2: OILS & FLUIDS (الزيوت والسوائل)
// -------------------------------------------------------------
// Engine oils, Transmission/Gear fluids, Coolants, Brake fluids, AdBlue, Grease
const oilsRaw = rawInv.filter(i => {
  const n = (i.name || '').toLowerCase();
  const c = i.category;
  // Exclude oil filters or coolers
  const isFilterOrCooler = /فلتر|سيفون|مبرد|قاعدة|رديتر|غطا/.test(n);
  const isOil = c === 'زيوت وسوائل' || /زيت|سائل فرامل|سائل تبريد|ماء مقطر|ماء رديتر|كولانت|شحم|اد بلو|يوريا|atf|cvt|dot4/.test(n);
  return isOil && !isFilterOrCooler && i.unitCost > 0;
}).sort((a,b) => (b.issued || 0) - (a.issued || 0));

// Select top 35 essential oils and fluids
const oils = oilsRaw.slice(0, 35).map((item, idx) => {
  const n = item.name.toLowerCase();
  let suggestedQty = 24;
  if (/ماء مقطر/.test(n)) suggestedQty = 120; // cartons
  else if (/اد بلو|يوريا/.test(n)) suggestedQty = 20; // jugs
  else if (/زيت ديزل|زيت مكينة|5w30|10w40/.test(n)) suggestedQty = 48; // bottles/liters
  else if (/زيت قير|atf/.test(n)) suggestedQty = 36;
  else if (/ماء رديتر|كولانت/.test(n)) suggestedQty = 30;
  else if (/فرامل/.test(n)) suggestedQty = 36;
  else if (/شحم/.test(n)) suggestedQty = 15;

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
    actualQty: '', // Empty for purchasing manager
    supplySource: 'طلب توريد جديد للفرع',
    estCost: round2(suggestedQty * item.unitCost)
  };
});

// -------------------------------------------------------------
// 3. SECTION 3: FAST-MOVING SPARE PARTS (الأصناف سريعة الدوران)
// -------------------------------------------------------------
// Mechanical, Suspension, Electrical, Engine parts with high velocity
const existingSkus = new Set([...consumables.map(x => x.sku), ...oils.map(x => x.sku)]);

const fastMovingRaw = rawInv.filter(i => {
  if (existingSkus.has(i.sku)) return false;
  const n = (i.name || '').toLowerCase();
  const isOil = /زيت|سائل فرامل|سائل تبريد|ماء مقطر|ماء رديتر|كولانت|شحم|اد بلو|يوريا/.test(n);
  const isConsumable = /فلتر|سيفون|صفاية|بواجي|بوجي|شمعة احتراق|مساحة|قفيز|كلبس|بخاخ تنظيف|منظف فرامل/.test(n);
  return !isOil && !isConsumable && (i.issued || 0) >= 20 && i.unitCost > 0;
}).sort((a,b) => (b.issued || 0) - (a.issued || 0));

// Select top 70 fast-moving items
const fastMoving = fastMovingRaw.slice(0, 70).map((item, idx) => {
  const n = item.name.toLowerCase();
  const issued = item.issued || 0;
  let suggestedQty = 4;
  if (issued > 300) suggestedQty = 12;
  else if (issued > 150) suggestedQty = 8;
  else if (issued > 60) suggestedQty = 6;
  else suggestedQty = 4;

  if (/صامولة|مسمار/.test(n)) suggestedQty = 20;

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
    actualQty: '', // Empty for purchasing manager
    supplySource: 'طلب شراء جديد / مخزون افتتاحي',
    estCost: round2(suggestedQty * item.unitCost)
  };
});

// -------------------------------------------------------------
// 4. SECTION 4: STAGNANT & SURPLUS STOCK TRANSFERS (التحويلات المقترحة للأصناف الراكدة)
// -------------------------------------------------------------
// Real items with healthy surplus in one branch and low turnover ratio
const allPriorSkus = new Set([...existingSkus, ...fastMoving.map(x => x.sku)]);

const transfersRaw = rawInv.filter(i => {
  if (allPriorSkus.has(i.sku)) return false;
  const total = i.totalQty || 0;
  const issued = i.issued || 0;
  const main = i.qtyMain || 0;
  const rawaf = i.qtyRawaf || 0;
  const sulaim = i.qtySulaim || 0;
  const maxBranch = Math.max(main, rawaf, sulaim);
  
  // Must have at least 4 units in at least one branch, unit cost >= 20 SAR, and slow/moderate turnover
  return total >= 5 && maxBranch >= 4 && (issued / Math.max(1, total)) < 0.35 && i.unitCost >= 20;
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

  // Suggest transferring ~30% to 40% of the branch's surplus stock (minimum 2, max 10)
  const suggestedTransfer = Math.max(2, Math.min(10, Math.floor(sourceQty * 0.35)));

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
    actualQty: '', // Empty for purchasing/storekeeper transfer execution
    supplySource: `تحويل داخلي من ${sourceBranch}`,
    estCost: round2(suggestedTransfer * item.unitCost)
  };
}).sort((a,b) => (b.estCost || 0) - (a.estCost || 0));

// Select top 60 high-value transfer candidates
const transfers = transfersRaw.slice(0, 60).map((t, idx) => ({
  ...t,
  index: idx + 1
}));

// -------------------------------------------------------------
// Summary & Metrics Calculation
// -------------------------------------------------------------
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
  transfersEstSavings: round2(transfers.reduce((s, i) => s + i.estCost, 0)), // Financial capital saved via internal transfer

  // Total new purchase budget needed:
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

console.log('Summary Statistics:', summary);

// Save JSON for Web App
const fullData = {
  metadata: {
    title: 'كشف طلبية وافتتاح الفرع الجديد — شركة درة السيارة لقطع الغيار',
    generatedAt: new Date().toISOString(),
    preparedBy: 'إدارة ذكاء الأعمال والتحليل المالي (BI Intelligence)',
    forRoles: ['مسئول المشتريات', 'أمين المستودعات', 'الإدارة العامة'],
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
console.log(`Saved JSON dataset to: ${outputJsonPath}`);

// -------------------------------------------------------------
// 5. GENERATE PROFESSIONAL EXCEL WORKBOOK (.XLSX)
// -------------------------------------------------------------
const wb = XLSX.utils.book_new();

// Helper to format rows for Excel
function createSheetRows(items, sectionTitle, isTransfer = false) {
  const header = [
    ['شركة درة السيارة للتجارة — نظام ذكاء الأعمال والمخزون'],
    [`كشف طلبيات وافتتاح الفرع الجديد — ${sectionTitle}`],
    [`تاريخ الإعداد: ${new Date().toLocaleDateString('ar-SA')} | حالة الاعتماد: بانتظار تحديد الكميات من مسئول المشتريات`],
    []
  ];

  const colHeaders = [
    'م',
    'رقم الصنف (Part Number)',
    'اسم وتوصيف الصنف',
    'الفئة / التصنيف',
    'الماركة',
    'آخر سعر شراء (ر.س)',
    isTransfer ? 'رصيد الفرع المحوّل منه' : 'الرصيد الإجمالي بالفروع',
    'الكمية المقترحة',
    'الكمية المطلوبة الفعلية (للتعبئة)',
    isTransfer ? 'الفرع المقترح التحويل منه' : 'مصدر التوفير',
    isTransfer ? 'وفر السيولة المقترح (ر.س)' : 'التكلفة التقديرية (ر.س)'
  ];

  const dataRows = items.map((item, i) => [
    i + 1,
    item.sku,
    item.name,
    item.subType,
    item.brand,
    item.unitCost,
    isTransfer ? item.sourceQty : item.totalStock,
    item.suggestedQty,
    '', // Empty for manual/purchasing input
    isTransfer ? item.sourceBranch : item.supplySource,
    item.estCost
  ]);

  return [...header, colHeaders, ...dataRows];
}

// 1. Executive Summary Sheet
const summaryRows = [
  ['شركة درة السيارة للتجارة — الإدارة العامة'],
  ['الملخص التنفيذي لخطة توريد وتحويلات افتتاح الفرع الجديد'],
  [`تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')} | منصة ذكاء الأعمال (BI Platform)`],
  [],
  ['البيان', 'عدد الأصناف', 'إجمالي الكميات المقترحة', 'القيمة التقديرية (ر.س)', 'ملاحظات استراتيجية'],
  ['1. الأصناف الاستهلاكية (فلاتر، بواجي، مساحات، كلبسات)', summary.consumablesCount, summary.consumablesSuggestedQty, summary.consumablesEstCost, 'طلب شراء جديد للموردين (مستهلكات سريعة النفاذ)'],
  ['2. الزيوت والسوائل (محركات، قير، سوائل تبريد وفرامل)', summary.oilsCount, summary.oilsSuggestedQty, summary.oilsEstCost, 'طلب توريد مباشر لزيوت وكولانت وماء مقطر ويوريا'],
  ['3. الأصناف سريعة الدوران (ميكانيك، تعليق، كهرباء)', summary.fastMovingCount, summary.fastMovingSuggestedQty, summary.fastMovingEstCost, 'تشكيلة القطع الميكانيكية والكهربائية الأكثر طلباً وسحباً'],
  ['4. التحويلات الداخلية للأصناف الراكدة والفائضة', summary.transfersCount, summary.transfersSuggestedQty, summary.transfersEstSavings, 'وفر مباشر في السيولة بتحويل فائض المخزون من الفروع الحالية دون شراء جديد!'],
  [],
  ['إجمالي ميزانية الشراء الجديدة المطلوبة:', '', summary.consumablesSuggestedQty + summary.oilsSuggestedQty + summary.fastMovingSuggestedQty, summary.totalNewPurchaseCost, 'ر.س (المطلوب اعتماده للموردين)'],
  ['وفر السيولة المحقق من التحويلات الداخلية:', '', summary.transfersSuggestedQty, summary.transfersEstSavings, 'ر.س (مخزون منقول من الفروع دون تكلفة نقدية جديدة)'],
  [],
  ['تعليمات مسئول المشتريات:'],
  ['1. يرجى مراجعة عمود "الكمية المقترحة" لكل صنف وتعبئة عمود "الكمية المطلوبة الفعلية" بالكمية المراد تعميدها.'],
  ['2. الأصناف في تبويب "التحويلات المقترحة" يتم إصدار سندات نقل داخلي بها من الفروع المذكورة إلى الفرع الجديد.'],
  [],
  ['اعتماد مسئول المشتريات: __________________    توقيع أمين المستودعات: __________________    موافقة الإدارة العامة: __________________']
];

const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
wsSummary['!cols'] = [{ wch: 45 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 65 }];
XLSX.utils.book_append_sheet(wb, wsSummary, 'الملخص التنفيذي');

// 2. Consumables Sheet
const wsConsumables = XLSX.utils.aoa_to_sheet(createSheetRows(consumables, 'القسم 1: الأصناف الاستهلاكية'));
wsConsumables['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 40 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 26 }, { wch: 28 }, { wch: 22 }];
XLSX.utils.book_append_sheet(wb, wsConsumables, '1_الأصناف_الاستهلاكية');

// 3. Oils & Fluids Sheet
const wsOils = XLSX.utils.aoa_to_sheet(createSheetRows(oils, 'القسم 2: الزيوت والسوائل'));
wsOils['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 42 }, { wch: 24 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 26 }, { wch: 28 }, { wch: 22 }];
XLSX.utils.book_append_sheet(wb, wsOils, '2_الزيوت_والسوائل');

// 4. Fast Moving Sheet
const wsFast = XLSX.utils.aoa_to_sheet(createSheetRows(fastMoving, 'القسم 3: الأصناف سريعة الدوران'));
wsFast['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 42 }, { wch: 22 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 26 }, { wch: 28 }, { wch: 22 }];
XLSX.utils.book_append_sheet(wb, wsFast, '3_سريعة_الدوران');

// 5. Internal Transfers Sheet
const wsTransfers = XLSX.utils.aoa_to_sheet(createSheetRows(transfers, 'القسم 4: التحويلات المقترحة للأصناف الراكدة والفائضة', true));
wsTransfers['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 42 }, { wch: 22 }, { wch: 15 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 26 }, { wch: 32 }, { wch: 22 }];
XLSX.utils.book_append_sheet(wb, wsTransfers, '4_تحويلات_الفروع_الراكدة');

// 6. Complete Combined Printable Sheet (الكل في كشف واحد مرتب بالتسلسل)
const allItems = [
  ...consumables.map(x => ({ ...x, sectionName: '1. الأصناف الاستهلاكية' })),
  ...oils.map(x => ({ ...x, sectionName: '2. الزيوت والسوائل' })),
  ...fastMoving.map(x => ({ ...x, sectionName: '3. الأصناف سريعة الدوران' })),
  ...transfers.map(x => ({ ...x, sectionName: '4. التحويلات الداخلية من الفروع' }))
];

const combinedRows = [
  ['شركة درة السيارة للتجارة — كشف شامل لجميع طلبيات وافتتاح الفرع الجديد'],
  ['كشف رسمي مجمع مرتب بالأقسام: 1. الاستهلاكية | 2. الزيوت والسوائل | 3. سريعة الدوران | 4. التحويلات الراكدة'],
  [`تاريخ الكشف: ${new Date().toLocaleDateString('ar-SA')} | إجمالي عدد الأصناف: ${allItems.length} صنف`],
  [],
  [
    'م',
    'القسم التابع له',
    'رقم الصنف (SKU)',
    'اسم وتوصيف الصنف',
    'الماركة',
    'آخر سعر شراء (ر.س)',
    'رصيد الفروع الحالي',
    'الكمية المقترحة',
    'الكمية الفعلية المطلوبة',
    'المصدر / فرع التحويل',
    'التكلفة / الوفر التقديري (ر.س)'
  ],
  ...allItems.map((item, idx) => [
    idx + 1,
    item.sectionName,
    item.sku,
    item.name,
    item.brand,
    item.unitCost,
    item.sourceQty || item.totalStock,
    item.suggestedQty,
    '',
    item.sourceBranch || item.supplySource,
    item.estCost
  ])
];

const wsAll = XLSX.utils.aoa_to_sheet(combinedRows);
wsAll['!cols'] = [{ wch: 5 }, { wch: 26 }, { wch: 20 }, { wch: 42 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 24 }, { wch: 32 }, { wch: 24 }];
XLSX.utils.book_append_sheet(wb, wsAll, 'الكشف_الشامل_للطباعة');

// Write Excel files
const rootExcelPath = path.resolve(__dirname, '../../كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx');
XLSX.writeFile(wb, rootExcelPath);
console.log(`Excel file written to root: ${rootExcelPath}`);

const publicDownloadsDir = path.resolve(__dirname, '../public/downloads');
if (!fs.existsSync(publicDownloadsDir)) {
  fs.mkdirSync(publicDownloadsDir, { recursive: true });
}
const publicExcelPath = path.resolve(publicDownloadsDir, 'كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx');
XLSX.writeFile(wb, publicExcelPath);
console.log(`Excel file also copied to public downloads: ${publicExcelPath}`);
