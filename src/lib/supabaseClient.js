import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://flfbzeyoqouzctoteyef.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cVmS9xHwNXSZC3qilRhSXQ_mVoeL_01';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Saves/upserts an approved item cost override into Supabase
 */
export async function saveCostOverrideToDatabase(partNumber, unitCost, sku = '', partName = '') {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('inventory_cost_overrides')
      .upsert({
        part_number: String(partNumber).trim(),
        sku: String(sku || partNumber).trim(),
        part_name: String(partName || '').trim(),
        unit_cost: Number(unitCost),
        updated_at: new Date().toISOString()
      }, { onConflict: 'part_number' });
    if (error) {
      console.warn('Supabase cost override notice:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('Supabase cost override catch:', err);
    return null;
  }
}

/**
 * Fetches all saved cost overrides from Supabase
 */
export async function fetchCostOverridesFromDatabase() {
  if (!supabase) return {};
  try {
    const { data, error } = await supabase
      .from('inventory_cost_overrides')
      .select('part_number, unit_cost');
    if (error || !data) return {};
    const map = {};
    data.forEach((row) => {
      if (row.part_number && row.unit_cost !== null) {
        map[row.part_number] = Number(row.unit_cost);
      }
    });
    return map;
  } catch (err) {
    return {};
  }
}

