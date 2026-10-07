// DEMO MODE ONLY. All simulated data lives here. Nothing below comes from a trained model.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export async function mockPredict(inputs) {
  await wait(4200);
  const v = inputs.values;
  return {
    patient_id: v.patientId || 'DEMO-001',
    severity: 'Moderate NPDR',
    confidence: 0.87,
    class_probabilities: { 'No DR': 0.02, 'Mild NPDR': 0.07, 'Moderate NPDR': 0.78, 'Severe NPDR': 0.1, PDR: 0.03 },
    fundus: { heatmap_url: null, overlay_url: null, simulated_blobs: [[56, 46, 34], [68, 64, 24], [36, 62, 20]] },
    oct: { heatmap_url: null, overlay_url: null, simulated_blobs: [[48, 46, 32], [72, 54, 22]] },
    clinical_explanation: [
      { feature: 'HbA1c', value: `${v.hba1c} %`, shap_value: 0.31 },
      { feature: 'Diabetes duration', value: `${v.duration} years`, shap_value: 0.22 },
      { feature: 'Blood pressure', value: `${v.systolic}/${v.diastolic} mmHg`, shap_value: 0.09 },
      { feature: 'Age', value: `${v.age} years`, shap_value: 0.05 },
    ],
    modality_contribution: { Fundus: 0.4, OCT: 0.35, Clinical: 0.25 },
  };
}
