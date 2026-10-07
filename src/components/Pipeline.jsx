import { Fragment } from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
const LANES = [['Fundus Image', 'RETFound-CFP', 'Image Features'], ['OCT Scan', 'RETFound-OCT', 'OCT Features'], ['Clinical Data', 'Clinical MLP', 'Clinical Features']];
export default function Pipeline() {
  return (
    <div className="pipe" role="img" aria-label="Fundus, OCT and clinical data are encoded separately, fused, classified into a DR severity, then explained with Grad-CAM and SHAP.">
      <div className="lanes">
        {LANES.map((l) => (
          <div className="lane" key={l[0]}>
            {l.map((n, i) => (<Fragment key={n}><div className={'node' + (i === 1 ? ' model' : '')}>{n}</div>{i < 2 && <ArrowRight size={16} className="ar" />}</Fragment>))}
          </div>
        ))}
      </div>
      <div className="fuse">
        <ArrowRight className="ar toright" size={20} /><ArrowDown className="ar todown" size={20} />
        <div className="node big">Multimodal Fusion</div><ArrowDown size={16} className="ar" />
        <div className="node big">Severity Classifier</div><ArrowDown size={16} className="ar" />
        <div className="node big accent">DR Severity Result</div>
        <div className="node xai">Explainability: Grad-CAM + SHAP</div>
      </div>
    </div>
  );
}
