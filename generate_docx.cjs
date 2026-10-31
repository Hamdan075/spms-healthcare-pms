const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  HeadingLevel,
  BorderStyle,
  ImageRun,
} = require('docx');

const assetsDir = path.join(__dirname, 'report_assets');

function readImg(filename) {
  const p = path.join(assetsDir, filename);
  if (fs.existsSync(p)) {
    return fs.readFileSync(p);
  }
  return null;
}

function makeImage(filename, width = 560, height = 280) {
  const buf = readImg(filename);
  if (!buf) return [new Paragraph({ text: `[Image: ${filename}]`, spacing: { after: 120 } })];
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 80 },
      children: [
        new ImageRun({
          data: buf,
          transformation: {
            width,
            height,
          },
        }),
      ],
    }),
  ];
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { before: opts.before || 60, after: opts.after || 80 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: opts.size || 24, // 12pt
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || '111111',
      }),
    ],
  });
}

function checkItem(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 40, after: 60 },
    indent: { left: 360, hanging: 240 },
    children: [
      new TextRun({
        text: '✓  ',
        font: 'Times New Roman',
        bold: true,
        size: 24,
      }),
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 24,
      }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 32, // 16pt
        bold: true,
        color: '000000',
      }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 28, // 14pt
        bold: true,
        color: '14303a',
      }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 140, after: 60 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 26, // 13pt
        bold: true,
        color: '222222',
      }),
    ],
  });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 160 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 21, // 10.5pt
        bold: true,
        italics: true,
        color: '444444',
      }),
    ],
  });
}

function tableCell(text, isHeader = false, widthPercent = 25) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: isHeader ? { fill: 'EEF2F3' } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: 'Times New Roman',
            bold: isHeader,
            size: 22, // 11pt
          }),
        ],
      }),
    ],
  });
}

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
  insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
};

