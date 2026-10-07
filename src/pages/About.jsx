import Pipeline from '../components/Pipeline.jsx';
import { CLASSES, COLORS } from '../utils/constants.js';
const S = [
  ['Problem', 'Diabetic retinopathy (DR) is a microvascular complication of diabetes and a leading cause of preventable vision loss. Grading its severity from a single image type can miss complementary evidence.'],
  ['Proposed approach', 'Combine three sources of evidence: colour fundus photographs, OCT scans and structured clinical information, to estimate DR severity in one workflow.'],
  ['Foundation models', 'RETFound-based encoders (CFP for fundus, OCT for cross-sectional scans) extract retinal features. A small clinical neural network (MLP) encodes the tabular clinical variables.'],
  ['Multimodal fusion', 'The fundus, OCT and clinical feature vectors are combined by a fusion module and passed to a severity classifier that outputs class probabilities.'],
  ['Explainability', 'Grad-CAM-style visual attribution for imaging and SHAP values for clinical variables show what contributed to a prediction. Contribution is not clinical causation.'],
];
export default function About() {
  return (
    <div className="wrap sec" id="about">
      <h1>Methodology</h1>
      <Pipeline />
      <div className="stack">{S.map(([t, d]) => <article className="card" key={t}><h3>{t}</h3><p className="muted">{d}</p></article>)}
        <article className="card"><h3>Severity classes</h3><ol className="steps5">{CLASSES.map((c, i) => <li key={c} style={{ '--c': COLORS[i] }}><i />{c}</li>)}</ol></article>
        <article className="card"><h3>Model evaluation</h3><p className="muted">Model evaluation will be added after training and validation.</p></article>
        <article className="card disclaimer"><div><h3>Research prototype</h3><p className="muted">This is an academic B.Tech project. The current website runs in demo mode: every prediction, heatmap and contribution value is simulated and no trained model is connected. It must not be used for clinical diagnosis.</p></div></article></div>
    </div>
  );
}
