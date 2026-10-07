export default function FormSection({ fields, values, onChange, errors }) {
  return (
    <div className="grid2">
      {fields.map((f) => {
        const id = 'f-' + f.name, err = errors[f.name];
        const common = { id, value: values[f.name], 'aria-invalid': !!err, 'aria-describedby': err ? id + '-err' : undefined, onChange: (e) => onChange(f.name, e.target.value) };
        return (
          <div className="field" key={f.name}>
            <label htmlFor={id}>{f.label}{f.unit && <span className="unit"> ({f.unit})</span>} <em className={f.required ? 'req' : ''}>{f.required ? 'Required' : 'Optional'}</em></label>
            {f.type === 'select'
              ? <select {...common}><option value="">Select…</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
              : <input {...common} type={f.type} step={f.step} min={f.min} max={f.max} placeholder={f.placeholder} />}
            {err && <p className="err" id={id + '-err'} role="alert">{err}</p>}
          </div>
        );
      })}
    </div>
  );
}
