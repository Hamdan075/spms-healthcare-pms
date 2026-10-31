import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSchedule, computeEVM, effectiveBaseline, topoSort, riskScore, riskLevel, addDays } from '../src/calc.js';
import * as D from '../src/sampleData.js';

const START = '2026-08-31';
const sample = () => D.activities.map((a) => ({ _id: a.key, name: a.name, durationDays: a.durationDays, dependencies: a.deps, plannedCost: a.plannedCost,
  actualCost: a.actualCost, percentComplete: a.percentComplete, actualFinish: a.fin != null ? addDays(START, a.fin) : undefined }));
const near = (a, b, eps = 0.005) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test('TC-01 CPM: planned finish and critical path of a simple network', () => {
  const acts = [{ _id: 'a', name: 'A', durationDays: 5, dependencies: [] }, { _id: 'b', name: 'B', durationDays: 3, dependencies: ['a'] }, { _id: 'c', name: 'C', durationDays: 4, dependencies: ['a'] }];
  const s = computeSchedule(acts, START, START, '2026-12-31');
  assert.equal(s.plannedFinishOffset, 9); assert.deepEqual(s.criticalPath, ['A', 'C']);
  assert.equal(s.items.find((i) => i.id === 'b').slack, 1);
});
test('TC-02 Circular dependency is rejected', () => {
  assert.throws(() => topoSort([{ _id: 'a', name: 'A', dependencies: ['b'] }, { _id: 'b', name: 'B', dependencies: ['a'] }]), /Circular/);
});
test('TC-03 Dependency on a missing activity is rejected', () => {
  assert.throws(() => topoSort([{ _id: 'a', name: 'A', dependencies: ['zzz'] }]), /does not exist/);
});
test('TC-04 Case-study baseline: 12 activities, 107 day plan, PKR 5,000,000', () => {
  const s = computeSchedule(sample(), START, '2026-10-26', '2026-12-21'); const evm = computeEVM(sample(), s, 5000000);
  assert.equal(s.plannedFinishOffset, 107); assert.equal(evm.BAC, 5000000);
});
test('TC-05 Delay of "Appointment module" propagates and pushes final finish past the deadline', () => {
  const s = computeSchedule(sample(), START, '2026-10-26', '2026-12-21');
  assert.equal(s.items.find((i) => i.id === 'A5').status, 'Delayed');
  assert.equal(s.items.find((i) => i.id === 'A5').delay, 7);
  assert.equal(s.items.find((i) => i.id === 'A12').delay, 7);
  assert.equal(s.projectedFinish, '2026-12-23'); assert.equal(s.daysLate, 2);
  assert.ok(s.items.find((i) => i.id === 'A5').impacts.some((x) => x.name === 'Deployment and handover'));
});
test('TC-06 EVM indicators on case-study data (status date 26 Oct 2026)', () => {
  const s = computeSchedule(sample(), START, '2026-10-26', '2026-12-21'); const e = computeEVM(sample(), s, 5000000);
  near(e.PV, 3195333.33, 1); assert.equal(e.EV, 2815000); assert.equal(e.AC, 3610000);
  near(e.CPI, 0.7798); near(e.SPI, 0.8810);
});
test('TC-07 Thresholds raise critical CPI and warning SPI messages', () => {
  const s = computeSchedule(sample(), START, '2026-10-26', '2026-12-21'); const w = computeEVM(sample(), s, 5000000).warnings;
  assert.equal(w.find((x) => x.code === 'CPI').level, 'critical'); assert.equal(w.find((x) => x.code === 'SPI').level, 'warning');
  assert.ok(w.some((x) => x.code === 'DEADLINE') && w.some((x) => x.code === 'EAC'));
});
test('TC-08 Healthy project produces no EVM warnings', () => {
  const acts = [{ _id: 'a', name: 'A', durationDays: 10, dependencies: [], plannedCost: 1000, actualCost: 500, percentComplete: 50 }];
  const s = computeSchedule(acts, START, addDays(START, 5), addDays(START, 20)); const e = computeEVM(acts, s, 1000);
  near(e.CPI, 1); near(e.SPI, 1); assert.equal(e.warnings.length, 0);
});
test('TC-09 Planned cost above approved budget is flagged', () => {
  const acts = [{ _id: 'a', name: 'A', durationDays: 5, dependencies: [], plannedCost: 2000, percentComplete: 0 }];
  const s = computeSchedule(acts, START, START, addDays(START, 30));
  assert.ok(computeEVM(acts, s, 1000).warnings.some((x) => x.code === 'BUDGET'));
});
test('TC-10 Approved change requests extend budget (+800,000) and deadline (+21 days)', () => {
  const b = effectiveBaseline({ approvedBudget: 5000000, deadline: '2026-12-21' }, D.changeRequests);
  assert.equal(b.budget, 5800000); assert.equal(b.extraDays, 21); assert.equal(b.deadline.toISOString().slice(0, 10), '2027-01-11');
});
test('TC-11 Risk prioritisation score and level', () => {
  assert.equal(riskScore(4, 5), 20); assert.equal(riskLevel(20), 'Critical'); assert.equal(riskLevel(12), 'High'); assert.equal(riskLevel(6), 'Medium'); assert.equal(riskLevel(2), 'Low');
});
test('TC-12 Late completion is reported as Completed Late', () => {
  const s = computeSchedule(sample(), START, '2026-10-26', '2026-12-21');
  assert.equal(s.items.find((i) => i.id === 'A4').status, 'Completed Late');
});
