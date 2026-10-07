import { mockPredict } from './mockApi.js';
import { CLASSES } from '../utils/constants.js';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE = import.meta.env.VITE_API_BASE_URL || '';

// Adapter: turns ANY backend response into the shape the UI uses. Edit here if your API changes.
export function normalize(raw, inputs, demo) {
  const probabilities = CLASSES.map((label) => ({ label, value: Number(raw.class_probabilities?.[label] ?? 0) }));
  const top = probabilities.reduce((a, b) => (b.value > a.value ? b : a));
  const img = (m) => ({ heatmap: m?.heatmap_url || null, overlay: m?.overlay_url || null, blobs: m?.simulated_blobs || [[50, 50, 30]] });
  return {
    demo, inputs, timestamp: new Date().toISOString(),
    patientId: raw.patient_id ?? inputs.values.patientId,
    severity: raw.severity ?? top.label,
    confidence: raw.confidence ?? top.value,
    probabilities,
    fundus: img(raw.fundus), oct: img(raw.oct),
    clinical: (raw.clinical_explanation || []).map((c) => ({ feature: c.feature, value: c.value, contribution: c.shap_value ?? c.contribution ?? 0 })),
    modality: raw.modality_contribution ? Object.entries(raw.modality_contribution).map(([name, value]) => ({ name, value })) : null,
  };
}

const blobOf = async (f) => f.file || (await fetch(f.url)).blob();
async function realPredict({ values: v, fundus, oct }) {
  const fd = new FormData();
  const map = { patient_id: v.patientId, age: v.age, sex: v.sex, hba1c: v.hba1c, blood_glucose: v.glucose, systolic_bp: v.systolic, diastolic_bp: v.diastolic, diabetes_duration: v.duration, diabetes_type: v.diabetesType, bmi: v.bmi };
  Object.entries(map).forEach(([k, val]) => val !== '' && val != null && fd.append(k, val));
  fd.append('fundus_image', await blobOf(fundus), fundus.name);
  fd.append('oct_image', await blobOf(oct), oct.name);
  const res = await fetch(`${BASE}/predict`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('bad status');
  return res.json();
}

// The only function the UI calls.
export async function analyzePatient(inputs) {
  try {
    const raw = USE_MOCK ? await mockPredict(inputs) : await realPredict(inputs);
    return normalize(raw, inputs, USE_MOCK);
  } catch {
    throw new Error(USE_MOCK ? "We couldn't complete this analysis. Please try again." : 'Analysis service is currently unavailable.');
  }
}
export const isDemoMode = USE_MOCK;
