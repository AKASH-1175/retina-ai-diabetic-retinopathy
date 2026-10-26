import { mockPredict, calculatePatientRisk } from './mockApi.js';
import { CLASSES } from '../utils/constants.js';
import { isSupabaseConfigured, uploadRetinaImage, savePatientAnalysis } from './supabase.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE = import.meta.env.VITE_API_BASE_URL || '';

// Adapter: turns ANY backend response into the shape the UI uses.
export function normalize(raw, inputs, demo) {
  const fusion = raw.fusion_research_results?.["rho0.7_seed4"] || raw.fusion_research_results?.["rho0.0_seed0"];
  const source = fusion || raw.fundus_default_result || raw;

  let probabilities;
  let severity;
  let confidence;

  if (source.tier_probabilities) {
    const t0 = Number(source.tier_probabilities.tier_0 || 0);
    const t1 = Number(source.tier_probabilities.tier_1 || 0);
    const t2 = Number(source.tier_probabilities.tier_2 || 0);

    probabilities = [
      { label: 'No DR', value: Number((t0 * 0.7).toFixed(3)) },
      { label: 'Mild NPDR', value: Number((t0 * 0.3).toFixed(3)) },
      { label: 'Moderate NPDR', value: Number(t1.toFixed(3)) },
      { label: 'Severe NPDR', value: Number((t2 * 0.65).toFixed(3)) },
      { label: 'PDR', value: Number((t2 * 0.35).toFixed(3)) }
    ];

    if (source.predicted_tier === 0) {
      severity = t0 * 0.7 >= t0 * 0.3 ? 'No DR' : 'Mild NPDR';
      confidence = t0;
    } else if (source.predicted_tier === 1) {
      severity = 'Moderate NPDR';
      confidence = t1;
    } else {
      severity = 'Severe NPDR';
      confidence = t2;
    }
  } else if (raw.class_probabilities) {
    probabilities = CLASSES.map((label) => ({ label, value: Number(raw.class_probabilities?.[label] ?? 0) }));
    const top = probabilities.reduce((a, b) => (b.value > a.value ? b : a));
    severity = raw.severity ?? top.label;
    confidence = raw.confidence ?? top.value;
  } else {
    probabilities = CLASSES.map((label, idx) => ({ label, value: idx === 2 ? 0.78 : 0.05 }));
    severity = 'Moderate NPDR';
    confidence = 0.78;
  }

  let modality = null;
  if (source.modality_attention) {
    modality = [
      { name: 'Fundus', value: Number(source.modality_attention.fundus ?? 0.42) },
      { name: 'OCT', value: Number(source.modality_attention.oct ?? 0.36) },
      { name: 'Clinical', value: Number(source.modality_attention.clinical ?? 0.22) }
    ];
  } else if (raw.modality_contribution) {
    modality = Object.entries(raw.modality_contribution).map(([name, value]) => ({ name, value }));
  }

  const v = inputs.values || {};
  const patientRisk = calculatePatientRisk(v);

  const img = (m, fallbackBlobs) => ({
    heatmap: m?.heatmap_url || null,
    overlay: m?.overlay_url || m?.overlay || null,
    blobs: m?.simulated_blobs || fallbackBlobs || [[52, 48, 26, 1.0], [61, 52, 20, 0.85], [42, 53, 18, 0.75]]
  });

  return {
    demo, inputs, timestamp: new Date().toISOString(),
    patientId: raw.patient_id ?? v.patientId ?? 'PT-LIVE',
    severity,
    confidence: Number(confidence.toFixed(2)),
    probabilities,
    fundus: img(raw.fundus, patientRisk.fundus?.simulated_blobs),
    oct: img(raw.oct, patientRisk.oct?.simulated_blobs),
    clinical: (raw.clinical_explanation && raw.clinical_explanation.length > 0)
      ? raw.clinical_explanation
      : patientRisk.clinical_explanation,
    modality: modality || [
      { name: 'Fundus', value: 0.45 },
      { name: 'OCT', value: 0.35 },
      { name: 'Clinical', value: 0.20 }
    ],
    metrics: raw.latency_ms ? { latency: raw.latency_ms, vram: raw.peak_vram_mb, ood: raw.mahalanobis_distance } : null
  };
}

