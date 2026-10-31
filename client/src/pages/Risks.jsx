import { useState } from 'react';
import { useData } from '../api';
import { Crud, Panel, Badge } from '../ui';

const tone = (s) => (s >= 15 ? 'c' : s >= 10 ? 'h' : s >= 5 ? 'm' : 'l');

export default function Risks() {
  const [v, setV] = useState(0); const bump = () => setV((x) => x + 1);
  const [risks] = useData('/risks', v); const [proj] = useData('/project', v);
  const list = risks || [];
  return (
    <>
      <div className="head"><h2 className="title">Risk control</h2></div>
      <Crud path="/risks" title="Risk and issue register" onChange={bump} reloadKey={v} blank={{ likelihood: 3, impact: 3, status: 'Open' }}
        columns={[{ key: 'title', label: 'Risk / potential problem' }, { key: 'likelihood', label: 'Likelihood' }, { key: 'impact', label: 'Impact' }, { key: 'owner', label: 'Owner' }, { label: 'Status', render: (r) => <Badge v={r.status} /> }]}
        fields={[{ key: 'title', label: 'Risk / potential problem', required: true, wide: true }, { key: 'likelihood', label: 'Likelihood (1-5)', type: 'number', min: 1, max: 5, required: true }, { key: 'impact', label: 'Impact (1-5)', type: 'number', min: 1, max: 5, required: true },
          { key: 'owner', label: 'Owner', type: 'select', options: (proj?.responsibilities || []).map((m) => m.member) }, { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Mitigated', 'Occurred', 'Closed'] },
          { key: 'preventive', label: 'Preventive action', type: 'textarea', wide: true }, { key: 'corrective', label: 'Corrective action', type: 'textarea', wide: true }]} />
      <div className="grid2">
        <Panel title="Prioritization matrix (likelihood x impact)">
          <div className="matrix"><div className="axisy">Likelihood</div>
            {[5, 4, 3, 2, 1].map((l) => [1, 2, 3, 4, 5].map((i) => <div key={l + '-' + i} className={'cell ' + tone(l * i)}>{list.filter((r) => r.likelihood === l && r.impact === i).map((r) => <span key={r._id} title={r.title}>R{r.rank}</span>)}</div>))}
            <div className="axisx">Impact</div></div></Panel>
        <Panel title="Ranked risks"><div className="scroll"><table><thead><tr><th style={{ width: '45px', whiteSpace: 'nowrap' }}>#</th><th>Risk</th><th style={{ width: '60px', whiteSpace: 'nowrap' }}>Score</th><th style={{ width: '85px', whiteSpace: 'nowrap' }}>Level</th></tr></thead><tbody>
          {list.map((r) => <tr key={r._id}><td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>R{r.rank}</td><td>{r.title}</td><td style={{ whiteSpace: 'nowrap' }}>{r.score}</td><td><Badge v={r.level} /></td></tr>)}</tbody></table></div></Panel>
      </div>
      <Panel title="Process Decision Program Chart (PDPC)">
        <div className="pdpc"><div className="goal">Goal: deliver the healthcare system on time, on budget and defect-free</div>
          <div className="branches">{list.filter((r) => r.status !== 'Closed').map((r) => (
            <div className="branch" key={r._id}><div className={'prob ' + tone(r.score)}><b>R{r.rank}</b> {r.title}<small>score {r.score}</small></div>
              <div className="arrow">prevent</div><div className="act prev">{r.preventive || 'No preventive action defined'}</div>
              <div className="arrow">if it occurs</div><div className="act corr">{r.corrective || 'No corrective action defined'}</div></div>))}</div></div>
      </Panel>
    </>
  );
}
