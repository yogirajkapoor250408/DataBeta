# SECURITY_AND_DATA.md — DataBeta Security, Privacy & Data Governance

This document details the security posture, data lifecycle, encryption standards, and role-based access controls implemented across DataBeta.

---

## 1. Multi-Tenant Architecture & Isolation

- **PostgreSQL Database**: Hosted on Supabase Cloud.
- **Row Level Security (RLS)**: Every database table (`crm_deals`, `invoices`, `transactions`, `workspace_members`, `audit_logs`) includes a mandatory `business_id` or `workspace_id` foreign key.
- **Enforcement Policy**:
  ```sql
  CREATE POLICY "Tenant isolation for deals"
  ON public.crm_deals
  FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
    )
  );
  ```
- No user can read, write, update, or delete records belonging to another workspace.

---

## 2. Encryption Standards

- **In Transit**: All HTTP and WebSocket connections are strictly enforced over TLS 1.3.
- **At Rest**: PostgreSQL storage, database snapshots, and uploaded documents are encrypted with AES-256.
- **Zero Client Service Keys**: Only public anonymous keys with scoped RLS permissions are exposed to frontend clients. Privileged service keys are strictly confined to backend edge functions.

---

## 3. Role-Based Access Control (RBAC)

| Role | CRM Deals & Pipeline | Invoices & Collections | Historical Ledger | Workspace Settings & Audit Log |
|---|---|---|---|---|
| **Owner** | Full Access | Full Access | Full Access | Full Admin Access |
| **Admin** | Full Access | Full Access | Full Access | Full Admin Access |
| **Sales Manager** | Full Access | Read-Only | Read-Only | View Only |
| **Salesperson** | Assigned Deals Only | View Associated Invoices | No Access | No Access |
| **Finance Viewer** | Read-Only | Full Access | Full Access | View Only |
| **Viewer** | Read-Only | Read-Only | Read-Only | No Access |

---

## 4. Immutable Audit Logging

Sensitive operational actions generate permanent entries in `audit_logs`:
- Workspace creation & deletion requests
- Base currency changes (permission-gated)
- Team member invitations and role adjustments
- CSV/Excel data imports and rollback actions
- Full JSON/CSV workspace exports

---

## 5. Data Retention, Portability & Deletion

- **Zero Vendor Lock-in**: Owners can download a complete JSON archive of all workspace entities anytime via `Settings > Security & Data Architecture > Export JSON Dump`.
- **Right to Erasure**: Deleting a workspace invokes cascading deletions across all associated deals, contacts, invoices, transactions, and audit logs.
- **Zero Data Selling**: Customer data, deal values, and financial records are never sold, monetized, or scraped for external AI model training.
