/**
 * Safe Browser Storage Utility for Dora Cars BI Platform
 * Prevents QuotaExceededError crashes by:
 * 1. Safely guarding all setItem / getItem operations in try...catch
 * 2. Automatically purging non-critical transient caches when quota is exceeded
 * 3. Gracefully falling back to sessionStorage or memory if localStorage is completely locked
 */

// In-memory fallback dictionary
const memoryStorage = new Map();

// Non-essential keys that can be safely pruned when storage quota is exceeded
const PRUNABLE_KEYS = [
  'dora_sync_status_cache',
  'dora_social_responder_messages',
  'dora_social_learned_insights',
  'dora_chat_history',
  'dora_agent_memory',
  'dora_agent_tasks',
  'dora_inbox_data_version',
  'dora_private_notes',
  'dora_ai_agent_config',
];

/**
 * Calculates approximate localStorage usage in KB
 */
export function getStorageUsageKB() {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += (key.length + (localStorage.getItem(key)?.length || 0)) * 2;
      }
    }
  } catch (e) {
    // ignore
  }
  return Math.round(total / 1024);
}

/**
 * Prunes non-essential keys to free up space
 */
export function pruneStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    // 1. Remove known prunable keys
    for (const key of PRUNABLE_KEYS) {
      localStorage.removeItem(key);
    }

    // 2. Remove any old temp or debug keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('temp_') || key.startsWith('cache_') || key.includes('_debug_'))) {
        localStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.warn('Storage pruning warning:', err);
  }
}

/**
 * Complete reset of heavy caches while preserving credentials and critical data
 */
export function recoverStorageEmergency() {
  pruneStorage();
  try {
    // Remove heavy datasets if still overflowing
    const heavyKeys = [
      'dora_custom_inventory_items_v1',
      'dora_period_sales_',
      'dora_private_campaigns'
    ];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && heavyKeys.some(h => key.startsWith(h))) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {}
}

/**
 * Safely sets an item in localStorage with auto-pruning and fallback
 */
export function safeSetItem(key, value) {
  if (typeof window === 'undefined') return;
  const strVal = typeof value === 'string' ? value : JSON.stringify(value);

  try {
    localStorage.setItem(key, strVal);
    // Mirror to sessionStorage and memory
    try { sessionStorage.setItem(key, strVal); } catch (e) {}
    memoryStorage.set(key, strVal);
  } catch (err) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      (err?.message && err.message.toLowerCase().includes('quota'));

    if (isQuota) {
      console.warn(`[safeStorage] Quota exceeded on key "${key}". Running auto-prune...`);
      pruneStorage();

      // Retry once after pruning
      try {
        localStorage.setItem(key, strVal);
        try { sessionStorage.setItem(key, strVal); } catch (e) {}
        memoryStorage.set(key, strVal);
        return;
      } catch (retryErr) {
        console.warn(`[safeStorage] Retry failed for key "${key}". Using fallback storage.`);
      }
    }

    // Fallback: save to sessionStorage and memory so the session NEVER crashes
    try {
      sessionStorage.setItem(key, strVal);
    } catch (e) {}
    memoryStorage.set(key, strVal);
  }
}

/**
 * Safely gets an item with fallback
 */
export function safeGetItem(key) {
  if (typeof window === 'undefined') return null;

  try {
    const val = localStorage.getItem(key);
    if (val !== null) return val;
  } catch (e) {}

  try {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal !== null) return sessionVal;
  } catch (e) {}

  return memoryStorage.get(key) || null;
}

/**
 * Safely removes an item
 */
export function safeRemoveItem(key) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch (e) {}
  try { sessionStorage.removeItem(key); } catch (e) {}
  memoryStorage.delete(key);
}

// Auto-run hygiene on module load
if (typeof window !== 'undefined') {
  try {
    if (getStorageUsageKB() > 3500) {
      pruneStorage();
    }
  } catch (e) {}
}
