import { useState } from 'react';
import { useData, fmtDate } from '../api';
import { Crud, Badge } from '../ui';

export default function Quality() {
  const [v, setV] = useState(0); const bump = () => setV((x) => x + 1);
  const [wbs] = useData('/wbs', v); const [acts] = useData('/activities', v); const [proj] = useData('/project', v);
  const w = (id) => { const x = (wbs || []).find((n) => n._id === id); return x ? `${x.code} ${x.name}` : '-'; };
  const team = (proj?.responsibilities || []).map((m) => m.member);
  return (
    <>
      <div className="head"><h2 className="title">Quality management</h2></div>
      <p className="muted">A checklist item marked Fail automatically raises a defect, so inspection records and the defect log stay consistent.</p>
      <Crud path="/checks" title="Quality checklist and inspection results" onChange={bump} reloadKey={v} blank={{ kind: 'Inspection', status: 'Pending' }}
        columns={[{ label: 'Deliverable', render: (r) => w(r.deliverable) }, { key: 'item', label: 'Checklist item' }, { key: 'kind', label: 'Type' }, { label: 'Result', render: (r) => <Badge v={r.status} /> }, { key: 'inspector', label: 'Inspector' }, { key: 'notes', label: 'Notes' }]}
        fields={[{ key: 'deliverable', label: 'Deliverable / work package', type: 'select', required: true, options: (wbs || []).map((n) => ({ value: n._id, label: `${n.code} ${n.name}` })) }, { key: 'item', label: 'Checklist item', required: true },
          { key: 'kind', label: 'Type', type: 'select', options: ['Inspection', 'Test'] }, { key: 'status', label: 'Result', type: 'select', options: ['Pending', 'Pass', 'Fail'] },
          { key: 'inspector', label: 'Inspector', type: 'select', options: team }, { key: 'notes', label: 'Notes' }]} />
      <Crud path="/defects" title="Defect tracking" onChange={bump} reloadKey={v} blank={{ severity: 'Medium', status: 'Open' }}
        columns={[{ key: 'title', label: 'Defect' }, { label: 'Severity', render: (r) => <Badge v={r.severity} /> }, { label: 'Status', render: (r) => <Badge v={r.status} /> }, { label: 'Assigned to', render: (r) => r.assignee || 'Unassigned' }, { label: 'Activity', render: (r) => (acts || []).find((a) => a._id === r.activity)?.name || '-' }, { label: 'Resolved', render: (r) => fmtDate(r.resolvedDate) }]}
        fields={[{ key: 'title', label: 'Title', required: true, wide: true }, { key: 'description', label: 'Description', type: 'textarea', wide: true },
          { key: 'severity', label: 'Severity', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] }, { key: 'status', label: 'Resolution status', type: 'select', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
          { key: 'assignee', label: 'Assigned to', type: 'select', options: team }, { key: 'activity', label: 'Related activity', type: 'select', options: (acts || []).map((a) => ({ value: a._id, label: a.name })) }]} />
    </>
  );
}
