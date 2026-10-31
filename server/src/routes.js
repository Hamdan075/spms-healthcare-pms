import express from 'express';
import mongoose from 'mongoose';
import * as M from './models.js';
import { computeSchedule, computeEVM, effectiveBaseline, topoSort, riskScore, riskLevel, addDays } from './calc.js';

const { Project, Requirement, WBS, Activity, ChangeRequest, Defect, QualityCheck, Risk } = M;
export const router = express.Router();
const bad = (msg, status = 400) => Object.assign(new Error(msg), { status });
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const getProject = async () => (await Project.findOne()) || Promise.reject(bad('No project defined yet', 404));
const plain = (d) => (d && d.toObject ? d.toObject() : d);

async function context() {
  const [project, acts, crs] = await Promise.all([getProject(), Activity.find(), ChangeRequest.find({ status: 'Approved' })]);
  const base = effectiveBaseline(project, crs);
  const statusDate = project.statusDate || new Date();
  const list = acts.map(plain);
  const schedule = computeSchedule(list, project.startDate, statusDate, base.deadline);
  const evm = computeEVM(list, schedule, base.budget);
  return { project, acts: list, base, statusDate, schedule, evm };
}

// ---- generic CRUD with validation hooks (validate(merged, current, raw) may return a sanitised payload) ----
function crud(path, Model, { validate, onDelete, after } = {}) {
  router.get(path, wrap(async (req, res) => res.json(await Model.find().sort({ createdAt: 1 }))));
  router.post(path, wrap(async (req, res) => {
    const payload = (validate && (await validate(req.body, null, req.body))) || req.body;
    let doc = await Model.create(payload);
    if (after) doc = (await after(doc)) || doc;
    res.status(201).json(doc);
  }));
  router.put(`${path}/:id`, wrap(async (req, res) => {
    const cur = await Model.findById(req.params.id); if (!cur) throw bad('Record not found', 404);
    const payload = (validate && (await validate({ ...cur.toObject(), ...req.body }, cur, req.body))) || req.body;
    cur.set(payload); let doc = await cur.save();
    if (after) doc = (await after(doc)) || doc;
    res.json(doc);
  }));
  router.delete(`${path}/:id`, wrap(async (req, res) => {
    const cur = await Model.findById(req.params.id); if (!cur) throw bad('Record not found', 404);
    if (onDelete) await onDelete(cur);
    await cur.deleteOne(); res.json({ ok: true });
  }));
}

// ---- Project (charter + plan + status + closure) ----
router.get('/project', wrap(async (req, res) => {
  const { project, base } = await context();
  res.json({ ...project.toObject(), effective: { budget: base.budget, deadline: base.deadline, extraCost: base.extraCost, extraDays: base.extraDays } });
}));
router.put('/project', wrap(async (req, res) => {
  const p = await getProject(); const next = { ...p.toObject(), ...req.body };
  if (new Date(next.deadline) <= new Date(next.startDate)) throw bad('Deadline must be after the start date');
  if (next.closure?.closed || next.status === 'Closed') {
    const open = await Defect.countDocuments({ severity: 'Critical', status: { $nin: ['Resolved', 'Closed'] } });
    if (open) throw bad(`Project cannot be closed: ${open} critical defect(s) are unresolved`, 409);
    const unfinished = await Activity.countDocuments({ percentComplete: { $lt: 100 } });
    if (unfinished) throw bad(`Project cannot be closed: ${unfinished} activity(ies) are not 100% complete`, 409);
  }
  p.set(req.body); res.json(await p.save());
}));

// ---- Requirements ----
crud('/requirements', Requirement, {
  validate: async (b, cur) => {
    if (b.status === 'Approved' && b.changeRequest) {
      const cr = await ChangeRequest.findById(b.changeRequest);
      if (!cr || cr.status !== 'Approved') throw bad('This requirement comes from a change request that is not approved yet; approve the change request first', 409);
    }
    if (cur && cur.status === 'Approved' && b.status !== 'Approved' && (await WBS.exists({ requirement: cur._id })))
      throw bad('Requirement is used in the WBS; remove it from the WBS before changing its approval', 409);
  },
  onDelete: async (r) => { if (await WBS.exists({ requirement: r._id })) throw bad('Requirement is used in the WBS', 409); if (await ChangeRequest.exists({ requirement: r._id })) throw bad('Requirement belongs to a change request', 409); },
});

