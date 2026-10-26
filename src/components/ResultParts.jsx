import { CLASSES, COLORS } from '../utils/constants.js';

export function SeverityCard({ r }) {
  const idx = Math.max(0, CLASSES.indexOf(r.severity)), c = COLORS[idx];
  return (
    <div className="card sev" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <p className="muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Diabetic Retinopathy Severity</p>
        <h2 style={{ color: c, fontSize: '2.4rem', margin: '4px 0 16px' }}>{r.severity}</h2>
      </div>
      <div className="conf" style={{ margin: '8px 0' }}>
        <strong>{Math.round(r.confidence * 100)}%</strong>
        <span>Classification Confidence</span>
      </div>
      <div className="scale" aria-label={`Severity level ${idx + 1} of 5`}>
        {CLASSES.map((k, i) => (
          <div key={k} className={i === idx ? 'on' : ''} style={{ background: i === idx ? COLORS[i] : undefined }}>
            <small>{k}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProbabilityChart({ data }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3>Class Probability Distribution</h3>
        <span className="tag">Softmax</span>
      </div>
      <ul className="bars" style={{ margin: '0 0 10px' }}>
        {data.map((d, i) => (
          <li key={d.label}>
            <span>{d.label}</span>
            <div className="track"><div style={{ width: `${d.value * 100}%`, background: COLORS[i] }} /></div>
            <b>{Math.round(d.value * 100)}%</b>
          </li>
        ))}
      </ul>
      <p className="muted" style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>Multi-class calibrated confidence scores across the 5 DR severity stages.</p>
    </div>
  );
}

export function ClinicalExplanation({ items = [] }) {
  const safeItems = Array.isArray(items) ? items : [];
  const max = Math.max(0.05, ...safeItems.map((i) => Math.abs(i.contribution || 0)));
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0 }}>Clinical Biomarker Attribution</h3>
        <span className="tag">SHAP XAI</span>
      </div>
      <p className="muted" style={{ fontSize: '0.84rem', marginBottom: '14px' }}>
        Dynamic feature contributions computed from entered patient clinical biomarkers.
      </p>

      {/* Relative Contribution Tracks */}
      <ul className="bars" style={{ margin: '0 0 16px 0' }}>
        {safeItems.map((it) => {
          const contrib = Number(it.contribution || 0);
          const isRisk = contrib > 0;
          const isProtective = contrib < 0;
          const barColor = isRisk ? 'var(--cy)' : isProtective ? '#34d399' : '#94a3b8';
          const pct = Math.min(100, (Math.abs(contrib) / max) * 100);

          return (
            <li key={it.feature}>
              <span style={{ fontSize: '0.88rem' }}>{it.feature}</span>
              <div className="track">
                <div style={{ width: `${pct}%`, background: barColor, transition: 'width 0.4s ease' }} />
              </div>
              <b style={{ color: barColor, fontSize: '0.88rem' }}>
                {contrib > 0 ? '+' : ''}{contrib.toFixed(2)}
              </b>
            </li>
          );
        })}
      </ul>

      {/* Detailed Biomarker Attribution Table */}
      <div className="tablewrap" style={{ marginTop: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Biomarker</th>
              <th>Entered Value</th>
              <th>SHAP Contribution</th>
              <th>Clinical Risk Impact</th>
            </tr>
          </thead>
          <tbody>
            {safeItems.map((it) => {
              const contrib = Number(it.contribution || 0);
              const isRisk = contrib > 0;
              const isProtective = contrib < 0;
              const textColor = isRisk ? 'var(--cy)' : isProtective ? '#34d399' : 'var(--mu)';
              const impactText = isRisk
                ? `+${Math.round(contrib * 100)}% Risk Elevation`
                : isProtective
                ? `${Math.round(contrib * 100)}% Protective`
                : 'Baseline / Neutral';

              return (
                <tr key={it.feature}>
                  <td>{it.feature}</td>
                  <td style={{ fontWeight: 600 }}>{it.value}</td>
                  <td style={{ color: textColor, fontWeight: 700 }}>
                    {contrib > 0 ? '+' : ''}{contrib.toFixed(2)}
                  </td>
                  <td style={{ color: textColor, fontSize: '0.82rem' }}>
                    {impactText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ModalityContribution({ items }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Modality Fusion Contribution</h3>
        <span className="tag">Attention Weights</span>
      </div>
      <p className="muted" style={{ fontSize: '0.84rem', marginBottom: '14px' }}>Relative weight distribution across multimodal input streams.</p>
      <ul className="bars" style={{ margin: '0 0 16px 0' }}>
        {items.map((m) => (
          <li key={m.name}>
            <span>{m.name}</span>
            <div className="track"><div style={{ width: `${m.value * 100}%`, background: 'var(--cy)' }} /></div>
            <b>{Math.round(m.value * 100)}%</b>
          </li>
        ))}
      </ul>
      <div className="tablewrap" style={{ marginTop: 'auto' }}>
        <table>
          <thead>
            <tr><th>Input Stream</th><th>Target Evidence</th><th>Weight</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Fundus Imaging</td>
              <td>Visible microaneurysms & exudates</td>
              <td style={{ color: 'var(--cy)', fontWeight: 600 }}>{items.find(i => i.name === 'Fundus')?.value ? Math.round(items.find(i => i.name === 'Fundus').value * 100) + '%' : '40%'}</td>
            </tr>
            <tr>
              <td>OCT Imaging</td>
              <td>Cross-sectional retinal layer thickness</td>
              <td style={{ color: 'var(--cy)', fontWeight: 600 }}>{items.find(i => i.name === 'OCT')?.value ? Math.round(items.find(i => i.name === 'OCT').value * 100) + '%' : '35%'}</td>
            </tr>
            <tr>
              <td>Clinical Data</td>
              <td>Systemic metrics (HbA1c, BP, duration)</td>
              <td style={{ color: 'var(--cy)', fontWeight: 600 }}>{items.find(i => i.name === 'Clinical')?.value ? Math.round(items.find(i => i.name === 'Clinical').value * 100) + '%' : '25%'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
