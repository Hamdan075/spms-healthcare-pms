import { useState } from 'react';
import { api, useData, money, fmtDate } from '../api';
import { Crud, Panel, Badge, Err } from '../ui';

const Node = ({ n, depth = 0 }) => (
  <li><div className="wbsn"><b>{n.code}</b> {n.name} <Badge v={n.type} />{n.requirementTitle && <small> covers: {n.requirementTitle}</small>}</div>
    {n.children.length > 0 && <ul>{n.children.map((c) => <Node key={c._id} n={c} depth={depth + 1} />)}</ul>}</li>
);

export default function Scope({ refresh }) {
  const [v, setV] = useState(0); const bump = () => setV((x) => x + 1);
  const [reqs] = useData('/requirements', v); const [wbs] = useData('/wbs', v); const [tree] = useData('/wbs/tree', v); const [acts] = useData('/activities', v); const [team] = useData('/project', v);
  const [effects, setEffects] = useState(null);
  const approvedReqs = (reqs || []).filter((r) => r.status === 'Approved').map((r) => ({ value: r._id, label: r.title }));
  const decide = (r, done, setErr) => r.status !== 'Pending' ? null : ['Approved', 'Rejected'].map((d) => (
    <button key={d} className={'btn sm ' + (d === 'Approved' ? 'primary' : '')} onClick={async () => {
      try { const res = await api.post(`/changes/${r._id}/decision`, { decision: d }); setEffects(res.effects); await done(); bump(); } catch (e) { setErr(e.message); } }}>{d === 'Approved' ? 'Approve' : 'Reject'}</button>));
  return (
    <>
      <div className="head"><h2 className="title">Scope, WBS and change control</h2></div>
      <p className="muted">Only approved requirements can be placed in the WBS. A proposed requirement stays out of scope until its change request is approved.</p>
      {!reqs && <Err msg="Loading..." />}
      <Crud path="/requirements" title="Requirements" onChange={bump} reloadKey={v}
        blank={{ priority: 'Medium', status: 'Proposed' }}
        columns={[{ key: 'title', label: 'Requirement' }, { label: 'Priority', render: (r) => <Badge v={r.priority} /> }, { label: 'Status', render: (r) => <Badge v={r.status} /> }, { label: 'In scope', render: (r) => (r.status === 'Approved' ? 'Yes' : 'No') }]}
        fields={[{ key: 'title', label: 'Title', required: true, wide: true }, { key: 'description', label: 'Description', type: 'textarea', wide: true }, { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] }, { key: 'status', label: 'Status', type: 'select', options: ['Proposed', 'Approved', 'Rejected'] }]} />
      <Panel title="Work breakdown structure (hierarchical view)"><ul className="tree">{(tree || []).map((n) => <Node key={n._id} n={n} />)}</ul></Panel>
      <Crud path="/wbs" title="WBS elements" onChange={bump} reloadKey={v} blank={{ type: 'Deliverable' }}
        columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { label: 'Type', render: (r) => <Badge v={r.type} /> }, { label: 'Requirement', render: (r) => (reqs || []).find((x) => x._id === r.requirement)?.title || '-' }]}
        fields={[{ key: 'code', label: 'Code (e.g. 2.6)', required: true }, { key: 'name', label: 'Name', required: true }, { key: 'type', label: 'Type', type: 'select', options: ['Deliverable', 'Work Package'] },
          { key: 'parent', label: 'Parent deliverable', type: 'select', options: (wbs || []).filter((w) => w.type === 'Deliverable').map((w) => ({ value: w._id, label: `${w.code} ${w.name}` })) },
          { key: 'requirement', label: 'Approved requirement (work packages)', type: 'select', options: approvedReqs, wide: true }]} />
      <Crud path="/changes" title="Change requests" onChange={bump} reloadKey={v}
        rowActions={decide}
        columns={[{ key: 'title', label: 'Change' }, { key: 'justification', label: 'Justification' }, { label: 'Cost impact', render: (r) => money(r.costImpact) }, { label: 'Schedule impact', render: (r) => `+${r.scheduleImpactDays} days` }, { label: 'Status', render: (r) => <Badge v={r.status} /> }]}
        fields={[{ key: 'title', label: 'Title', required: true, wide: true }, { key: 'justification', label: 'Justification', type: 'textarea', required: true, wide: true },
          { key: 'costImpact', label: 'Cost impact (PKR)', type: 'number', min: 0 }, { key: 'scheduleImpactDays', label: 'Schedule impact (days)', type: 'number', min: 0 },
          { key: 'requirement', label: 'Requirement introduced', type: 'select', options: (reqs || []).filter((r) => r.status === 'Proposed').map((r) => ({ value: r._id, label: r.title })) },
          { key: 'assignee', label: 'Implementer', type: 'select', options: (team?.responsibilities || []).map((m) => m.member) },
          { key: 'predecessor', label: 'Starts after activity', type: 'select', options: (acts || []).map((a) => ({ value: a._id, label: a.name })) }]} />
      {effects && (
        <Panel title={'Result of decision: ' + effects.decision} actions={<button className="btn sm" onClick={() => setEffects(null)}>Dismiss</button>}>
          {effects.decision === 'Approved' ? (
            <table><tbody>
              <tr><th>Scope</th><td>"{effects.requirement}" is now approved. WBS {effects.newWbs.join(' and ')} and activity "{effects.newActivity}" were created.</td></tr>
              <tr><th>Budget</th><td>{money(effects.budgetBefore)} to {money(effects.budgetAfter)}</td></tr>
              <tr><th>Deadline</th><td>{fmtDate(effects.deadlineBefore)} to {fmtDate(effects.deadlineAfter)}</td></tr>
              <tr><th>Projected finish</th><td>{effects.projectedFinishBefore} to {effects.projectedFinishAfter}</td></tr></tbody></table>
          ) : <p>The change request was rejected; scope, schedule and budget are unchanged.</p>}
        </Panel>)}
    </>
  );
}