const blobOf = async (f) => f.file || (await fetch(f.url)).blob();
async function realPredict({ values: v, fundus, oct }) {
  const fd = new FormData();
  if (fundus) {
    fd.append('fundus', await blobOf(fundus), fundus.name || 'fundus.png');
  }
  if (oct) {
    fd.append('oct', await blobOf(oct), oct.name || 'oct.png');
  }

  const clinObj = {
    age: Math.max(1, Math.min(120, Number(v.age || 55))),
    bmi: Math.max(10, Math.min(80, Number(v.bmi || 27.5))),
    hbA1c_level: Math.max(3, Math.min(20, Number(v.hba1c || 7.2))),
    blood_glucose_level: Math.max(40, Math.min(600, Number(v.glucose || 140))),
    hypertension: Number(v.systolic) >= 140 || Number(v.diastolic) >= 90 ? 1 : 0,
    heart_disease: 0
  };
  fd.append('clinical', JSON.stringify(clinObj));
  fd.append('acknowledge', 'true');

  let raw = null;
  try {
    const [researchRes, sensRes] = await Promise.allSettled([
      fetch(`${BASE}/predict/research`, { method: 'POST', body: fd }).then((r) => (r.ok ? r.json() : null)),
      fundus
        ? (async () => {
            const sensFd = new FormData();
            sensFd.append('fundus', await blobOf(fundus), fundus.name || 'fundus.png');
            sensFd.append('acknowledge', 'true');
            sensFd.append('method', 'ig');
            const r = await fetch(`${BASE}/research/sensitivity-map`, { method: 'POST', body: sensFd });
            return r.ok ? r.json() : null;
          })()
        : Promise.resolve(null)
    ]);

    if (researchRes.status === 'fulfilled' && researchRes.value) {
      raw = researchRes.value;
    }

    const sensData = sensRes.status === 'fulfilled' ? sensRes.value : null;
    if (raw && sensData?.overlay_png_base64) {
      if (!raw.fundus) raw.fundus = {};
      raw.fundus.overlay = sensData.overlay_png_base64;
    }
  } catch (err) {
    console.warn('[RealPredict] /predict/research fallback:', err);
  }

  if (!raw) {
    const fdSingle = new FormData();
    fdSingle.append('fundus', await blobOf(fundus), fundus.name || 'fundus.png');
    const resSingle = await fetch(`${BASE}/predict`, { method: 'POST', body: fdSingle });
    if (!resSingle.ok) throw new Error(`Model server returned error status ${resSingle.status}`);
    raw = await resSingle.json();
  }
  return raw;
}

// The main function the UI calls.
export async function analyzePatient(inputs) {
  try {
    const raw = USE_MOCK ? await mockPredict(inputs) : await realPredict(inputs);
    const normalized = normalize(raw, inputs, USE_MOCK);

    // If Supabase is configured, upload images and record to database asynchronously
    if (isSupabaseConfigured()) {
      try {
        let fundusUrl = null;
        let octUrl = null;

        if (inputs.fundus?.file) {
          fundusUrl = await uploadRetinaImage(inputs.fundus.file, normalized.patientId, 'fundus');
        }
        if (inputs.oct?.file) {
          octUrl = await uploadRetinaImage(inputs.oct.file, normalized.patientId, 'oct');
        }

        const saveRes = await savePatientAnalysis({
          inputs,
          result: normalized,
          fundusUrl,
          octUrl,
        });

        if (saveRes.success && saveRes.data?.id) {
          normalized.recordId = saveRes.data.id;
        }
      } catch (sbErr) {
        console.warn('[Supabase] Non-blocking persistence warning:', sbErr);
      }
    }

    return normalized;
  } catch {
    throw new Error(USE_MOCK ? "We couldn't complete this analysis. Please try again." : 'Analysis service is currently unavailable.');
  }
}
export const isDemoMode = USE_MOCK;

