import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Charter from './pages/Charter';
import Scope from './pages/Scope';
import Schedule from './pages/Schedule';
import Cost from './pages/Cost';
import Quality from './pages/Quality';
import Risks from './pages/Risks';

const TABS = [['Dashboard', Dashboard], ['Charter and plan', Charter], ['Scope and changes', Scope], ['Schedule and resources', Schedule], ['Cost and EVM', Cost], ['Quality and defects', Quality], ['Risk control', Risks]];

export default function App() {
  const [i, setI] = useState(0); const [ver, setVer] = useState(0);
  const Page = TABS[i][1];
  return (
    <div className="shell">
      <nav><h1>Project control room</h1><p>Smart Healthcare PMS</p>
        {TABS.map(([n], k) => <button key={n} className={k === i ? 'on' : ''} onClick={() => { setI(k); setVer((v) => v + 1); }}>{n}</button>)}</nav>
      <main><Page key={i + '-' + ver} refresh={() => setVer((v) => v + 1)} /></main>
    </div>
  );
}
