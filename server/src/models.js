import mongoose from 'mongoose';
const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;
const M = (name, def) => mongoose.model(name, new Schema(def, { timestamps: true }));
const s = { type: String, trim: true };
const num = (min = 0, extra = {}) => ({ type: Number, min, default: 0, ...extra });

export const Project = M('Project', {
  name: { ...s, required: [true, 'Project name is required'] }, description: s, objectives: [String],
  stakeholders: [{ name: s, role: s, interest: s }], scopeIn: s, scopeOut: s,
  approvedBudget: { type: Number, required: [true, 'Approved budget is required'], min: [1, 'Budget must be positive'] },
  startDate: { type: Date, required: [true, 'Start date is required'] }, deadline: { type: Date, required: [true, 'Deadline is required'] }, statusDate: Date,
  status: { type: String, enum: ['Initiation', 'Planning', 'Executing', 'Monitoring and Controlling', 'Closed'], default: 'Planning' },
  milestones: [{ name: s, date: Date, done: { type: Boolean, default: false } }],
  responsibilities: [{ member: s, role: s, duty: s }],
  plan: { scope: s, schedule: s, cost: s, quality: s },
  closure: { closed: { type: Boolean, default: false }, date: Date, lessons: s },
});
export const Requirement = M('Requirement', {
  title: { ...s, required: [true, 'Requirement title is required'] }, description: s,
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Proposed', 'Approved', 'Rejected'], default: 'Proposed' }, changeRequest: { type: ObjectId, ref: 'ChangeRequest' },
});
export const WBS = M('WBS', {
  code: { ...s, required: [true, 'WBS code is required'] }, name: { ...s, required: [true, 'WBS name is required'] },
  type: { type: String, enum: ['Deliverable', 'Work Package'], default: 'Deliverable' }, parent: { type: ObjectId, ref: 'WBS', default: null }, requirement: { type: ObjectId, ref: 'Requirement' },
});
export const Activity = M('Activity', {
  name: { ...s, required: [true, 'Activity name is required'] }, wbs: { type: ObjectId, ref: 'WBS', required: [true, 'Select a WBS work package'] },
  assignee: { ...s, required: [true, 'Assign a team member'] }, durationDays: { type: Number, required: [true, 'Duration is required'], min: [1, 'Duration must be at least 1 day'] },
  dependencies: [{ type: ObjectId, ref: 'Activity' }], plannedCost: num(0, { min: [0, 'Cost cannot be negative'] }), actualCost: num(0, { min: [0, 'Cost cannot be negative'] }),
  percentComplete: num(0, { min: [0, 'Percent must be 0-100'], max: [100, 'Percent must be 0-100'] }), actualFinish: Date,
});
export const ChangeRequest = M('ChangeRequest', {
  title: { ...s, required: [true, 'Title is required'] }, justification: { ...s, required: [true, 'Justification is required'] },
  costImpact: num(0, { min: [0, 'Cost impact cannot be negative'] }), scheduleImpactDays: num(0, { min: [0, 'Schedule impact cannot be negative'] }),
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, requirement: { type: ObjectId, ref: 'Requirement' },
  assignee: s, predecessor: { type: ObjectId, ref: 'Activity' }, decisionDate: Date, decisionNotes: s, resultingActivity: { type: ObjectId, ref: 'Activity' },
});
export const Defect = M('Defect', {
  title: { ...s, required: [true, 'Defect title is required'] }, description: s,
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' }, status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  assignee: s, activity: { type: ObjectId, ref: 'Activity' }, qualityCheck: { type: ObjectId, ref: 'QualityCheck' }, resolvedDate: Date,
});
export const QualityCheck = M('QualityCheck', {
  deliverable: { type: ObjectId, ref: 'WBS', required: [true, 'Select a deliverable or work package'] }, item: { ...s, required: [true, 'Checklist item is required'] },
  kind: { type: String, enum: ['Inspection', 'Test'], default: 'Inspection' }, status: { type: String, enum: ['Pending', 'Pass', 'Fail'], default: 'Pending' },
  inspector: s, notes: s, defect: { type: ObjectId, ref: 'Defect' },
});
export const Risk = M('Risk', {
  title: { ...s, required: [true, 'Describe the risk or problem'] },
  likelihood: { type: Number, required: true, min: [1, 'Likelihood is 1-5'], max: [5, 'Likelihood is 1-5'] }, impact: { type: Number, required: true, min: [1, 'Impact is 1-5'], max: [5, 'Impact is 1-5'] },
  owner: s, preventive: s, corrective: s, status: { type: String, enum: ['Open', 'Mitigated', 'Occurred', 'Closed'], default: 'Open' },
});
