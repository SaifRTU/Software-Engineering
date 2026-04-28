# Risk Management & Mitigation Tracker

A web application for capturing, assessing, prioritizing, and mitigating project risks. It acts as a central **risk register** with clear ownership, deadlines, and reporting so risks are handled proactively instead of being lost in spreadsheets or meetings.

## Purpose

- **Risk owners / team leads:** Update and execute mitigation actions  
- **Project managers:** Review risks, prioritize, and monitor progress  
- **Managers / stakeholders:** Read-only overview and reports  
- **Admin:** User roles, categories, scoring rules (placeholder for future RBAC)

## Core Features (MVP)

- **Risk register CRUD** — Create, update, archive risks  
- **Scoring & prioritization** — Probability (1–5) × Impact (1–5) → Risk Score; auto Risk Level (Low / Medium / High / Critical)  
- **Mitigation action tracking** — Actions per risk with due dates and status  
- **Dashboards** — Top risks, risks by category, overdue actions, risk heatmap (Impact vs Probability)  
- **Reports** — Export risk register and mitigation summary as **CSV** or **PDF**

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3)  
- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Recharts  
- **Export:** CSV (built-in), PDF (PDFKit)

## Quick Start

### Prerequisites

- Node.js 18+

### Setup

```bash
# From project root
npm run setup
npm run db:init
```

### Run

```bash
# Start backend (API) and frontend (dev server) together
npm run dev
```

- **API:** http://localhost:3001  
- **App:** http://localhost:5173  

Or run separately:

```bash
npm run dev:server   # backend only
npm run dev:client   # frontend only (ensure backend is running for API)
```

### Build for production

```bash
npm run build        # builds client into client/dist
npm run start        # runs server only (serve client/dist manually or via server if you add static serving)
```

## Project Structure

```
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api.js          # API client
│   │   ├── App.jsx
│   │   ├── components/     # Layout, RiskLevelBadge
│   │   └── pages/         # Dashboard, RiskRegister, RiskDetail, RiskForm, Reports
│   └── ...
├── server/
│   ├── data/               # SQLite DB (created by init-db)
│   ├── db.js               # DB access & helpers
│   ├── index.js            # Express API
│   ├── routes/             # export.js (CSV), export-pdf.js (PDF)
│   └── scripts/
│       └── init-db.js      # Create schema + seed data
├── package.json            # Root scripts (dev, setup, db:init)
└── README.md
```

## Data Model

- **Risks:** title, description, category, probability (1–5), impact (1–5), risk_score (P×I), risk_level (Low/Medium/High/Critical), owner_id, status (Open → In Mitigation → Monitoring → Closed/Accepted), evidence_notes, archived  
- **Mitigation actions:** risk_id, title, description, due_date, owner_id, status (pending / in_progress / completed / overdue)  
- **Users:** id, email, name, role (admin, project_manager, risk_owner, viewer) — seeded for demo; RBAC can be added later  

Categories: schedule, cost, technical, security, compliance, stakeholders.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/config | Categories, risk statuses, action statuses |
| GET | /api/users | List users |
| GET | /api/risks | List risks (query: archived, category, status) |
| GET | /api/risks/:id | Get risk with mitigation actions |
| POST | /api/risks | Create risk |
| PATCH | /api/risks/:id | Update risk |
| POST | /api/risks/:id/archive | Archive risk |
| POST | /api/risks/:id/restore | Restore archived risk |
| GET | /api/risks/:riskId/actions | List actions for risk |
| POST | /api/risks/:riskId/actions | Create mitigation action |
| PATCH | /api/actions/:id | Update action |
| GET | /api/dashboard | Top risks, by category, overdue actions, heatmap |
| GET | /api/overdue-actions | Overdue mitigation actions |
| GET | /api/export/csv | Download risk register CSV |
| GET | /api/export/pdf | Download risk register + mitigation summary PDF |

## Future Enhancements (Advanced)

- Notifications/reminders (overdue actions, critical risks)  
- Audit trail (who changed what, when)  
- Role-based access control (RBAC)  
- Risk templates (common risks per project type)  
- Residual risk (re-score after mitigation)  
- Integrations (CSV import, Jira/Trello link)  

## License

Course project — use as needed for your software engineering course.
