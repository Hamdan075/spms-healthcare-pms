# Test cases (calculation engine, run with `npm test`)

Status date 2026-10-26, project start 2026-08-31, sample data from `sampleData.js`. "Actual" = result of the last automated run.

| ID | Scenario | Expected | Actual |
|---|---|---|---|
| TC-01 | Simple network A(5) -> B(3), A -> C(4) | Finish day 9, critical path A, C, slack of B = 1 | Pass |
| TC-02 | A depends on B, B depends on A | Error "Circular dependency" | Pass |
| TC-03 | Dependency on a non-existent activity | Error "does not exist" | Pass |
| TC-04 | Case-study baseline | 12 activities, planned finish day 107, BAC = 5,000,000 | Pass |
| TC-05 | Appointment module 70% done and overdue | Status Delayed, +7 days, final activity +7 days, projected finish 2026-12-23, 2 days after deadline | Pass |
| TC-06 | EVM on sample data | PV about 3,195,333; EV 2,815,000; AC 3,610,000; CPI 0.78; SPI 0.88 | Pass |
| TC-07 | Threshold warnings | CPI critical, SPI warning, deadline and EAC warnings present | Pass |
| TC-08 | Healthy project | CPI = SPI = 1.00, no warnings | Pass |
| TC-09 | Planned cost 2,000 vs budget 1,000 | BUDGET warning | Pass |
| TC-10 | Both change requests approved | Budget 5,800,000; +21 days; deadline 2027-01-11 | Pass |
| TC-11 | Risk 4x5 | Score 20, level Critical; 12 High; 6 Medium; 2 Low | Pass |
| TC-12 | Database implementation finished 2 days late | Status "Completed Late" | Pass |

## API / UI test cases (run manually against the running app)
| ID | Action | Expected |
|---|---|---|
| UI-01 | Create WBS work package linked to a Proposed requirement | Rejected: requirement not approved, cannot be in approved scope |
| UI-02 | Set a Proposed CR-linked requirement to Approved directly | Rejected: approve the change request first |
| UI-03 | Create an activity with predecessor that forms a cycle | Rejected: circular dependency |
| UI-04 | Create an activity with assignee outside the team / duration 0 | Rejected with message |
| UI-05 | Approve CR1 | Requirement approved, WBS CR-1 and activity created, budget +500,000, deadline +14 days |
| UI-06 | Approve CR1 again / edit decided CR | Refused: already decided / read-only |
| UI-07 | Mark a checklist item Fail | Defect "Failed check: ..." created automatically |
| UI-08 | Move a defect to In Progress without assignee | Rejected |
| UI-09 | Close the project with critical defects open | Rejected with defect count |
| UI-10 | Update % complete to 120 | Rejected: percent must be 0-100 |
