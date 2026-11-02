import 'dotenv/config';
import mongoose from 'mongoose';
import * as D from './sampleData.js';
import * as M from './models.js';

export async function seed() {
  await Promise.all(Object.values(M).map((m) => m.deleteMany({})));
  await M.Project.create(D.project);
  const crs = {}; for (const c of D.changeRequests) crs[c.key] = new M.ChangeRequest({ ...c, predecessor: undefined });
  const reqs = {}; for (const r of D.requirements) reqs[r.key] = await M.Requirement.create({ ...r, changeRequest: r.cr ? crs[r.cr]._id : undefined });
  const w = {}; for (const n of D.wbs) w[n.code] = await M.WBS.create({ code: n.code, name: n.name, type: n.type, parent: n.parent ? w[n.parent]._id : null, requirement: n.req ? reqs[n.req]._id : undefined });
  const acts = {};
  for (const a of D.activities) acts[a.key] = new M.Activity({ ...a, wbs: w[a.wbsCode]._id, dependencies: a.deps.map((k) => acts[k]._id), actualFinish: a.fin != null ? new Date(new Date(D.project.startDate).getTime() + a.fin * 86400000) : undefined });
  await Promise.all(Object.values(acts).map((a) => a.save()));
  for (const c of D.changeRequests) { const doc = crs[c.key]; doc.requirement = Object.values(reqs).find((r) => r.changeRequest?.equals(doc._id))._id; doc.predecessor = acts[c.predecessor]._id; await doc.save(); }
  for (const d of D.defects) await M.Defect.create({ ...d, activity: acts[d.activity]._id });
  for (const q of D.checks) await M.QualityCheck.create({ ...q, deliverable: w[q.wbs]._id });
  for (const r of D.risks) await M.Risk.create(r);
}
if (process.argv[1]?.endsWith('seed.js')) {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spms');
  await seed(); console.log('Sample data loaded.'); await mongoose.disconnect();
}
