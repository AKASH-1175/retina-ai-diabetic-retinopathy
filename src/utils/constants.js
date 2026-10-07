export const CLASSES = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'PDR'];
export const COLORS = ['#34d399', '#a3e635', '#fbbf24', '#fb923c', '#f87171'];
export const EMPTY = { patientId: '', age: '', sex: '', hba1c: '', glucose: '', systolic: '', diastolic: '', duration: '', diabetesType: '', bmi: '' };
export const DEMO_PATIENT = { patientId: 'DEMO-001', age: '58', sex: 'Female', hba1c: '7.2', glucose: '', systolic: '130', diastolic: '80', duration: '8', diabetesType: 'Type 2', bmi: '28.4' };
// Add new fields here — forms, validation and review pick them up automatically.
export const PATIENT_FIELDS = [
  { name: 'patientId', label: 'Patient ID', type: 'text', required: true, placeholder: 'PT-001' },
  { name: 'age', label: 'Age', unit: 'years', type: 'number', required: true, min: 0, max: 120 },
  { name: 'sex', label: 'Sex', type: 'select', required: true, options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
];
export const CLINICAL_FIELDS = [
  { name: 'hba1c', label: 'HbA1c', unit: '%', type: 'number', step: '0.1', required: true, placeholder: '7.2' },
  { name: 'glucose', label: 'Blood glucose', unit: 'mg/dL', type: 'number' },
  { name: 'systolic', label: 'Systolic BP', unit: 'mmHg', type: 'number', required: true, placeholder: '130' },
  { name: 'diastolic', label: 'Diastolic BP', unit: 'mmHg', type: 'number', required: true, placeholder: '80' },
  { name: 'duration', label: 'Diabetes duration', unit: 'years', type: 'number', required: true, placeholder: '8' },
  { name: 'diabetesType', label: 'Diabetes type', type: 'select', required: true, options: ['Type 1', 'Type 2', 'Other', 'Unknown'] },
  { name: 'bmi', label: 'BMI', unit: 'kg/m²', type: 'number', step: '0.1' },
];
