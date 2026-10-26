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
      <div className="row between" style={{ marginBottom: '8px' }}>
        <div>
          <h1><CheckCircle2 className="okc" /> Analysis complete</h1>
          <p className="muted">Patient {r.patientId} · {new Date(r.timestamp).toLocaleString()}</p>
        </div>
        <div className="col">
          <span className="tag">Model output</span>
          <span className="tag">Multimodal Retinal AI</span>
          {r.recordId && <span className="tag" style={{ borderColor: '#059669', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)' }}>Saved to Supabase</span>}
        </div>
      </div>

      {/* 1. Primary Severity Classification & Probability Chart */}
      <div className="grid2 top" style={{ marginBottom: '28px' }}>
        <SeverityCard r={r} />
        <ProbabilityChart data={r.probabilities} />
      </div>

      {/* 2. Visual Attention Maps (Grad-CAM) */}
      <div className="sec-head" style={{ margin: '28px 0 14px' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Visual Attention & Feature Maps</h2>
        <p className="muted" style={{ fontSize: '0.86rem' }}>Deep-learning attention localizations for structural and microvascular biomarkers.</p>
      </div>
      <div className="grid2">
        <div className="card">
          <HeatmapViewer title="Fundus Imaging Analysis" modality="fundus" original={fundus.url} heatmap={r.fundus.heatmap} overlay={r.fundus.overlay} blobs={r.fundus.blobs} ratio="4/3" />
        </div>
        <div className="card">
          <HeatmapViewer title="OCT Scan Analysis" modality="oct" original={oct.url} heatmap={r.oct.heatmap} overlay={r.oct.overlay} blobs={r.oct.blobs} ratio="4/3" />
        </div>
      </div>
      <div className="note" style={{ margin: '14px 0 28px', padding: '10px 14px', background: 'rgba(14, 116, 144, 0.08)', borderRadius: '8px' }}>
        Grad-CAM visual overlays highlight retinal areas that contributed most heavily to the model's feature representations.
      </div>

      {/* 3. Biomarker Attribution & Modality Weights */}
      <div className="sec-head" style={{ margin: '28px 0 14px' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Multimodal Attribution & Weights</h2>
        <p className="muted" style={{ fontSize: '0.86rem' }}>SHAP biomarker contributions and modality fusion attention distribution.</p>
      </div>
      <div className="grid2" style={{ marginBottom: '28px' }}>
        <ClinicalExplanation items={r.clinical} />
        {r.modality && <ModalityContribution items={r.modality} />}
      </div>

      {/* 4. Model Architecture & Pipeline */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Multimodal Prediction Architecture</h3>
          <span className="tag">End-to-End Pipeline</span>
        </div>
        <Pipeline />
      </div>

      {/* 5. Patient Summary & Export */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Patient Assessment Summary</h3>
          <span className="tag">Verified</span>
        </div>
        <dl className="sum">
          <div><dt>Patient ID</dt><dd>{r.patientId}</dd></div>
          <div><dt>Predicted Severity</dt><dd>{r.severity}</dd></div>
          <div><dt>Confidence Score</dt><dd>{Math.round(r.confidence * 100)}%</dd></div>
          <div><dt>Imaging Modalities</dt><dd>Fundus CFP ✓ OCT Scan ✓</dd></div>
          <div><dt>Clinical Profile</dt><dd>Complete ✓</dd></div>
          <div><dt>Explainability Engine</dt><dd>Grad-CAM ✓ SHAP ✓</dd></div>
        </dl>
        <div className="row" style={{ marginTop: '16px' }}>
          <button className="btn primary" onClick={() => nav('/analyze')}>Start New Analysis</button>
          <button className="btn" disabled title="Report generation will be available in a future version."><FileText size={16} /> Generate Report</button>
        </div>
      </div>
    </div>
  );
}
