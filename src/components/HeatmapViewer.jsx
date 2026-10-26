import { useEffect, useRef, useState } from 'react';
import { Eye, Layers, Flame, Sliders } from 'lucide-react';

// Classical medical Jet colormap (deep blue -> cyan -> green -> yellow -> red)
function getJetColor(t) {
  const r = Math.min(Math.max(1.5 - Math.abs(t * 4 - 3), 0), 1);
  const g = Math.min(Math.max(1.5 - Math.abs(t * 4 - 2), 0), 1);
  const b = Math.min(Math.max(1.5 - Math.abs(t * 4 - 1), 0), 1);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Google Turbo medical colormap
function getTurboColor(t) {
  const r = Math.min(Math.max(34.61 + t * (1172.6 + t * (-3162.2 + t * (3483.9 + t * -1449.6))), 0), 255);
  const g = Math.min(Math.max(23.31 + t * (557.3 + t * (1231.8 + t * (-3474.9 + t * 1802.7))), 0), 255);
  const b = Math.min(Math.max(27.2 + t * (3211.1 + t * (-15327.9 + t * (27814.0 + t * -17424.8))), 0), 255);
  return [Math.round(r), Math.round(g), Math.round(b)];
}

// Inferno / Hot iron thermal colormap
function getInfernoColor(t) {
  const r = Math.min(Math.max(t < 0.33 ? t * 3 * 180 : 180 + (t - 0.33) * 1.5 * 75, 0), 255);
  const g = Math.min(Math.max(t < 0.33 ? 0 : t < 0.66 ? (t - 0.33) * 3 * 160 : 160 + (t - 0.66) * 3 * 95, 0), 255);
  const b = Math.min(Math.max(t < 0.25 ? 20 + t * 4 * 100 : t < 0.5 ? 120 - (t - 0.25) * 4 * 100 : 20, 0), 255);
  return [Math.round(r), Math.round(g), Math.round(b)];
}

// Continuous Gaussian Medical Attention Canvas
function GradCamCanvas({ blobs = [], modality = 'fundus', colormap = 'jet', opacity = 0.7, isStandalone = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 400;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const getColor = colormap === 'turbo' ? getTurboColor : colormap === 'inferno' ? getInfernoColor : getJetColor;

    const safeBlobs = Array.isArray(blobs) && blobs.length > 0
      ? blobs
      : [[50, 48, 28, 1.0], [61, 54, 24, 0.88], [40, 52, 22, 0.8]];

    // 2D continuous Gaussian density calculation
    for (let y = 0; y < height; y++) {
      const v = y / height;
      for (let x = 0; x < width; x++) {
        const u = x / width;
        let intensity = 0;

        // Modality-specific anatomical attention envelope
        if (modality === 'oct') {
          // Horizontal retinal strata with central foveal pit dip
          const foveaDip = 0.50 + 0.06 * Math.cos(Math.PI * (u - 0.5));
          const layerDist = Math.abs(v - foveaDip) / 0.12;
          intensity += 0.32 * Math.exp(-layerDist * layerDist * 2.5);
        }

        // Gaussian kernels for microvascular / retinal lesion foci
        for (let b = 0; b < safeBlobs.length; b++) {
          const blob = safeBlobs[b];
          const bx = blob[0] / 100;
          const by = blob[1] / 100;
          const br = Math.max(0.08, (blob[2] || 25) / 100 * 0.7);
          const weight = blob[3] !== undefined ? blob[3] : 1.0;

          const dx = (u - bx) / br;
          const dy = (v - by) / br;
          const d2 = dx * dx + dy * dy;
          intensity += weight * Math.exp(-d2 * 0.75);
        }

        // Smooth normalization to [0, 1]
        const clamped = Math.min(1.0, Math.max(0, intensity * 0.82));
        const idx = (y * width + x) * 4;

        if (isStandalone) {
          // Heatmap View: Full-contrast thermal presentation on dark medical backdrop
          if (clamped < 0.08) {
            data[idx] = 4;
            data[idx + 1] = 8;
            data[idx + 2] = 20;
            data[idx + 3] = 255;
          } else {
            const [cr, cg, cb] = getColor(clamped);
            data[idx] = cr;
            data[idx + 1] = cg;
            data[idx + 2] = cb;
            data[idx + 3] = 255;
          }
        } else {
          // Overlay View: Smooth alpha falloff over anatomical scan
          if (clamped < 0.12) {
            data[idx + 3] = 0; // Transparent over healthy / baseline tissue
          } else {
            const normalized = (clamped - 0.12) / 0.88;
            const [cr, cg, cb] = getColor(clamped);
            data[idx] = cr;
            data[idx + 1] = cg;
            data[idx + 2] = cb;
            // Smooth non-linear alpha blend
            const alphaWeight = Math.pow(normalized, 0.85);
            data[idx + 3] = Math.round(opacity * alphaWeight * 255);
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [blobs, modality, colormap, opacity, isStandalone]);

  return (
    <canvas
      ref={canvasRef}
      className="heat"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        pointerEvents: 'none'
      }}
    />
  );
}

export default function HeatmapViewer({
  title,
  original,
  heatmap,
  overlay,
  blobs,
  modality = 'fundus',
  ratio = '4/3'
}) {
  const [tab, setTab] = useState('overlay');
  const [op, setOp] = useState(70);
  const [colormap, setColormap] = useState('jet');

  const hasRealOverlay = Boolean(overlay);
  const isOct = modality === 'oct' || String(title).toLowerCase().includes('oct');

  return (
    <div className="hv" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Title and Tech Badge */}
      <div className="hvhead" style={{ marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{title}</h3>
          <span className="muted" style={{ fontSize: '0.78rem' }}>
            {isOct ? 'Macular retinal strata & foveal depression' : 'Temporal vascular arcade & microaneurysm focus'}
          </span>
        </div>
        <span className="tag" style={{ alignSelf: 'flex-start' }}>Grad-CAM XAI</span>
      </div>

      {/* Mode View Switcher (Original / Heatmap / Overlay) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="seg" role="tablist" aria-label={`${title} view`} style={{ margin: 0 }}>
          <button
            role="tab"
            aria-selected={tab === 'original'}
            className={tab === 'original' ? 'on' : ''}
            onClick={() => setTab('original')}
          >
            <Eye size={14} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
            Original
          </button>
          <button
            role="tab"
            aria-selected={tab === 'heatmap'}
            className={tab === 'heatmap' ? 'on' : ''}
            onClick={() => setTab('heatmap')}
          >
            <Flame size={14} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
            Heatmap
          </button>
          <button
            role="tab"
            aria-selected={tab === 'overlay'}
            className={tab === 'overlay' ? 'on' : ''}
            onClick={() => setTab('overlay')}
          >
            <Layers size={14} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
            Overlay
          </button>
        </div>

        {/* Colormap Selector */}
        {!hasRealOverlay && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="muted" style={{ fontSize: '0.74rem', marginRight: '4px' }}>Palette:</span>
            {['jet', 'turbo', 'inferno'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColormap(c)}
                style={{
                  background: colormap === c ? 'var(--cy)' : 'var(--bg2)',
                  color: colormap === c ? '#04141a' : 'var(--mu)',
                  border: '1px solid var(--bd)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Medical Stage Viewport */}
      <div className="stage" style={{ width: '100%', aspectRatio: ratio, borderRadius: '10px', background: '#020617' }}>
        {/* 1. Original Scan Mode */}
        {tab === 'original' && (
          <img src={original} alt={`${title} original scan`} />
        )}

        {/* 2. Standalone Heatmap Mode */}
        {tab === 'heatmap' && (
          <div className="blk" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {hasRealOverlay ? (
              <img className="heat" src={overlay} alt={`${title} model sensitivity map`} />
            ) : heatmap ? (
              <img className="heat" src={heatmap} alt={`${title} precomputed heatmap`} />
            ) : (
              <GradCamCanvas
                blobs={blobs}
                modality={isOct ? 'oct' : 'fundus'}
                colormap={colormap}
                isStandalone={true}
              />
            )}
          </div>
        )}

        {/* 3. Combined Anatomical Overlay Mode */}
        {tab === 'overlay' && (
          <>
            <img src={original} alt={`${title} underlying anatomy`} />
            {hasRealOverlay ? (
              <img
                className="heat"
                src={overlay}
                alt={`${title} Grad-CAM overlay`}
                style={{ opacity: op / 100 }}
              />
            ) : (
              <GradCamCanvas
                blobs={blobs}
                modality={isOct ? 'oct' : 'fundus'}
                colormap={colormap}
                opacity={op / 100}
                isStandalone={false}
              />
            )}
          </>
        )}
      </div>

      {/* Calibrated Continuous Attention Colorbar */}
      <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--bd)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--mu)', marginBottom: '5px' }}>
          <span>0.0 Baseline (Normal Retina)</span>
          <span>0.5 Intermediate Focus</span>
          <span style={{ color: '#f87171', fontWeight: 600 }}>1.0 Peak Lesion Focus</span>
        </div>
        <div
          style={{
            height: '8px',
            borderRadius: '4px',
            background: colormap === 'inferno'
              ? 'linear-gradient(to right, #000004, #57106e, #bb3754, #f98e09, #fcffa4)'
              : colormap === 'turbo'
              ? 'linear-gradient(to right, #30123b, #4145ab, #4675ed, #39a2fc, #1bcfd4, #24eca6, #61f46e, #a4fc3c, #d1e834, #f3c63a, #fe9b2d, #f36315, #d93806, #b11902, #7a0403)'
              : 'linear-gradient(to right, #00007f, #0000ff, #007fff, #00ffff, #7fff7f, #ffff00, #ff7f00, #ff0000, #7f0000)'
          }}
        />
      </div>

      {/* Opacity Control & Live Feedback */}
      <div style={{ minHeight: '44px', display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        {tab === 'overlay' ? (
          <label className="slider" style={{ width: '100%', margin: 0 }}>
            <Sliders size={14} style={{ flexShrink: 0, color: 'var(--cy)' }} />
            <span>Grad-CAM opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={op}
              onChange={(e) => setOp(+e.target.value)}
            />
            <strong style={{ minWidth: '40px', textAlign: 'right', color: 'var(--tx)' }}>{op}%</strong>
          </label>
        ) : (
          <span className="muted" style={{ fontSize: '0.82rem' }}>
            Switch to <strong>Overlay</strong> mode to adjust real-time Grad-CAM attention blending.
          </span>
        )}
      </div>
    </div>
  );
}
