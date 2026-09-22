const fs = require('fs');

async function checkPage82() {
  const buf = fs.readFileSync('C:/Users/PC/Desktop/التقرير المخزون اخر نسخه.pdf');
  const uint8 = new Uint8Array(buf);
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  const loadingTask = pdfjsLib.getDocument({ data: uint8 });
  const pdfDoc = await loadingTask.promise;
  console.log('Total pages:', pdfDoc.numPages);
  
  const page = await pdfDoc.getPage(82);
  const textContent = await page.getTextContent();
  
  const items = textContent.items.map(it => ({
    str: it.str.trim(),
    x: Math.round(it.transform[4]),
    y: Math.round(it.transform[5])
  })).filter(it => it.str.length > 0);

  const linesMap = new Map();
  for (const it of items) {
    let matchedY = null;
    for (const k of linesMap.keys()) {
      if (Math.abs(k - it.y) <= 3) {
        matchedY = k;
        break;
      }
    }
    const targetY = matchedY !== null ? matchedY : it.y;
    if (!linesMap.has(targetY)) linesMap.set(targetY, []);
    linesMap.get(targetY).push(it);
  }
  
  const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);
  console.log('Page 82 Row count:', sortedYs.length);
  for (const y of sortedYs) {
    const lineItems = linesMap.get(y).sort((a, b) => b.x - a.x);
    const lineStr = lineItems.map(it => it.str).join('  |  ');
    console.log(`[Y=${y}] ${lineStr}`);
  }
}
checkPage82().catch(console.error);
