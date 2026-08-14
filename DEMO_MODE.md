# DataBeta Demo Mode Architecture & Isolation

DataBeta provides an interactive, realistic exploration mode for prospective customers without ever polluting, overwriting, or confusing real business tenant data.

---

## 1. Core Principles

1. **Strict Tenant Separation**:
   - Demo mode operates under a fixed tenant identifier: `demo-workspace-id`.
   - Real customer workspaces use secure UUIDs generated on signup.
   - Demo data is immutable; changes made during demo sessions remain in temporary browser memory and are discarded on reload.
2. **Explicit Route Semantics**:
   - Demo Mode: `/dashboard.html?mode=demo` (or `/demo`).
   - Real Authenticated Mode: `/dashboard.html?mode=live` or `/app/[workspaceSlug]`.
3. **Persistent In-App Banner**:
   - When viewing demo data, a persistent top banner clearly states:
     > `"Demo workspace — changes are not saved to your business data."`
   - Includes 1-click CTA: `[Exit Demo & Open Real Workspace]` to transition directly to signup/login.
4. **Zero Sample Data in Real Accounts**:
   - New user accounts start 100% clean with zero mock transactions or deals.
   - An interactive 5-step checklist guides new owners through creating their first contact, deal, task, invoice, and ledger import.
