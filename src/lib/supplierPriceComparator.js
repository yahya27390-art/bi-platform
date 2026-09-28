// ============================================================
// SUPPLIER PRICE COMPARATOR ENGINE — DORA CARS BI PLATFORM
// Part Number Normalization (Removing '-' and separators)
// Strict Category-to-Category Matching:
// - Korean (-K) is strictly compared against Korean stock ONLY
// - Mobis OEM (-M) is strictly compared against OEM stock ONLY
// 100% Deterministic Matching against 8,901 Official Inventory SKUs
// ============================================================

import { REAL_ALL_PARTS } from '../data/realInventoryData';
import husounData from '../data/husounQuotationData.json';
import badrAlWadiData from '../data/badrAlWadiQuotationData.json';
import miskData from '../data/miskQuotationData.json';
import * as XLSX from 'xlsx';

/**
 * Normalizes any part number / SKU by:
 * 1. Removing hyphens (-), spaces, underscores, dots, slashes, hash symbols
 * 2. Converting all characters to uppercase
 * 3. Trimming leading/trailing whitespace
 * 
 * Example:
 * '58101-2TA00-K' -> '581012TA00K'
 * '58101-2TA00-M' -> '581012TA00M'
 * '28201-2A701'   -> '282012A701'
 * '04300 2N100'   -> '043002N100'
 */
