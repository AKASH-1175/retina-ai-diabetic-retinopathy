import { Check, Loader2 } from 'lucide-react';
export const STEPS = ['Preparing patient data', 'Processing fundus image', 'Processing OCT scan', 'Encoding clinical information', 'Combining multimodal features', 'Generating explanation', 'Preparing results'];
export default function AnalysisProgress({ step, demo }) {
  return (
    <div className="card progress" role="status" aria-live="polite">
      <h2>{demo ? 'Running simulated analysis' : 'Running analysis'}</h2>
      <ul>{STEPS.map((s, i) => (
        <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}>
          <span>{s}</span>{i < step ? <Check size={18} /> : i === step ? <Loader2 size={18} className="spin" /> : <i />}
        </li>))}</ul>
      <div className="bar"><div style={{ width: `${Math.min(100, (step / STEPS.length) * 100)}%` }} /></div>
    </div>
  );
}
