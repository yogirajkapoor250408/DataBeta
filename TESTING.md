# DataBeta Testing Guide

This document details automated and manual test strategies verifying DataBeta's financial reliability, tenant isolation, and import integrity.

---

## 1. Automated Test Suite

Run the full automated test suite with Node's native test runner:

```bash
node tests/runAllTests.js
```

### Coverage Matrix:
- **Money Model & Parsing**:
  - Currency symbol stripping (`₹`, `$`, `€`, `£`).
  - Thousands separator stripping (INR `1,50,000` & US `150,000`).
  - Accounting parentheses negative parsing `(1,200.00)` $\rightarrow$ `-1200`.
  - Non-finite & `NaN` rejection (no silent zero coercion).
- **Multi-Currency Safety**:
  - FX conversion formula testing.
  - Safe multi-currency aggregation guards.
- **Import Normalization & Reconciliation**:
  - Signed amount + type mapping (`type=revenue/income` vs `type=expense/debit`).
  - Post-import row count and sum reconciliation assertion.
- **Tenant Isolation**:
  - Real tenant vs demo tenant data partition invariant.
- **Audit Logging**:
  - Verification of append-only events for all critical mutations.
- **Provenance Envelope**:
  - Contract validation and zero-division win-rate safety.

---

## 2. Type Checking & Production Build

```bash
npx tsc --noEmit
npm run build
```

---

## 3. Manual QA Verification Checklist

1. **CRM Deal Isolation**:
   - Create a deal in real workspace.
   - Click "Explore Demo" / navigate with `?mode=demo`.
   - Return to live mode (`?mode=live`).
   - Verify real deal persists and is not overwritten by demo fixtures.
2. **Ledger CSV Import**:
   - Upload `tests/fixtures/importFixtures.ts` CSV files.
   - Confirm preflight preview totals match exact non-zero sums.
   - Confirm all valid rows are written into the dataset.
3. **Empty State Checklist**:
   - Create a new clean account.
   - Verify 5-step checklist displays with 0 mock deals/invoices.
4. **Audit Trail**:
   - Advance a deal stage and create an invoice.
   - Navigate to Settings $\rightarrow$ Audit Log and verify both actions appear with timestamps and actor details.
