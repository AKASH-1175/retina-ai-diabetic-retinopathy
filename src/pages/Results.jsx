import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, FileText } from 'lucide-react';
import { useAnalysis } from '../AnalysisContext.jsx';
import Pipeline from '../components/Pipeline.jsx';
import HeatmapViewer from '../components/HeatmapViewer.jsx';
import { SeverityCard, ProbabilityChart, ClinicalExplanation, ModalityContribution } from '../components/ResultParts.jsx';
export default function Results() {
  const { result: r } = useAnalysis(); const nav = useNavigate();
  if (!r) return <div className="wrap sec narrow"><div className="card empty"><h2>No analysis found</h2><p className="muted">No analysis found. Start a new patient analysis.</p><Link to="/analyze" className="btn primary">Start New Analysis</Link></div></div>;
  const { fundus, oct } = r.inputs;
  return (
    <div className="wrap sec">
      <div className="row between"><div><h1><CheckCircle2 className="okc" /> Analysis complete</h1>
        <p className="muted">Patient {r.patientId} · {new Date(r.timestamp).toLocaleString()}</p></div>
        <div className="col">{r.demo ? <span className="tag warn">DEMO MODE — Simulated prediction</span> : <span className="tag">Model output</span>}<span className="tag">Research prototype — Not for clinical diagnosis</span></div></div>
      <div className="grid2 top"><SeverityCard r={r} /><ProbabilityChart data={r.probabilities} demo={r.demo} /></div>
      <div className="card"><h3>Fundus analysis</h3><HeatmapViewer title="Fundus" original={fundus.url} heatmap={r.fundus.heatmap} overlay={r.fundus.overlay} blobs={r.fundus.blobs} /></div>
      <div className="card"><h3>OCT analysis</h3><HeatmapViewer title="OCT" original={oct.url} heatmap={r.oct.heatmap} overlay={r.oct.overlay} blobs={r.oct.blobs} ratio="4/3" />
        <p className="note">{r.demo ? 'Demo visualization: ' : ''}Highlighted regions indicate where the model's attention was strongest. This is not a diagnosis of specific lesions.</p></div>
      <div className="grid2"><ClinicalExplanation items={r.clinical} demo={r.demo} />{r.modality && <ModalityContribution items={r.modality} demo={r.demo} />}</div>
      <div className="card"><h3>How the prediction was produced</h3><Pipeline /></div>
      <div className="card"><h3>Summary</h3>
        <dl className="sum"><div><dt>Patient</dt><dd>{r.patientId}</dd></div><div><dt>Predicted severity</dt><dd>{r.severity}</dd></div><div><dt>Confidence</dt><dd>{Math.round(r.confidence * 100)}%</dd></div><div><dt>Imaging</dt><dd>Fundus ✓ OCT ✓</dd></div><div><dt>Clinical data</dt><dd>Available ✓</dd></div><div><dt>Explainability</dt><dd>Grad-CAM ✓ SHAP ✓</dd></div></dl>
        <div className="row"><button className="btn primary" onClick={() => nav('/analyze')}>Start New Analysis</button><button className="btn" disabled title="Report generation will be available in a future version."><FileText size={16} /> Generate Report</button></div>
        <p className="note">Report generation will be available in a future version. Model evaluation will be added after training and validation.</p></div>
    </div>
  );
}
