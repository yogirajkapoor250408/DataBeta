# DataBeta Audit Log Specification

DataBeta records an immutable, append-only audit trail for all business-critical mutations across the sales, cash, and settings domains.

---

## 1. Audit Entry Schema

```typescript
export interface AuditLogEntry {
  id: string;                      // Unique event UUID
  eventId?: string;                // External event reference
  workspaceId: string;             // Tenant workspace ID
  userId?: string;                 // User UUID
  actorId?: string;                // User UUID
  userEmail: string;               // Actor email
  actorEmail?: string;             // Actor email
  action: AuditAction;             // Action discriminator
  entityType: string;              // 'crm_deal' | 'invoice' | 'workspace' | etc.
  entityId?: string;               // Target resource ID
  requestId?: string;              // Correlation request ID
  source?: string;                 // 'web_client' | 'api' | 'import_job'
  beforeSummary?: string;          // State before mutation
  afterSummary?: string;           // State after mutation
  details?: Record<string, any>;   // JSON metadata payload
  createdAt: string;               // ISO 8601 timestamp
}
```

---

## 2. Tracked Mutation Actions

| Action | Entity Type | Description |
| :--- | :--- | :--- |
| `workspace_created` | `workspace` | Initial business tenant provisioning |
| `base_currency_changed` | `workspace` | Base accounting currency update |
| `workspace_settings_updated` | `workspace` | Settings, locale, or fiscal year changes |
| `member_invited` | `workspace_member` | Team member invite dispatched |
| `member_role_updated` | `workspace_member` | Permission role updated |
| `deal_created` | `crm_deal` | New sales deal registered |
| `deal_stage_advanced` | `crm_deal` | Deal stage progression (e.g. `qualified` $\rightarrow$ `won`) |
| `deal_updated` | `crm_deal` | Value, close date, or owner modified |
| `deal_deleted` | `crm_deal` | Deal removed from board |
| `task_created` | `crm_task` | Follow-up task scheduled |
| `task_completed` | `crm_task` | Follow-up marked finished |
| `invoice_created` | `invoice` | Customer invoice created |
| `invoice_paid` | `invoice` | Invoice collection settled |
| `import_started` | `import_job` | Batch CSV/Excel file ingestion initiated |
| `import_completed` | `import_job` | Reconciled batch committed to ledger |
| `import_failed` | `import_job` | Import aborted due to validation error |
| `data_exported` | `workspace` | Full JSON/CSV backup downloaded |
| `data_deleted` | `workspace` | Workspace data wiped |

---

## 3. Storage & Export

- Audit entries are stored in PostgreSQL table `public.audit_logs` protected by tenant RLS.
- Offline fallback persists recent events to `localStorage` under `databeta_audit_[workspaceId]`.
- Administrators can export the full audit history anytime from **Settings $\rightarrow$ Audit Log $\rightarrow$ Export Full Backup**.
