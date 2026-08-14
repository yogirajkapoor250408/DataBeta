# DEMO_MODE.md — DataBeta Isolated Demo Specification

This document defines how Demo Mode operates in DataBeta to guarantee compliance with the **Non-Negotiable Product-Trust Rules**.

---

## 1. Core Principle: Zero Confusion Between Demo & Real Data

- **Never present seed/demo data as customer data**: When a user creates or opens their workspace, if no real records have been created or imported, DataBeta renders a clean **First-Run Setup Checklist** and clear empty states indicating what data is needed to unlock each card.
- **Explicit Demo Labeling**: Whenever Demo Mode is active, an unambiguous, high-contrast banner (`DemoBanner.tsx`) is rendered persistently at the top of the interface:
  > **Demo Mode**: *Demo data — not your business data. Explore realistic sales pipeline, cash collections, and owner actions risk-free.*
- **No Shared State**: Changes made in Demo Mode (such as completing demo tasks, advancing demo deals, or creating demo invoices) are isolated to the demo session and never pollute user database tables or audit logs.

---

## 2. Seed Data Persona & Scenario

The demo environment simulates **Apex Technical Solutions**, an illustrative 12-person B2B consulting & software platform business:
- **Commercial Clients**: Nexus Dynamics (Enterprise SaaS), Vanguard Logistics (Supply Chain), Horizon Digital Media (Creative Agency), Cobalt BioTech (Healthcare Diagnostics).
- **Pipeline Deals**: Active opportunities across `Proposal Sent`, `Negotiation`, and `Won` stages with real closing dates and stage win probabilities.
- **Invoices & Receivables**: Real invoice numbers (`INV-2026-001`, `INV-2026-002`, `INV-2026-003`) demonstrating overdue, due soon, and paid states.
- **Historical Ledger**: Real dual-entry revenue and operating expenses showing gross margins and customer profitability.

---

## 3. Safe Switching Workflow

- Users can switch into Demo Mode anytime via the **"Explore Demo"** button in the top navigation or empty-state checklists.
- Users can exit Demo Mode with one click via **"Open My Workspace"** or by authenticating with their credentials.
- A **"Reset Demo Data"** action allows resetting demo entities back to their initial state.
