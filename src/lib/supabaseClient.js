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

/**
 * Saves/upserts a supplier quotation into Supabase database
 */
export async function saveQuotationToDatabase(quotation) {
  if (!supabase || !quotation) return null;
  try {
    const payload = {
      id: String(quotation.id || `quote_${Date.now()}`),
      title: String(quotation.title || quotation.shortName || 'عرض سعر بدون عنوان').trim(),
      supplier_name: String(quotation.supplierName || '').trim(),
      date: String(quotation.date || new Date().toISOString().split('T')[0]),
      items_count: Number(quotation.itemsCount || quotation.analysisData?.items?.length || 0),
      badge: String(quotation.badge || 'عرض محفوظ').trim(),
      icon: String(quotation.icon || '📄').trim(),
      analysis_data: quotation.analysisData || null,
      raw_items: quotation.rawItems || null,
      quotation_info: quotation.quotationInfo || null,
      updated_at: new Date().toISOString()
    };

    // Try primary table supplier_quotations first
    const { data, error } = await supabase
      .from('supplier_quotations')
      .upsert(payload, { onConflict: 'id' });

    if (!error) return { success: true, data };

    // Fallback: bi_documents table
    console.warn('supplier_quotations table notice, attempting bi_documents fallback:', error.message);
    const docPayload = {
      id: payload.id,
      title: payload.title,
      doc_type: 'supplier_quotation',
      file_url: JSON.stringify(payload)
    };
    const { data: dData, error: dErr } = await supabase
      .from('bi_documents')
      .upsert(docPayload, { onConflict: 'id' });

    if (dErr) {
      console.warn('bi_documents fallback error:', dErr.message);
      return { success: false, error: dErr.message };
    }
    return { success: true, data: dData };
  } catch (err) {
    console.warn('saveQuotationToDatabase catch:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches all saved quotations from Supabase database
 */
export async function fetchQuotationsFromDatabase() {
  if (!supabase) return [];
  try {
    // Try primary table supplier_quotations
    const { data, error } = await supabase
      .from('supplier_quotations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        supplierName: row.supplier_name,
        title: row.title,
        shortName: row.supplier_name || row.title,
        date: row.date,
        dateFormatted: row.date,
        itemsCount: row.items_count,
        badge: row.badge,
        icon: row.icon || '📄',
        isBuiltIn: false,
        analysisData: row.analysis_data,
        rawItems: row.raw_items,
        quotationInfo: row.quotation_info
      }));
    }

    // Fallback: try bi_documents
    const { data: docData, error: docErr } = await supabase
      .from('bi_documents')
      .select('*')
      .eq('doc_type', 'supplier_quotation');

    if (!docErr && Array.isArray(docData) && docData.length > 0) {
      return docData.map((d) => {
        try {
          const parsed = JSON.parse(d.file_url);
          return {
            id: parsed.id || d.id,
            supplierName: parsed.supplier_name,
            title: parsed.title || d.title,
            shortName: parsed.supplier_name || parsed.title,
            date: parsed.date,
            dateFormatted: parsed.date,
            itemsCount: parsed.items_count,
            badge: parsed.badge,
            icon: parsed.icon || '📄',
            isBuiltIn: false,
            analysisData: parsed.analysis_data,
            rawItems: parsed.raw_items,
            quotationInfo: parsed.quotation_info
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    }

    return [];
  } catch (err) {
    console.warn('fetchQuotationsFromDatabase catch:', err);
    return [];
  }
}

