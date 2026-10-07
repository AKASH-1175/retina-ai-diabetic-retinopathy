import { useState } from 'react';
// Pass real `heatmap` / `overlay` URLs later; otherwise a clearly-labelled simulated heatmap is drawn.
export default function HeatmapViewer({ title, original, heatmap, overlay, blobs, ratio = '1/1' }) {
  const [tab, setTab] = useState('overlay'); const [op, setOp] = useState(65);
  const simulated = !heatmap && !overlay;
  const sim = <div className="heat" style={{ background: blobs.map(([x, y, r]) => `radial-gradient(circle at ${x}% ${y}%,rgba(255,50,0,.95),rgba(255,190,0,.6) ${r * 0.5}%,rgba(0,170,255,.28) ${r}%,transparent ${r * 1.5}%)`).join(',') }} />;
  const heat = heatmap ? <img className="heat" src={heatmap} alt="" /> : sim;
  return (
    <div className="hv">
      <div className="hvhead"><h4>{title}</h4><span className={'tag ' + (simulated ? 'warn' : '')}>{simulated ? `Simulated Grad-CAM — Demo` : 'Grad-CAM'}</span></div>
      <div className="seg" role="tablist" aria-label={`${title} view`}>
        {['original', 'heatmap', 'overlay'].map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
      </div>
      <div className="stage" style={{ aspectRatio: ratio }}>
        {tab === 'original' && <img src={original} alt={`${title} original`} />}
        {tab === 'heatmap' && <div className="blk">{heat}</div>}
        {tab === 'overlay' && (overlay ? <img src={overlay} alt={`${title} overlay`} /> : <><img src={original} alt={`${title} original under overlay`} /><div className="heat" style={{ opacity: op / 100 }}>{heat}</div></>)}
      </div>
      {tab === 'overlay' && !overlay && <label className="slider">Overlay opacity <input type="range" min="0" max="100" value={op} onChange={(e) => setOp(+e.target.value)} /> {op}%</label>}
    </div>
  );
}
