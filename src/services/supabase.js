import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_project_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key' &&
    !supabaseUrl.includes('example.supabase.co')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload an image (File or Blob) to Supabase Storage.
 * @param {File|Blob} file - The file or blob to upload
 * @param {string} patientId - Patient identifier for folder organization
 * @param {'fundus'|'oct'} type - Image type
 * @returns {Promise<string|null>} Public URL of uploaded image, or null if unconfigured
 */
export async function uploadRetinaImage(file, patientId = 'anonymous', type = 'fundus') {
  if (!supabase) return null;

  try {
    const ext = file.name ? file.name.split('.').pop() : 'png';
    const filename = `${patientId}/${type}_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('retina-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn(`[Supabase Storage] Error uploading ${type} image:`, error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from('retina-images')
      .getPublicUrl(data.path);

    return publicData?.publicUrl || null;
  } catch (err) {
    console.warn('[Supabase Storage] Upload error:', err);
    return null;
  }
}

/**
 * Save complete analysis record to Supabase Database.
 * @param {Object} params
 * @param {Object} params.inputs - User form values & image objects
 * @param {Object} params.result - Model/mock output results
 * @param {string|null} params.fundusUrl - Supabase storage URL if uploaded
 * @param {string|null} params.octUrl - Supabase storage URL if uploaded
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function savePatientAnalysis({ inputs, result, fundusUrl = null, octUrl = null }) {
  if (!supabase) {
    return { success: false, error: 'Supabase credentials are not configured in .env' };
  }

  try {
    const v = inputs.values || {};
    const record = {
      patient_id: result.patientId || v.patientId || 'UNKNOWN',
      age: v.age ? Number(v.age) : null,
      sex: v.sex || null,
      hba1c: v.hba1c ? Number(v.hba1c) : null,
      blood_glucose: v.glucose ? Number(v.glucose) : null,
      systolic_bp: v.systolic ? Number(v.systolic) : null,
      diastolic_bp: v.diastolic ? Number(v.diastolic) : null,
      diabetes_duration: v.duration ? Number(v.duration) : null,
      diabetes_type: v.diabetesType || null,
      bmi: v.bmi ? Number(v.bmi) : null,
      predicted_severity: result.severity,
      confidence: result.confidence,
      class_probabilities: result.probabilities,
      fundus_image_url: fundusUrl || (typeof inputs.fundus?.url === 'string' && !inputs.fundus.url.startsWith('blob:') && !inputs.fundus.url.startsWith('data:') ? inputs.fundus.url : null),
      oct_image_url: octUrl || (typeof inputs.oct?.url === 'string' && !inputs.oct.url.startsWith('blob:') && !inputs.oct.url.startsWith('data:') ? inputs.oct.url : null),
      clinical_explanation: result.clinical || [],
      modality_contribution: result.modality || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('analyses')
      .insert([record])
      .select();

    if (error) {
      console.error('[Supabase DB] Insert error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('[Supabase DB] Error saving analysis:', err);
    return { success: false, error: err.message || 'Database error' };
  }
}

/**
 * Fetch recent patient analysis records.
 * @param {number} limit - Maximum number of records to retrieve
 * @returns {Promise<Array>}
 */
export async function fetchRecentAnalyses(limit = 10) {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Supabase DB] Fetch error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Supabase DB] Error fetching records:', err);
    return [];
  }
}
