import { useState } from 'react';
import { api, useData, money, fix } from '../api';
import { Panel, Stat, Err } from '../ui';

export default function Cost() {
  const [v, setV] = useState(0); const [e, error] = useData('/evm', v); const [acts] = useData('/activities', v); const [err, setErr] = useState(''); const [edit, setEdit] = useState({});
  if (!e || !acts) return <Err msg={error || 'Loading...'} />;
  const save = async (a) => {
    setErr(''); const x = edit[a._id] || {};
    try { await api.put('/activities/' + a._id, { percentComplete: Number(x.percentComplete ?? a.percentComplete), actualCost: Number(x.actualCost ?? a.actualCost), plannedCost: Number(x.plannedCost ?? a.plannedCost) }); setEdit({ ...edit, [a._id]: undefined }); setV(v + 1); } catch (z) { setErr(z.message); }
  };
  const tone = (x) => (x < 0.8 ? 'bad' : x < 0.9 ? 'mid' : 'good');
  const cell = (a, k) => <input type="number" min="0" max={k === 'percentComplete' ? 100 : undefined} value={edit[a._id]?.[k] ?? a[k]} onChange={(ev) => setEdit({ ...edit, [a._id]: { ...edit[a._id], [k]: ev.target.value } })} />;
  return (
    <>
      <div className="head"><h2 className="title">Cost management and earned value</h2></div>
      <div className="warnings">{e.warnings.length === 0 && <div className="ok">Cost and schedule performance are within thresholds.</div>}{e.warnings.map((w, i) => <div key={i} className={'warn ' + w.level}>{w.message}</div>)}</div>
      <div className="stats">
        <Stat label="Planned value (PV)" value={money(e.PV)} /><Stat label="Earned value (EV)" value={money(e.EV)} /><Stat label="Actual cost (AC)" value={money(e.AC)} />
        <Stat label="CPI = EV / AC" value={fix(e.CPI)} tone={tone(e.CPI)} /><Stat label="SPI = EV / PV" value={fix(e.SPI)} tone={tone(e.SPI)} />
        <Stat label="Budget at completion" value={money(e.BAC)} sub={'approved ' + money(e.budget)} tone={e.BAC > e.budget ? 'bad' : ''} /><Stat label="Estimate at completion" value={money(e.EAC)} sub={'variance ' + money(e.VAC)} />
        <Stat label="Cost variance / schedule variance" value={money(e.CV)} sub={'SV ' + money(e.SV)} /></div>
      <Err msg={err} />
      <Panel title="Track progress and expenditure per activity"><div className="scroll"><table className="edit"><thead><tr><th>Activity</th><th>Planned cost</th><th>% complete</th><th>Actual cost</th><th>Earned value</th><th /></tr></thead><tbody>
        {acts.map((a) => <tr key={a._id}><td>{a.name}</td><td>{cell(a, 'plannedCost')}</td><td>{cell(a, 'percentComplete')}</td><td>{cell(a, 'actualCost')}</td><td>{money((a.plannedCost * (edit[a._id]?.percentComplete ?? a.percentComplete)) / 100)}</td>
          <td><button className="btn sm primary" disabled={!edit[a._id]} onClick={() => save(a)}>Update</button></td></tr>)}</tbody></table></div></Panel>
      <p className="muted">PV = planned cost x share of the activity scheduled to be finished by the status date. EV = planned cost x percent complete. Warning thresholds: below 0.9, critical below 0.8.</p>
    </>
  );
}
