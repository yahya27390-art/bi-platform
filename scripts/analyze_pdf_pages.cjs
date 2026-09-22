const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function analyzeAllPages() {
  const buf = fs.readFileSync('C:/Users/PC/Desktop/التقرير المخزون اخر نسخه.pdf');
  const parser = new PDFParse(new Uint8Array(buf));
  await parser.load();
  const text = await parser.getText();
  
  let wrappedPages = 0;
  for (let p = 0; p < text.pages.length - 1; p++) {
    const lines = text.pages[p].text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let skuStartIdx = -1;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (/\d+\s*\/\s*277/.test(lines[i])) { skuStartIdx = i + 1; break; }
    }
    if (skuStartIdx === -1) continue;
    
    let qtyStartIdx = -1, qtyEndIdx = -1;
    for (let i = skuStartIdx; i < lines.length; i++) {
      if (/^\d+\s+\d+\s+\d+$/.test(lines[i])) {
        if (qtyStartIdx === -1) qtyStartIdx = i;
        qtyEndIdx = i;
      } else if (qtyStartIdx !== -1) {
        break;
      }
    }
    if (qtyStartIdx === -1) continue;
    const N = qtyEndIdx - qtyStartIdx + 1;
    
    let firstUnitIdx = -1;
    let unitCount = 0;
    for (let i = qtyStartIdx + N; i < lines.length; i++) {
      const norm = lines[i].normalize('NFKD');
      if (/^(حبه|طقم|متر|لتر|درزن|كرتون|برميل|علبه)$/.test(norm)) {
        if (firstUnitIdx === -1) firstUnitIdx = i;
        unitCount++;
      } else if (firstUnitIdx !== -1) {
        break;
      }
    }
    
    if (firstUnitIdx !== -1) {
      const nameLinesCount = firstUnitIdx - (qtyStartIdx + N);
      if (nameLinesCount !== N) {
        wrappedPages++;
        if (wrappedPages <= 10) {
          console.log(`Page ${p + 1}: expected N=${N}, but nameLinesCount=${nameLinesCount}, unitsCount=${unitCount}`);
        }
      }
    }
  }
  console.log(`Total wrapped/mismatched pages: ${wrappedPages}`);
}
analyzeAllPages().catch(console.error);