// ---- WBS ----
crud('/wbs', WBS, {
  validate: async (b, cur) => {
    if (await WBS.findOne({ code: b.code, _id: { $ne: cur?._id } })) throw bad(`WBS code ${b.code} already exists`, 409);
    if (b.parent) {
      let n = await WBS.findById(b.parent); if (!n) throw bad('Parent element not found');
      if (n.type === 'Work Package') throw bad('A work package cannot have child elements');
      while (n && cur) { if (String(n._id) === String(cur._id)) throw bad('A WBS element cannot be its own ancestor'); n = n.parent && (await WBS.findById(n.parent)); }
    }
    if (b.type === 'Work Package') {
      const r = b.requirement && (await Requirement.findById(b.requirement));
      if (!r) throw bad('A work package must be linked to a requirement');
      if (r.status !== 'Approved') throw bad(`"${r.title}" is not approved, so it cannot be included in the approved project scope`, 409);
    }
  },
  onDelete: async (n) => { if (await WBS.exists({ parent: n._id })) throw bad('Delete the child elements first', 409); if (await Activity.exists({ wbs: n._id })) throw bad('Activities are assigned to this work package', 409); },
});
router.get('/wbs/tree', wrap(async (req, res) => {
  const [nodes, reqs] = await Promise.all([WBS.find().sort({ code: 1 }), Requirement.find()]);
  const rq = new Map(reqs.map((r) => [String(r._id), r.title]));
  const m = new Map(nodes.map((n) => [String(n._id), { ...n.toObject(), requirementTitle: rq.get(String(n.requirement)), children: [] }]));
  const roots = []; m.forEach((n) => (n.parent && m.get(String(n.parent)) ? m.get(String(n.parent)).children.push(n) : roots.push(n)));
  res.json(roots);
}));

// ---- Activities ----
crud('/activities', Activity, {
  validate: async (b, cur) => {
    const [project, wbs, all] = await Promise.all([getProject(), WBS.findById(b.wbs), Activity.find()]);
    if (!Number.isInteger(Number(b.durationDays)) || Number(b.durationDays) < 1) throw bad('Duration must be a whole number of days (at least 1)');
    if (!wbs || wbs.type !== 'Work Package') throw bad('An activity must belong to a WBS work package');
    const req = await Requirement.findById(wbs.requirement);
    if (!req || req.status !== 'Approved') throw bad('The work package is not linked to an approved requirement', 409);
    if (!project.responsibilities.some((r) => r.member === b.assignee)) throw bad(`"${b.assignee}" is not a member of the project team`);
    const id = String(cur?._id || new mongoose.Types.ObjectId()); const deps = (b.dependencies || []).map(String);
    if (deps.includes(id)) throw bad('An activity cannot depend on itself');
    try { topoSort([...all.filter((a) => String(a._id) !== id).map(plain), { _id: id, name: b.name, dependencies: deps, durationDays: 1 }]); } catch (e) { throw bad(e.message, 409); }
  },
  onDelete: async (a) => { if (await Activity.exists({ dependencies: a._id })) throw bad('Other activities depend on this activity', 409); },
});

