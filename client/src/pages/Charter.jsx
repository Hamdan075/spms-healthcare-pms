import { useEffect, useState } from 'react';
import { api, money, fmtDate } from '../api';
import { Panel, Err, ListEditor, Stat } from '../ui';

export default function Charter() {
  const [p, setP] = useState(null); const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const load = () => api.get('/project').then((x) => setP({ ...x, objectivesText: (x.objectives || []).join('\n') })).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  if (!p) return <Err msg={err} />;
  const set = (k, v) => setP({ ...p, [k]: v }); const setPlan = (k, v) => setP({ ...p, plan: { ...p.plan, [k]: v } }); const setClosure = (k, v) => setP({ ...p, closure: { ...p.closure, [k]: v } });
  const save = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    const { _id, effective, objectivesText, createdAt, updatedAt, __v, ...rest } = p;
    try { await api.put('/project', { ...rest, objectives: objectivesText.split('\n').map((s) => s.trim()).filter(Boolean), approvedBudget: Number(p.approvedBudget) }); setMsg('Saved.'); await load(); } catch (x) { setErr(x.message); }
  };
  return (
    <form onSubmit={save}>
      <div className="head"><h2 className="title">Project charter and management plan</h2><button className="btn primary" type="submit">Save all changes</button></div>
      <Err msg={err} />{msg && <div className="ok">{msg}</div>}
      <div className="stats"><Stat label="Approved budget (baseline)" value={money(p.approvedBudget)} /><Stat label="Budget after approved changes" value={money(p.effective.budget)} sub={'+' + money(p.effective.extraCost)} />
        <Stat label="Deadline (baseline)" value={fmtDate(p.deadline)} /><Stat label="Deadline after approved changes" value={fmtDate(p.effective.deadline)} sub={'+' + p.effective.extraDays + ' days'} /></div>
      <Panel title="Charter">
        <div className="form">
          <label className="wide">Project name<input value={p.name || ''} onChange={(e) => set('name', e.target.value)} required /></label>
          <label className="wide">Description<textarea rows={2} value={p.description || ''} onChange={(e) => set('description', e.target.value)} /></label>
          <label className="wide">Objectives (one per line)<textarea rows={4} value={p.objectivesText} onChange={(e) => set('objectivesText', e.target.value)} /></label>
          <label>Approved budget (PKR)<input type="number" min="1" value={p.approvedBudget} onChange={(e) => set('approvedBudget', e.target.value)} required /></label>
          <label>Status<select value={p.status} onChange={(e) => set('status', e.target.value)}>{['Initiation', 'Planning', 'Executing', 'Monitoring and Controlling', 'Closed'].map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Start date<input type="date" value={fmtDate(p.startDate)} onChange={(e) => set('startDate', e.target.value)} required /></label>
          <label>Deadline<input type="date" value={fmtDate(p.deadline)} onChange={(e) => set('deadline', e.target.value)} required /></label>
          <label className="wide">In scope<textarea rows={2} value={p.scopeIn || ''} onChange={(e) => set('scopeIn', e.target.value)} /></label>
          <label className="wide">Out of scope<textarea rows={2} value={p.scopeOut || ''} onChange={(e) => set('scopeOut', e.target.value)} /></label>
        </div>
      </Panel>
      <Panel title="Stakeholders"><ListEditor rows={p.stakeholders} setRows={(r) => set('stakeholders', r)} cols={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'interest', label: 'Interest' }]} /></Panel>
      <Panel title="Responsibilities (project team)"><ListEditor rows={p.responsibilities} setRows={(r) => set('responsibilities', r)} cols={[{ key: 'member', label: 'Member' }, { key: 'role', label: 'Role' }, { key: 'duty', label: 'Responsibility' }]} /></Panel>
      <Panel title="Milestones"><ListEditor rows={p.milestones} setRows={(r) => set('milestones', r)} cols={[{ key: 'name', label: 'Milestone' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'done', label: 'Done', type: 'check' }]} /></Panel>
      <Panel title="Project management plan"><div className="form">
        {[['scope', 'Scope plan'], ['schedule', 'Schedule plan'], ['cost', 'Cost plan'], ['quality', 'Quality plan']].map(([k, l]) => <label key={k} className="wide">{l}<textarea rows={2} value={p.plan?.[k] || ''} onChange={(e) => setPlan(k, e.target.value)} /></label>)}</div></Panel>
      <Panel title="Closure record"><div className="form">
        <label><span>Project closed</span><input type="checkbox" checked={!!p.closure?.closed} onChange={(e) => { setClosure('closed', e.target.checked); if (e.target.checked) setClosure('date', new Date().toISOString().slice(0, 10)); }} /></label>
        <label>Closure date<input type="date" value={p.closure?.date ? String(p.closure.date).slice(0, 10) : ''} onChange={(e) => setClosure('date', e.target.value)} /></label>
        <label className="wide">Lessons learned<textarea rows={2} value={p.closure?.lessons || ''} onChange={(e) => setClosure('lessons', e.target.value)} /></label>
        <p className="muted wide">Closing is blocked while critical defects are unresolved or activities are incomplete.</p></div></Panel>
    </form>
  );
}
