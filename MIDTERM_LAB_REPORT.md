# COMSATS UNIVERSITY ISLAMABAD, SAHIWAL CAMPUS
## Department of Computer Sciences
### Course: CSE-494 Software Project Management (Fall-2026)
**Instructor:** Mr. Bilal Shabbir Qaisar  
**Mid-term Examination Lab Report & Verification Documentation**  
**Submission Date:** 26-10-2026  

---

### Student Credentials
- **Name:** M. Hamda *(Editable in `MIDTERM_LAB_REPORT.html`)*
- **Registration #:** FA23-BSE-000 *(Editable)*
- **Section:** FA23-BSE-7B
- **Subject:** Software Project Management (CSE-494)
- **Submitted to:** Sir Bilal Shabeer Qasir

---

## Case Study: Smart Healthcare Project Management and Monitoring System

A software development company has been contracted to develop a Smart Healthcare Project Management System for a network of five hospitals. The system must manage patient appointments, laboratory reports, doctor schedules, online consultations, and hospital billing. The project must be completed within 16 weeks, with a maximum approved budget of PKR 5,000,000.

The development team consists of a project manager, two backend developers, two frontend developers, one database developer, and one quality assurance engineer. During development, hospital management introduces additional requirements, including an AI-based preliminary diagnosis module and a mobile application. These changes increase the estimated project cost by PKR 800,000 and the development duration by three weeks. Furthermore, testing reveals critical defects in appointment scheduling and patient record management.

---

## Implemented Modules (25 Marks Breakdown)

### 1. Project Initiation and Integration Management (4 Marks)
- **Project Charter**: Defines objectives across five hospitals, stakeholders, scope boundaries (in-scope vs. out-of-scope), approved baseline budget (PKR 5,000,000), and deadline (16 weeks, 2026-08-31 to 2026-12-21).
- **Project Management Plan**: Integrated sub-plans for scope baseline management, forward/backward pass CPM scheduling, bottom-up cost control with EVM, and quality checklists.
- **Milestones & Responsibilities**: 6 major milestones (Charter Approved, Design Complete, Core Modules, Integration, UAT, Go-live) and 7-person team responsibilities assigned.
- **Project Closure Enforcement**: Strict business rule blocks closing the project while critical defects remain open or activities are unfinished (HTTP 409 rejection).

### 2. Scope Management and WBS (4 Marks)
- **Requirements Management**: Prioritized (High/Medium/Low) and approved requirements. Initial hospital requirements (R1-R6) are Approved; hospital management's new requests (R7: AI Diagnosis, R8: Mobile Application) start as Proposed.
- **Hierarchical Work Breakdown Structure (WBS)**: 3 Deliverable levels and 12 terminal Work Packages linked directly to approved requirements.
- **Change Request Mechanism**: Records proposed changes, justification, cost impact, schedule impact, and approval status:
  - **CR1 (AI Preliminary Diagnosis)**: +PKR 500,000 | +14 days duration
  - **CR2 (Mobile Application)**: +PKR 300,000 | +7 days duration
  - **Combined Impact**: Exactly +PKR 800,000 and +21 days (3 weeks).
- **Scope Baseline Isolation**: Unapproved requirements are strictly rejected from WBS work packages and activity dependencies. Approving a change request dynamically promotes the requirement, creates WBS deliverables/packages, adds implementation activities, and recalculates budget and deadline baselines.

### 3. Schedule and Resource Management (5 Marks)
- **Activities & Dependency Graph**: 12 baseline activities with team assignees, estimated durations, planned costs, and predecessor dependencies. Circular dependencies are rejected via Topological Sort.
- **Critical Path Method (CPM)**: Programmatic forward pass (ES, EF) and backward pass (LS, LF) calculating Total Float (Slack). Critical Path identified with zero slack.
- **Delay Propagation**: Delay in Activity A5 (Appointment Module) propagates through dependent tasks (Billing, Integration, QA, UAT, Handover), pushing projected finish 2 days past the deadline.
- **Gantt Chart & Milestone Timeline**: Graphical Gantt chart displaying baseline vs. forecast progress, milestone diamonds, status date guideline, deadline guideline, and visual legend.

