// Pure calculation engine: scheduling (CPM + delay propagation), EVM, risk scoring, change-request effects.
const DAY = 86400000;
export const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY);
export const diffDays = (a, b) => Math.round((new Date(a) - new Date(b)) / DAY);
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const sid = (x) => String(x);
const iso = (d) => new Date(d).toISOString().slice(0, 10);

export function topoSort(acts) {
  const byId = new Map(acts.map((a) => [sid(a._id), a]));
  const indeg = new Map(), out = new Map();
  acts.forEach((a) => { indeg.set(sid(a._id), 0); out.set(sid(a._id), []); });
  acts.forEach((a) => (a.dependencies || []).forEach((p) => {
    p = sid(p);
    if (!byId.has(p)) throw new Error(`Activity "${a.name}" depends on an activity that does not exist`);
    out.get(p).push(sid(a._id));
    indeg.set(sid(a._id), indeg.get(sid(a._id)) + 1);
  }));
  const queue = [...indeg].filter(([, v]) => v === 0).map(([k]) => k), order = [];
  while (queue.length) {
    const k = queue.shift(); order.push(k);
    out.get(k).forEach((s) => { indeg.set(s, indeg.get(s) - 1); if (indeg.get(s) === 0) queue.push(s); });
  }
  if (order.length !== acts.length) throw new Error('Circular dependency detected between activities');
  return { order, byId, out };
}

/** Planned schedule (forward/backward pass) + forecast schedule that pushes overdue work to the status date. */
export function computeSchedule(acts, startDate, statusDate, deadline) {
  const st = diffDays(statusDate, startDate);
  const dlOff = diffDays(deadline, startDate);
  if (!acts.length) return { items: [], statusOffset: st, plannedFinishOffset: 0, projectedFinishOffset: 0, daysLate: 0, plannedFinish: iso(startDate), projectedFinish: iso(startDate), criticalPath: [] };
  const { order, byId, out } = topoSort(acts);
  const r = {};
  for (const id of order) {
    const a = byId.get(id), preds = (a.dependencies || []).map(sid);
    const dur = a.durationDays, pct = a.percentComplete || 0;
    const es = Math.max(0, ...preds.map((p) => r[p].ef)), ef = es + dur;
    const fs = Math.max(es, ...preds.map((p) => r[p].ff));
    let ff;
    if (pct >= 100) ff = a.actualFinish ? diffDays(a.actualFinish, startDate) : ef;
    else {
      ff = fs + dur;
      if (ef < st) ff = Math.max(ff, st + Math.ceil((dur * (100 - pct)) / 100)); // overdue: remaining work starts from status date
    }
    r[id] = { es, ef, fs, ff, delay: ff - ef };
  }
  const plannedFinishOffset = Math.max(...order.map((i) => r[i].ef));
  for (const id of [...order].reverse()) {
    const succ = out.get(id);
    const lf = succ.length ? Math.min(...succ.map((s) => r[s].ls)) : plannedFinishOffset;
    r[id].lf = lf; r[id].ls = lf - byId.get(id).durationDays; r[id].slack = r[id].ls - r[id].es;
  }
  const items = order.map((id) => {
    const a = byId.get(id), x = r[id], pct = a.percentComplete || 0;
    const own = pct < 100 && x.ef < st;
    const status = pct >= 100 ? (x.delay > 0 ? 'Completed Late' : 'Complete') : own ? 'Delayed' : x.delay > 0 ? 'Impacted' : pct > 0 ? 'In Progress' : 'Not Started';
    let impacts = [];
    if (own) { // transitive dependents that slip because of this activity
      const seen = new Set(), stack = [...out.get(id)];
      while (stack.length) { const s = stack.pop(); if (seen.has(s)) continue; seen.add(s); if (r[s].delay > 0) impacts.push({ name: byId.get(s).name, delay: r[s].delay }); out.get(s).forEach((n) => stack.push(n)); }
    }
    return { id, name: a.name, assignee: a.assignee, durationDays: a.durationDays, dependencies: (a.dependencies || []).map(sid), percent: pct,
      es: x.es, ef: x.ef, fs: x.fs, ff: x.ff, delay: x.delay, slack: x.slack, critical: x.slack === 0 && pct < 101,
      plannedStart: iso(addDays(startDate, x.es)), plannedEnd: iso(addDays(startDate, x.ef)), forecastEnd: iso(addDays(startDate, x.ff)), status, impacts };
  });
  const projectedFinishOffset = Math.max(...items.map((i) => i.ff));
  return { items, statusOffset: st, plannedFinishOffset, projectedFinishOffset, daysLate: Math.max(0, projectedFinishOffset - dlOff),
    plannedFinish: iso(addDays(startDate, plannedFinishOffset)), projectedFinish: iso(addDays(startDate, projectedFinishOffset)),
    criticalPath: items.filter((i) => i.critical).map((i) => i.name) };
}

export function computeEVM(acts, schedule, budget, thr = { warn: 0.9, critical: 0.8 }) {
  const byId = new Map(schedule.items.map((i) => [i.id, i]));
  let PV = 0, EV = 0, AC = 0, BAC = 0;
  for (const a of acts) {
    const s = byId.get(sid(a._id)), c = a.plannedCost || 0;
    BAC += c; PV += c * clamp((schedule.statusOffset - s.es) / a.durationDays, 0, 1);
    EV += (c * (a.percentComplete || 0)) / 100; AC += a.actualCost || 0;
  }
  const CPI = AC > 0 ? EV / AC : 1, SPI = PV > 0 ? EV / PV : 1;
  const EAC = CPI > 0 ? BAC / CPI : BAC;
  const warnings = [];
  const idx = (name, v, code) => {
    if (v < thr.critical) warnings.push({ level: 'critical', code, message: `${name} is ${v.toFixed(2)} (below ${thr.critical}) - ${code === 'CPI' ? 'serious cost overrun' : 'serious schedule slippage'}` });
    else if (v < thr.warn) warnings.push({ level: 'warning', code, message: `${name} is ${v.toFixed(2)} (below ${thr.warn}) - ${code === 'CPI' ? 'cost overrun trend' : 'schedule slippage trend'}` });
  };
  idx('Cost Performance Index', CPI, 'CPI'); idx('Schedule Performance Index', SPI, 'SPI');
  if (BAC > budget) warnings.push({ level: 'critical', code: 'BUDGET', message: `Planned cost ${Math.round(BAC)} exceeds the approved budget ${Math.round(budget)}` });
  if (EAC > budget) warnings.push({ level: 'warning', code: 'EAC', message: `Forecast at completion ${Math.round(EAC)} exceeds the approved budget by ${Math.round(EAC - budget)}` });
  if (schedule.daysLate > 0) warnings.push({ level: 'warning', code: 'DEADLINE', message: `Projected finish ${schedule.projectedFinish} is ${schedule.daysLate} day(s) after the deadline` });
  return { PV, EV, AC, BAC, CPI, SPI, CV: EV - AC, SV: EV - PV, EAC, ETC: EAC - AC, VAC: BAC - EAC, warnings };
}

export function effectiveBaseline(project, approvedCRs) {
  const extraCost = approvedCRs.reduce((s, c) => s + (c.costImpact || 0), 0);
  const extraDays = approvedCRs.reduce((s, c) => s + (c.scheduleImpactDays || 0), 0);
  return { budget: project.approvedBudget + extraCost, deadline: addDays(project.deadline, extraDays), extraCost, extraDays };
}

export const riskScore = (l, i) => l * i;
export const riskLevel = (s) => (s >= 15 ? 'Critical' : s >= 10 ? 'High' : s >= 5 ? 'Medium' : 'Low');
