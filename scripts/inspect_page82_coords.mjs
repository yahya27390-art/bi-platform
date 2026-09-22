import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function run() {
  const buf = fs.readFileSync('C:/Users/PC/Desktop/التقرير المخزون اخر نسخه.pdf');
  const uint8 = new Uint8Array(buf);
  const loadingTask = pdfjs.getDocument({ data: uint8 });
  const pdfDoc = await loadingTask.promise;
  console.log('Total pages:', pdfDoc.numPages);
  
  const page = await pdfDoc.getPage(82);
  const textContent = await page.getTextContent();
  console.log('Page 82 items count:', textContent.items.length);
  
  const items = textContent.items.map(it => ({
    str: it.str.trim(),
    rowY: Math.round(it.transform[4] * 10) / 10,
    colX: Math.round(it.transform[5] * 10) / 10
  })).filter(it => it.str.length > 0);

  const targetItems = items.filter(it => it.rowY >= 560 && it.rowY <= 590);
  targetItems.sort((a, b) => a.rowY - b.rowY || b.colX - a.colX);

  console.log('--- Items in rowY 560 to 590 ---');
  for (const it of targetItems) {
    console.log(`rowY=${it.rowY}, colX=${it.colX}: ${it.str}`);
  }
}

run().catch(console.error);