// ---- Change requests: record -> decide -> approved CR changes scope, schedule and budget ----
crud('/changes', ChangeRequest, {
  validate: async (b, cur, raw) => {
    if (cur && cur.status !== 'Pending') throw bad('Decided change requests are read-only', 409);
    if (!Number.isInteger(Number(b.scheduleImpactDays))) throw bad('Schedule impact must be a whole number of days');
    const { status, decisionDate, decisionNotes, resultingActivity, ...safe } = raw; return safe;
  },
  onDelete: async (c) => { if (c.status === 'Approved') throw bad('Approved change requests are part of the baseline and cannot be deleted', 409); },
});
router.post('/changes/:id/decision', wrap(async (req, res) => {
  const cr = await ChangeRequest.findById(req.params.id); if (!cr) throw bad('Change request not found', 404);
  if (cr.status !== 'Pending') throw bad('This change request was already decided', 409);
  const { decision, notes } = req.body; if (!['Approved', 'Rejected'].includes(decision)) throw bad('Decision must be Approved or Rejected');
  const before = await context(); const effects = { decision };
  cr.status = decision; cr.decisionDate = new Date(); cr.decisionNotes = notes;
  if (decision === 'Rejected') { if (cr.requirement) await Requirement.updateOne({ _id: cr.requirement }, { status: 'Rejected' }); await cr.save(); return res.json({ cr, effects }); }
  // Approved: scope (requirement + WBS), schedule (new activity before the final deliverables) and budget (effective budget).
  const team = before.project.responsibilities.map((r) => r.member);
  const assignee = cr.assignee && team.includes(cr.assignee) ? cr.assignee : team[0];
  if (!assignee) throw bad('Add team members to the project charter first');
  const terminals = before.acts.filter((a) => !before.acts.some((o) => (o.dependencies || []).some((d) => String(d) === String(a._id))));
  if (cr.requirement) await Requirement.updateOne({ _id: cr.requirement }, { status: 'Approved' });
  const rq = cr.requirement && (await Requirement.findById(cr.requirement));
  const n = await WBS.countDocuments({ code: /^CR-/ }) + 1;
  const del = await WBS.create({ code: `CR-${n}`, name: cr.title, type: 'Deliverable' });
  const wp = await WBS.create({ code: `CR-${n}.1`, name: `Implement: ${cr.title}`, type: 'Work Package', parent: del._id, requirement: rq?._id });
  const act = await Activity.create({ name: `Implement: ${cr.title}`, wbs: wp._id, assignee, durationDays: Math.max(1, cr.scheduleImpactDays), plannedCost: cr.costImpact, dependencies: cr.predecessor ? [cr.predecessor] : [] });
  await Activity.updateMany({ _id: { $in: terminals.map((t) => t._id) } }, { $addToSet: { dependencies: act._id } });
  cr.resultingActivity = act._id; await cr.save();
  const after = await context();
  Object.assign(effects, { budgetBefore: before.base.budget, budgetAfter: after.base.budget, deadlineBefore: before.base.deadline, deadlineAfter: after.base.deadline,
    projectedFinishBefore: before.schedule.projectedFinish, projectedFinishAfter: after.schedule.projectedFinish, newWbs: [del.code, wp.code], newActivity: act.name, requirement: rq?.title });
  res.json({ cr, effects });
}));

// ---- Quality ----
crud('/defects', Defect, {
  validate: async (b, cur, raw) => {
    if (['In Progress', 'Resolved', 'Closed'].includes(b.status) && !b.assignee) throw bad('Assign the defect to someone before moving it to In Progress, Resolved or Closed');
    if (b.assignee && !(await getProject()).responsibilities.some((r) => r.member === b.assignee)) throw bad(`"${b.assignee}" is not a member of the project team`);
    return b.status === 'Resolved' && !cur?.resolvedDate ? { ...raw, resolvedDate: new Date() } : raw;
  },
});
crud('/checks', QualityCheck, {
  validate: async (b) => { const w = await WBS.findById(b.deliverable); if (!w) throw bad('Select a valid deliverable or work package'); },
  after: async (doc) => { // a failed inspection/test automatically raises a defect, keeping quality records consistent
    if (doc.status === 'Fail' && !doc.defect) {
      const d = await Defect.create({ title: `Failed check: ${doc.item}`, severity: 'High', status: 'Open', qualityCheck: doc._id });
      doc.defect = d._id; return doc.save();
    }
  },
});

