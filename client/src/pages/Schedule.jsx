import { useState } from 'react';
import { useData, fmtDate } from '../api';
import { Crud, Panel, Badge, Stat } from '../ui';

function Gantt({ s }) {
  const day = 86400000, t0 = new Date(s.startDate).getTime();
  const end = Math.max(s.projectedFinishOffset, Math.round((new Date(s.deadline) - t0) / day)) + 7; const pos = (d) => (d / end) * 100;
  const deadlineOff = Math.round((new Date(s.deadline) - t0) / day);
  const weeks = Array.from({ length: Math.ceil(end / 7) + 1 }, (_, i) => i * 7);
  return (
    <div className="gantt">
      <div className="g-chart-inner">
        <div className="g-axis"><span className="g-label">Activities</span><div className="g-track">{weeks.map((w) => <i key={w} style={{ left: pos(w) + '%' }}>W{w / 7 + 1}</i>)}</div></div>
        <div className="g-body">
          <div className="g-vlines">
            <b className="g-status" style={{ left: pos(s.statusOffset) + '%' }}><em>status</em></b>
            <b className="g-deadline" style={{ left: pos(deadlineOff) + '%' }}><em>deadline</em></b>
          </div>
          {s.items.map((i) => (
            <div className="g-row" key={i.id}><span className="g-label" title={i.name}>{i.name}</span>
              <div className="g-track">
                <div className="g-plan" style={{ left: pos(i.es) + '%', width: pos(i.ef - i.es) + '%' }} />
                <div className={'g-bar ' + (i.status === 'Delayed' || i.status === 'Completed Late' ? 'late' : i.status === 'Impacted' ? 'imp' : i.critical ? 'crit' : '')} style={{ left: pos(i.fs) + '%', width: pos(i.ff - i.fs) + '%' }}>
                  <u style={{ width: i.percent + '%' }} /></div></div></div>))}
          <div className="g-lines"><span className="g-label">Milestones</span><div className="g-track">
            {s.milestones.map((m) => { const o = Math.round((new Date(m.date) - t0) / day); return <b key={m.name} className={'g-mile ' + (m.done ? 'done' : '')} title={m.name + ' ' + fmtDate(m.date)} style={{ left: pos(o) + '%' }} />; })}</div></div>
        </div>
      </div>
      <div className="gantt-legend">
        <div className="g-leg-item"><span className="g-swatch g-swatch-plan" /><span>Planned baseline</span></div>
        <div className="g-leg-item"><span className="g-swatch g-swatch-prog" /><span>Forecast (fill = progress)</span></div>
        <div className="g-leg-item"><span className="g-swatch g-swatch-crit" /><span>Critical path</span></div>
        <div className="g-leg-item"><span className="g-swatch g-swatch-imp" /><span>Impacted by predecessor</span></div>
        <div className="g-leg-item"><span className="g-swatch g-swatch-late" /><span>Delayed</span></div>
        <div className="g-leg-item"><span className="g-swatch-diamond" /><span>Milestone</span></div>
        <div className="g-leg-item"><span className="g-swatch-line g-line-status" /><span>Status date</span></div>
        <div className="g-leg-item"><span className="g-swatch-line g-line-deadline" /><span>Deadline</span></div>
      </div>
    </div>
  );
}

export default function Schedule() {
  const [v, setV] = useState(0); const bump = () => setV((x) => x + 1);
  const [s, error] = useData('/schedule', v); const [acts] = useData('/activities', v); const [wbs] = useData('/wbs', v); const [proj] = useData('/project', v);
  const wp = (wbs || []).filter((w) => w.type === 'Work Package');
  return (
    <>
      <div className="head"><h2 className="title">Schedule and resources</h2></div>
      {s && <div className="stats"><Stat label="Planned finish" value={s.plannedFinish} /><Stat label="Projected finish" value={s.projectedFinish} tone={s.daysLate ? 'bad' : 'good'} sub={s.daysLate ? `${s.daysLate} day(s) after deadline ${fmtDate(s.deadline)}` : 'meets deadline ' + fmtDate(s.deadline)} /><Stat label="Critical path" value={s.criticalPath.length + ' activities'} /></div>}
      {error && <div className="error">{error}</div>}
      <Crud path="/activities" title="Activities" onChange={bump} reloadKey={v} blank={{ durationDays: 5, plannedCost: 0, percentComplete: 0, actualCost: 0, dependencies: [] }}
        columns={[{ key: 'name', label: 'Activity' }, { key: 'assignee', label: 'Assignee' }, { label: 'Days', key: 'durationDays' }, { label: 'Depends on', render: (r) => (r.dependencies || []).map((d) => (acts || []).find((a) => a._id === d)?.name).filter(Boolean).join(', ') || '-' }, { label: 'Done', render: (r) => r.percentComplete + '%' }]}
        fields={[{ key: 'name', label: 'Name', required: true, wide: true }, { key: 'wbs', label: 'WBS work package', type: 'select', required: true, options: wp.map((w) => ({ value: w._id, label: `${w.code} ${w.name}` })) },
          { key: 'assignee', label: 'Assigned to', type: 'select', required: true, options: (proj?.responsibilities || []).map((m) => m.member) },
          { key: 'durationDays', label: 'Duration (days)', type: 'number', min: 1, required: true }, { key: 'plannedCost', label: 'Planned cost (PKR)', type: 'number', min: 0 },
          { key: 'dependencies', label: 'Predecessors (Ctrl/Cmd-click for several)', type: 'multi', wide: true, options: (acts || []).map((a) => ({ value: a._id, label: a.name })) }]} />
      {s && <Panel title="Gantt chart and milestones"><Gantt s={s} /></Panel>}
      {s && <Panel title="Schedule table (planned vs forecast)"><div className="scroll"><table><thead><tr><th>Activity</th><th>Planned start</th><th>Planned end</th><th>Forecast end</th><th>Slack</th><th>Status</th><th>Impact on dependents</th></tr></thead><tbody>
        {s.items.map((i) => <tr key={i.id}><td>{i.name}{i.critical && <small> (critical)</small>}</td><td>{i.plannedStart}</td><td>{i.plannedEnd}</td><td>{i.forecastEnd}{i.delay > 0 && <small> +{i.delay}d</small>}</td><td>{i.slack}</td><td><Badge v={i.status} /></td>
          <td>{i.impacts.length ? i.impacts.map((x) => `${x.name} (+${x.delay}d)`).join(', ') : '-'}</td></tr>)}</tbody></table></div></Panel>}
    </>
  );
}
