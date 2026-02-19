# Auto Claims FNOL Workflow Optimization & System UAT

## Project Overview
Portfolio/Resume project demonstrating operations analysis, business analysis, and workflow optimization skills for auto insurance claims processing at Mapfre.

## Original Problem Statement
Build an Auto Claims First Notice of Loss (FNOL) Workflow Optimization & System UAT project including:
- Workflow Analysis with As-Is vs To-Be flowcharts
- KPI Dashboard with metrics
- Business Requirements Document (BRD)
- UAT Test Scripts management
- Data Trend Analysis
- Risk Mitigation Plan
- Change Management Communications

## Architecture
- **Frontend**: React.js with Tailwind CSS, Recharts, React Flow
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Key Libraries**: React Flow (flowcharts), Recharts (data visualization), jsPDF (PDF export), Sonner (toasts)

## User Personas
1. **Operations Analyst** - Primary user for workflow analysis and KPI monitoring
2. **Business Analyst** - Reviews BRD and use cases
3. **QA Tester** - Manages UAT test scripts and defects
4. **Operations Manager** - Reviews risk mitigation and communications
5. **Recruiter/Hiring Manager** - Portfolio viewer

## Core Requirements (Static)
- [x] KPI Dashboard with 4 metrics
- [x] As-Is vs To-Be workflow flowcharts
- [x] Business Requirements Document viewer
- [x] UAT Test Scripts with Pass/Fail tracking
- [x] Defect Tracker with severity levels
- [x] Data Trend Analysis with pivot tables
- [x] Risk Mitigation Plan cards
- [x] Internal Communications draft
- [x] PDF Export functionality for all documents

## What's Been Implemented (Jan 2026)

### Phase 1: Dashboard & KPIs
- KPI cards: Avg Resolution Time, Auto-Route Success, Escalation Rate, Total Claims
- Claims volume trend chart (30 days)
- Claims by type pie chart
- Claims by day bar chart
- Recent claims list

### Phase 2: Workflow Analysis
- Interactive As-Is flowchart (manual process with pain points)
- Interactive To-Be flowchart (automated process with improvements)
- Process improvement metrics

### Phase 3: Business Requirements
- Full BRD document with 5 sections
- 3 detailed use cases (Low-Risk Auto-Approval, Regional Adjuster Assignment, High-Value Escalation)
- **PDF Export for BRD + Use Cases**

### Phase 4: UAT Testing
- 8 test scripts with Pass/Fail status management
- Defect tracker with CRUD operations
- Defect Escalation Protocol documentation
- **PDF Export for UAT Plan**

### Phase 5: Data Analytics
- Pivot tables by: Day of Week, Status, Claim Type, Region
- Interactive charts
- Raw data table with CSV export
- Key trend insight (Monday backlog spike)
- **PDF Export for Analytics Report**

### Phase 6: Change Management
- 3 risk cards with mitigation steps and contingency plans
- Internal communication email draft
- Change management methods documentation
- **PDF Export for Risk Mitigation Plan**

## Mock Data
- 60 auto-generated claims with realistic data
- 8 UAT test scripts
- 2 sample defects
- 3 risk mitigation items

## Prioritized Backlog

### P0 (Critical) - COMPLETED
- All deliverables implemented
- PDF Export functionality added

### P1 (High Priority) - Future
- User authentication for role-based access
- Print-friendly views
- Dark mode toggle

### P2 (Medium Priority) - Future
- Email notifications integration
- Real-time collaboration
- Version history for documents

## Next Tasks
- Add claim search/filter functionality
- Implement dark mode toggle
