import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { REAL_ALL_PARTS } from '../data/realInventoryData';
import { normalizePartNumber } from './supplierPriceComparator';
import {
  getAllInventoryParts,
  getAllPartsMap,
  registerInventoryItemIfNotExists
} from './customInventoryStore';

// ─── CONSTANTS & CONFIGURATION ───
export const BRANCH_KEYS = {
  MAIN: 'main',
  RAWAF: 'rawaf',
  KIA: 'kia'
};

export const BRANCH_META = {
  [BRANCH_KEYS.MAIN]: {
    id: BRANCH_KEYS.MAIN,
    name: 'الفرع الرئيسي',
    fullName: 'المركز الرئيسي — بريدة',
    badge: 'المركز الرئيسي',
    icon: '🏢',
    accentColor: 'blue',
    theme: {
      activeTab: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40',
      activeTabDark: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/30',
      inactiveTab: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-750 hover:text-blue-700 dark:hover:text-blue-300',
      badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
      cardBorder: 'border-t-4 border-t-blue-500',
      cardRing: 'ring-1 ring-blue-500/20',
      submitBtn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 ring-blue-400/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      pillBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    }
  },
  [BRANCH_KEYS.RAWAF]: {
    id: BRANCH_KEYS.RAWAF,
    name: 'فرع الرواف',
    fullName: 'فرع الرواف — قطع غيار ومستودع',
    badge: 'مستودع الرواف',
    icon: '📍',
    accentColor: 'amber',
    theme: {
      activeTab: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/40',
      activeTabDark: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400/50 shadow-lg shadow-amber-600/30 ring-2 ring-amber-400/30',
      inactiveTab: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-750 hover:text-amber-700 dark:hover:text-amber-300',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
      cardBorder: 'border-t-4 border-t-amber-500',
      cardRing: 'ring-1 ring-amber-500/20',
      submitBtn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 ring-amber-400/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      pillBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    }
  },
  [BRANCH_KEYS.KIA]: {
    id: BRANCH_KEYS.KIA,
    name: 'فرع كيا',
    fullName: 'فرع قطع غيار كيا وهيونداي',
    badge: 'كيا وهيونداي',
    icon: '🚗',
    accentColor: 'rose',
    theme: {
      activeTab: 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-500 shadow-md shadow-rose-500/30 ring-2 ring-rose-400/40',
      activeTabDark: 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-400/50 shadow-lg shadow-rose-600/30 ring-2 ring-rose-400/30',
      inactiveTab: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-750 hover:text-rose-700 dark:hover:text-rose-300',
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
      cardBorder: 'border-t-4 border-t-rose-500',
      cardRing: 'ring-1 ring-rose-500/20',
      submitBtn: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 ring-rose-400/20',
      textColor: 'text-rose-600 dark:text-rose-400',
      pillBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    }
  }
};

export const PRIORITY_LEVELS = {
  NORMAL: { id: 'NORMAL', label: 'عادي', color: 'slate', badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  URGENT: { id: 'URGENT', label: 'عاجل جداً', color: 'amber', badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800' },
  CUSTOMER_REQUEST: { id: 'CUSTOMER_REQUEST', label: 'طلب عميل خاص', color: 'rose', badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-800' }
};

const STORAGE_KEY = 'dora_branch_shortages_store_v1';

// Initial seed helper
function createNewBatch(branchKey, batchNumber = 1) {
  const branchName = BRANCH_META[branchKey]?.name || branchKey;
  return {
    id: `batch_${branchKey}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    branchKey,
    batchNumber,
    title: `قائمة نواقص ${branchName} — دورة طلب رقم #${batchNumber}`,
    status: 'ACTIVE', // 'ACTIVE' | 'ORDERED'
    createdAt: new Date().toISOString(),
    orderedAt: null,
    orderedByName: null,
    orderedByUsername: null,
    supplierNotes: '',
    items: []
  };
}

// ─── LOCAL STORAGE MANAGEMENT ───
export function getBranchShortagesStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        // Ensure all 3 branches exist
        Object.keys(BRANCH_META).forEach((key) => {
          if (!data[key] || !Array.isArray(data[key])) {
            data[key] = [createNewBatch(key, 1)];
          }
        });
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading branch shortages store from localStorage:', err);
  }

  // Default empty state
  const initialStore = {
    [BRANCH_KEYS.MAIN]: [createNewBatch(BRANCH_KEYS.MAIN, 1)],
    [BRANCH_KEYS.RAWAF]: [createNewBatch(BRANCH_KEYS.RAWAF, 1)],
    [BRANCH_KEYS.KIA]: [createNewBatch(BRANCH_KEYS.KIA, 1)]
  };
  saveBranchShortagesStore(initialStore);
  return initialStore;
}

export function saveBranchShortagesStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving branch shortages store to localStorage:', err);
  }
}

