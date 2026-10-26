// Dynamic, input-responsive prediction and biomarker attribution service.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function calculatePatientRisk(v = {}) {
  const hba1c = Number(v.hba1c || 7.2);
  const duration = Number(v.duration || 8);
  const sys = Number(v.systolic || 130);
  const dia = Number(v.diastolic || 80);
  const glucose = v.glucose ? Number(v.glucose) : Math.round(hba1c * 28.7 - 46.7);
  const bmi = v.bmi ? Number(v.bmi) : 27.5;
  const age = Number(v.age || 55);

  // 1. Dynamic SHAP Feature Attribution
  const hba1cShap = Number(((hba1c - 6.0) * 0.082).toFixed(2));
  const durShap = Number(((duration - 5.0) * 0.024).toFixed(2));
  const mapVal = (sys + 2 * dia) / 3;
  const bpShap = Number(((mapVal - 93.3) * 0.007).toFixed(2));
  const gluShap = Number(((glucose - 110) * 0.0012).toFixed(2));
  const bmiShap = Number(((bmi - 24.5) * 0.012).toFixed(2));
  const ageShap = Number(((age - 50) * 0.003).toFixed(2));

  const clinicalExplanation = [
    { feature: 'HbA1c', value: `${hba1c} %`, shap_value: hba1cShap, contribution: hba1cShap },
    { feature: 'Diabetes duration', value: `${duration} years`, shap_value: durShap, contribution: durShap },
    { feature: 'Blood pressure', value: `${sys}/${dia} mmHg`, shap_value: bpShap, contribution: bpShap },
    { feature: 'Blood glucose', value: `${glucose} mg/dL`, shap_value: gluShap, contribution: gluShap },
    { feature: 'BMI', value: `${bmi} kg/m²`, shap_value: bmiShap, contribution: bmiShap },
    { feature: 'Age', value: `${age} years`, shap_value: ageShap, contribution: ageShap },
  ];

  // 2. Risk Score & DR Severity Grading
  const compositeRisk = hba1cShap * 1.8 + durShap * 1.5 + bpShap * 1.0 + gluShap * 0.8 + bmiShap * 0.5 + ageShap * 0.4;

  let severity = 'Moderate NPDR';
  let probs = { 'No DR': 0.03, 'Mild NPDR': 0.08, 'Moderate NPDR': 0.76, 'Severe NPDR': 0.10, PDR: 0.03 };
  let fundusBlobs = [[50, 48, 28, 1.0], [60, 54, 22, 0.85], [42, 52, 20, 0.75]];
  let octBlobs = [[50, 48, 30, 1.0], [40, 45, 22, 0.8], [62, 52, 24, 0.75]];

  if (compositeRisk < 0.0) {
    severity = 'No DR';
    probs = { 'No DR': 0.86, 'Mild NPDR': 0.10, 'Moderate NPDR': 0.03, 'Severe NPDR': 0.01, PDR: 0.00 };
    fundusBlobs = [[50, 50, 20, 0.6], [61, 50, 18, 0.5]];
    octBlobs = [[50, 50, 22, 0.6], [50, 55, 18, 0.45]];
  } else if (compositeRisk < 0.25) {
    severity = 'Mild NPDR';
    probs = { 'No DR': 0.12, 'Mild NPDR': 0.74, 'Moderate NPDR': 0.11, 'Severe NPDR': 0.02, PDR: 0.01 };
    fundusBlobs = [[48, 48, 24, 0.85], [58, 52, 19, 0.7], [38, 46, 16, 0.6]];
    octBlobs = [[50, 48, 26, 0.8], [42, 46, 20, 0.65]];
  } else if (compositeRisk < 0.65) {
    severity = 'Moderate NPDR';
    probs = { 'No DR': 0.02, 'Mild NPDR': 0.07, 'Moderate NPDR': 0.78, 'Severe NPDR': 0.10, PDR: 0.03 };
    fundusBlobs = [[50, 48, 28, 1.0], [61, 54, 24, 0.88], [40, 52, 22, 0.8], [55, 40, 18, 0.65]];
    octBlobs = [[50, 48, 30, 1.0], [38, 44, 24, 0.85], [62, 52, 26, 0.8], [50, 56, 18, 0.6]];
  } else if (compositeRisk < 1.1) {
    severity = 'Severe NPDR';
    probs = { 'No DR': 0.01, 'Mild NPDR': 0.03, 'Moderate NPDR': 0.12, 'Severe NPDR': 0.72, PDR: 0.12 };
    fundusBlobs = [[50, 48, 34, 1.0], [62, 55, 30, 0.95], [38, 50, 28, 0.9], [56, 38, 24, 0.85], [44, 60, 22, 0.8]];
    octBlobs = [[50, 48, 36, 1.0], [36, 44, 30, 0.9], [64, 54, 28, 0.9], [50, 60, 25, 0.85]];
  } else {
    severity = 'PDR';
    probs = { 'No DR': 0.00, 'Mild NPDR': 0.01, 'Moderate NPDR': 0.06, 'Severe NPDR': 0.22, PDR: 0.71 };
    fundusBlobs = [[50, 48, 38, 1.0], [64, 56, 34, 1.0], [36, 50, 32, 0.95], [58, 36, 28, 0.9], [42, 62, 26, 0.85], [48, 30, 22, 0.8]];
    octBlobs = [[50, 48, 40, 1.0], [34, 44, 32, 0.95], [66, 54, 32, 0.95], [50, 62, 28, 0.9]];
  }

  const confidence = probs[severity];

  return {
    patient_id: v.patientId || 'PT-LIVE',
    severity,
    confidence,
    class_probabilities: probs,
    fundus: { heatmap_url: null, overlay_url: null, simulated_blobs: fundusBlobs },
    oct: { heatmap_url: null, overlay_url: null, simulated_blobs: octBlobs },
    clinical_explanation: clinicalExplanation,
    modality_contribution: {
      Fundus: 0.45,
      OCT: 0.35,
      Clinical: 0.20,
    },
  };
}

export async function mockPredict(inputs) {
  await wait(2400);
  return calculatePatientRisk(inputs.values);
}
