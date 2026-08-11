# DataBeta Architecture Guide

DataBeta is built using a modern, beginner-friendly **client-side architecture**. This document explains how the major components of DataBeta work together to turn raw business spreadsheets into financial dashboards and reports.

---

## Architecture Overview Diagram

```
+-----------------------------------------------------------------------+
|                              USER BROWSER                              |
|                                                                       |
|   +-------------------+    File Upload   +------------------------+   |
|   |  CSV / XLSX File  | ---------------> |      dataParser.ts     |   |
|   +-------------------+                  +------------------------+   |
|                                                      |                |
|                                                      v                |
|   +-------------------+  Auto/Manual     +------------------------+   |
|   | ColumnMapperModal | <--------------> |   columnMatcher.ts     |   |
|   +-------------------+                  +------------------------+   |
|                                                      |                |
|                                                      v                |
|   +-------------------+  Normalized      +------------------------+   |
|   |   DataTableView   | <--------------- |   NormalizedRecord[]   |   |
|   +-------------------+                  +------------------------+   |
|                                                      |                |
|                                          +-----------+-----------+    |
|                                          |                       |    |
|                                          v                       v    |
|                                 +-----------------+     +----------+  |
|                                 | metricsCalc.ts  |     | summary.ts| |
|                                 +-----------------+     +----------+  |
|                                          |                       |    |
|                                          v                       v    |
|                                 +----------------------------------+  |
|                                 |       DashboardView.tsx          |  |
|                                 |  (KPI Cards, Charts, Insights)   |  |
|                                 +----------------------------------+  |
+-----------------------------------------------------------------------+
```

---

## Major Components Breakdown

### 1. Data Ingestion & Sanitization (`dataParser.ts`)
When a user drops a file:
- **PapaParse** converts `.csv` text rows into JavaScript objects.
- **SheetJS (`xlsx`)** reads binary Excel worksheets into structured array objects.
- **Number Cleaning**: Removes `$`, `€`, `,`, and whitespace characters from string inputs to prevent `NaN` math errors.
- **Date Normalization**: Standardizes dates across ISO strings, US formats (`MM/DD/YYYY`), European formats (`DD/MM/YYYY`), and Excel date serials into native JavaScript `Date` objects.

### 2. Header Auto-Detection Engine (`columnMatcher.ts`)
Spreadsheets rarely use identical column names. The column matching engine:
- Evaluates raw file headers against a dictionary of aliases (e.g. `Revenue` matches `Sales`, `Income`, `Turnover`, `Credit`).
- Maps headers to 8 standard DataBeta fields (`date`, `revenue`, `expense`, `profit`, `category`, `product`, `customer`, `quantity`).
- If required fields (like `Date` or a financial metric) cannot be matched automatically, the application safely triggers `ColumnMapperModal.tsx` for manual user mapping.

### 3. Financial Metrics Engine (`metricsCalculator.ts`)
Computes aggregate financial KPIs:
- **Revenue**, **Expenses**, **Estimated Profit**, **Profit Margin (%)**, **Transaction Count**, and **Average Order Value**.
- **Data Availability Check**: If expense columns do not exist in the uploaded file, the calculator explicitly flags `hasExpenseData = false`, causing the UI to render `"Not enough data"` instead of dummy zeros.

### 4. Rule-Based Summary Engine (`summaryEngine.ts`)
Evaluates the dataset chronologically (comparing sub-periods) using deterministic rules:
- Checks if revenue grew or declined.
- Compares expense growth rate against revenue growth rate.
- Identifies the highest-revenue category and its percentage of total sales.
- Highlights profit margin health.

### 5. UI Layer & Views
- **DashboardView**: Displays high-level cards, time-series charts (Recharts), category breakdown, and rule-based insights. Includes instant date range filters (All time, This month, Last month, Last 3 months, Custom).
- **DataTableView**: Displays paginated transaction rows with live search, column sorting, and category filters.
- **ReportsView**: Styled with `@media print` CSS rules so clicking "Print / Save PDF" produces a clean executive paper report without web site headers or clutter.
- **SettingsView**: Allows exporting normalized data as CSV or resetting state.

---

## Security & Privacy Guarantee

1. **Zero External Requests**: All file parsing, calculations, and chart renders occur 100% inside local browser memory.
2. **Local Persistence**: Uploaded state is stored exclusively in `localStorage` on the user's device.
3. **No Execution Risk**: Files are parsed strictly as plain tabular data; scripts within cells are sanitized and never executed.