### 4. Cost Management and Earned Value Analysis (5 Marks)
- **Cost Estimation**: Bottom-up activity cost estimation totaling Budget at Completion (BAC = PKR 5,000,000).
- **Progress Tracking**: Real-time tracking of Actual Cost (AC) and Earned Value (EV).
- **EVM Performance Indicators (Status Date: 26-Oct-2026)**:
  - Planned Value (PV): PKR 3,195,333
  - Earned Value (EV): PKR 2,815,000
  - Actual Cost (AC): PKR 3,610,000
  - **Cost Performance Index (CPI): 0.78** (Severe cost overrun)
  - **Schedule Performance Index (SPI): 0.88** (Schedule slippage)
  - Estimate at Completion (EAC): PKR 6,412,078
- **Automated Threshold Warnings**: Banners alert project managers when CPI/SPI drop below 0.9 (warning) or 0.8 (critical), budget is exceeded, or deadlines slip.

### 5. Quality Management and Risk Control (4 Marks)
- **Defect Tracking**: Records defects, severity (Critical, High, Medium, Low), team assignee, and resolution status. Tracks case-study critical defects (Double booking in scheduling, Concurrent overwrite in records).
- **Quality Checklist with Automated Defect Raising**: Inspections and tests recorded per deliverable. Marking an inspection as `Fail` automatically raises a high-severity defect.
- **5x5 Prioritization Matrix**: Ranks risks by Likelihood (1-5) &times; Impact (1-5), classifying them into Critical, High, Medium, and Low severity zones.
- **Process Decision Program Chart (PDPC)**: Structured contingency tree displaying risks alongside concrete preventive and corrective action pathways.

### 6. System Integration, Validation, and Reporting (3 Marks)
- **Full-Stack MERN Architecture**: React 18 UI, Express API, MongoDB database persistence.
- **Cross-Module Validation**: Referential integrity between requirements, WBS, activities, defects, and change requests.
- **Project Control Room Dashboard**: Consolidated real-time dashboard displaying project health, EVM metrics, pending change requests, delayed activities, top risks, and printable summary report.

---

## Automated Test Cases Verification (`npm test`)

| ID | Test Scenario | Expected Result | Actual Result |
|---|---|---|:---:|
| TC-01 | CPM simple network: A(5) &rarr; B(3), A &rarr; C(4) | Finish day 9, critical path A &rarr; C, slack B = 1 | **Pass** |
| TC-02 | Circular dependency detection (A &rarr; B &rarr; A) | Error: "Circular dependency detected" | **Pass** |
| TC-03 | Dependency on non-existent activity | Error: "Activity depends on activity that does not exist" | **Pass** |
| TC-04 | Case-study baseline plan (12 activities) | 107-day plan, BAC = PKR 5,000,000 | **Pass** |
| TC-05 | Appointment module delay propagation | Status Delayed (+7d), pushes finish past deadline | **Pass** |
| TC-06 | EVM computations on case-study data | PV ~3.19M, EV 2.815M, AC 3.61M, CPI 0.78, SPI 0.88 | **Pass** |
| TC-07 | Threshold warning messages generation | CPI Critical warning, SPI warning, EAC warning present | **Pass** |
| TC-08 | Healthy project threshold check | CPI = SPI = 1.00, zero warning messages | **Pass** |
| TC-09 | Budget overrun detection | Planned cost > approved budget flags critical warning | **Pass** |
| TC-10 | Change requests approval math | Budget becomes PKR 5.8M (+800k), deadline +21 days | **Pass** |
| TC-11 | Risk scoring and prioritization formula | Score 20 = Critical, Score 12 = High, Score 6 = Medium | **Pass** |
| TC-12 | Late completion status categorization | Activities finished past plan marked "Completed Late" | **Pass** |

---

## How to Generate the PDF Report

1. Open [MIDTERM_LAB_REPORT.html](file:///c:/Users/hamda/Downloads/spms-healthcare-pms/MIDTERM_LAB_REPORT.html) in Google Chrome or Microsoft Edge.
2. In the top toolbar, type your **Student Name**, **Registration #**, **Section**, and **Submission Date**. (The cover page updates in real-time).
3. Click the green **"Print / Save as PDF"** button (or press `Ctrl + P`).
4. In the print dialog:
   - **Destination**: *Save as PDF*
   - **Paper Size**: *A4*
   - **Margins**: *Default* (the template includes built-in academic double borders and page margins)
   - **Options**: Check *Background graphics*
5. Click **Save** to generate the final PDF report.
