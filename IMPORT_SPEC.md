# DataBeta Import Normalization & Reconciliation Specification

This document defines the strict, Zod-validated data ingestion and reconciliation contract implemented in DataBeta.

---

## 1. Supported Entity Schemas & Formats

DataBeta accepts structured `.csv`, `.xlsx`, and `.xls` files for four core business entities:

### 1. Financial Transactions / Ledger (`transactions`)
Supports three common industry formatting styles:
1. **Single Signed Amount with Type Column**:
   - `Date`: ISO Date, DD/MM/YYYY, MM/DD/YYYY, or Excel serial numbers.
   - `Description`: Transaction description / memo.
   - `Amount`: Signed or unsigned numeric text (`₹15,000.50`, `$12,000`, `(5,000)`).
   - `Type`: `'revenue' | 'expense' | 'income' | 'credit' | 'debit' | 'outflow'`.
   - `Category`: Categorization (`SaaS`, `Infrastructure`, `Payroll`, etc.).
   - `Customer`: Customer or Vendor entity name.
2. **Separate Revenue and Expense Columns**:
   - `Revenue`: Positive inbound cash flow.
   - `Expense`: Positive outbound expense.
3. **Signed Amount Single Column**:
   - Positive numbers represent Revenue.
   - Negative numbers or accounting parentheses `(1,500.00)` represent Expenses.

### 2. CRM Deals (`deals`)
- `Title`: Deal / Opportunity name (Required).
- `Company`: Account name (Required).
- `Contact`: Contact person name.
- `Amount`: Numerical deal value (Non-negative).
- `Stage`: `'lead' | 'qualified' | 'discovery' | 'proposal_sent' | 'negotiation' | 'won' | 'lost'`.
- `Expected Close Date`: Target closing date.
- `Next Step`: Immediate required action item.

### 3. CRM Contacts (`contacts`)
- `Name`: Full person name (Required).
- `Email`: Valid email format.
- `Phone`: E.164 or formatted phone number.
- `Company`: Associated organization.
- `Role`: Job title or decision role.

### 4. Invoices & Receivables (`invoices`)
- `Invoice Number`: Unique identifier (Required).
- `Customer Name`: Billing customer (Required).
- `Amount`: Total invoice amount (Positive).
- `Issue Date`: Invoicing date.
- `Due Date`: Payment deadline.
- `Status`: `'draft' | 'sent' | 'due_soon' | 'overdue' | 'paid' | 'disputed'`.
- `Amount Paid`: Settled portion.

---

## 2. Normalization & Decimal Safety Rules

1. **No Silent Zero Coercion**:
   - Any row containing unparseable characters (`N/A`, `FREE`, `#VALUE!`) in an amount column is flagged with an explicit `ImportRowError`. It is never silently coerced to `0`.
2. **Deterministic Signed Mapping**:
   - `type IN ('expense', 'debit', 'outflow', 'cost')` or negative amount $\rightarrow$ `revenue = 0, expense = abs(amount), profit = -abs(amount)`.
   - `type IN ('revenue', 'income', 'credit')` or positive amount $\rightarrow$ `revenue = abs(amount), expense = 0, profit = abs(amount)`.

---

## 3. Post-Import Reconciliation Assertion

Before committing a batch of rows to the workspace ledger, the engine asserts:
$$\text{persistedRowCount} == \text{previewValidRowCount}$$
$$|\text{persistedTotalRevenue} - \text{previewTotalRevenue}| < 0.05$$
$$|\text{persistedTotalExpense} - \text{previewTotalExpense}| < 0.05$$

If any assertion fails, the entire batch write is rejected, and an explicit discrepancy warning is displayed.
