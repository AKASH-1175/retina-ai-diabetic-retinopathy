import { useRef, useState } from 'react';
import { UploadCloud, X, RefreshCw, Loader2 } from 'lucide-react';
const OK = ['image/jpeg', 'image/png'], MAX = 10 * 1024 * 1024;
export default function ImageUploader({ id, title, description, value, onChange, error }) {
  const ref = useRef(); const [drag, setDrag] = useState(false); const [loading, setLoading] = useState(false); const [msg, setMsg] = useState('');
  const handle = (file) => {
    if (!file) return; setMsg('');
    if (!OK.includes(file.type)) return setMsg('Please upload a valid image file.');
    if (file.size > MAX) return setMsg('Image exceeds the supported size limit.');
    setLoading(true);
    setTimeout(() => { onChange({ name: file.name, size: file.size, url: URL.createObjectURL(file), file }); setLoading(false); }, 350);
  };
  const e = msg || error, open = () => ref.current.click();
  return (
    <section className="card" aria-labelledby={id + '-t'}>
      <h3 id={id + '-t'}>{title}</h3><p className="muted">{description}</p>
      {value ? (
        <div className="preview">
          <img src={value.url} alt={`${title} preview`} />
          <div className="meta"><strong>{value.name}</strong><span className="muted">{(value.size / 1024).toFixed(0)} KB · stays in your browser</span>
            <div className="row"><button type="button" className="btn sm" onClick={open}><RefreshCw size={14} /> Replace</button><button type="button" className="btn sm" onClick={() => onChange(null)}><X size={14} /> Remove</button></div></div>
        </div>
      ) : (
        <div className={'drop' + (drag ? ' on' : '')} role="button" tabIndex={0} aria-label={`Upload ${title}`} onClick={open}
          onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), open())}
          onDragOver={(ev) => { ev.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(ev) => { ev.preventDefault(); setDrag(false); handle(ev.dataTransfer.files[0]); }}>
          {loading ? <Loader2 className="spin" /> : <UploadCloud />}<p>{loading ? 'Loading image…' : 'Drag and drop, or click to browse'}</p><small>JPG, JPEG or PNG · max 10 MB</small>
        </div>
      )}
      <input ref={ref} id={id} type="file" accept=".jpg,.jpeg,.png" hidden onChange={(ev) => { handle(ev.target.files[0]); ev.target.value = ''; }} />
      {e && <p className="err" role="alert">{e}</p>}
    </section>
  );
}
