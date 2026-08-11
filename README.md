# DataBeta - Small Business Financial Analytics MVP

DataBeta is a lightweight, zero-latency business data analysis tool designed for small and micro online business owners. It allows business owners to upload raw sales and expense data (CSV or Excel) and immediately understand financial performance, profit margins, and key operational trends without manual calculations or external dependencies.

---

## Key Features

1. **End-to-End Data Parsing & Normalization**:
   - Accepts CSV (`.csv`) and Excel (`.xlsx`, `.xls`) workbooks.
   - Automatically cleans currency formatting (e.g. `$1,250.00`, `€450`, `,`), dates, and number formats.

2. **Smart Column Auto-Detection & Manual Mapping**:
   - Fuzzy-detects standard business fields (`Date`, `Revenue`, `Expense`, `Profit`, `Category`, `Product`, `Customer`, `Quantity`).
   - If required columns are ambiguous or missing, an interactive modal allows manual field mapping.

3. **Strict Financial Accuracy ("No Invented Data")**:
   - Calculates Total Revenue, Total Expenses, Estimated Profit, Profit Margin (%), Transaction Count, and Average Transaction Value.
   - If a metric cannot be derived from uploaded data, it displays `"Not enough data"` instead of generating fake numbers.

4. **Dynamic Visual Dashboards**:
   - Area and Bar charts for Revenue, Expense, and Profit over time.
   - Category breakdown chart.
   - Date preset filtering (All time, This month, Last month, Last 3 months, Custom date range).

5. **Rule-Based Business Summary**:
   - Automated financial observations (e.g., period-over-period revenue growth, expense growth vs revenue velocity, top revenue categories, profit margin health).
   - 100% deterministic rule-based analysis (no paid AI APIs required).

6. **Interactive Searchable Data Table**:
   - Full record grid with search, category filtering, column sorting, and pagination.

7. **Printable Executive Reports**:
   - Print-formatted summary optimized for browser `window.print()` / PDF export.

8. **100% Client-Side Data Privacy**:
   - All file parsing and processing occurs locally in the browser. No business data is sent to external servers.

9. **Try Demo Data Mode**:
   - Built-in 6-month e-commerce sample dataset clearly labeled with a `Demo Data` badge.

---

## Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Ingestion**: PapaParse (CSV), SheetJS `xlsx` (Excel)
- **Data Visualization**: Recharts
- **Date Handling**: `date-fns`

---

## Installation & Local Execution

### Prerequisites
- Node.js v18+ 
- npm or yarn

### Quickstart

1. **Clone or Navigate to Project Directory**:
   ```bash
   cd DataBeta
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:5173`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## Project Structure

```
DataBeta/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Top navigation header & Demo banner
│   │   ├── DashboardView.tsx      # KPI Cards, Recharts, Business Summary
│   │   ├── DataTableView.tsx      # Searchable, sortable, paginated grid
│   │   ├── ReportsView.tsx        # Printable executive PDF/Print view
│   │   ├── SettingsView.tsx       # Export CSV, reset state, privacy docs
│   │   ├── ColumnMapperModal.tsx  # Manual column mapping UI
│   │   ├── FileUploadModal.tsx    # Drag-and-drop file uploader
│   │   └── EmptyState.tsx         # Zero-data onboarding screen
│   ├── utils/
│   │   ├── dataParser.ts          # CSV/XLSX file reader & number cleaner
│   │   ├── columnMatcher.ts       # Fuzzy header matching engine
│   │   ├── metricsCalculator.ts   # Financial KPI calculations
│   │   ├── summaryEngine.ts       # Deterministic rule-based insights
│   │   └── demoData.ts            # Realistic 6-month sample dataset
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces & types
│   ├── App.tsx                    # Root container & tab router
│   ├── main.tsx                   # React DOM entry point
│   └── index.css                  # Tailwind styles & print CSS
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── ARCHITECTURE.md                # Beginner-friendly architecture overview
└── README.md
```

---

## Known Limitations & Future Roadmap

- Multi-currency conversion is not built into MVP (assumes single currency symbol).
- Large files (>100,000 rows) may take 1-2 seconds to parse synchronously in the browser main thread.
