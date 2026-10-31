# Smart Healthcare Project Management and Monitoring System (MERN)

Working Software Project Management System for the CSE-494 mid-term case study: React UI, Express API, MongoDB persistence.
All scheduling, cost and EVM calculations run programmatically in `server/src/calc.js`.

## Run
Prerequisites: Node 18+, MongoDB running locally (or an Atlas URI in `server/.env`, see `.env.example`).

    npm run setup      # installs server + client
    npm run server     # API on :5000 (loads the sample case-study data automatically if the DB is empty)
    npm run client     # UI on http://localhost:5173  (second terminal)
    npm run seed       # optional: reset the database to the sample data
    npm test           # 12 unit tests of the calculation engine

## Modules (marks map)
| Module | Where | What it does |
|---|---|---|
| 1 Initiation and integration | Charter and plan | Charter, stakeholders, team responsibilities, milestones, plan, status, closure (blocked while critical defects or unfinished work remain) |
| 2 Scope and WBS | Scope and changes | Requirements (add/update/prioritise/approve), hierarchical WBS, change requests with cost/schedule impact and approval. Unapproved requirements are rejected from the WBS and from activities (HTTP 409) |
| 3 Schedule and resources | Schedule and resources | Activities, assignees (must be team members), durations, dependencies (cycle detection), forward/backward pass, slack, critical path, delay propagation, Gantt with milestones, status and deadline lines |
| 4 Cost and EVM | Cost and EVM | PV, EV, AC, CPI, SPI (+ CV, SV, EAC, ETC, VAC), progress/actual-cost tracking, threshold warnings (below 0.9 warning, below 0.8 critical, over budget, past deadline) |
| 5 Quality and risk | Quality / Risk control | Defect tracking, quality checklist with inspection/test results (a Fail raises a defect), 5x5 prioritization matrix, ranked register, PDPC view |
| 6 Integration and reporting | Dashboard | Progress, pending CRs, delayed activities, budget status, unresolved critical defects, top risks, print-friendly report |

## Demonstrating an approved change request (required scenario)
1. Dashboard shows budget PKR 5,000,000, deadline 2026-12-21, projected finish 2026-12-23 (late), two pending CRs.
2. Scope and changes: approve "Add AI-based preliminary diagnosis module" (+PKR 500,000, +14 days).
3. The result panel shows: requirement becomes approved (enters scope), new WBS elements and activity are created, budget 5,000,000 to 5,500,000, deadline +14 days, projected finish recalculated.
4. Approve the mobile app CR (+800,000 total, +21 days total as in the case study). Return to Dashboard / Cost and EVM to see the new baseline and EVM re-computed.
Sample status date is 2026-10-26 (editable on the Dashboard).

## Database schema
Collections: projects, requirements, wbs, activities, changerequests, defects, qualitychecks, risks (see `server/src/models.js`).
Sample data: `server/src/sampleData.js` (loaded by `server/src/seed.js`).
Key relations: requirement <- wbs(work package) <- activity; changerequest -> requirement, predecessor activity, resulting activity; defect -> activity / qualitycheck; qualitycheck -> wbs.

## Validation and exception handling
Mongoose schema validation (required, ranges, enums) + business rules in `routes.js`: deadline after start, positive budget, unique WBS codes, no WBS cycles, work packages need an approved requirement, activities need a work package and a team assignee, duration is a whole number of days at least 1, no self/circular dependencies, decided CRs are read-only, defects need an owner before work starts, deletions that would break links are refused. Errors return `{ error }` and the UI shows them inline.
