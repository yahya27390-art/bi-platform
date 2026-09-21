const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:\\Users\\PC\\Desktop\\التقرير المخزون اخر نسخه.pdf';
const buf = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(buf);

function parsePageText(text, pageNum) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Find where SKUs start. Header lines:
  // 0: بيانات المخزون...
  // 1: 1 - درة السيارة...
  // 2: Tele No
  // 3: Fax No
  // 4: P.O.Box...
  // 5: طبع بواسطة...
  let skuStartIdx = -1;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (/\d+\s*\/\s*277/.test(lines[i])) {
      skuStartIdx = i + 1;
      break;
    }
  }
  if (skuStartIdx === -1) {
    return { error: 'Header not found: ' + lines.slice(0, 7).join(' | '), pageNum };
  }

  // Next is block of SKUs until we hit numbers with tabs (quantities)
  let qtyStartIdx = -1;
  const skus = [];
  for (let i = skuStartIdx; i < lines.length; i++) {
    const line = lines[i];
    // Check if line is 3 tab-separated or space-separated numbers like "0\t0\t0" or "37\t84\t108"
    if (/^\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/.test(line) && !line.includes('-')) {
      qtyStartIdx = i;
      break;
    }
    skus.push(line);
  }

  const N = skus.length;
  if (N === 0) return { error: 'No SKUs found', pageNum };

  // After skus, exactly N quantity lines
  const branchQtys = [];
  for (let i = qtyStartIdx; i < qtyStartIdx + N; i++) {
    branchQtys.push(lines[i]);
  }

  // After quantities, exactly N item names
  const nameStartIdx = qtyStartIdx + N;
  const names = [];
  for (let i = nameStartIdx; i < nameStartIdx + N; i++) {
    names.push(lines[i]);
  }

  // After names, exactly N unit lines (or unit header)
  let unitStartIdx = nameStartIdx + N;
  const units = [];
  for (let i = unitStartIdx; i < unitStartIdx + N; i++) {
    units.push(lines[i]);
  }

  // Find where branch costs start. We skip table headers like 'اسم الصنف', 'الوحدة', 'رقم الصنف', 'المخزن', etc.
  let costStartIdx = unitStartIdx + N;
  while (costStartIdx < lines.length && !/^\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/.test(lines[costStartIdx])) {
    costStartIdx++;
  }

  const branchCosts = [];
  for (let i = costStartIdx; i < costStartIdx + N; i++) {
    branchCosts.push(lines[i]);
  }

  // Next is total quantities: N numbers
  const totQtyStartIdx = costStartIdx + N;
  const totalQtys = [];
  for (let i = totQtyStartIdx; i < totQtyStartIdx + N; i++) {
    totalQtys.push(lines[i]);
  }

  // Next is header like 'التكلفة كميات...' then total costs: N numbers
  let totCostStartIdx = totQtyStartIdx + N;
  while (totCostStartIdx < lines.length && !/^\d+[\d,]*\.\d{2}$/.test(lines[totCostStartIdx].replace(/,/g, ''))) {
    totCostStartIdx++;
  }

  const totalCosts = [];
  for (let i = totCostStartIdx; i < totCostStartIdx + N; i++) {
    totalCosts.push(lines[i]);
  }

  return {
    pageNum,
    count: N,
    skus,
    branchQtys,
    names,
    branchCosts,
    totalQtys,
    totalCosts
  };
}

async function run() {
  const parser = new PDFParse(uint8);
  await parser.load();
  const text = await parser.getText();
  
  console.log(`Checking first 10 pages out of ${text.pages.length}:`);
  for (let p = 0; p < 10; p++) {
    const res = parsePageText(text.pages[p].text, p + 1);
    if (res.error) {
      console.log(`Page ${p+1} ERROR:`, res.error);
    } else {
      console.log(`Page ${p+1}: ${res.count} items. First SKU: ${res.skus[0]} -> ${res.names[0]} | Qty: ${res.totalQtys[0]} | Cost: ${res.totalCosts[0]}`);
    }
  }

  // Also check last page (page 277)
  console.log('--- Last page (277) raw text: ---');
  console.log(text.pages[276].text);
}

run();
