/**
 * Corporate Quotations Storage & Management Engine
 * Seller: Dorat Cars Auto Spare Parts Co. (درة السيارة لقطع غيار السيارات)
 * Client Recipient: Alandimaj Alawwali For Cars Maintenance (شركة الاندماج الأولى لصيانة السيارات)
 * All item prices from Paper 2 are VAT-INCLUSIVE (شاملة ضريبة القيمة المضافة 15%)
 */

const STORAGE_KEY = 'dora_corporate_quotations_v10';

// Official Verified Data of Dorat Cars (from ZATCA VAT Registration Certificate)
export const OUR_COMPANY_VERIFIED = {
  companyName: 'شركة درة السيارة لقطع غيار السيارات',
  companyNameEn: 'Dorat Cars Auto Spare Parts Co.',
  crNumber: '1131303965',
  vatNumber: '311861381500003',
  unifiedNumber700: '7016475555',
  address: 'المملكة العربية السعودية · القصيم - بريدة · المنتزه، العام 52381',
  phone: '0539454377 - 0538834212',
  email: 'sales@doratcars.com',
  website: 'www.doratcars.com',
  bankName: 'مصرف الراجحي (Al Rajhi Bank)',
  iban: 'SA2680000108608010709658',
  accountNumber: '108000010006080709658',
  salesRep: 'إدارة مبيعات الشركات والأسطول'
};

// Target Client Company receiving the quote (Alandimaj Alawwali)
export const CLIENT_COMPANY_ALANDIMAJ = {
  name: 'شركة الاندماج الاولي لصيانة السيارات',
  nameEn: 'Alandimaj Alawwali For Cars Maintenance',
  vatNumber: '312765772600003',
  phone: '966553979299',
  addressEn: '7541Al Anbar AL TILIFZYUN DIST 55422',
  address: 'بريدة - الشارع التجاري (7541Al Anbar AL TILIFZYUN DIST 55422)',
  crNumber: '1131054321',
  attn: 'إدارة الصيانة والتشغيل'
};

