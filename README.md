# DataBeta — Daily Sales & Cash Operating System

> **"Know exactly who to follow up with today, what is likely to close, and what it means for this month’s cash — without rebuilding your business in a spreadsheet."**

DataBeta is a production-grade, privacy-first sales and cash operating system built specifically for small business owners and frontline sales teams (2–25 people). It bridges pipeline progression, customer communication, and receivables into an actionable 30-day cash outlook with full metric provenance.

---

## 🏛 Core Architecture & Operating Principles

1. **Non-Negotiable Provenance Envelope**:
   - Zero invented metrics, fake runways, or optimistic health scores.
   - Every metric reports its status (`complete` | `partial` | `needs_data`), contributing record count, date window, missing inputs, and calculation assumptions.
2. **Strict Isolated Demo Mode**:
   - Explicitly isolated dataset (`Apex Technical Solutions`) marked with a persistent amber banner (`"Demo data — not your business data"`).
   - Production mode presents honest, step-by-step empty-state checklists until records are created or imported.
3. **No Fake Telemetry or Social Proof**:
   - Purged all fake random notification engines and fabricated user presence toasts.
4. **Relational Sales & Cash Data Model**:
   - Deals (7-stage Kanban), Contacts, Companies, Tasks, Products/Services, Invoices, and Transactions.

---

## 📂 Core Modules

- **Module A: Today Command Center (`DashboardView.tsx`)**: Prioritized Next Best Actions with plain-English rationale, 30-Day Cash Outlook (Committed + Weighted Pipeline - Outflows), and Daily Target Pace.
- **Module B: Sales CRM (`CRMView.tsx`)**: 7-stage drag-and-drop Kanban, Contacts & Companies directory with duplicate warning, and 1-tap WhatsApp follow-up script copying.
- **Module C: Cash & Receivables (`FinanceView.tsx`)**: Invoices aging list (`draft`, `sent`, `due_soon`, `overdue`, `paid`, `disputed`), 1-tap polite reminder script copying, and 30-day cash calendar.
- **Module D: Profitability & Provenance (`InsightsView.tsx`)**: Customer and job-level gross margins, product profitability leaderboard, and full provenance calculation inspectors.
- **Module E: Import & Data Quality Center (`FileUploadModal.tsx`)**: Pre-write validation engine for 7 entity types with downloadable CSV templates and row-by-row error auditing.
- **Module F: Executive Reporting (`ReportsView.tsx`)**: 5 core reports with data completeness preflight checks, print-formatted stylesheets, and CSV exports.
- **Module G: Governance & Settings (`SettingsView.tsx`)**: Workspace base currency vs display currency separation, team invites with RBAC roles, live audit logging, and full JSON data backup export.
- **Module H: Honest Public Website (`LandingPage.tsx`)**: Grounded marketing for 2–25 person businesses with an interactive ROI calculator and straightforward pricing tiers ($0, $29/mo, $79/mo).

---

## 📚 Production Specification Documentation

- 🏛️ [ARCHITECTURE.md](file:///Users/yogiraj/Desktop/DataBeta/ARCHITECTURE.md) — System architecture, tenant boundaries, route lifecycle & trust invariants.
- 📥 [IMPORT_SPEC.md](file:///Users/yogiraj/Desktop/DataBeta/IMPORT_SPEC.md) — Zod-validated import normalizer, decimal safety, and post-import reconciliation.
- 💵 [MONEY_AND_CURRENCY.md](file:///Users/yogiraj/Desktop/DataBeta/MONEY_AND_CURRENCY.md) — MoneyAmount model, FX rate provenance, and multi-currency aggregation safety.
- 🛡️ [AUDIT_LOG.md](file:///Users/yogiraj/Desktop/DataBeta/AUDIT_LOG.md) — Append-only audit schema, mutation events, and compliance backup exports.
- 🎭 [DEMO_MODE.md](file:///Users/yogiraj/Desktop/DataBeta/DEMO_MODE.md) — Immutable demo tenant isolation and persistent banner specifications.
- 🧪 [TESTING.md](file:///Users/yogiraj/Desktop/DataBeta/TESTING.md) — Automated test suite coverage matrix and manual QA checklist.

---

## 🚀 Getting Started

### Installation
```bash
git clone https://github.com/yogirajkapoor250408/DataBeta.git
cd DataBeta
npm install
```

### Automated Tests
```bash
node tests/runAllTests.js
```

### Type Checking & Production Build
```bash
npx tsc --noEmit
npm run build
```

### Running Locally
```bash
npm run dev
```
Visit `http://localhost:5173/` for the public marketing site, or `http://localhost:5173/dashboard.html` for the application.

---

## 🗄️ Database Migrations

Apply `supabase/schema.sql` (or `supabase/migrations/20260815_production_hardening.sql`) in your Supabase SQL Editor to enable multi-tenant CRM tables and RLS isolation policies.


---

## 🛡️ License
Private & Proprietary — Built for DataBeta.
