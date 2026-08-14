# DataBeta Money & Currency Model

This document outlines how monetary amounts, multi-currency conversions, and FX rates are modeled and enforced across DataBeta.

---

## 1. Domain Types

Every monetary record in DataBeta uses the `MoneyAmount` envelope:

```typescript
export interface MoneyAmount {
  originalAmount: number;         // e.g. 150000.00
  originalCurrency: CurrencyCode; // e.g. 'INR'
  baseAmount: number;             // e.g. 1796.41
  baseCurrency: CurrencyCode;     // e.g. 'USD'
  fxRate: number;                 // e.g. 83.5
  fxRateDate?: string;            // e.g. '2026-08-15'
  conversionSource?: string;      // 'identical' | 'reference_fx' | 'custom_rate'
}
```

---

## 2. Workspace Base Currency vs Display Currency

- **Workspace Base Currency (`baseCurrency`)**:
  - The authoritative accounting currency of the business tenant (e.g. `USD`, `INR`, `EUR`, `GBP`).
  - All ledger reports, cash outlook calculations, and pipeline aggregations are normalized to the base currency.
- **Display Currency (`displayCurrency`)**:
  - The local viewing currency selected in the navigation bar.
  - Changes to display currency only adjust presentation formatting and do not alter the persistent base records.

---

## 3. Safe Multi-Currency Aggregation

DataBeta enforces an invariant that **mixed currencies are never aggregated directly**:

```typescript
export function aggregateMoneyAmounts(
  items: { amount: number; currency?: CurrencyCode }[],
  targetBaseCurrency: CurrencyCode
): {
  totalBaseAmount: number;
  itemCount: number;
  hasMixedCurrencies: boolean;
  currencyBreakdown: Record<CurrencyCode, number>;
}
```

If multiple currencies exist within a dataset, each record is converted using the recorded FX rate before addition, and the UI displays a mixed-currency badge indicating multi-currency conversion provenance.
