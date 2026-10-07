import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, FlaskConical } from 'lucide-react';
import FormSection from '../components/ClinicalForm.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import AnalysisProgress, { STEPS as PSTEPS } from '../components/AnalysisProgress.jsx';
import { analyzePatient, isDemoMode } from '../services/api.js';
import { useAnalysis } from '../AnalysisContext.jsx';
import { EMPTY, DEMO_PATIENT, PATIENT_FIELDS, CLINICAL_FIELDS } from '../utils/constants.js';
import { demoFundus, demoOct } from '../utils/demoAssets.js';
const TITLES = ['Patient information', 'Clinical information', 'Fundus image', 'OCT scan', 'Review & analyze'];
export default function Analyze() {
  const nav = useNavigate(); const { setResult } = useAnalysis();
  const [step, setStep] = useState(0); const [values, setValues] = useState(EMPTY);
  const [fundus, setFundus] = useState(null); const [oct, setOct] = useState(null);
  const [errors, setErrors] = useState({}); const [banner, setBanner] = useState('');
  const [running, setRunning] = useState(false); const [pstep, setPstep] = useState(0); const timer = useRef();
  useEffect(() => {
    return () => clearInterval(timer.current);
  }, []);
  const set = (k, v) => { setValues({ ...values, [k]: v }); setErrors({ ...errors, [k]: undefined }); };
  const validate = (fields) => {
    const e = {};
    fields.forEach((f) => { if (f.required && !String(values[f.name]).trim()) e[f.name] = 'This field is required.'; });
    setErrors(e); const bad = Object.keys(e).length > 0; setBanner(bad ? 'Please complete the required fields.' : ''); return !bad;
  };
  const next = () => {
    const ok = step === 0 ? validate(PATIENT_FIELDS) : step === 1 ? validate(CLINICAL_FIELDS)
      : step === 2 ? (fundus ? true : (setBanner('Please complete the required fields.'), setErrors({ fundus: 'Upload a fundus image to continue.' }), false))
      : step === 3 ? (oct ? true : (setBanner('Please complete the required fields.'), setErrors({ oct: 'Upload an OCT scan to continue.' }), false)) : true;
    if (ok) { setBanner(''); setErrors({}); setStep(step + 1); }
  };
  const loadDemo = () => { setValues(DEMO_PATIENT); setFundus(demoFundus()); setOct(demoOct()); setErrors({}); setBanner(''); setStep(4); };
  const run = async () => {
    setRunning(true); setPstep(0); setBanner('');
    timer.current = setInterval(() => setPstep((p) => Math.min(p + 1, PSTEPS.length - 1)), 650);
    try {
      const res = await analyzePatient({ values, fundus, oct });
      clearInterval(timer.current); setPstep(PSTEPS.length);
      setTimeout(() => { setResult(res); nav('/results'); }, 450);
    } catch (err) { clearInterval(timer.current); setRunning(false); setBanner(err.message); }
  };
  if (running) return <div className="wrap sec narrow"><AnalysisProgress step={pstep} demo={isDemoMode} /></div>;
  const fields = [...PATIENT_FIELDS, ...CLINICAL_FIELDS];
  return (
    <div className="wrap sec narrow">
      <div className="row between"><h1>Analyze a patient</h1><button className="btn" onClick={loadDemo}><FlaskConical size={16} /> Load Demo Patient</button></div>
      {isDemoMode && <p className="tag warn">DEMO MODE — Simulated prediction</p>}
      <ol className="stepper" aria-label="Progress">{TITLES.map((t, i) => <li key={t} className={i === step ? 'cur' : i < step ? 'ok' : ''} aria-current={i === step ? 'step' : undefined}><span>{i < step ? <Check size={14} /> : i + 1}</span><em>{t}</em></li>)}</ol>
      {banner && <p className="banner" role="alert">{banner}</p>}
      <div className="panel">
        {step === 0 && <FormSection fields={PATIENT_FIELDS} values={values} onChange={set} errors={errors} />}
        {step === 1 && <FormSection fields={CLINICAL_FIELDS} values={values} onChange={set} errors={errors} />}
        {step === 2 && <ImageUploader id="fundus" title="Fundus Photograph" description="Upload the patient's retinal fundus image." value={fundus} onChange={(v) => { setFundus(v); setErrors({}); setBanner(''); }} error={errors.fundus} />}
        {step === 3 && <ImageUploader id="oct" title="OCT Scan" description="Upload the OCT retinal scan for structural analysis." value={oct} onChange={(v) => { setOct(v); setErrors({}); setBanner(''); }} error={errors.oct} />}
        {step === 4 && (
          <div className="card review"><h3>Review inputs</h3>
            <dl>{fields.map((f) => <div key={f.name}><dt>{f.label}</dt><dd>{values[f.name] ? `${values[f.name]}${f.unit ? ' ' + f.unit : ''}` : '—'}</dd></div>)}
              <div><dt>Fundus</dt><dd>{fundus ? `✓ ${fundus.name}` : 'Missing'}</dd></div><div><dt>OCT</dt><dd>{oct ? `✓ ${oct.name}` : 'Missing'}</dd></div></dl>
          </div>)}
      </div>
      <div className="row between">
        {step === 4 ? <button className="btn" onClick={() => setStep(0)}>Edit Information</button> : <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>}
        {step === 4 ? <button className="btn primary lg" disabled={!fundus || !oct} onClick={run}>Analyze Patient</button> : <button className="btn primary" onClick={next}>Continue</button>}
      </div>
    </div>
  );
}
