const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:\\Users\\PC\\Desktop\\التقرير المخزون اخر نسخه.pdf';
const buf = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(buf);

function parsePageText(text, pageNum) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Find header
  let skuStartIdx = -1;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (/\d+\s*\/\s*277/.test(lines[i])) {
      skuStartIdx = i + 1;
      break;
    }
  }
  if (skuStartIdx === -1) {
    return { error: 'Header not found', pageNum };
  }

  // Find where branch quantities start
  // A branch quantity line consists of 3 integers separated by whitespace: e.g. "37\t84\t108" or "0\t0\t0"
  let qtyStartIdx = -1;
  let qtyEndIdx = -1;
  for (let i = skuStartIdx; i < lines.length; i++) {
    if (/^\d+\s+\d+\s+\d+$/.test(lines[i])) {
      if (qtyStartIdx === -1) qtyStartIdx = i;
      qtyEndIdx = i;
    } else if (qtyStartIdx !== -1) {
      // End of quantity block
      break;
    }
  }

  if (qtyStartIdx === -1) {
    return { error: 'Branch quantities not found', pageNum };
  }

  const N = qtyEndIdx - qtyStartIdx + 1;

  // Raw SKU lines between skuStartIdx and qtyStartIdx
  const rawSkuLines = lines.slice(skuStartIdx, qtyStartIdx);
  const skus = [];
  for (let i = 0; i < rawSkuLines.length; i++) {
    let s = rawSkuLines[i];
    if (s.endsWith('-') && i + 1 < rawSkuLines.length) {
      s = s + rawSkuLines[i + 1];
      i++;
    }
    skus.push(s);
  }

  // If skus.length still > N, try merging any short non-sku line
  if (skus.length > N) {
    // Sometimes word wraps without dash
    const mergedSkus = [];
    for (let i = 0; i < skus.length; i++) {
      if (mergedSkus.length > 0 && !skus[i].includes('-') && !/^\d{4,}/.test(skus[i]) && mergedSkus.length + (skus.length - i) > N) {
        mergedSkus[mergedSkus.length - 1] += skus[i];
      } else {
        mergedSkus.push(skus[i]);
      }
    }
    while (mergedSkus.length > N) {
      // fallback
      break;
    }
    if (mergedSkus.length === N) {
      skus.length = 0;
      skus.push(...mergedSkus);
    }
  }

  // Branch quantities (N lines)
  const branchQtys = lines.slice(qtyStartIdx, qtyStartIdx + N);

  // Item names (N lines)
  const nameStartIdx = qtyStartIdx + N;
  const names = [];
  for (let i = nameStartIdx; i < nameStartIdx + N; i++) {
    names.push(lines[i]);
  }

  // Units (N lines)
  let unitStartIdx = nameStartIdx + N;
  const units = [];
  for (let i = unitStartIdx; i < unitStartIdx + N; i++) {
    units.push(lines[i]);
  }

  // Branch costs (N lines)
  let costStartIdx = unitStartIdx + N;
  while (costStartIdx < lines.length && !/^\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/.test(lines[costStartIdx])) {
    costStartIdx++;
  }

  const branchCosts = [];
  for (let i = costStartIdx; i < costStartIdx + N; i++) {
    branchCosts.push(lines[i]);
  }

  // Total quantities (N lines)
  const totQtyStartIdx = costStartIdx + N;
  const totalQtys = [];
  for (let i = totQtyStartIdx; i < totQtyStartIdx + N; i++) {
    totalQtys.push(lines[i]);
  }

  // Total costs (N lines)
  let totCostStartIdx = totQtyStartIdx + N;
  while (totCostStartIdx < lines.length && !/^\d+[\d,]*\.\d{2}$/.test(lines[totCostStartIdx].replace(/,/g, ''))) {
    totCostStartIdx++;
  }

  const totalCosts = [];
  for (let i = totCostStartIdx; i < totCostStartIdx + N; i++) {
    totalCosts.push(lines[i]);
  }

  if (branchCosts.length !== N || totalQtys.length !== N || totalCosts.length !== N) {
    return {
      error: `Length mismatch on page ${pageNum}: N=${N}, costs=${branchCosts.length}, qtys=${totalQtys.length}, totCosts=${totalCosts.length}`,
      pageNum
    };
  }

  const items = [];
  for (let i = 0; i < N; i++) {
    const qParts = branchQtys[i].split(/\s+/).map(Number);
    const cParts = branchCosts[i].split(/\s+/).map(Number);
    const totalQty = parseInt(totalQtys[i], 10) || 0;
    const totalCost = parseFloat(totalCosts[i].replace(/,/g, '')) || 0;

    // Notice column order from report header:
    // Column 1: 100 - مخزن المركز الرئيسي
    // Column 2: 200 - مخزن فرع الرواف
    // Column 3: 300 - مخزن السليم 2
    // Let's verify whether qParts is [main, rawaf, sulaim] or reversed.
    // On page 1 row 2 (04300-2N100):
    // Table in PDF image shows:
    // 100 - مخزن المركز الرئيسي: كميات 37, تكلفة 2479.00
    // 200 - مخزن فرع الرواف: كميات 84, تكلفة 5628.00
    // 300 - مخزن السليم 2: كميات 108, تكلفة 7236.00
    // qParts was "37  84  108"
    // cParts was "2479.00  5628.00  7236.00"
    // So:
    // index 0 = المركز الرئيسي (100)
    // index 1 = فرع الرواف (200)
    // index 2 = مخزن السليم 2 (300)

    const qtyMain = qParts[0] || 0;
    const qtyRawaf = qParts[1] || 0;
    const qtySulaim = qParts[2] || 0;

    const costMain = cParts[0] || 0;
    const costRawaf = cParts[1] || 0;
    const costSulaim = cParts[2] || 0;

    // Calculate unit cost
    let unitCost = 0;
    if (totalQty > 0) {
      unitCost = +(totalCost / totalQty).toFixed(2);
    } else if (costMain > 0 && qtyMain > 0) {
      unitCost = +(costMain / qtyMain).toFixed(2);
    } else if (costRawaf > 0 && qtyRawaf > 0) {
      unitCost = +(costRawaf / qtyRawaf).toFixed(2);
    } else if (costSulaim > 0 && qtySulaim > 0) {
      unitCost = +(costSulaim / qtySulaim).toFixed(2);
    }

    items.push({
      sku: skus[i].trim(),
      name: names[i].normalize('NFKD').trim(),
      unit: (units[i] || 'حبه').normalize('NFKD').trim(),
      qtyMain,
      costMain,
      qtyRawaf,
      costRawaf,
      qtySulaim,
      costSulaim,
      totalQty,
      totalCost,
      unitCost,
      pageNum
    });
  }

  return { pageNum, count: N, items };
}

