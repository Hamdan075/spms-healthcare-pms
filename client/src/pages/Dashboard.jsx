import { useState } from 'react';
import { api, useData, money, fix, fmtDate } from '../api';
import { Panel, Stat, Badge, Err } from '../ui';

export default function Dashboard() {
  const [ver, setVer] = useState(0); const [d, error] = useData('/dashboard', ver); const [err, setErr] = useState('');
  if (error) return <Err msg={error + ' - is the API running and MongoDB reachable?'} />;
  if (!d) return <p>Loading...</p>;
  const { project: p, evm, budget, schedule } = d;
  const setStatus = async (v) => { try { setErr(''); await api.put('/project', { statusDate: v }); setVer((x) => x + 1); } catch (e) { setErr(e.message); } };
  return (
    <>
      <div className="head"><div><h2 className="title">{p.name}</h2><p className="muted">Status: {p.status}. Baseline {money(p.baselineBudget)} / {fmtDate(p.baselineDeadline)}; current {money(p.budget)} / {fmtDate(p.deadline)}</p></div>
        <div className="row"><label className="inline">Status date<input type="date" value={fmtDate(p.statusDate)} onChange={(e) => e.target.value && setStatus(e.target.value)} /></label><button className="btn" onClick={() => window.print()}>Print report</button></div></div>
      <Err msg={err} />
      <div className="warnings">{d.warnings.length === 0 && <div className="ok">All indicators are within thresholds.</div>}
        {d.warnings.map((w, i) => <div key={i} className={'warn ' + w.level}>{w.message}</div>)}</div>
      <div className="stats">
        <Stat label="Progress (earned / planned)" value={fix(d.progressPercent) + '%'} />
        <Stat label="CPI" value={fix(evm.CPI)} tone={evm.CPI < 0.8 ? 'bad' : evm.CPI < 0.9 ? 'mid' : 'good'} sub="cost performance" />
        <Stat label="SPI" value={fix(evm.SPI)} tone={evm.SPI < 0.8 ? 'bad' : evm.SPI < 0.9 ? 'mid' : 'good'} sub="schedule performance" />
        <Stat label="Projected finish" value={schedule.projectedFinish} tone={schedule.daysLate ? 'bad' : 'good'} sub={schedule.daysLate ? schedule.daysLate + ' day(s) after deadline' : 'on time'} />
        <Stat label="Spent / approved" value={money(budget.spent)} sub={'of ' + money(budget.approved)} tone={budget.forecast > budget.approved ? 'mid' : 'good'} />
        <Stat label="Forecast at completion" value={money(budget.forecast)} />
      </div>
      <div className="grid2">
        <Panel title="Delayed and impacted activities"><table><thead><tr><th>Activity</th><th>Status</th><th>Slip</th><th>Forecast end</th></tr></thead><tbody>
          {d.delayed.length === 0 && <tr><td colSpan="4" className="empty">No delayed activities.</td></tr>}
          {d.delayed.map((x) => <tr key={x.name}><td>{x.name}<br /><small>{x.assignee}</small></td><td><Badge v={x.status} /></td><td>{x.delay} d</td><td>{x.forecastEnd}</td></tr>)}</tbody></table></Panel>
        <Panel title="Unresolved critical defects"><table><thead><tr><th>Defect</th><th>Owner</th><th>Status</th></tr></thead><tbody>
          {d.criticalDefects.length === 0 && <tr><td colSpan="3" className="empty">None.</td></tr>}
          {d.criticalDefects.map((x) => <tr key={x.title}><td>{x.title}</td><td>{x.assignee}</td><td><Badge v={x.status} /></td></tr>)}</tbody></table></Panel>
        <Panel title="Pending change requests"><table><thead><tr><th>Request</th><th>Cost</th><th>Days</th></tr></thead><tbody>
          {d.pendingChangeRequests.length === 0 && <tr><td colSpan="3" className="empty">None pending.</td></tr>}
          {d.pendingChangeRequests.map((x) => <tr key={x.title}><td>{x.title}</td><td>{money(x.costImpact)}</td><td>+{x.scheduleImpactDays}</td></tr>)}</tbody></table></Panel>
        <Panel title="Scope, quality and top risks">
          <p>Requirements: {d.requirements.approved} approved, {d.requirements.proposed} proposed, {d.requirements.rejected} rejected.</p>
          <p>Quality checks: {d.quality.pass} pass, {d.quality.fail} fail, {d.quality.pending} pending.</p>
          <table><tbody>{d.topRisks.map((r) => <tr key={r.title}><td>{r.title}</td><td>{r.score}</td><td><Badge v={r.level} /></td></tr>)}</tbody></table></Panel>
      </div>
      <Panel title="Milestones"><div className="miles">{d.milestones.map((m) => <div key={m.name} className={m.done ? 'done' : ''}><b>{m.name}</b><span>{fmtDate(m.date)}</span><Badge v={m.done ? 'Done' : 'Upcoming'} /></div>)}</div></Panel>
    </>
  );
}
