// Realistic sample data for the Smart Healthcare PMS case study (16 weeks, PKR 5,000,000, 7-person team).
export const project = {
  name: 'Smart Healthcare Project Management and Monitoring System',
  description: 'Appointments, laboratory reports, doctor schedules, online consultations and billing for a network of five hospitals.',
  objectives: ['Deliver the system for all five hospitals within 16 weeks', 'Stay within the approved budget of PKR 5,000,000', 'Zero unresolved critical defects at go-live', 'Single patient record shared across hospitals'],
  stakeholders: [
    { name: 'Hospital Network Management', role: 'Sponsor', interest: 'Budget, timeline, adoption' },
    { name: 'Doctors and Consultants', role: 'End users', interest: 'Fast schedules and records' },
    { name: 'Laboratory Staff', role: 'End users', interest: 'Reliable report delivery' },
    { name: 'Billing Department', role: 'End users', interest: 'Accurate invoicing' },
    { name: 'Patients', role: 'End users', interest: 'Easy appointments and online consultation' },
  ],
  scopeIn: 'Patient appointments, laboratory reports, doctor schedules, online consultations, hospital billing, role-based access for five hospitals.',
  scopeOut: 'AI-based preliminary diagnosis and mobile application (until a change request is approved), hardware procurement, legacy data cleansing.',
  approvedBudget: 5000000, startDate: '2026-08-31', deadline: '2026-12-21', statusDate: '2026-10-26', status: 'Executing',
  milestones: [
    { name: 'Charter approved', date: '2026-09-04', done: true }, { name: 'Design complete', date: '2026-09-30', done: true },
    { name: 'Core modules complete', date: '2026-11-04', done: false }, { name: 'Integration complete', date: '2026-11-19', done: false },
    { name: 'UAT sign-off', date: '2026-12-10', done: false }, { name: 'Go-live', date: '2026-12-21', done: false }],
  responsibilities: [
    { member: 'Ayesha Khan', role: 'Project Manager', duty: 'Planning, risk, stakeholder reporting' },
    { member: 'Usman Tariq', role: 'Backend Developer', duty: 'Appointments, billing' },
    { member: 'Bilal Ahmed', role: 'Backend Developer', duty: 'Patient records, lab reports, integration' },
    { member: 'Sara Malik', role: 'Frontend Developer', duty: 'UI/UX, doctor and patient portals' },
    { member: 'Hassan Raza', role: 'Frontend Developer', duty: 'Admin portal, reports' },
    { member: 'Zainab Ali', role: 'Database Developer', duty: 'Schema, performance, migration' },
    { member: 'Omar Farooq', role: 'QA Engineer', duty: 'Test plans, defect tracking' }],
  plan: { scope: 'Scope baseline = approved requirements only; changes via formal change request.', schedule: '16 weeks, 12 activities, forward/backward pass CPM, weekly status.', cost: 'Cost baseline PKR 5,000,000 built bottom-up from activity estimates; EVM reviewed weekly.', quality: 'Checklist inspection per deliverable; zero critical defects at release; CPI/SPI thresholds 0.9 / 0.8.' },
};

export const requirements = [
  { key: 'R1', title: 'Patient appointment management', priority: 'High', status: 'Approved' },
  { key: 'R2', title: 'Laboratory report management', priority: 'High', status: 'Approved' },
  { key: 'R3', title: 'Doctor schedule management', priority: 'High', status: 'Approved' },
  { key: 'R4', title: 'Online consultations', priority: 'Medium', status: 'Approved' },
  { key: 'R5', title: 'Hospital billing', priority: 'High', status: 'Approved' },
  { key: 'R6', title: 'Multi-hospital support and role-based access', priority: 'High', status: 'Approved' },
  { key: 'R7', title: 'AI-based preliminary diagnosis module', priority: 'Medium', status: 'Proposed', cr: 'CR1' },
  { key: 'R8', title: 'Mobile application', priority: 'Medium', status: 'Proposed', cr: 'CR2' },
];

export const wbs = [
  { code: '1', name: 'Planning and Design', type: 'Deliverable' },
  { code: '1.1', name: 'Requirements analysis and SRS', type: 'Work Package', parent: '1', req: 'R6' },
  { code: '1.2', name: 'System and database design', type: 'Work Package', parent: '1', req: 'R6' },
  { code: '1.3', name: 'UI/UX design', type: 'Work Package', parent: '1', req: 'R4' },
  { code: '2', name: 'Core Modules', type: 'Deliverable' },
  { code: '2.1', name: 'Database implementation', type: 'Work Package', parent: '2', req: 'R6' },
  { code: '2.2', name: 'Appointment and scheduling module', type: 'Work Package', parent: '2', req: 'R1' },
  { code: '2.3', name: 'Patient records and lab reports module', type: 'Work Package', parent: '2', req: 'R2' },
  { code: '2.4', name: 'Billing and online consultation module', type: 'Work Package', parent: '2', req: 'R5' },
  { code: '2.5', name: 'Frontend portals', type: 'Work Package', parent: '2', req: 'R3' },
  { code: '3', name: 'Integration and Delivery', type: 'Deliverable' },
  { code: '3.1', name: 'System integration', type: 'Work Package', parent: '3', req: 'R6' },
  { code: '3.2', name: 'System testing and QA', type: 'Work Package', parent: '3', req: 'R1' },
  { code: '3.3', name: 'UAT and training', type: 'Work Package', parent: '3', req: 'R3' },
  { code: '3.4', name: 'Deployment and handover', type: 'Work Package', parent: '3', req: 'R6' },
];