async function main() {
  console.log('Loading PDF...');
  const parser = new PDFParse(uint8);
  await parser.load();
  const text = await parser.getText();
  console.log(`Loaded ${text.pages.length} pages.`);

  const allItems = [];
  const errors = [];

  // Pages 1 to 276 contain data items (Page 277 is the summary total)
  for (let p = 0; p < text.pages.length - 1; p++) {
    try {
      const res = parsePageText(text.pages[p].text, p + 1);
      if (res.error) {
        errors.push(res);
      } else {
        allItems.push(...res.items);
      }
    } catch (err) {
      errors.push({
        pageNum: p + 1,
        error: err.message,
        stack: err.stack
      });
    }
  }

  console.log(`Parsing finished. Extracted ${allItems.length} items. Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('First 5 errors:', errors.slice(0, 5));
  }

  // Calculate totals
  let sumQty = 0;
  let sumCost = 0;
  let sumQtyMain = 0, sumCostMain = 0;
  let sumQtyRawaf = 0, sumCostRawaf = 0;
  let sumQtySulaim = 0, sumCostSulaim = 0;

  for (const item of allItems) {
    sumQty += item.totalQty;
    sumCost += item.totalCost;
    sumQtyMain += item.qtyMain;
    sumCostMain += item.costMain;
    sumQtyRawaf += item.qtyRawaf;
    sumCostRawaf += item.costRawaf;
    sumQtySulaim += item.qtySulaim;
    sumCostSulaim += item.costSulaim;
  }

  console.log('==================================================');
  console.log('AUDIT TOTALS VS REPORT GRAND TOTALS:');
  console.log(`Report Grand Total Quantity: 38,662 | Sum of Parsed Items: ${sumQty}`);
  console.log(`Report Grand Total Cost: 2,289,429.14 SAR | Sum of Parsed Items: ${sumCost.toFixed(2)} SAR`);
  console.log('--------------------------------------------------');
  console.log(`100 - المركز الرئيسي: ${sumQtyMain} قطعة | ${sumCostMain.toFixed(2)} ر.س`);
  console.log(`200 - فرع الرواف: ${sumQtyRawaf} قطعة | ${sumCostRawaf.toFixed(2)} ر.س`);
  console.log(`300 - مخزن السليم 2 (كيا): ${sumQtySulaim} قطعة | ${sumCostSulaim.toFixed(2)} ر.س`);
  console.log('==================================================');

  // Save parsed inventory data to JSON
  const outputPath = path.join(__dirname, '../src/data/officialWarehouseInventory.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    metadata: {
      reportDate: '21/09/2026',
      source: 'بيانات المخزون كميات وتكاليف حسب الاصناف - درة السيارة لقطع غيار السيارات',
      auditor: 'فهد',
      totalPages: 277,
      totalItems: allItems.length,
      grandTotals: {
        totalQty: sumQty,
        totalCost: +sumCost.toFixed(2),
        mainBranch: { qty: sumQtyMain, cost: +sumCostMain.toFixed(2) },
        rawafBranch: { qty: sumQtyRawaf, cost: +sumCostRawaf.toFixed(2) },
        sulaimBranch: { qty: sumQtySulaim, cost: +sumCostSulaim.toFixed(2) }
      }
    },
    items: allItems
  }, null, 2));

  console.log(`Saved official warehouse inventory to ${outputPath}`);
}

main().catch(err => console.error(err));
