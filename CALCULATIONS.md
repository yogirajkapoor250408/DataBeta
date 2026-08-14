# CALCULATIONS.md — DataBeta Metric & Calculation Provenance Specification

Every numerical metric rendered in DataBeta is deterministic, auditable, and grounded strictly in verified source records. DataBeta never synthesizes optimistic forecasts or speculative scores when data is missing.

---

## 1. Standard Provenance Envelope

All calculation methods return a typed `ProvenanceMetric<T>` envelope:

```typescript
export interface ProvenanceMetric<T = number> {
  status: 'complete' | 'partial' | 'needs_data';
  value: T | null;
  formattedValue: string;
  coverage: {
    records: number;
    startDate?: string;
    endDate?: string;
    missingInputs: string[];
  };
  assumptions: string[];
  sourceLinks?: Array<{ type: string; id: string; label: string }>;
  calculatedAt: string;
}
```

---

## 2. Core Operational Formulas

### A. Sales Win Rate Conversion (%)
- **Formula**:
  $$\text{Win Rate} = \left( \frac{\text{Won Deals Count}}{\text{Total Closed Deals Count}} \right) \times 100$$
- **Required Inputs**: Deals marked with `stage === 'won'` or `stage === 'lost'`.
- **Eligibility Condition**: Minimum 1 closed deal. If 0 closed deals exist, returns status `'partial'` with formatted value `"0 closed deals"`.
- **Assumptions**: Deals currently in active negotiation (`lead`, `qualified`, `proposal_sent`, `negotiation`) are excluded from historical denominator.

---

### B. Total Weighted Pipeline Inflow ($)
- **Formula**:
  $$\text{Weighted Pipeline} = \sum_{i=1}^{n} \left( \text{Deal Amount}_i \times \frac{\text{Probability Pct}_i}{100} \right)$$
- **Required Inputs**: Active open deals where `stage !== 'won'` and `stage !== 'lost'`.
- **Default Stage Weights**:
  - `New Lead`: 10%
  - `Qualified`: 30%
  - `Discovery`: 50%
  - `Proposal Sent`: 70%
  - `Negotiation`: 85%
- **Assumptions**: Only applies to open opportunities closing within the evaluated timeframe.

---

### C. Cash Collection Rate (%)
- **Formula**:
  $$\text{Collection Rate} = \left( \frac{\text{Total Cash Collected}}{\text{Total Invoiced Receivables}} \right) \times 100$$
- **Required Inputs**: Billed invoices with non-zero amounts and recorded payments.
- **Eligibility Condition**: Requires at least 1 issued invoice record. If total invoiced is $0$, returns status `'needs_data'`.
- **Assumptions**: Includes partial payments credited against open invoices.

---

### D. Gross Operating Margin (%)
- **Formula**:
  $$\text{Gross Margin} = \left( \frac{\text{Realized Gross Revenue} - \text{Operating Expenses}}{\text{Realized Gross Revenue}} \right) \times 100$$
- **Required Inputs**: Mapped transaction ledger entries with positive revenue and categorized expenses.
- **Eligibility Condition**: Requires gross revenue $> 0$. If only expenses exist, returns status `'partial'` with `"No realized revenue"`.

---

### E. 30-Day Cash Outlook Breakdown ($)
- **Formula**:
  $$\text{Net Cash Outlook} = (\text{Committed Invoiced Inflow} + \text{Weighted Pipeline Inflow}) - \text{Expected Outflows}$$
- **Components**:
  1. **Committed Inflow**: Sum of unpaid invoice balances due within 30 days.
  2. **Weighted Pipeline Inflow**: Probability-adjusted value of open CRM deals targeted to close within 30 days.
  3. **Expected Outflows**: Sum of operating expenses and vendor overhead.
  4. **Opening Bank Balance**: Configured in Workspace Profile (or returns `"Not connected"` with explicit prompt).
