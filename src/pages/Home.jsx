import { Link } from 'react-router-dom';
import { Eye, ScanLine, Stethoscope, Flame, BarChart3, FlaskConical } from 'lucide-react';
import Pipeline from '../components/Pipeline.jsx';
import { CLASSES, COLORS } from '../utils/constants.js';
const INPUTS = [[Eye, 'Fundus Imaging', 'RETFound-CFP', 'Fundus photography captures the visible retina, showing lesion patterns such as microaneurysms, haemorrhages and exudates.'], [ScanLine, 'OCT Imaging', 'RETFound-OCT', 'Optical coherence tomography adds cross-sectional structural information about the retinal layers.'], [Stethoscope, 'Clinical Information', 'Clinical MLP', 'Clinical indicators such as HbA1c, blood pressure and diabetes duration give patient-level context that complements imaging.']];
export default function Home() {
  return (<>
    <section className="hero wrap">
      <div className="herotxt">
        <span className="tag">Research prototype · Demo mode</span>
        <h1>Multimodal AI for Diabetic Retinopathy Severity</h1>
        <p className="lead">Analyze retinal imaging and clinical information through a unified research workflow designed for explainable diabetic retinopathy severity assessment.</p>
        <div className="row"><Link to="/analyze" className="btn primary lg">Start Analysis</Link><Link to="/about" className="btn lg">Explore Methodology</Link></div>
      </div>
      <Pipeline />
    </section>
    <section className="wrap sec"><h2>Three inputs, one assessment</h2>
      <div className="grid3">{INPUTS.map(([I, t, b, d]) => (<article className="card" key={t}><I className="ico" /><h3>{t}</h3><p className="muted">{d}</p><span className="tag">{b}</span></article>))}</div></section>
    <section className="wrap sec"><h2>Explainable by design</h2>
      <div className="grid2">
        <article className="card"><Flame className="ico" /><h3>Visual explanation</h3><span className="tag">Grad-CAM</span><p className="muted">Highlights regions of the retinal image that influenced the model's prediction.</p></article>
        <article className="card"><BarChart3 className="ico" /><h3>Clinical explanation</h3><span className="tag">SHAP</span><p className="muted">Shows how individual clinical variables contributed to the model's prediction. A feature that contributed to the prediction is not claimed to have caused the disease.</p></article>
      </div></section>
    <section className="wrap sec"><h2>Severity scale</h2>
      <ol className="steps5">{CLASSES.map((c, i) => <li key={c} style={{ '--c': COLORS[i] }}><i />{c}</li>)}</ol></section>
    <section className="wrap sec"><div className="card disclaimer"><FlaskConical className="ico" /><div><h3>Research prototype</h3><p className="muted">This interface is developed for academic and research demonstration purposes. Demo predictions are simulated and are not intended for clinical diagnosis or treatment decisions.</p></div></div></section>
  </>);
}