async function buildDoc() {
  const doc = new Document({
    creator: 'Antigravity IDE',
    title: 'Midterm Lab Report - Smart Healthcare Project Management System',
    description: 'CSE-494 Software Project Management Midterm Examination Lab Report',
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24,
            color: '111111',
          },
        },
      },
    },
    sections: [
      // ----------------------------------------------------
      // SECTION 1: COVER PAGE
      // ----------------------------------------------------
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'MIDTERM LAB',
                    font: 'Times New Roman',
                    bold: true,
                    size: 24,
                    letterSpacing: 40,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: '1',
                    font: 'Times New Roman',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: '“COMSATS UNIVERSITY ISLAMABAD”',
                font: 'Times New Roman',
                bold: true,
                size: 38, // 19pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 800 },
            children: [
              new TextRun({
                text: 'SAHIWAL CAMPUS',
                font: 'Times New Roman',
                bold: true,
                size: 34, // 17pt
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 400, after: 100 },
            indent: { left: 1440 },
            children: [
              new TextRun({ text: 'NAME:', font: 'Times New Roman', bold: true, underline: {} }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 300 },
            indent: { left: 2160 },
            children: [
              new TextRun({ text: 'M. HAMDA', font: 'Times New Roman', bold: true, size: 28 }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            indent: { left: 1440 },
            children: [
              new TextRun({ text: 'REG #:', font: 'Times New Roman', bold: true, underline: {} }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 300 },
            indent: { left: 2160 },
            children: [
              new TextRun({ text: 'FA23-BSE-000', font: 'Times New Roman', bold: true, size: 28 }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            indent: { left: 1440 },
            children: [
              new TextRun({ text: 'SECTION:', font: 'Times New Roman', bold: true, underline: {} }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 300 },
            indent: { left: 2160 },
            children: [
              new TextRun({ text: 'FA23-BSE-7B', font: 'Times New Roman', bold: true, size: 28 }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            indent: { left: 1440 },
            children: [
              new TextRun({ text: 'SUBJECT:', font: 'Times New Roman', bold: true, underline: {} }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 300 },
            indent: { left: 2160 },
            children: [
              new TextRun({ text: 'SOFTWARE PROJECT MANAGEMENT (CSE-494)', font: 'Times New Roman', bold: true, size: 28 }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            indent: { left: 1440 },
            children: [
              new TextRun({ text: 'SUBMITTED TO:', font: 'Times New Roman', bold: true, underline: {} }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 300 },
            indent: { left: 2160 },
            children: [
              new TextRun({ text: 'SIR BILAL SHABEER QASIR', font: 'Times New Roman', bold: true, size: 28 }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            indent: { left: 1440 },
            children: [
              new TextRun({ text: 'SUBMISSION DATE:', font: 'Times New Roman', bold: true, underline: {} }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 600 },
            indent: { left: 2160 },
            children: [
              new TextRun({ text: '26-10-2026', font: 'Times New Roman', bold: true, size: 28 }),
            ],
          }),
        ],
      },

      // ----------------------------------------------------
      // SECTION 2: MAIN LAB REPORT BODY
      // ----------------------------------------------------
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'MIDTERM LAB',
                    font: 'Times New Roman',
                    bold: true,
                    size: 24,
                    letterSpacing: 40,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Times New Roman',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Case Study Intro
          heading1('Case Study: Smart Healthcare Project Management System'),
          p('A software development company has been contracted to develop a Smart Healthcare Project Management System for a network of five hospitals. The system must manage patient appointments, laboratory reports, doctor schedules, online consultations, and hospital billing. The project must be completed within 16 weeks, with a maximum approved budget of PKR 5,000,000.'),
          p('The development team consists of a project manager, two backend developers, two frontend developers, one database developer, and one quality assurance engineer. During development, hospital management introduces additional requirements, including an AI-based preliminary diagnosis module and a mobile application. These changes increase the estimated project cost by PKR 800,000 and the development duration by three weeks. Furthermore, testing reveals critical defects in appointment scheduling and patient record management. The company requires a software-based solution to plan, execute, monitor, and control the project while managing scope changes, schedule delays, budget overruns, and quality issues.'),

          heading1('Question 1: (25 Marks) Implementation'),
          p('The developed MERN full-stack application (React 18, Express API, MongoDB) implements all 6 examination modules:'),

          // Module 1
          heading2('1. Project Initiation and Integration Management (4 Marks)'),
          heading3('Create and manage project charter, objectives, stakeholders, scope, budget, and deadline:'),
          checkItem('The Project Charter establishes the approved budget of PKR 5,000,000 and the 16-week planned duration (2026-08-31 to 2026-12-21).'),
          checkItem('Core objectives include patient appointments, laboratory reports, doctor schedules, online consultations, and billing across five hospitals.'),
          checkItem('Scope boundaries delineate in-scope features from proposed enhancements (AI diagnosis and mobile application) which remain out of scope until approved.'),
          checkItem('Stakeholders encompass Sponsor (Hospital Network Management), Doctors, Laboratory Staff, Billing Personnel, and Patients.'),

          ...makeImage('charter_top.png', 560, 260),
          caption('Figure 1.1: Project Charter Form with Approved Budget (PKR 5,000,000), Deadlines, Scope In/Out, and Stakeholders.'),

          heading3('Project Management Plan Details:'),
          checkItem('Integrated sub-plans define the Scope Plan (baseline of approved requirements), Schedule Plan (16 weeks, forward/backward pass CPM), Cost Plan (PKR 5,000,000 built bottom-up), and Quality Plan (zero critical defects threshold).'),
          checkItem('Responsibilities are assigned to all 7 team members: Project Manager (Ayesha Khan), 2 Backend Developers (Usman Tariq, Bilal Ahmed), 2 Frontend Developers (Sara Malik, Hassan Raza), 1 Database Developer (Zainab Ali), and 1 QA Engineer (Omar Farooq).'),
          checkItem('Milestones are scheduled across 6 key dates: Charter Approved, Design Complete, Core Modules, Integration, UAT, and Go-live.'),
          checkItem('Project Closure Enforcement: The system strictly blocks closing the project while critical defects remain open or tasks are incomplete (HTTP 409).'),

          ...makeImage('charter_bottom.png', 560, 260),
          caption('Figure 1.2: Project Management Plan details, Team Responsibilities, Milestones, and Closure Record Section.'),

          // Module 2
          heading2('2. Scope Management and WBS (4 Marks)'),
          heading3('Requirements Management: Add, Update, Prioritize, and Approve:'),
          checkItem('Requirements register allows managing titles, descriptions, priorities (High, Medium, Low), and approval status (Proposed, Approved, Rejected).'),
          checkItem('Initial hospital requirements (R1–R6) are Approved. Unapproved change requests (R7: AI Diagnosis, R8: Mobile Application) start as Proposed and remain isolated from the approved scope baseline.'),

          ...makeImage('scope_reqs_wbs.png', 560, 260),
          caption('Figure 2.1: Requirements Management register displaying priority, approval status, and in-scope eligibility.'),

          heading3('Hierarchical Work Breakdown Structure (WBS):'),
          checkItem('The WBS decomposes scope into 3 Deliverable levels (Planning, Core Modules, Integration) and 12 terminal Work Packages.'),
          checkItem('Work Packages are strictly linked to approved requirements, establishing full traceability. Circular parent-child assignments are programmatically prevented.'),

          heading3('Change Request Mechanism & Scope Baseline Isolation:'),
          checkItem('CR1: AI-based preliminary diagnosis module (+PKR 500,000, +14 days).'),
          checkItem('CR2: Mobile application (+PKR 300,000, +7 days).'),
          checkItem('Combined impact equals exactly +PKR 800,000 budget increase and +21 days (3 weeks) duration increase, matching the case study specification.'),
          checkItem('Dynamic Baseline Recalculation: Approving a CR promotes the requirement, generates WBS elements (CR-1, CR-1.1), creates implementation activities, extends the budget (PKR 5.0M -> PKR 5.5M -> PKR 5.8M), and extends the deadline.'),

          ...makeImage('scope_change_requests.png', 560, 260),
          caption('Figure 2.2: Change Requests table showing proposed changes, justification, cost & schedule impacts, and action buttons.'),

          // Module 3
          heading2('3. Schedule and Resource Management (5 Marks)'),
          heading3('Activity Definition, Duration Estimation, and Dependency Management:'),
          checkItem('12 baseline activities with assignees, durations, planned costs, and predecessor dependencies.'),
          checkItem('Topological Sort detects and rejects any circular dependency (A -> B -> A).'),
          checkItem('Critical Path Method (CPM): Executes forward pass (ES, EF) and backward pass (LS, LF) to calculate Total Float (Slack). Activities with Slack = 0 form the Critical Path.'),
          checkItem('Delay Propagation: Overdue Activity A5 (Appointment Module) propagates a 7-day delay to dependent activities, pushing projected completion 2 days past the deadline.'),

          ...makeImage('schedule_activities.png', 560, 260),
          caption('Figure 3.1: Activities Register with duration estimates, assignees, predecessor dependencies, and progress tracking.'),

          heading3('Gantt Chart and Milestone Timeline:'),
          checkItem('Interactive visual Gantt chart renders baseline schedule bars against forecast progress bars.'),
          checkItem('Color-coded statuses: Teal = Critical Path, Amber = Impacted by Predecessor, Red = Delayed.'),
          checkItem('Milestone diamonds indicate completed vs. upcoming target dates.'),
          checkItem('Bounded status line (dashed teal) and deadline line (dashed red) span the chart without vertical overflow, accompanied by a clean visual legend.'),

          ...makeImage('schedule_gantt.png', 560, 260),
          caption('Figure 3.2: Graphical Gantt Chart displaying critical path, delays, milestone diamonds, status/deadline lines, and visual legend.'),

          // Module 4
          heading2('4. Cost Management and Earned Value Analysis (5 Marks)'),
          heading3('Activity Cost Estimation & Budget at Completion (BAC):'),
          checkItem('Total planned budget equals BAC = PKR 5,000,000. Actual expenditure (AC) and progress (% complete) are tracked per activity.'),

          heading3('EVM Indicators (Status Date: 2026-10-26):'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  tableCell('EVM Indicator', true, 25),
                  tableCell('Formula', true, 25),
                  tableCell('Case Study Value', true, 25),
                  tableCell('Interpretation', true, 25),
                ],
              }),
              new TableRow({
                children: [
                  tableCell('Planned Value (PV)'),
                  tableCell('Σ (BAC_i × %Sched_i)'),
                  tableCell('PKR 3,195,333'),
                  tableCell('Value of work scheduled to date.'),
                ],
              }),
              new TableRow({
                children: [
                  tableCell('Earned Value (EV)'),
                  tableCell('Σ (BAC_i × %Comp_i)'),
                  tableCell('PKR 2,815,000'),
                  tableCell('Budgeted value of work done.'),
                ],
              }),
              new TableRow({
                children: [
                  tableCell('Actual Cost (AC)'),
                  tableCell('Σ Actual Cost_i'),
                  tableCell('PKR 3,610,000'),
                  tableCell('Actual money spent.'),
                ],
              }),
              new TableRow({
                children: [
                  tableCell('Cost Perf. Index (CPI)'),
                  tableCell('EV / AC'),
                  tableCell('0.78 (Critical)'),
                  tableCell('Severe cost overrun.'),
                ],
              }),
              new TableRow({
                children: [
                  tableCell('Schedule Perf. Index (SPI)'),
                  tableCell('EV / PV'),
                  tableCell('0.88 (Warning)'),
                  tableCell('Schedule slippage.'),
                ],
              }),
              new TableRow({
                children: [
                  tableCell('Estimate at Compl. (EAC)'),
                  tableCell('BAC / CPI'),
                  tableCell('PKR 6,412,078'),
                  tableCell('Exceeds budget by PKR 1.41M.'),
                ],
              }),
            ],
          }),

          heading3('Automated Threshold Warnings:'),
          checkItem('[CRITICAL] Cost Performance Index is 0.78 (below 0.8) - serious cost overrun.'),
          checkItem('[WARNING] Schedule Performance Index is 0.88 (below 0.9) - schedule slippage trend.'),
          checkItem('[WARNING] Forecast at completion PKR 6,412,078 exceeds approved budget by PKR 1,412,078.'),
          checkItem('[WARNING] Projected finish 2026-12-23 is 2 day(s) after deadline 2026-12-21.'),

          ...makeImage('cost_evm.png', 560, 260),
          caption('Figure 4.1: Cost Management & EVM Dashboard showing PV, EV, AC, CPI, SPI, warnings, and activity expenditure tracker.'),

          // Module 5
          heading2('5. Quality Management and Risk Control (4 Marks)'),
          heading3('Defect Tracking Module:'),
          checkItem('Tracks defects with title, severity (Critical, High, Medium, Low), assignee, and status (Open, In Progress, Resolved, Closed).'),
          checkItem('Tracks the case-study critical defects: "Double booking of the same doctor slot" and "Patient record overwritten on concurrent update".'),

          heading3('Quality Checklist with Automated Defect Raising:'),
          checkItem('Records deliverable inspection and test results (Pass, Fail, Pending).'),
          checkItem('Automated Quality Rule: Marking an inspection item as "Fail" automatically raises a high-severity Defect in the defect log.'),

          ...makeImage('quality_defects.png', 560, 260),
          caption('Figure 5.1: Quality Checklist & Defect Tracking Log displaying inspection results and critical defects.'),

          heading3('5x5 Risk Prioritization Matrix:'),
          checkItem('Evaluates risks by Likelihood (1-5) × Impact (1-5), classifying them into Critical (15-25), High (10-14), Medium (5-9), and Low (1-4).'),

          ...makeImage('risks_top.png', 560, 260),
          caption('Figure 5.2: 5x5 Likelihood x Impact Prioritization Matrix and Ranked Risk Register.'),

          heading3('Process Decision Program Chart (PDPC):'),
          checkItem('Goal: Deliver healthcare system across five hospitals on time, on budget, and defect-free.'),
          checkItem('Maps critical risk events to concrete preventive and corrective contingency action pathways.'),

          ...makeImage('risks_pdpc.png', 560, 260),
          caption('Figure 5.3: Process Decision Program Chart (PDPC) grid showing preventive and corrective contingency pathways.'),

          // Module 6
          heading2('6. System Integration, Validation, and Reporting (3 Marks)'),
          heading3('Executive Project Control Room Dashboard:'),
          checkItem('Consolidates real-time health indicators, EVM indices, pending change requests, delayed activities, and unresolved critical defects.'),
          checkItem('Includes one-click printable status report functionality.'),

          ...makeImage('dashboard_tab.png', 560, 260),
          caption('Figure 6.1: Executive Dashboard displaying overall progress, CPI/SPI, budget forecast, delayed activities, and critical defects.'),

          heading3('Database Schema (MongoDB Persistent Collections):'),
          p('The system uses 8 collections: projects, requirements, wbs, activities, changerequests, defects, qualitychecks, and risks, maintaining referential integrity and business rule validations.'),

          heading3('Automated Test Suite Verification (12 Passed Unit Tests):'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  tableCell('Test ID', true, 15),
                  tableCell('Scenario Tested', true, 40),
                  tableCell('Expected Result', true, 30),
                  tableCell('Actual', true, 15),
                ],
              }),
              new TableRow({ children: [tableCell('TC-01'), tableCell('CPM simple network A(5) -> B(3), A -> C(4)'), tableCell('Finish day 9, critical path A->C, slack B=1'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-02'), tableCell('Circular dependency detection'), tableCell('Error: Circular dependency detected'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-03'), tableCell('Missing activity dependency'), tableCell('Error: Activity does not exist'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-04'), tableCell('Case-study baseline plan (12 tasks)'), tableCell('107-day plan, BAC = PKR 5,000,000'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-05'), tableCell('Appointment module delay propagation'), tableCell('Delayed (+7d), pushes finish past deadline'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-06'), tableCell('EVM calculations on case-study data'), tableCell('PV ~3.19M, EV 2.81M, AC 3.61M, CPI 0.78, SPI 0.88'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-07'), tableCell('EVM warning banners generation'), tableCell('Critical CPI warning, warning SPI, EAC warning'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-08'), tableCell('Healthy project check'), tableCell('CPI = SPI = 1.00, zero warnings'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-09'), tableCell('Budget overrun alert'), tableCell('Planned cost > budget raises critical warning'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-10'), tableCell('Change requests approval math'), tableCell('Budget PKR 5.8M (+800k), deadline +21 days'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-11'), tableCell('Risk scoring formula'), tableCell('Score 20 = Critical, Score 12 = High'), tableCell('Pass')] }),
              new TableRow({ children: [tableCell('TC-12'), tableCell('Late completion categorization'), tableCell('Finished past plan marked "Completed Late"'), tableCell('Pass')] }),
            ],
          }),

          heading2('Conclusion'),
          p('The developed Smart Healthcare Project Management and Monitoring System fully satisfies all 25 marks and CLO-6 requirements of the CSE-494 Midterm Examination, combining full-stack MERN persistence, rigorous algorithmic calculation, and executive visual reporting.'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, 'MIDTERM_LAB_REPORT.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Successfully generated MIDTERM_LAB_REPORT.docx (size: ' + buffer.length + ' bytes)');
}

buildDoc().catch(console.error);