// ─── ACTIVE BATCH HELPERS ───
export function getActiveBatchForBranch(branchKey) {
  const store = getBranchShortagesStore();
  const branchBatches = store[branchKey] || [];
  // Find active batch or create one if none exists
  let active = branchBatches.find((b) => b.status === 'ACTIVE');
  if (!active) {
    const nextBatchNum = branchBatches.length + 1;
    active = createNewBatch(branchKey, nextBatchNum);
    branchBatches.unshift(active);
    store[branchKey] = branchBatches;
    saveBranchShortagesStore(store);
  }
  return active;
}

export function getAllBatchesForBranch(branchKey) {
  const store = getBranchShortagesStore();
  return store[branchKey] || [];
}

// ─── ITEM OPERATIONS (AUTO-SAVE) ───
export function addShortageItem(branchKey, itemData, currentUser) {
  const store = getBranchShortagesStore();
  const branchBatches = store[branchKey] || [];
  let activeBatchIndex = branchBatches.findIndex((b) => b.status === 'ACTIVE');

  if (activeBatchIndex === -1) {
    const nextNum = branchBatches.length + 1;
    const newBatch = createNewBatch(branchKey, nextNum);
    branchBatches.unshift(newBatch);
    activeBatchIndex = 0;
  }

  const cleanPartNumber = (itemData.partNumber || '').trim();
  const cleanPartName = (itemData.partName || '').trim();
  const requestedQty = Math.max(1, parseInt(itemData.requestedQty, 10) || 1);

  // Automatically register newly encountered part into master inventory if it does not exist
  const registration = registerInventoryItemIfNotExists({
    sku: cleanPartNumber,
    name: cleanPartName,
    branchKey,
    staffName: currentUser?.name || 'موظف الفرع',
    notes: (itemData.notes || '').trim()
  });

  const finalPartName = cleanPartName || registration.item?.name || 'صنف غير مسمى';

  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    batchId: branchBatches[activeBatchIndex].id,
    branchKey,
    partNumber: cleanPartNumber,
    normalizedPartNumber: normalizePartNumber(cleanPartNumber),
    partName: finalPartName,
    requestedQty,
    priority: itemData.priority || 'NORMAL',
    notes: (itemData.notes || '').trim(),
    createdByName: currentUser?.name || 'موظف الفرع',
    createdByUsername: currentUser?.username || 'staff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isNewToInventory: !!registration.isNew
  };

  branchBatches[activeBatchIndex].items.unshift(newItem);
  store[branchKey] = branchBatches;
  saveBranchShortagesStore(store);

  // Sync to Cloud Supabase silently in background if configured
  syncItemToCloud(newItem).catch((e) => console.warn('Cloud sync background error:', e));

  return {
    store,
    newItem,
    activeBatch: branchBatches[activeBatchIndex],
    isNewToInventory: !!registration.isNew,
    registeredItem: registration.item
  };
}

