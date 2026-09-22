import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function testAllPages() {
  const buf = fs.readFileSync('C:/Users/PC/Desktop/التقرير المخزون اخر نسخه.pdf');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  console.log(`Document loaded with ${doc.numPages} pages.`);

  let totalSkus = 0;
  for (let p = 1; p <= doc.numPages - 1; p++) {
    const page = await doc.getPage(p);
    const text = await page.getTextContent();
    const skuItems = text.items.filter(it => 
      it.str.trim().length > 0 && 
      it.transform[5] > 1100 && 
      it.transform[4] > 130 && 
      it.transform[4] < 630 &&
      !it.str.includes('ﺭﻗﻡ') &&
      !it.str.includes('ﺍﻟﺻﻧﻑ')
    );
    totalSkus += skuItems.length;
    if (p <= 5 || p === 82 || p === 276) {
      console.log(`Page ${p}: found ${skuItems.length} SKUs at colX > 1100`);
    }
  }
  console.log(`Total SKUs extracted across pages 1..276: ${totalSkus}`);
}

testAllPages().catch(console.error);