export function normalizePartNumber(code) {
  if (!code && code !== 0) return '';
  return String(code)
    .replace(/[-\s_.\/\\#]/g, '')
    .toUpperCase()
    .trim();
}

// Build pre-indexed fast lookup Maps for Korean vs OEM vs General parts
let _catalogMap = null;
let _koreanCatalogMap = null;
let _oemCatalogMap = null;
let _catalogBaseMap = null;

export function getCatalogLookupMaps() {
  if (!_catalogMap || !_koreanCatalogMap || !_oemCatalogMap) {
    _catalogMap = new Map();
    _koreanCatalogMap = new Map();
    _oemCatalogMap = new Map();
    _catalogBaseMap = new Map();

    REAL_ALL_PARTS.forEach((item) => {
      const normSku = normalizePartNumber(item.sku);
      if (!normSku) return;

      if (!_catalogMap.has(normSku)) {
        _catalogMap.set(normSku, item);
      }

      // Check if our inventory item is Korean aftermarket
      const isOurKorean =
        normSku.endsWith('K') ||
        normSku.includes('HIQ') ||
        normSku.includes('HI-Q') ||
        (item.name && item.name.includes('كوري'));

      if (isOurKorean) {
        _koreanCatalogMap.set(normSku, item);
        const baseKey = normSku.replace(/K$/, '').replace(/HIQ$/, '');
        if (!_koreanCatalogMap.has(baseKey + 'K')) {
          _koreanCatalogMap.set(baseKey + 'K', item);
        }
      } else {
        _oemCatalogMap.set(normSku, item);
        const baseKey = normSku.replace(/M$/, '');
        if (!_oemCatalogMap.has(baseKey)) {
          _oemCatalogMap.set(baseKey, item);
        }
      }

      // Base SKU without trailing K or M
      const baseSku = normSku.replace(/[KM]$/, '');
      if (baseSku && !_catalogBaseMap.has(baseSku)) {
        _catalogBaseMap.set(baseSku, item);
      }
    });
  }

  return {
    catalogMap: _catalogMap,
    koreanCatalogMap: _koreanCatalogMap,
    oemCatalogMap: _oemCatalogMap,
    catalogBaseMap: _catalogBaseMap
  };
}

/**
 * Compares quotation items against our official warehouse inventory
 * STRICT RULE: Korean items (-K) are compared ONLY with Korean stock!
 * OEM items (-M) are compared ONLY with OEM Mobis stock!
 * @param {Array} rawItems Array of { itemNo, partNumber, partName, supplierPrice, ... }
 * @returns {Object} { items, stats, quotationInfo }
 */
export function compareQuotationItems(rawItems, quotationInfo = null) {
  const { catalogMap, koreanCatalogMap, oemCatalogMap, catalogBaseMap } = getCatalogLookupMaps();
  const info = quotationInfo || badrAlWadiData.quotationInfo;

  // STRICT BUSINESS RULE: Exclude any items that are unavailable from the supplier or have no price
  // We compare only what is actually available for purchase from the supplier
  const validItems = (rawItems || []).filter((item) => {
    const rawPrice = Number(item.supplierPrice || item['السعر'] || item.price || 0);
    const itemNote = String(item.note || item['ملاحظة'] || item['ملاحظات'] || '');
    const isUnavailable = rawPrice <= 0 || itemNote.includes('غير متوفر') || itemNote.includes('غير متوفره') || itemNote.includes('لا يوجد');
    return !isUnavailable;
  });

  let matchedCount = 0;
  let cheaperCount = 0;
  let expensiveCount = 0;
  let equalCount = 0;
  let zeroCostCount = 0;
  let notInCatalogCount = 0;
  let inStockCount = 0;

  let totalSupplierValue = 0;
  let totalOurCostValue = 0;
  let totalSavingsOpportunity = 0;
  let totalExtraRisk = 0;

  // Grade-specific statistics
  let koreanTotalCount = 0;
  let koreanMatchedCount = 0;
  let koreanCheaperCount = 0;
  let koreanSavings = 0;

  let oemTotalCount = 0;
  let oemMatchedCount = 0;
  let oemCheaperCount = 0;
  let oemSavings = 0;

  const analyzedItems = validItems.map((item, idx) => {
    const rawPartNumber = String(item.partNumber || item['رقم القطعة'] || item.sku || '').trim();
    const cleanKey = normalizePartNumber(rawPartNumber);
    const supplierPrice = Number(item.supplierPrice || item['السعر'] || item.price || 0);
    const partName = String(item.partName || item['اسم القطعة'] || item.name || '').trim();
    const itemNo = idx + 1;
    const itemNote = String(item.note || item['ملاحظة'] || item['ملاحظات'] || '').trim();

    totalSupplierValue += supplierPrice;

    // Detect Product Grade (Korean vs OEM vs General)
    const isSupplierKorean =
      rawPartNumber.endsWith('-K') ||
      rawPartNumber.endsWith('K') ||
      partName.includes('كوري') ||
      rawPartNumber.includes('-K');

    const isSupplierOEM =
      rawPartNumber.endsWith('-M') ||
      rawPartNumber.endsWith('M') ||
      partName.includes('اصلي') ||
      partName.includes('أصلي') ||
      partName.includes('وكالة') ||
      rawPartNumber.includes('-M');

    const productGrade = isSupplierKorean ? 'korean' : isSupplierOEM ? 'oem' : 'general';
    const productGradeLabel = isSupplierKorean ? 'كوري (بديل)' : isSupplierOEM ? 'أصلي وكالة (موبيس)' : 'عام';

    let ourMatch = null;
    let matchType = 'none';

    // ─── STRICT RULE EXECUTION ───
    if (isSupplierKorean) {
      // 1. MUST ONLY match against Korean aftermarket inventory
      ourMatch = koreanCatalogMap.get(cleanKey);
      if (!ourMatch) {
        const baseKey = cleanKey.replace(/K$/, '');
        ourMatch = koreanCatalogMap.get(baseKey + 'K');
      }
      if (ourMatch) matchType = 'korean-to-korean';
    } else if (isSupplierOEM) {
      // 2. MUST ONLY match against Mobis OEM original inventory
      const cleanOEM = cleanKey.replace(/M$/, '');
      ourMatch = oemCatalogMap.get(cleanOEM);
      if (!ourMatch) {
        ourMatch = oemCatalogMap.get(cleanOEM + 'M');
      }
      if (ourMatch) matchType = 'oem-to-oem';
    } else {
      // 3. General item (e.g. Diesel parts in Husoun / Misk quotation)
      ourMatch = catalogMap.get(cleanKey);
      if (!ourMatch) {
        const baseKey = cleanKey.replace(/[KM]$/, '');
        ourMatch = catalogBaseMap.get(baseKey);
      }
      if (ourMatch) matchType = 'exact-general';
    }

    if (ourMatch) {
      matchedCount++;
      const ourCost = Number(ourMatch.unitCost || 0);
      const totalQty = Number(ourMatch.balance || ourMatch.totalQty || 0);

      if (totalQty > 0) inStockCount++;
      if (ourCost > 0) totalOurCostValue += ourCost;

      let diff = null;
      let diffPercent = null;
      let savingsAmount = 0;
      let extraAmount = 0;
      let verdict = 'equal';
      let verdictLabel = 'سعر متطابق';
      let verdictColor = 'slate';

      if (ourCost === 0) {
        verdict = 'zero_cost';
        verdictLabel = 'تكلفتنا مسجلة 0';
        verdictColor = 'amber';
        zeroCostCount++;
      } else {
        diff = supplierPrice - ourCost;
        diffPercent = ((supplierPrice - ourCost) / ourCost) * 100;

        if (supplierPrice < ourCost) {
          verdict = 'cheaper';
          verdictLabel = 'أرخص من تكلفتنا (وفر)';
          verdictColor = 'emerald';
          cheaperCount++;
          savingsAmount = ourCost - supplierPrice;
          totalSavingsOpportunity += savingsAmount;
        } else if (supplierPrice > ourCost) {
          verdict = 'expensive';
          verdictLabel = 'أغلى من تكلفتنا';
          verdictColor = 'rose';
          expensiveCount++;
          extraAmount = supplierPrice - ourCost;
          totalExtraRisk += extraAmount;
        } else {
          equalCount++;
        }
      }

      if (isSupplierKorean) {
        koreanTotalCount++;
        koreanMatchedCount++;
        if (supplierPrice < ourCost && ourCost > 0) {
          koreanCheaperCount++;
          koreanSavings += (ourCost - supplierPrice);
        }
      } else if (isSupplierOEM) {
        oemTotalCount++;
        oemMatchedCount++;
        if (supplierPrice < ourCost && ourCost > 0) {
          oemCheaperCount++;
          oemSavings += (ourCost - supplierPrice);
        }
      }

      return {
        id: itemNo,
        itemNo,
        supplierPartNumber: rawPartNumber,
        normalizedPartNumber: cleanKey,
        supplierPartName: partName,
        supplierPrice,
        isAvailable: true,
        itemNote,
        productGrade,
        productGradeLabel,
        matched: true,
        matchType,
        ourSku: ourMatch.sku,
        ourName: ourMatch.name,
        ourUnitCost: ourCost,
        ourTotalQty: totalQty,
        ourQtyMain: Number(ourMatch.qtyMain || 0),
        ourQtyRawaf: Number(ourMatch.qtyRawaf || 0),
        ourQtySulaim: Number(ourMatch.qtySulaim || 0),
        ourCategory: ourMatch.category || (isSupplierKorean ? 'فحمات كوري' : 'فحمات فرامل'),
        ourBrand: ourMatch.brand || (isSupplierKorean ? 'korean' : 'mobis'),
        diff,
        diffPercent,
        savingsAmount,
        extraAmount,
        verdict,
        verdictLabel,
        verdictColor,
        status: ourMatch.status || (totalQty > 0 ? 'in_stock' : 'out_of_stock')
      };
    } else {
      notInCatalogCount++;
      if (isSupplierKorean) {
        koreanTotalCount++;
      } else if (isSupplierOEM) {
        oemTotalCount++;
      }

      const notFoundLabel = isSupplierKorean
        ? 'غير متوفر كوري بمخزوننا (صنف جديد)'
        : isSupplierOEM
        ? 'غير مسجل كأصلي بالكتالوج'
        : 'صنف غير مسجل بالكتالوج';

      return {
        id: itemNo,
        itemNo,
        supplierPartNumber: rawPartNumber,
        normalizedPartNumber: cleanKey,
        supplierPartName: partName,
        supplierPrice,
        isAvailable: true,
        itemNote,
        productGrade,
        productGradeLabel,
        matched: false,
        matchType: 'none',
        ourSku: null,
        ourName: notFoundLabel,
        ourUnitCost: null,
        ourTotalQty: 0,
        ourQtyMain: 0,
        ourQtyRawaf: 0,
        ourQtySulaim: 0,
        ourCategory: isSupplierKorean ? 'فحمات فرامل كوري' : 'فحمات فرامل أصلي',
        ourBrand: isSupplierKorean ? 'korean' : 'mobis',
        diff: null,
        diffPercent: null,
        savingsAmount: 0,
        extraAmount: 0,
        verdict: 'not_in_catalog',
        verdictLabel: notFoundLabel,
        verdictColor: 'purple',
        status: 'not_in_catalog'
      };
    }
  });

  const totalCount = analyzedItems.length;
  const matchRate = totalCount > 0 ? (matchedCount / totalCount) * 100 : 0;

  return {
    items: analyzedItems,
    quotationInfo: info,
    stats: {
      totalCount,
      matchedCount,
      matchRate: Math.round(matchRate * 10) / 10,
      notInCatalogCount,
      cheaperCount,
      expensiveCount,
      equalCount,
      zeroCostCount,
      inStockCount,
      totalSupplierValue,
      totalOurCostValue,
      totalSavingsOpportunity: Math.round(totalSavingsOpportunity * 100) / 100,
      totalExtraRisk: Math.round(totalExtraRisk * 100) / 100,
      koreanTotalCount,
      koreanMatchedCount,
      koreanCheaperCount,
      koreanSavings: Math.round(koreanSavings * 100) / 100,
      oemTotalCount,
      oemMatchedCount,
      oemCheaperCount,
      oemSavings: Math.round(oemSavings * 100) / 100
    }
  };
}

/**
 * Get preloaded Badr Al-Wadi Brake Pads quotation comparison
 */
export function getBadrAlWadiQuotationAnalysis() {
  return compareQuotationItems(badrAlWadiData.items, badrAlWadiData.quotationInfo);
}

/**
 * Get preloaded official Husoun quotation comparison
 */
export function getHusounQuotationAnalysis() {
  return compareQuotationItems(husounData.items, husounData.quotationInfo);
}

/**
 * Get preloaded official Misk quotation comparison (ارقام الديزل - عرض سعر 28.09.2026 - مسك)
 */
export function getMiskQuotationAnalysis() {
  return compareQuotationItems(miskData.items, miskData.quotationInfo);
}

/**
 * Parse an uploaded PDF quotation file in the browser
 */
export async function parsePdfQuotationFile(file) {
  const pdfjsLib = await import('pdfjs-dist');

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      const pdfWorkerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerModule.default || pdfWorkerModule;
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.4.296'}/build/pdf.worker.min.mjs`;
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;

  let allLines = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const lineMap = new Map();
    tc.items.forEach((item) => {
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y).push(item);
    });
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    sortedY.forEach((y) => {
      const itemsInLine = lineMap.get(y).sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = itemsInLine.map((i) => i.str).join(' ').trim();
      if (lineText) allLines.push(lineText);
    });
  }

  const items = [];
  const partNumberRegex = /([0-9A-Z]{4,6}[-][0-9A-Z]{4,6}(?:[-][0-9A-Z]+)?)/i;
  const noDashPartRegex = /\b([0-9A-Z]{5}[0-9A-Z]{5,7})\b/i;

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    if (
      line.includes('Product Code') ||
      line.includes('Product Name') ||
      line.includes('Unit Price') ||
      line.includes('سعر الحبة') ||
      line.includes('اسم الصنف')
    ) {
      continue;
    }

    let match = line.match(partNumberRegex) || line.match(noDashPartRegex);
    if (match) {
      const partNumber = match[1];
      let rest = line.replace(partNumber, '').trim();
      let nextLine = (i + 1 < allLines.length) ? allLines[i + 1] : '';

      let price = null;
      let name = '';

      if (nextLine && !nextLine.match(partNumberRegex) && !nextLine.match(noDashPartRegex)) {
        const pricesInNext = nextLine.match(/(\d+\.\d{2}|\b\d{2,6}\b)/g);
        if (pricesInNext && pricesInNext.length > 0) {
          const candidatePrice = parseFloat(pricesInNext[pricesInNext.length - 1]);
          if (!isNaN(candidatePrice) && candidatePrice > 0) {
            price = candidatePrice;
            name = nextLine.replace(pricesInNext[pricesInNext.length - 1], '').replace(/^\d+\s*/, '').trim();
          }
        }
      }

      if (price === null) {
        const pricesInSame = rest.match(/(\d+\.\d{2}|\b\d{2,6}\b)/g);
        if (pricesInSame && pricesInSame.length > 0) {
          const candidatePrice = parseFloat(pricesInSame[pricesInSame.length - 1]);
          if (!isNaN(candidatePrice) && candidatePrice > 0) {
            price = candidatePrice;
            name = rest.replace(pricesInSame[pricesInSame.length - 1], '').trim();
          }
        }
      }

      if (partNumber && price !== null && price > 0) {
        items.push({
          id: items.length + 1,
          itemNo: items.length + 1,
          partNumber: partNumber.trim(),
          partName: name.trim() || 'صنف مسعر',
          supplierPrice: price
        });
      }
    }
  }

  if (items.length === 0) {
    throw new Error('لم نتمكن من استخراج أصناف وأسعار صالحة من ملف PDF. يرجى التأكد من أن الملف نصي يحتوي على أرقام قطع وأسعار.');
  }

  return items;
}

