import { useEffect, useState } from 'react';
import { api } from './api';

export const Badge = ({ v }) => <span className={'badge b-' + String(v).toLowerCase().replace(/[^a-z]+/g, '-')}>{v}</span>;
export const Err = ({ msg }) => (msg ? <div className="error" role="alert">{msg}</div> : null);
export const Panel = ({ title, children, actions }) => <section className="panel"><header><h2>{title}</h2><div>{actions}</div></header>{children}</section>;
export const Stat = ({ label, value, tone, sub }) => <div className={'stat ' + (tone || '')}><span>{label}</span><b>{value}</b>{sub && <small>{sub}</small>}</div>;

const optList = (o = []) => o.map((x) => (typeof x === 'string' ? { value: x, label: x } : x));

function Input({ f, form, set }) {
  const v = form[f.key] ?? '';
  const common = { id: f.key, value: v, required: f.required, onChange: (e) => set(f.key, e.target.value) };
  if (f.type === 'textarea') return <textarea rows={3} {...common} />;
  if (f.type === 'select') return <select {...common}><option value="">- select -</option>{optList(f.options).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
  if (f.type === 'multi') return <select multiple size={4} value={form[f.key] || []} onChange={(e) => set(f.key, [...e.target.selectedOptions].map((o) => o.value))}>{optList(f.options).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
  return <input type={f.type || 'text'} min={f.min} max={f.max} step={f.step} {...common} />;
}

export function Crud({ path, title, columns, fields, onChange, rowActions, blank = {}, reloadKey }) {
  const [rows, setRows] = useState([]); const [form, setForm] = useState(null); const [err, setErr] = useState('');
  const load = () => api.get(path).then(setRows).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [path, reloadKey]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const open = (r) => { setErr(''); setForm(r ? { ...r, ...Object.fromEntries(fields.filter((f) => f.type === 'date').map((f) => [f.key, r[f.key] ? String(r[f.key]).slice(0, 10) : ''])) } : { ...blank }); };
  const done = async () => { setForm(null); await load(); onChange && onChange(); };
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    const body = {}; fields.forEach((f) => { let v = form[f.key]; if (f.type === 'number') v = v === '' || v == null ? undefined : Number(v); if (['select', 'date'].includes(f.type) && v === '') v = undefined; body[f.key] = v; });
    try { form._id ? await api.put(`${path}/${form._id}`, body) : await api.post(path, body); await done(); } catch (x) { setErr(x.message); }
  };
  const del = async (r) => { if (!confirm('Delete this record?')) return; setErr(''); try { await api.del(`${path}/${r._id}`); await done(); } catch (x) { setErr(x.message); } };
  return (
    <Panel title={title} actions={<button className="btn primary" onClick={() => open()}>Add</button>}>
      <Err msg={!form && err} />
      {form && (
        <form className="form" onSubmit={submit}>
          {fields.map((f) => <label key={f.key} className={f.wide ? 'wide' : ''}>{f.label}<Input f={f} form={form} set={set} /></label>)}
          <Err msg={err} />
          <div className="wide row"><button className="btn primary" type="submit">{form._id ? 'Save changes' : 'Create'}</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}
      <div className="scroll"><table><thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th /></tr></thead>
        <tbody>{rows.length === 0 && <tr><td colSpan={columns.length + 1} className="empty">Nothing here yet. Add the first record.</td></tr>}
          {rows.map((r) => (
            <tr key={r._id}>{columns.map((c) => <td key={c.label}>{c.render ? c.render(r) : r[c.key] ?? '-'}</td>)}
              <td className="actions">{rowActions && rowActions(r, done, setErr)}<button className="btn sm" onClick={() => open(r)}>Edit</button><button className="btn sm danger" onClick={() => del(r)}>Delete</button></td></tr>))}
        </tbody></table></div>
    </Panel>
  );
}

export function ListEditor({ rows, setRows, cols }) {
  const upd = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="scroll"><table className="edit"><thead><tr>{cols.map((c) => <th key={c.key}>{c.label}</th>)}<th /></tr></thead>
      <tbody>{rows.map((r, i) => (
        <tr key={i}>{cols.map((c) => <td key={c.key}>{c.type === 'check'
          ? <input type="checkbox" checked={!!r[c.key]} onChange={(e) => upd(i, c.key, e.target.checked)} />
          : <input type={c.type || 'text'} value={c.type === 'date' ? (r[c.key] ? String(r[c.key]).slice(0, 10) : '') : r[c.key] || ''} onChange={(e) => upd(i, c.key, e.target.value)} />}</td>)}
          <td><button type="button" className="btn sm danger" onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove</button></td></tr>))}</tbody></table>
      <button type="button" className="btn sm" onClick={() => setRows([...rows, {}])}>Add row</button></div>
  );
}