// key, wbs code, assignee, duration(days), deps(keys), planned cost, % complete, actual cost, actual finish offset (done only)
const A = (key, name, wbsCode, assignee, durationDays, deps, plannedCost, percentComplete, actualCost, fin) => ({ key, name, wbsCode, assignee, durationDays, deps, plannedCost, percentComplete, actualCost, fin });
export const activities = [
  A('A1', 'Requirements analysis and SRS', '1.1', 'Ayesha Khan', 10, [], 300000, 100, 310000, 10),
  A('A2', 'System and database design', '1.2', 'Zainab Ali', 10, ['A1'], 400000, 100, 420000, 20),
  A('A3', 'UI/UX design', '1.3', 'Sara Malik', 10, ['A1'], 350000, 100, 340000, 20),
  A('A4', 'Database implementation', '2.1', 'Zainab Ali', 15, ['A2'], 450000, 100, 480000, 37),
  A('A5', 'Appointment and scheduling module', '2.2', 'Usman Tariq', 20, ['A4'], 600000, 70, 700000),
  A('A6', 'Patient records and lab reports module', '2.3', 'Bilal Ahmed', 20, ['A4'], 600000, 60, 620000),
  A('A7', 'Billing and online consultation module', '2.4', 'Usman Tariq', 15, ['A5'], 500000, 30, 200000),
  A('A8', 'Frontend portals', '2.5', 'Hassan Raza', 25, ['A3', 'A4'], 550000, 70, 540000),
  A('A9', 'System integration', '3.1', 'Bilal Ahmed', 10, ['A5', 'A6', 'A7', 'A8'], 300000, 0, 0),
  A('A10', 'System testing and QA', '3.2', 'Omar Farooq', 15, ['A9'], 400000, 0, 0),
  A('A11', 'UAT and training', '3.3', 'Ayesha Khan', 7, ['A10'], 250000, 0, 0),
  A('A12', 'Deployment and handover', '3.4', 'Ayesha Khan', 5, ['A11'], 300000, 0, 0),
];

export const changeRequests = [
  { key: 'CR1', title: 'Add AI-based preliminary diagnosis module', justification: 'Hospital management requested symptom-based preliminary diagnosis to shorten triage.', costImpact: 500000, scheduleImpactDays: 14, assignee: 'Bilal Ahmed', predecessor: 'A4' },
  { key: 'CR2', title: 'Add mobile application', justification: 'Patients need mobile access to appointments and reports.', costImpact: 300000, scheduleImpactDays: 7, assignee: 'Sara Malik', predecessor: 'A5' },
];

export const defects = [
  { title: 'Double booking of the same doctor slot', severity: 'Critical', status: 'In Progress', assignee: 'Usman Tariq', activity: 'A5', description: 'Concurrent requests book one slot twice.' },
  { title: 'Patient record overwritten on concurrent update', severity: 'Critical', status: 'Open', assignee: 'Bilal Ahmed', activity: 'A6', description: 'Missing optimistic locking.' },
  { title: 'Lab report PDF layout misaligned', severity: 'Medium', status: 'Resolved', assignee: 'Hassan Raza', activity: 'A8' },
  { title: 'Reminder SMS uses wrong timezone', severity: 'Low', status: 'Open', assignee: 'Usman Tariq', activity: 'A7' },
];

export const checks = [
  { wbs: '1.1', item: 'SRS reviewed and signed by sponsor', kind: 'Inspection', status: 'Pass', inspector: 'Omar Farooq' },
  { wbs: '1.2', item: 'ER diagram normalised to 3NF', kind: 'Inspection', status: 'Pass', inspector: 'Omar Farooq' },
  { wbs: '2.2', item: 'No double booking under concurrent load', kind: 'Test', status: 'Fail', inspector: 'Omar Farooq', notes: 'See critical defect' },
  { wbs: '2.3', item: 'Patient record update keeps last valid version', kind: 'Test', status: 'Fail', inspector: 'Omar Farooq' },
  { wbs: '2.5', item: 'Portals pass responsive check', kind: 'Inspection', status: 'Pending', inspector: 'Omar Farooq' },
];

export const risks = [
  { title: 'Scope creep from hospital management', likelihood: 5, impact: 4, owner: 'Ayesha Khan', preventive: 'Formal change control, sponsor sign-off', corrective: 'Re-baseline budget and schedule via approved change request' },
  { title: 'Critical defects in scheduling and records', likelihood: 4, impact: 5, owner: 'Omar Farooq', preventive: 'Concurrency tests in CI, code reviews', corrective: 'Defect swarm, freeze new features until fixed' },
  { title: 'Cost overrun on backend work', likelihood: 4, impact: 3, owner: 'Ayesha Khan', preventive: 'Weekly EVM review', corrective: 'Reassign effort, reduce low-priority scope' },
  { title: 'Key developer unavailable', likelihood: 2, impact: 4, owner: 'Ayesha Khan', preventive: 'Pair programming, documentation', corrective: 'Cross-train backup developer' },
  { title: 'Data migration errors across five hospitals', likelihood: 3, impact: 4, owner: 'Zainab Ali', preventive: 'Dry-run migrations', corrective: 'Rollback script and manual reconciliation' },
  { title: 'Hospital staff resist new workflow', likelihood: 2, impact: 2, owner: 'Ayesha Khan', preventive: 'Early demos and training', corrective: 'On-site support during first weeks' },
];