// ---- Risks (prioritisation matrix + PDPC) ----
router.get('/risks', wrap(async (req, res) => {
  const rows = (await Risk.find()).map((r) => ({ ...r.toObject(), score: riskScore(r.likelihood, r.impact), level: riskLevel(riskScore(r.likelihood, r.impact)) })).sort((a, b) => b.score - a.score);
  res.json(rows.map((r, i) => ({ ...r, rank: i + 1 })));
}));
crud('/risks', Risk);

// ---- Computed views ----
router.get('/schedule', wrap(async (req, res) => {
  const { project, base, schedule } = await context();
  const names = new Map((await WBS.find()).map((w) => [String(w._id), `${w.code} ${w.name}`]));
  const acts = await Activity.find(); const wbsOf = new Map(acts.map((a) => [String(a._id), names.get(String(a.wbs))]));
  res.json({ ...schedule, items: schedule.items.map((i) => ({ ...i, wbs: wbsOf.get(i.id) })), startDate: project.startDate, deadline: base.deadline, baselineDeadline: project.deadline, milestones: project.milestones });
}));
router.get('/evm', wrap(async (req, res) => { const { evm, base, schedule, statusDate } = await context(); res.json({ ...evm, budget: base.budget, statusDate, schedule: { daysLate: schedule.daysLate, projectedFinish: schedule.projectedFinish } }); }));

router.get('/dashboard', wrap(async (req, res) => {
  const { project, base, schedule, evm, statusDate } = await context();
  const [pendingCRs, crit, reqs, checks, risks] = await Promise.all([ChangeRequest.find({ status: 'Pending' }),
    Defect.find({ severity: 'Critical', status: { $nin: ['Resolved', 'Closed'] } }), Requirement.find(), QualityCheck.find(), Risk.find()]);
  const warnings = [...evm.warnings];
  if (crit.length) warnings.push({ level: 'critical', code: 'DEFECTS', message: `${crit.length} critical defect(s) unresolved` });
  if (pendingCRs.length) warnings.push({ level: 'warning', code: 'CR', message: `${pendingCRs.length} change request(s) awaiting a decision` });
  const topRisks = risks.map((r) => ({ title: r.title, score: riskScore(r.likelihood, r.impact), level: riskLevel(riskScore(r.likelihood, r.impact)) })).sort((a, b) => b.score - a.score).slice(0, 5);
  res.json({
    project: { name: project.name, status: project.status, startDate: project.startDate, statusDate, baselineBudget: project.approvedBudget, baselineDeadline: project.deadline, budget: base.budget, deadline: base.deadline, extraCost: base.extraCost, extraDays: base.extraDays },
    progressPercent: evm.BAC ? (evm.EV / evm.BAC) * 100 : 0, evm, schedule: { plannedFinish: schedule.plannedFinish, projectedFinish: schedule.projectedFinish, daysLate: schedule.daysLate, criticalPath: schedule.criticalPath },
    budget: { approved: base.budget, planned: evm.BAC, spent: evm.AC, remaining: base.budget - evm.AC, forecast: evm.EAC },
    delayed: schedule.items.filter((i) => ['Delayed', 'Impacted', 'Completed Late'].includes(i.status)).map((i) => ({ name: i.name, status: i.status, delay: i.delay, assignee: i.assignee, forecastEnd: i.forecastEnd, impacts: i.impacts })),
    pendingChangeRequests: pendingCRs.map((c) => ({ title: c.title, costImpact: c.costImpact, scheduleImpactDays: c.scheduleImpactDays })),
    criticalDefects: crit.map((d) => ({ title: d.title, assignee: d.assignee, status: d.status })),
    requirements: { approved: reqs.filter((r) => r.status === 'Approved').length, proposed: reqs.filter((r) => r.status === 'Proposed').length, rejected: reqs.filter((r) => r.status === 'Rejected').length },
    quality: { total: checks.length, pass: checks.filter((c) => c.status === 'Pass').length, fail: checks.filter((c) => c.status === 'Fail').length, pending: checks.filter((c) => c.status === 'Pending').length },
    topRisks, warnings, milestones: project.milestones,
  });
}));