/**
 * Parse an uploaded Excel / CSV quotation file in the browser
 */
export async function parseExcelQuotationFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات.');
        }

        // Clean and normalize keys of all rows to eliminate hidden spaces (e.g. ' سعر البيع بالريال قبل الضريبة ')
        const normalizedJson = rawJson.map((row) => {
          const cleanRow = {};
          Object.keys(row).forEach((k) => {
            cleanRow[k.trim()] = row[k];
          });
          return cleanRow;
        });

        const firstRow = normalizedJson[0];
        const keys = Object.keys(firstRow);

        let partKey = keys.find((k) =>
          /رقم.*قطعة|كود.*صنف|رقم.*الصنف|رقم.*القطعه|^\s*p\s*[\/\\]?\s*n\s*$|part.*no|part.*num|sku|code/i.test(k)
        );
        let nameKey = keys.find((k) =>
          /اسم.*قطعة|بيان.*الصنف|اسم.*الصنف|وصف|^\s*desc\s*$|description|name|part.*name/i.test(k)
        );
        let priceKey = keys.find((k) =>
          /سعر.*البيع.*قبل.*الضريبة|سعر.*البيع|سعر.*قبل.*الضريبة|سعر|تكلفة|قيمة|price|cost|unit.*price|rate/i.test(k)
        );
        let notesKey = keys.find((k) =>
          /ملاحظة|ملاحظات|notes|remarks|status/i.test(k)
        );

        if (!partKey && keys.length >= 2) partKey = keys[1];
        if (!nameKey && keys.length >= 3) nameKey = keys[2];
        if (!priceKey && keys.length >= 4) priceKey = keys[3];

        if (!partKey) {
          throw new Error('لم نتمكن من العثور على عمود «رقم القطعة» أو «P/N» في الملف.');
        }

        const items = normalizedJson.map((row, idx) => {
          const rawPart = row[partKey] || '';
          let rawName = nameKey ? row[nameKey] : '';
          const rawPrice = priceKey ? parseFloat(String(row[priceKey]).replace(/[^0-9.]/g, '')) : 0;
          const rawNote = notesKey ? String(row[notesKey] || '').trim() : '';

          if ((!rawPrice || rawPrice === 0) && rawNote) {
            rawName = rawName ? `${rawName} (${rawNote})` : rawNote;
          }

          return {
            id: idx + 1,
            itemNo: row['م'] || row['#'] || idx + 1,
            partNumber: String(rawPart).trim(),
            partName: String(rawName || 'صنف مسعر').trim(),
            supplierPrice: isNaN(rawPrice) ? 0 : rawPrice,
            note: rawNote
          };
        })
        .filter((item) => {
          // Strictly exclude items with no price or explicitly marked as unavailable
          const hasPart = Boolean(item.partNumber);
          const hasPrice = item.supplierPrice > 0;
          const isUnavailable = item.note.includes('غير متوفر') || item.note.includes('غير متوفره') || item.note.includes('لا يوجد');
          return hasPart && hasPrice && !isUnavailable;
        })
        .map((item, idx) => ({
          ...item,
          id: idx + 1,
          itemNo: idx + 1
        }));

        resolve(items);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Universal quotation file parser: Automatically handles PDF, XLSX, XLS, and CSV
 */