export function updateShortageItem(branchKey, itemId, updates) {
  const store = getBranchShortagesStore();
  const branchBatches = store[branchKey] || [];
  const activeBatch = branchBatches.find((b) => b.status === 'ACTIVE');

  if (!activeBatch) return null;

  const itemIndex = activeBatch.items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return null;

  activeBatch.items[itemIndex] = {
    ...activeBatch.items[itemIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  store[branchKey] = branchBatches;
  saveBranchShortagesStore(store);
  return { store, updatedItem: activeBatch.items[itemIndex] };
}

/**
 * Check if a shortage item is still editable (within 1 hour / 60 minutes of creation)
 */
export function isItemEditable(item) {
  if (!item || !item.createdAt) return false;
  const itemTime = new Date(item.createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - itemTime) / (1000 * 60);
  return diffMinutes >= 0 && diffMinutes <= 60;
}

/**
 * Get remaining minutes to edit the item (out of 60 minutes)
 */
export function getRemainingEditMinutes(item) {
  if (!item || !item.createdAt) return 0;
  const itemTime = new Date(item.createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - itemTime) / (1000 * 60);
  const remaining = 60 - diffMinutes;
  return Math.max(0, Math.floor(remaining));
}

export function deleteShortageItem(branchKey, itemId) {
  const store = getBranchShortagesStore();
  const branchBatches = store[branchKey] || [];
  const activeBatch = branchBatches.find((b) => b.status === 'ACTIVE');

  if (!activeBatch) return null;

  activeBatch.items = activeBatch.items.filter((i) => i.id !== itemId);
  store[branchKey] = branchBatches;
  saveBranchShortagesStore(store);
  return store;
}

// ─── PURCHASING MANAGER DECISION: MARK AS ORDERED & SPAWN NEW BATCH ───
export function finalizeAndOrderBatch(branchKey, supplierNotes, managerUser) {
  const store = getBranchShortagesStore();
  const branchBatches = store[branchKey] || [];
  const activeBatchIndex = branchBatches.findIndex((b) => b.status === 'ACTIVE');

  if (activeBatchIndex === -1) return null;

  const currentBatch = branchBatches[activeBatchIndex];
  // 1. Lock the active batch
  currentBatch.status = 'ORDERED';
  currentBatch.orderedAt = new Date().toISOString();
  currentBatch.orderedByName = managerUser?.name || 'مدير المشتريات';
  currentBatch.orderedByUsername = managerUser?.username || 'manager';
  currentBatch.supplierNotes = (supplierNotes || '').trim();

  // 2. Spawn a new fresh ACTIVE batch for the branch
  const nextBatchNum = branchBatches.length + 1;
  const newActiveBatch = createNewBatch(branchKey, nextBatchNum);
  branchBatches.unshift(newActiveBatch);

  store[branchKey] = branchBatches;
  saveBranchShortagesStore(store);

  // Sync to Cloud Supabase silently in background
  syncBatchToCloud(currentBatch).catch((e) => console.warn('Cloud sync batch error:', e));

  return {
    store,
    orderedBatch: currentBatch,
    newActiveBatch
  };
}

// ─── AUTO-LOOKUP HELPER FROM MASTER CATALOG ───
export function lookupCatalogPart(inputQuery) {
  if (!inputQuery || inputQuery.trim().length < 2) return null;
  const norm = normalizePartNumber(inputQuery);
  const map = getAllPartsMap();
  const found = map.get(norm);

  if (found) {
    return {
      sku: found.sku,
      name: found.name,
      totalQty: found.totalQty || found.balance || 0,
      qtyMain: found.qtyMain || 0,
      qtyRawaf: found.qtyRawaf || 0,
      qtySulaim: found.qtySulaim || 0,
      unitCost: found.unitCost || 0,
      category: found.category || '',
      isCustomAdded: !!found.isCustomAdded
    };
  }
  return null;
}

// ─── SMART AUTOCOMPLETE SEARCH FOR PART NUMBERS ACROSS BRANCHES ───
export function searchCatalogParts(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const normQ = normalizePartNumber(query);
  const parts = getAllInventoryParts();

  const results = [];
  for (let i = 0; i < parts.length; i++) {
    const item = parts[i];
    const sNorm = normalizePartNumber(item.sku);
    const sSku = (item.sku || '').toLowerCase();
    const sName = (item.name || '').toLowerCase();

    if (
      sNorm.includes(normQ) ||
      sSku.includes(q) ||
      sName.includes(q)
    ) {
      results.push({
        sku: item.sku,
        name: item.name,
        totalQty: item.totalQty || item.balance || 0,
        qtyMain: item.qtyMain || 0,
        qtyRawaf: item.qtyRawaf || 0,
        qtySulaim: item.qtySulaim || 0,
        unitCost: item.unitCost || 0,
        category: item.category || '',
        isCustomAdded: !!item.isCustomAdded,
        status: item.status || (item.totalQty > 0 ? 'in_stock' : 'out_of_stock')
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}

// ─── EXPORT TO EXCEL (.xlsx) ───
export function exportShortagesBatchToExcel(batch, branchMeta) {
  const branchName = branchMeta?.name || batch.branchKey;
  const isOrdered = batch.status === 'ORDERED';

  const rows = (batch.items || []).map((item, index) => ({
    'م': index + 1,
    'رقم القطعة': item.partNumber,
    'اسم وتوصيف الصنف': item.partName,
    'الكمية المطلوبة': item.requestedQty,
    'درجة الأهمية': PRIORITY_LEVELS[item.priority]?.label || item.priority,
    'ملاحظات الموظف / العميل': item.notes || '--',
    'الموظف المسجل': item.createdByName,
    'تاريخ التسجيل': new Date(item.createdAt).toLocaleDateString('ar-SA'),
    'وقت التسجيل': new Date(item.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    'حالة القائمة': isOrdered ? 'تم الطلب من المورد' : 'قيد التسجيل النشط'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `نواقص ${branchName}`);

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `نواقص_${branchName}_دورة_${batch.batchNumber}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// ─── CLOUD SUPABASE SYNC (RESILIENT / GRACEFUL) ───
async function syncItemToCloud(item) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('branch_shortage_items').upsert([
      {
        id: item.id,
        batch_id: item.batchId,
        branch_key: item.branchKey,
        part_number: item.partNumber,
        part_name: item.partName,
        requested_qty: item.requestedQty,
        priority: item.priority,
        created_by_name: item.createdByName,
        notes: item.notes,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        is_new_to_inventory: !!item.isNewToInventory
      }
    ]);
  } catch (err) {
    // Non-blocking catch
  }
}

async function syncBatchToCloud(batch) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('branch_shortage_batches').upsert([
      {
        id: batch.id,
        branch_key: batch.branchKey,
        batch_number: batch.batchNumber,
        batch_title: batch.title,
        status: batch.status,
        created_at: batch.createdAt,
        ordered_at: batch.orderedAt,
        ordered_by: batch.orderedByName,
        supplier_notes: batch.supplierNotes
      }
    ]);
  } catch (err) {
    // Non-blocking catch
  }
}

/**
 * Fetch unified shortages store from Central Cloud Database (Supabase)
 * Merges across all 9 devices in the 3 branches and Purchasing Manager
 */
export async function fetchRemoteShortagesStore() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const [batchesRes, itemsRes] = await Promise.all([
      supabase.from('branch_shortage_batches').select('*').order('created_at', { ascending: false }),
      supabase.from('branch_shortage_items').select('*').order('created_at', { ascending: false })
    ]);

    if (batchesRes.error || itemsRes.error) {
      return null;
    }

    const batches = batchesRes.data || [];
    const items = itemsRes.data || [];

    if (batches.length === 0 && items.length === 0) {
      return null;
    }

    const itemsByBatch = {};
    items.forEach((it) => {
      const bId = it.batch_id;
      if (!itemsByBatch[bId]) itemsByBatch[bId] = [];
      itemsByBatch[bId].push({
        id: it.id,
        batchId: it.batch_id,
        branchKey: it.branch_key,
        partNumber: it.part_number,
        normalizedPartNumber: normalizePartNumber(it.part_number),
        partName: it.part_name,
        requestedQty: it.requested_qty,
        priority: it.priority,
        notes: it.notes || '',
        createdByName: it.created_by_name || 'موظف الفرع',
        createdByUsername: 'staff',
        createdAt: it.created_at,
        updatedAt: it.updated_at,
        isNewToInventory: !!it.is_new_to_inventory
      });
    });

    const currentLocal = getBranchShortagesStore();
    const newStore = {
      [BRANCH_KEYS.MAIN]: [],
      [BRANCH_KEYS.RAWAF]: [],
      [BRANCH_KEYS.KIA]: []
    };

    // For each branch, guarantee EXACTLY ONE canonical active batch containing ALL active items!
    Object.keys(BRANCH_META).forEach((bKey) => {
      const branchBatchesFromDb = batches.filter((b) => b.branch_key === bKey);
      const activeBatchesFromDb = branchBatchesFromDb.filter((b) => b.status === 'ACTIVE');
      const orderedBatchesFromDb = branchBatchesFromDb.filter((b) => b.status === 'ORDERED');

      let canonicalActiveBatch = null;

      if (activeBatchesFromDb.length > 0) {
        // Use the oldest/first active batch as the canonical one
        const primary = activeBatchesFromDb[0];
        
        // Collect items from ALL active batches of this branch to guarantee 100% data integrity
        const allActiveItems = [];
        activeBatchesFromDb.forEach((ab) => {
          const abItems = itemsByBatch[ab.id] || [];
          abItems.forEach((item) => {
            if (!allActiveItems.some((x) => x.id === item.id)) {
              allActiveItems.push({
                ...item,
                batchId: primary.id
              });
            }
          });
        });

        canonicalActiveBatch = {
          id: primary.id,
          branchKey: bKey,
          batchNumber: primary.batch_number || 1,
          title: primary.batch_title || `قائمة نواقص ${BRANCH_META[bKey]?.name || bKey} — دورة طلب رقم #${primary.batch_number || 1}`,
          status: 'ACTIVE',
          createdAt: primary.created_at,
          orderedAt: null,
          orderedByName: null,
          orderedByUsername: 'manager',
          supplierNotes: primary.supplier_notes || '',
          items: allActiveItems
        };
      } else {
        const nextNum = orderedBatchesFromDb.length + 1;
        canonicalActiveBatch = createNewBatch(bKey, nextNum);
      }

      // Put the active batch first
      newStore[bKey] = [canonicalActiveBatch];

      // Append past archived/ordered batches
      orderedBatchesFromDb.forEach((ob) => {
        newStore[bKey].push({
          id: ob.id,
          branchKey: bKey,
          batchNumber: ob.batch_number,
          title: ob.batch_title || `قائمة نواقص ${BRANCH_META[bKey]?.name || bKey} — دورة طلب رقم #${ob.batch_number}`,
          status: 'ORDERED',
          createdAt: ob.created_at,
          orderedAt: ob.ordered_at,
          orderedByName: ob.ordered_by,
          orderedByUsername: 'manager',
          supplierNotes: ob.supplier_notes || '',
          items: itemsByBatch[ob.id] || []
        });
      });
    });

    saveBranchShortagesStore(newStore);
    return newStore;
  } catch (err) {
    console.warn('Error fetching remote shortages store:', err);
    return null;
  }
}

/**
 * Automatically uploads any locally cached batches & items that were registered on this device
 * to the central cloud database so they become visible to all other devices and the Purchasing Manager.
 * Solves: Devices with existing records before the cloud update.
 */
export async function uploadLocalShortagesToCloud() {
  if (!isSupabaseConfigured || !supabase) return { count: 0, error: 'Database not configured' };
  try {
    const localStore = getBranchShortagesStore();
    let totalItemsUploaded = 0;

    for (const branchKey of Object.keys(localStore)) {
      const batches = localStore[branchKey] || [];
      const activeBatch = batches.find((b) => b.status === 'ACTIVE');

      if (activeBatch) {
        // Ensure active batch exists in remote DB
        await supabase.from('branch_shortage_batches').upsert([
          {
            id: activeBatch.id,
            branch_key: branchKey,
            batch_number: activeBatch.batchNumber || 1,
            batch_title: activeBatch.title,
            status: 'ACTIVE',
            created_at: activeBatch.createdAt || new Date().toISOString(),
            ordered_at: null,
            ordered_by: null,
            supplier_notes: activeBatch.supplierNotes || ''
          }
        ], { onConflict: 'id' });

        if (activeBatch.items && activeBatch.items.length > 0) {
          const rows = activeBatch.items.map((item) => ({
            id: item.id,
            batch_id: activeBatch.id,
            branch_key: branchKey,
            part_number: item.partNumber,
            part_name: item.partName,
            requested_qty: item.requestedQty || 1,
            priority: item.priority || 'NORMAL',
            created_by_name: item.createdByName || 'موظف الفرع',
            notes: item.notes || '',
            created_at: item.createdAt || new Date().toISOString(),
            updated_at: item.updatedAt || new Date().toISOString(),
            is_new_to_inventory: !!item.isNewToInventory
          }));

          await supabase.from('branch_shortage_items').upsert(rows, { onConflict: 'id' });
          totalItemsUploaded += rows.length;
        }
      }

      // Also upsert archived ORDERED batches if any exist locally
      const orderedBatches = batches.filter((b) => b.status === 'ORDERED');
      for (const ob of orderedBatches) {
        await supabase.from('branch_shortage_batches').upsert([
          {
            id: ob.id,
            branch_key: branchKey,
            batch_number: ob.batchNumber,
            batch_title: ob.title,
            status: 'ORDERED',
            created_at: ob.createdAt,
            ordered_at: ob.orderedAt,
            ordered_by: ob.orderedByName,
            supplier_notes: ob.supplierNotes || ''
          }
        ], { onConflict: 'id' });
      }
    }

    return { success: true, count: totalItemsUploaded };
  } catch (err) {
    console.warn('Error uploading local shortages to cloud:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Export full local store as JSON file backup
 */
export function exportLocalStoreToJson() {
  const store = getBranchShortagesStore();
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dora_shortages_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import local store from JSON file and merge
 */
export function importLocalStoreFromJson(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data && typeof data === 'object') {
      const current = getBranchShortagesStore();
      Object.keys(BRANCH_META).forEach((bKey) => {
        if (Array.isArray(data[bKey])) {
          // Merge batches by ID
          const existingIds = new Set((current[bKey] || []).map((b) => b.id));
          data[bKey].forEach((b) => {
            if (!existingIds.has(b.id)) {
              current[bKey].push(b);
            }
          });
        }
      });
      saveBranchShortagesStore(current);
      uploadLocalShortagesToCloud();
      return { success: true, store: current };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: false, error: 'Invalid JSON' };
}

/**
 * Real-time synchronization hook for multi-device live sync
 * Automatically triggers updates across all devices via WebSockets + Polling
 */
export function subscribeToShortagesSync(onUpdate) {
  let channel = null;

  if (isSupabaseConfigured && supabase) {
    try {
      channel = supabase
        .channel('dora_branch_shortages_live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'branch_shortage_items' }, () => {
          fetchRemoteShortagesStore().then((fresh) => {
            if (fresh && onUpdate) onUpdate(fresh);
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'branch_shortage_batches' }, () => {
          fetchRemoteShortagesStore().then((fresh) => {
            if (fresh && onUpdate) onUpdate(fresh);
          });
        })
        .subscribe();
    } catch (err) {
      console.warn('Supabase Realtime subscription error:', err);
    }
  }

  // 1. Initial push of local items on this device to cloud (guarantees old records are never lost)
  uploadLocalShortagesToCloud().then(() => {
    fetchRemoteShortagesStore().then((fresh) => {
      if (fresh && onUpdate) onUpdate(fresh);
    });
  });

  // 2. Periodic polling fallback (every 3.5s) to guarantee zero-latency across all 9 devices
  const intervalId = setInterval(() => {
    fetchRemoteShortagesStore().then((fresh) => {
      if (fresh && onUpdate) onUpdate(fresh);
    });
  }, 3500);

  return () => {
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
    clearInterval(intervalId);
  };
}