// Complete Authentic 31 Items from Paper 2 with VAT-INCLUSIVE prices (شاملة الضريبة)
export const ITEMS_FROM_PAPER_TWO = [
  { id: 'item-1', sku: '86842-H6500', name: 'نسافة كفر خلفي يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 35 },
  { id: 'item-2', sku: '86841-H6500', name: 'نسافة كفر خلفي يسار وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 35 },
  { id: 'item-3', sku: '79210-H6000', name: 'فصالة باب شنطة يسار وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 135 },
  { id: 'item-4', sku: '79220-H6000', name: 'فصالة باب شنطة يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 135 },
  { id: 'item-5', sku: '69200-H6000', name: 'باب شنطة وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 950 },
  { id: 'item-6', sku: '92401-H6500', name: 'اسطب ركن يسار وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 750 },
  { id: 'item-7', sku: '92402-H6500', name: 'اسطب ركن يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 750 },
  { id: 'item-8', sku: '69100-H6000', name: 'صاجة تحت الشنطة وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 410 },
  { id: 'item-9', sku: '86610-H6510', name: 'صدام خلفي فوق وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 500 },
  { id: 'item-10', sku: '99310-H6000T2X', name: 'حساس صدام خلفي وكالة واحد', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 240 },
  { id: 'item-11', sku: '86614-H6000', name: 'كرسي صدام يسار وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 45 },
  { id: 'item-12', sku: '86613-H6000', name: 'كرسي صدام يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 45 },
  { id: 'item-13', sku: '92406-H6500', name: 'عاكس صدام خلفي يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 60 },
  { id: 'item-14', sku: '92405-H6500', name: 'عاكس صدام خلفي يسار وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 60 },
  { id: 'item-15', sku: '86612-H6500', name: 'لحية صدام خلفي وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 95 },
  { id: 'item-16', sku: '86679-H6510', name: 'زيق وسط الصدام وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 250 },
  { id: 'item-17', sku: '86675-H6510', name: 'زيق يمين الصدام وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 295 },
  { id: 'item-18', sku: '86676-H6510', name: 'زيق يسار الصدام وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 295 },
  { id: 'item-19', sku: '86672-H6500', name: 'ديكور صدام خلفي يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 45 },
  { id: 'item-20', sku: '86671-H6500', name: 'ديكور صدام خلفي يسار وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 45 },
  { id: 'item-21', sku: '97510-H6000', name: 'هواية رفرف خلفي يمين يسار العدد 2', brand: 'وكالة', unit: 'حبه', qty: 2, priceInclusive: 55 },
  { id: 'item-22', sku: '86511-H6500TH', name: 'صدام امامي تايلندي', brand: 'تايلندي', unit: 'حبه', qty: 1, priceInclusive: 220 },
  { id: 'item-23', sku: '86350-H6510T', name: 'شبك امامي فوق تجاري', brand: 'تجاري', unit: 'حبه', qty: 1, priceInclusive: 150 },
  { id: 'item-24', sku: '29110-H6000', name: 'بطانة تحت الصدام وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 130 },
  { id: 'item-25', sku: '86513-H6000', name: 'كرسي صدام امامي يسار وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 35 },
  { id: 'item-26', sku: '86514-H6000', name: 'كرسي صدام امامي يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 35 },
  { id: 'item-27', sku: '86812-H6500', name: 'بطانة كفر امامي يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 80 },
  { id: 'item-28', sku: '56825-H6000', name: 'ذراع دركسون خارجي يمين وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 135 },
  { id: 'item-29', sku: '86562-H6520', name: 'ديكور كشاف يسار وكالة', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 135 },
  { id: 'item-30', sku: '55311-H5000', name: 'كرسي مساعد خلفي العدد 1', brand: 'وكالة', unit: 'حبه', qty: 1, priceInclusive: 220 },
  { id: 'item-31', sku: 'CLIPS-50', name: 'كلبسات بطانات كفر 50 حبه', brand: 'كلبس', unit: 'كيس', qty: 1, priceInclusive: 30 }
];

// Official Quotation Issued by Dorat Cars to Alandimaj Alawwali
export const DORA_TO_ALANDIMAJ_QUOTATION = {
  id: 'QUO-00834',
  quoteNumber: '00834',
  issueDate: '2026-10-17',
  validUntil: '2026-10-21',
  validDays: 4,
  status: 'APPROVED',
  workOrderNo: '00268224',
  branch: 'بريدة',
  isTaxInclusive: true, // Prices in quotation are tax-inclusive
  paymentTerms: 'تحويل بنكي / نقدي عند الاستلام - آجل 30 يوماً للشركات المعتمدة',
  deliveryTerms: 'تسليم فوري بمستودعات درة للسيارات بريدة أو توصيل لمقر الشركة',
  warrantyTerms: 'ضمان أصلي وكالة ضد عيوب الصناعة وفق سياسة درة للسيارات',
  notes: 'عرض سعر مقدم من شركة درة السيارة لقطع غيار السيارات إلى شركة الاندماج الأولى لصيانة السيارات. الأسعار شاملة ضريبة القيمة المضافة 15% وسارية لمدة 4 أيام من تاريخه.',

  // Our Company: Dorat Cars (Top of document with Logo)
  ourCompany: { ...OUR_COMPANY_VERIFIED },

  // Client Company receiving the quote: Alandimaj Alawwali
  clientCompany: { ...CLIENT_COMPANY_ALANDIMAJ },

  // Vehicle Details (Exactly matching Image 1)
  vehicle: {
    make: 'هيونداي',
    model: 'أكسنت',
    year: '2022',
    plate: 'ر د ص - 6651',
    vin: 'MALC741B4PM337075',
    odometer: '136,369 كم',
    branch: 'بريدة',
    workOrderNo: '00268224'
  },

  clientContact: {
    name: 'م. فهد التويجري / إدارة الصيانة',
    mobile: '966553979299',
    jobTitle: 'مسؤول الحركة والصيانة'
  },

  // The 31 Items from Paper 2
  items: [...ITEMS_FROM_PAPER_TWO]
};

// Complete Authentic 23 Items for Hyundai Azera 2026 (from Dora handwritten slips 1 & 2)
export const ITEMS_AZERA_2026 = [
  { id: 'azera-1', sku: '25310-L8020', name: 'رديتر ماء ازيرا 26 اصلي', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 1150 },
  { id: 'azera-2', sku: '97606-N1100', name: 'رديتر مكيف ازيرا 26 اصلي', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 1350 },
  { id: 'azera-3', sku: '54500-N1000', name: 'مقص يسار ازيرا 26 اصلي', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 750 },
  { id: 'azera-4', sku: '54650-N1000', name: 'مساعد امامي يسار ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 680 },
  { id: 'azera-5', sku: '54830-L1000', name: 'مسمار توازن ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 130 },
  { id: 'azera-6', sku: '51730-L1000', name: 'فلنجة امامي ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 700 },
  { id: 'azera-7', sku: '56820-L2000', name: 'ذراع خارجي يسار ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 130 },
  { id: 'azera-8', sku: '64101-N1000', name: 'واجهة ازيرا 26 اصلي', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 1150 },
  { id: 'azera-9', sku: '86812-N1010', name: 'بطانة كفر يمين ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 300 },
  { id: 'azera-10', sku: '66310-N1000', name: 'رفرف امامي يسار ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 1500 },
  { id: 'azera-11', sku: '29135-N1500', name: 'ديكور رديتر', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 190 },
  { id: 'azera-12', sku: '29135-N1000', name: 'ديكور رديتر فوق', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 260 },
  { id: 'azera-13', sku: '291B0-N1000', name: 'ديكور رديتر تحت', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 280 },
  { id: 'azera-14', sku: '86552-N1000', name: 'كرسي صدام امامي يمين ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 60 },
  { id: 'azera-15', sku: '86551-N1000', name: 'كرسي صدام امامي يسار ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 60 },
  { id: 'azera-16', sku: '99310-N1100CA', name: 'حساس صدام امامي ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 4, priceInclusive: 260 },
  { id: 'azera-17', sku: '99310-N1200A2B', name: 'حساس صدام جانبي ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 2, priceInclusive: 290 },
  { id: 'azera-18', sku: '92101-N1150', name: 'شمعة يسار ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 3700 },
  { id: 'azera-19', sku: '92209-N1100', name: 'لد طويل ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 8500 },
  { id: 'azera-20', sku: '865E2-N1000', name: 'كرسي صدام امامي جانبي يمين (عظمة صدام يمين) ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 70 },
  { id: 'azera-21', sku: '865E1-N1000', name: 'كرسي صدام امامي جانبي يسار (عظمة صدام يسار) ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 70 },
  { id: 'azera-22', sku: '91890-N1070', name: 'ضفيرة صدام امامي / حساسات ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 650 },
  { id: 'azera-23', sku: '86811-N1010', name: 'بطانة كفر امامي يسار ازيرا 26', brand: 'أصلي وكالة', unit: 'حبه', qty: 1, priceInclusive: 300 }
];

// Official Quotation Issued for Hyundai Azera 2026 (#009695)
export const DORA_TO_AZERA_2026_QUOTATION = {
  id: 'QUO-009695',
  quoteNumber: '009695',
  issueDate: '2026-10-22',
  validUntil: '2026-10-26',
  validDays: 4,
  status: 'APPROVED',
  workOrderNo: '—',
  branch: 'بريدة',
  isTaxInclusive: true,
  paymentTerms: 'تحويل بنكي / نقدي عند الاستلام - آجل 30 يوماً للشركات المعتمدة',
  deliveryTerms: 'تسليم فوري بمستودعات درة للسيارات بريدة أو توصيل لمقر العميل',
  warrantyTerms: 'ضمان أصلي وكالة هيونداي ضد عيوب الصناعة وفق سياسة درة للسيارات',
  notes: 'عرض سعر مقدم من شركة درة السيارة لقطع غيار السيارات لـ زبون ازيرا 2026. الأسعار شاملة ضريبة القيمة المضافة 15% وسارية لمدة 4 أيام من تاريخه.',
  ourCompany: { ...OUR_COMPANY_VERIFIED },
  clientCompany: {
    name: 'زبون ازيرا 2026',
    nameEn: 'Corporate Account',
    vatNumber: '—',
    phone: '+966552338287',
    address: 'المملكة العربية السعودية · القصيم - بريدة',
    crNumber: '—',
    attn: 'إدارة الصيانة'
  },
  vehicle: {
    make: 'هونداي',
    model: 'ازيرا',
    year: '2026',
    plate: '—',
    vin: 'KMHN341E0TA128263',
    odometer: '—',
    branch: 'بريدة',
    workOrderNo: '—'
  },
  items: [...ITEMS_AZERA_2026]
};

import {
  saveCorporateQuotationToDatabase,
  fetchCorporateQuotationsFromDatabase,
  deleteCorporateQuotationFromDatabase
} from './supabaseClient.js';

export function getSavedQuotations() {
  const defaultList = [DORA_TO_AZERA_2026_QUOTATION, DORA_TO_ALANDIMAJ_QUOTATION];
  if (typeof window === 'undefined') return defaultList;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure Azera 2026 quote exists with full 23 items
        const hasAzera = parsed.some(q => q.id === 'QUO-009695' || q.quoteNumber === '009695');
        if (!hasAzera) {
          parsed.unshift(DORA_TO_AZERA_2026_QUOTATION);
          saveQuotations(parsed);
          return parsed;
        } else {
          // If Azera quote exists but has fewer than 23 items, update it with complete items
          const azeraIdx = parsed.findIndex(q => q.id === 'QUO-009695' || q.quoteNumber === '009695');
          if (azeraIdx !== -1 && (parsed[azeraIdx].items?.length || 0) < 23) {
            parsed[azeraIdx] = {
              ...parsed[azeraIdx],
              ...DORA_TO_AZERA_2026_QUOTATION,
              items: [...ITEMS_AZERA_2026]
            };
            saveQuotations(parsed);
          }
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Error reading saved quotations:', err);
  }
  saveQuotations(defaultList);
  return defaultList;
}

function parseTimestamp(dateVal) {
  if (!dateVal) return 0;
  if (typeof dateVal === 'number') return dateVal;
  const str = String(dateVal).trim().replace(' ', 'T');
  const parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}

export function saveQuotations(quotes) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    window.dispatchEvent(new CustomEvent('dora-quotes-updated', { detail: quotes }));
  } catch (err) {
    console.warn('Error saving quotations:', err);
  }
}

const HOSTINGER_API_URL = typeof window !== 'undefined' && window.location.hostname === 'bi.doracar.com'
  ? '/api/corporate_quotations.php'
  : 'https://bi.doracar.com/api/corporate_quotations.php';

async function fetchFromHostingerServer() {
  try {
    const res = await fetch(HOSTINGER_API_URL, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.quotes) ? data.quotes : [];
  } catch (err) {
    console.warn('Hostinger API fetch notice:', err);
    return [];
  }
}

async function saveToHostingerServer(quote) {
  try {
    const res = await fetch(HOSTINGER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', quote })
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data?.success || false;
  } catch (err) {
    console.warn('Hostinger API save notice:', err);
    return false;
  }
}

async function deleteFromHostingerServer(id) {
  try {
    const res = await fetch(HOSTINGER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id })
    });
    return res.ok;
  } catch (err) {
    console.warn('Hostinger API delete notice:', err);
    return false;
  }
}

/**
 * Asynchronously syncs quotations with Hostinger Server & Supabase Cloud
 */
export async function syncQuotationsFromDatabase() {
  try {
    // 1. Fetch from Hostinger Server
    const serverQuotes = await fetchFromHostingerServer();
    
    // 2. Fetch from Supabase
    const dbQuotes = await fetchCorporateQuotationsFromDatabase();
    
    const allRemote = [...(serverQuotes || []), ...(dbQuotes || [])];
    
    if (allRemote.length > 0) {
      const localQuotes = getSavedQuotations();
      const localMap = new Map(localQuotes.map(q => [q.id, q]));
      
      allRemote.forEach(remote => {
        if (!remote || !remote.id) return;
        const existing = localMap.get(remote.id);
        const remoteTime = parseTimestamp(remote.updatedAt || remote.createdAt);
        const existingTime = existing ? parseTimestamp(existing.updatedAt || existing.createdAt) : 0;

        if (!existing || remoteTime > existingTime) {
          localMap.set(remote.id, remote);
        }
      });

      const merged = Array.from(localMap.values());
      saveQuotations(merged);
      return merged;
    }
  } catch (err) {
    console.warn('syncQuotationsFromDatabase notice:', err);
  }
  return getSavedQuotations();
}

export async function upsertQuotation(quote) {
  const all = getSavedQuotations();
  const index = all.findIndex(q => q.id === quote.id);
  const now = new Date().toISOString();
  let updatedQuote;

  if (index >= 0) {
    updatedQuote = { ...quote, updatedAt: now };
    all[index] = updatedQuote;
  } else {
    updatedQuote = { ...quote, createdAt: quote.createdAt || now, updatedAt: now };
    all.unshift(updatedQuote);
  }
  saveQuotations(all);

  // 1. Sync to Hostinger Server (awaited for data integrity)
  try {
    await saveToHostingerServer(updatedQuote);
  } catch (err) {
    console.warn('Hostinger save notice:', err);
  }

  // 2. Sync to Supabase in background
  saveCorporateQuotationToDatabase(updatedQuote).catch(err => {
    console.warn('Background Supabase save notice:', err);
  });

  return updatedQuote;
}

export async function deleteQuotation(id) {
  const all = getSavedQuotations();
  const filtered = all.filter(q => q.id !== id);
  saveQuotations(filtered);

  // 1. Delete from Hostinger Server
  try {
    await deleteFromHostingerServer(id);
  } catch (err) {
    console.warn('Hostinger delete notice:', err);
  }

  // 2. Delete from Supabase
  deleteCorporateQuotationFromDatabase(id).catch(err => {
    console.warn('Background Supabase delete notice:', err);
  });

  return filtered;
}

export function generateQuoteNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `00${rand}`;
}

/**
 * Creates a new blank quotation template ready for any employee to customize
 */
export function createBlankQuotation() {
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const validUntilDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const qNum = generateQuoteNumber();

  return {
    id: `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    quoteNumber: qNum,
    issueDate,
    validUntil: validUntilDate,
    validDays: 4,
    status: 'DRAFT',
    workOrderNo: '',
    branch: 'بريدة',
    isTaxInclusive: true,
    paymentTerms: 'تحويل بنكي / نقدي عند الاستلام - آجل 30 يوماً للشركات المعتمدة',
    deliveryTerms: 'تسليم فوري بمستودعات درة للسيارات بريدة أو توصيل لمقر الشركة',
    warrantyTerms: 'ضمان أصلي وكالة ضد عيوب الصناعة وفق سياسة درة للسيارات',
    notes: 'عرض سعر مقدم من شركة درة السيارة لقطع غيار السيارات. الأسعار شاملة ضريبة القيمة المضافة 15% وسارية لمدة 4 أيام من تاريخه.',

    // Our Company verified Dorat Cars data prefilled
    ourCompany: { ...OUR_COMPANY_VERIFIED },

    // Empty Client Company ready to fill
    clientCompany: {
      name: '',
      nameEn: '',
      vatNumber: '',
      phone: '',
      address: '',
      addressEn: '',
      crNumber: '',
      attn: ''
    },

    // Empty Vehicle ready to fill
    vehicle: {
      make: '',
      model: '',
      year: new Date().getFullYear().toString(),
      plate: '',
      vin: '',
      odometer: '',
      branch: 'بريدة',
      workOrderNo: ''
    },

    clientContact: {
      name: '',
      mobile: '',
      jobTitle: ''
    },

    items: []
  };
}

/**
 * Creates a duplicate copy of an existing quotation with a new quote number
 */
export function duplicateQuotation(sourceQuote) {
  const blank = createBlankQuotation();
  return {
    ...sourceQuote,
    id: blank.id,
    quoteNumber: blank.quoteNumber,
    issueDate: blank.issueDate,
    validUntil: blank.validUntil,
    validDays: 4,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: (sourceQuote.items || []).map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`
    }))
  };
}
