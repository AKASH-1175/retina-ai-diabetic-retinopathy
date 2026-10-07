import { CLASSES, COLORS } from '../utils/constants.js';
export function SeverityCard({ r }) {
  const idx = Math.max(0, CLASSES.indexOf(r.severity)), c = COLORS[idx];
  return (
    <div className="card sev">
      <p className="muted">Diabetic retinopathy severity</p>
      <h2 style={{ color: c }}>{r.severity}</h2>
      <div className="conf"><strong>{Math.round(r.confidence * 100)}%</strong><span>confidence</span></div>
      <div className="scale" aria-label={`Severity level ${idx + 1} of 5`}>{CLASSES.map((k, i) => <div key={k} className={i === idx ? 'on' : ''} style={{ background: i === idx ? COLORS[i] : undefined }}><small>{k}</small></div>)}</div>
      {r.demo && <span className="tag warn">DEMO RESULT</span>}
    </div>
  );
}
export function ProbabilityChart({ data, demo }) {
  return (
    <div className="card"><h3>Class probability distribution</h3>
      {demo && <p className="muted">Demo probability distribution — the trained backend will replace these values.</p>}
      <ul className="bars">{data.map((d, i) => (<li key={d.label}><span>{d.label}</span><div className="track"><div style={{ width: `${d.value * 100}%`, background: COLORS[i] }} /></div><b>{Math.round(d.value * 100)}%</b></li>))}</ul>
    </div>
  );
}
export function ClinicalExplanation({ items, demo }) {
  const max = Math.max(0.01, ...items.map((i) => Math.abs(i.contribution)));
  return (
    <div className="card"><h3>Clinical factors influencing prediction</h3>
      <ul className="bars">{items.map((it) => (<li key={it.feature}><span>{it.feature}</span><div className="track"><div style={{ width: `${(Math.abs(it.contribution) / max) * 100}%`, background: it.contribution >= 0 ? 'var(--cy)' : '#fb923c' }} /></div><b>{it.contribution > 0 ? '+' : ''}{it.contribution.toFixed(2)}</b></li>))}</ul>
      <div className="tablewrap"><table><thead><tr><th>Feature</th><th>Value</th><th>Contribution</th></tr></thead>
        <tbody>{items.map((it) => <tr key={it.feature}><td>{it.feature}</td><td>{it.value}</td><td>{it.contribution > 0 ? '+' : ''}{it.contribution.toFixed(2)}</td></tr>)}</tbody></table></div>
      <p className="note">{demo ? 'These values represent simulated model feature contributions in demo mode. ' : ''}Feature contribution does not establish clinical causation.</p>
    </div>
  );
}
export function ModalityContribution({ items, demo }) {
  return (
    <div className="card"><h3>{demo ? 'Demo modality contribution' : 'Modality contribution'}</h3>
      <ul className="bars">{items.map((m) => (<li key={m.name}><span>{m.name}</span><div className="track"><div style={{ width: `${m.value * 100}%`, background: 'var(--cy)' }} /></div><b>{Math.round(m.value * 100)}%</b></li>))}</ul>
      {demo && <p className="note">Illustrative demo visualization — actual contributions will come from the trained model.</p>}
    </div>
  );
}