export async function parseUploadedQuotationFile(file) {
  const fileName = file.name || '';
  const isPdf = /\.pdf$/i.test(fileName) || file.type === 'application/pdf';

  let items = [];
  if (isPdf) {
    items = await parsePdfQuotationFile(file);
  } else {
    items = await parseExcelQuotationFile(file);
  }

  const supplierName = fileName.replace(/\.[^/.]+$/, '').trim();
  const quotationInfo = {
    supplierName,
    quotationTitle: `تحليل عرض سعر: ${supplierName}`,
    quotationDate: new Date().toISOString().split('T')[0],
    month: 'مرفوع حديثاً',
    representative: 'ملف مرفوع بالمتصفح',
    fileName,
    category: isPdf ? 'عرض سعر PDF' : 'عرض سعر Excel',
    totalItemsCount: items.length
  };

  return compareQuotationItems(items, quotationInfo);
}

/**
 * Export comparison results to Excel (.xlsx) file
 */
export function exportComparisonToExcel(analyzedItems, quotationInfo) {
  const rows = analyzedItems.map((item) => ({
    'م': item.itemNo,
    'نوع القطعة': item.productGradeLabel || '--',
    'رقم القطعة عند المورد': item.supplierPartNumber,
    'الرقم المعتمد بمخزوننا (درة السيارة)': item.ourSku || '--',
    'اسم القطعة عند المورد': item.supplierPartName,
    'اسم الصنف بمخزوننا': item.ourName,
    'سعر المورد (ر.س)': item.supplierPrice,
    'تكلفتنا المعتمدة (ر.س)': item.ourUnitCost !== null ? item.ourUnitCost : '--',
    'فرق السعر (ر.س)': item.diff !== null ? item.diff : '--',
    'نسبة الفرق %': item.diffPercent !== null ? `${item.diffPercent.toFixed(1)}%` : '--',
    'التقييم': item.verdictLabel,
    'إجمالي رصيدنا المتوفر': item.ourTotalQty,
    'فرع المركز الرئيسي': item.ourQtyMain,
    'فرع الرواف': item.ourQtyRawaf,
    'فرع السليم': item.ourQtySulaim,
    'التصنيف': item.ourCategory
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'مقارنة الأسعار');

  const fileName = `مقارنة_أسعار_${quotationInfo.supplierName || 'المورد'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
