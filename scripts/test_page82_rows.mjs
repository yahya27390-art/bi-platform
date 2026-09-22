import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function testPage82Rows() {
  const buf = fs.readFileSync('C:/Users/PC/Desktop/التقرير المخزون اخر نسخه.pdf');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const page = await doc.getPage(82);
  const text = await page.getTextContent();
  
  const allItems = text.items.filter(it => it.str.trim().length > 0).map(it => ({
    str: it.str.trim(),
    rowY: Math.round(it.transform[4] * 10) / 10,
    colX: Math.round(it.transform[5] * 10) / 10
  }));

  // Find SKU anchors at colX > 1100 and rowY between 135 and 600
  const skuItems = allItems.filter(it => 
    it.colX > 1100 && 
    it.rowY >= 135 && 
    it.rowY <= 600 &&
    !it.str.includes('ﺭﻗﻡ') &&
    !it.str.includes('ﺍﻟﺻﻧﻑ')
  );
  skuItems.sort((a, b) => a.rowY - b.rowY);

  console.log(`Page 82 SKU anchors count: ${skuItems.length}`);

  const rows = [];
  for (let i = 0; i < skuItems.length; i++) {
    const curr = skuItems[i];
    const prev = skuItems[i - 1];
    const next = skuItems[i + 1];

    const minY = prev ? (prev.rowY + curr.rowY) / 2 : curr.rowY - 7;
    const maxY = next ? (curr.rowY + next.rowY) / 2 : curr.rowY + 7;

    const rowItems = allItems.filter(it => it.rowY >= minY && it.rowY < maxY);

    // Extract columns
    const sku = curr.str;
    
    // Name items: colX between 940 and 1100
    // Sort name items by colX descending (right to left for Arabic text order in PDF)
    const nameItems = rowItems.filter(it => it.colX >= 940 && it.colX <= 1100);
    nameItems.sort((a, b) => b.colX - a.colX);
    const name = nameItems.map(it => it.str).join(' ');

    // Unit items: colX between 915 and 940
    const unitItem = rowItems.find(it => it.colX >= 915 && it.colX < 940);
    const unit = unitItem ? unitItem.str.normalize('NFKD') : 'حبه';

    // Numbers
    // Qty 100: colX 865 - 900
    const q100Item = rowItems.find(it => it.colX >= 865 && it.colX < 905);
    const qty100 = q100Item ? parseInt(q100Item.str, 10) || 0 : 0;

    // Cost 100: colX 795 - 845
    const c100Item = rowItems.find(it => it.colX >= 795 && it.colX < 850);
    const cost100 = c100Item ? parseFloat(c100Item.str.replace(/,/g, '')) || 0 : 0;

    // Qty 200: colX 740 - 785
    const q200Item = rowItems.find(it => it.colX >= 740 && it.colX < 785);
    const qty200 = q200Item ? parseInt(q200Item.str, 10) || 0 : 0;

    // Cost 200: colX 670 - 720
    const c200Item = rowItems.find(it => it.colX >= 670 && it.colX < 720);
    const cost200 = c200Item ? parseFloat(c200Item.str.replace(/,/g, '')) || 0 : 0;

    // Qty 300: colX 620 - 660
    const q300Item = rowItems.find(it => it.colX >= 620 && it.colX < 660);
    const qty300 = q300Item ? parseInt(q300Item.str, 10) || 0 : 0;

    // Cost 300: colX 545 - 600
    const c300Item = rowItems.find(it => it.colX >= 545 && it.colX < 600);
    const cost300 = c300Item ? parseFloat(c300Item.str.replace(/,/g, '')) || 0 : 0;

    // Total Qty: colX 500 - 540
    const totQItem = rowItems.find(it => it.colX >= 500 && it.colX < 540);
    const totalQty = totQItem ? parseInt(totQItem.str, 10) || 0 : 0;

    // Total Cost: colX 400 - 480
    const totCItem = rowItems.find(it => it.colX >= 400 && it.colX < 480);
    const totalCost = totCItem ? parseFloat(totCItem.str.replace(/,/g, '')) || 0 : 0;

    rows.push({
      sku,
      name: name.normalize('NFKD'),
      unit,
      qty100, cost100,
      qty200, cost200,
      qty300, cost300,
      totalQty, totalCost,
      calcTotalQty: qty100 + qty200 + qty300,
      calcTotalCost: +(cost100 + cost200 + cost300).toFixed(2)
    });
  }

  console.log('--- Checking Last 5 Rows of Page 82 ---');
  for (const r of rows.slice(-5)) {
    console.log(JSON.stringify(r));
  }
}

testPage82Rows().catch(console.error);
