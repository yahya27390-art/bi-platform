const XLSX = require('xlsx');

function classifyItem(name, sku) {
  const n = String(name || '').toLowerCase().trim();
  const s = String(sku || '').toLowerCase().trim();
  const text = `${n} ${s}`;

  const isDiesel = /ديزل|diesel/.test(text);

  // 1. Cooling & AC - HIGHEST PRIORITY FOR COMPRESSORS/RADIATORS EVEN IF DIESEL
  if (/كمبروسر|كمبرسر|ضاغط|رديتر|رادياتير|طرمبة ماء|طرمبة مايه|مروحة|كلتش مروحة|بلف حرارة|ثرموستات|كوع ماء|كوع بلف|ثلاجة مكيف|مبخر|سربنتينة|لي مكيف|ماسورة مكيف|حساس حرارة|تبريد/.test(text)) {
    return { category: 'نظام التبريد والتكييف', isDiesel };
  }

  // 2. Electrical & Ignition - HIGHEST PRIORITY FOR DYNAMO/STARTER EVEN IF DIESEL
  if (/دينمو|سلف|بواجي|بوجي|شمعة احتراق|كويل|كويلات|ظفيرة|فيوز|كتاوت|ريليه|شريحة دركسون|سويتش|مفتاح|انوار|اسطب|شمعة|لمبة|كشاف/.test(text)) {
    return { category: 'كهرباء وإنارة', isDiesel };
  }

  // 3. Suspension, Steering & Axles - HIGHEST PRIORITY FOR AXLES/SHOCKS EVEN IF DIESEL
  if (/عكس|عكوس|راس عكس|صليبة|مساعد|مساعدات|ياي|يايات|مقص|مقصات|جلبة|جلدة مقص|ركبة|ذراع|دودة|عمود توازن|مسمار توازن|طرمبة دركسون|علبة دركسون|كراسي مكينة|كراسي قير|كرسي مكينة|كرسي قير|رمان|فلنجة|سرة كفر|شياﻝ/.test(text)) {
    return { category: 'مساعدات ونظام تعليق', isDiesel };
  }

  // 4. Brakes & Drums
  if (/فحمات|فحمة|قماش|اقمشة|مكابح|فرامل|طنبور|هوب|هوبات|كليبر|باكم|سلندر فرامل/.test(text)) {
    return { category: 'مكابح وهوبات', isDiesel };
  }

  // 5. Filters & Strainers
  if (/فلتر|فلاتر|سيفون|صفايه|صفاية/.test(text)) {
    return { category: 'فلاتر ومصفيات', isDiesel };
  }

  // 6. Body & Exterior
  if (/صدام|شبك|رفرف|كبوت|باب|شنطة|مراية|قزاز|زجاج|بطانة|لحية|مساحة|شبابيك/.test(text)) {
    return { category: 'هيكل وبودي', isDiesel };
  }

  // 7. Fasteners & Clips
  if (/كلبس|كلبسات|مسمار|مسامير|صامولة|صواميل|قفيز|وردة/.test(text)) {
    return { category: 'كلبسات ومثبتات', isDiesel };
  }

  // 8. OILS & FLUIDS - STRICT: ONLY ACTUAL LIQUIDS/LUBRICANTS, NEVER "ديزل" ALONE!
  if (/زيت مكينة|زيت قير|زيت جير|زيت محرك|زيت فرامل|زيت دركسون|زيت دفرنس|زيت هيدروليك|سائل تبريد|ماء رديتر|ماء مقطر|شحم|تشحيم|كولانت|مياه رديتر|سائل فرامل|atf|cvt|dot4/.test(text)) {
    return { category: 'زيوت وسوائل', isDiesel };
  }

  // 9. DIESEL POWERTRAIN & FUEL SPECIALIZATION
  // If it is a diesel vehicle engine component (بخاخات، طرمبة ديزل، تيربو، وجيه ديزل، سبايك ديزل...)
  if (isDiesel || /تيربو|بخاخ|بخاخات|طرمبة ديزل|سبيكة ديزل|وجيه ديزل/.test(text)) {
    return { category: 'قطع محركات وسيارات الديزل', isDiesel: true };
  }

  // 10. General Engine & Transmission Mechanical
  if (/مكينة|محرك|قير|جير|سير|سيور|بلف|كرنك|بستن|بستم|شنبر|سبيكة|سبايك|وجيه|وجه|كرتير|صوفة|طرمبة زيت|طرمبة بنزين|حذاف|كلتش|صحن/.test(text)) {
    return { category: 'محرك وجير', isDiesel };
  }

  return { category: 'قطع غيار عامة', isDiesel };
}

const wb = XLSX.readFile('c:/Users/Public/مجلد جديد/ملفات تقارير الحملات/حركة مخزن الى شهر 9 2026.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const counts = {};
let dieselCount = 0;
let oilsCount = 0;
const testItems = [
  'دينمو ديزل 1600 / 1700',
  'عكس امامي يسار توسان 14 / 12 ديزل',
  'كمبروسر اكسنت 14 / 12',
  'كمبروسر مكيف ديزل',
  'زيت قير ديزل سنتافي - سورينتو',
  'طرمبة ديزل',
  'بخاخات ديزل',
  'طقم وجيه النترا / اكسنت ديزل'
];

console.log('--- Testing Sample Items ---');
for (const t of testItems) {
  const res = classifyItem(t, '');
  console.log(`"${t}" => ${res.category} [Diesel: ${res.isDiesel}]`);
}

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[0]) continue;
  const res = classifyItem(r[1], r[0]);
  counts[res.category] = (counts[res.category] || 0) + 1;
  if (res.isDiesel) dieselCount++;
  if (res.category === 'زيوت وسوائل') oilsCount++;
}

console.log('\n--- Category Distribution Across 8,693 SKUs ---');
console.table(counts);
console.log(`Total items flagged with Diesel vehicle/engine: ${dieselCount}`);
console.log(`Total actual oils/liquids: ${oilsCount}`);
