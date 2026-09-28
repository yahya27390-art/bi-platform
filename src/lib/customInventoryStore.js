// ============================================================
// DYNAMIC CUSTOM INVENTORY REGISTRY & STORE
// Automatically registers newly requested branch shortage items
// that do not yet exist in the official master catalog.
// Ensures they exist in inventory with ZERO stock across all 3 warehouses:
// - المركز الرئيسي (100): 0
// - فرع الرواف (200): 0
// - فرع كيا / السليم (300): 0
// ============================================================

import { REAL_ALL_PARTS } from '../data/realInventoryData';
import { normalizePartNumber } from './supplierPriceComparator';

export const CUSTOM_INVENTORY_STORAGE_KEY = 'dora_custom_inventory_items_v1';

/**
 * Read custom dynamically registered parts from localStorage
 */
export function getCustomInventoryItems() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_INVENTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading custom inventory items from localStorage:', err);
  }
  return [];
}

/**
 * Persist custom dynamically registered parts to localStorage
 */
export function saveCustomInventoryItems(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_INVENTORY_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('dora-inventory-updated', { detail: items }));
  } catch (err) {
    console.warn('Error saving custom inventory items to localStorage:', err);
  }
}

// In-memory fast cache map
let _allPartsMap = null;

function buildAllPartsMap() {
  const map = new Map();
  // 1. Index official static parts
  for (let i = 0; i < REAL_ALL_PARTS.length; i++) {
    const p = REAL_ALL_PARTS[i];
    const norm = normalizePartNumber(p.sku);
    if (norm && !map.has(norm)) {
      map.set(norm, p);
    }
  }
  // 2. Index / overlay custom added parts
  const custom = getCustomInventoryItems();
  for (let i = 0; i < custom.length; i++) {
    const c = custom[i];
    const norm = normalizePartNumber(c.sku);
    if (norm) {
      map.set(norm, c);
    }
  }
  return map;
}

export function getAllPartsMap(forceRefresh = false) {
  if (!_allPartsMap || forceRefresh) {
    _allPartsMap = buildAllPartsMap();
  }
  return _allPartsMap;
}

/**
 * Returns full unified inventory list:
 * Custom zero-stock items first, followed by the official catalog.
 */
export function getAllInventoryParts() {
  const custom = getCustomInventoryItems();
  if (!custom || custom.length === 0) return REAL_ALL_PARTS;
  return [...custom, ...REAL_ALL_PARTS];
}

/**
 * Check if a part exists in inventory by raw or normalized SKU
 */
export function checkPartExistsInCatalog(query) {
  if (!query) return null;
  const norm = normalizePartNumber(query);
  if (!norm) return null;
  const map = getAllPartsMap();
  return map.get(norm) || null;
}

/**
 * Registers an item to the inventory catalog if it doesn't already exist.
 * If newly added, it is strictly assigned 0 balance across all 3 warehouses:
 * (الرصيد = 0، مخزن الرئيسي = 0، مخزن الرواف = 0، مخزن كيا/السليم = 0)
 */
export function registerInventoryItemIfNotExists({
  sku,
  name,
  branchKey = 'main',
  staffName = 'موظف الفرع',
  notes = ''
}) {
  if (!sku || !String(sku).trim()) {
    return { isNew: false, item: null };
  }

  const cleanSku = String(sku).trim().toUpperCase();
  const existing = checkPartExistsInCatalog(cleanSku);

  if (existing) {
    return { isNew: false, item: existing };
  }

  // Brand categorization hint based on SKU prefix
  let brand = 'general';
  const upper = cleanSku.toUpperCase();
  if (upper.includes('-2') || upper.includes('-3') || upper.includes('-4') || upper.includes('HYU')) {
    brand = 'hyundai';
  } else if (upper.includes('KIA') || upper.includes('-1') || upper.includes('-0')) {
    brand = 'kia';
  }

  const cleanName = (name && String(name).trim()) || `صنف جديد مسجل (${cleanSku})`;

  const newItem = {
    sku: cleanSku,
    name: cleanName,
    unit: 'حبه',
    brand,
    category: 'قطع غيار عامة',
    isDiesel: false,
    status: 'out_of_stock', // بلا رصيد على المخازن
    opening: 0,
    received: 0,
    issued: 0,
    balance: 0,
    qtyMain: 0,
    costMain: 0,
    qtyRawaf: 0,
    costRawaf: 0,
    qtySulaim: 0,
    costSulaim: 0,
    totalQty: 0,
    totalCost: 0,
    unitCost: 0,
    pageNum: 0,
    isCustomAdded: true,
    addedAt: new Date().toISOString(),
    addedByBranch: branchKey,
    addedByStaff: staffName,
    notes: notes || '',
    sourceReport: 'مسجل آلياً عبر نواقص الفروع (صنف بلا رصيد)'
  };

  const customList = getCustomInventoryItems();
  const normNew = normalizePartNumber(cleanSku);
  const alreadyInList = customList.some((x) => normalizePartNumber(x.sku) === normNew);
  if (!alreadyInList) {
    customList.unshift(newItem);
    saveCustomInventoryItems(customList);
    // Invalidate local in-memory map
    _allPartsMap = null;
  }

  return { isNew: true, item: newItem };
}
