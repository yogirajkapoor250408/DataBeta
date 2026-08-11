import { StandardField, ColumnMapping, FIELD_DEFINITIONS } from '../types';

const ALIASES: Record<StandardField, string[]> = {
  date: ['date', 'transaction_date', 'transaction date', 'tx_date', 'order_date', 'order date', 'invoice_date', 'invoice date', 'day', 'period', 'created_at', 'created at', 'timestamp', 'dt'],
  revenue: ['revenue', 'sales', 'sales_amount', 'sales amount', 'income', 'total_sales', 'total sales', 'earnings', 'turnover', 'amount', 'total_amount', 'total amount', 'price', 'total', 'gross revenue', 'credit'],
  expense: ['expense', 'expenses', 'cost', 'costs', 'cost of goods', 'cogs', 'spending', 'payout', 'debit', 'operational_cost', 'operational cost', 'outflow', 'expenditure'],
  profit: ['profit', 'net profit', 'net_profit', 'net income', 'net_income', 'gain', 'margin', 'gross profit', 'earnings net'],
  category: ['category', 'type', 'group', 'segment', 'classification', 'department', 'cat', 'kind', 'class'],
  product: ['product', 'product name', 'product_name', 'item', 'item name', 'service', 'sku', 'description', 'title', 'goods'],
  customer: ['customer', 'customer name', 'customer_name', 'client', 'buyer', 'user', 'purchaser', 'account'],
  quantity: ['quantity', 'qty', 'count', 'units', 'units sold', 'units_sold', 'number of items', 'volume']
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[^a-z0-9\s_]/g, '').replace(/\s+/g, ' ');
}

export function autoDetectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    date: null,
    revenue: null,
    expense: null,
    profit: null,
    category: null,
    product: null,
    customer: null,
    quantity: null,
  };

  const usedHeaders = new Set<string>();

  // Pass 1: Exact alias matches
  for (const fieldDef of FIELD_DEFINITIONS) {
    const field = fieldDef.key;
    const aliases = ALIASES[field];

    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      const norm = normalizeHeader(header);

      if (aliases.includes(norm)) {
        mapping[field] = header;
        usedHeaders.add(header);
        break;
      }
    }
  }

  // Pass 2: Partial matches if still unassigned
  for (const fieldDef of FIELD_DEFINITIONS) {
    const field = fieldDef.key;
    if (mapping[field]) continue; // Already mapped

    const aliases = ALIASES[field];
    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      const norm = normalizeHeader(header);

      const isMatch = aliases.some(alias => norm.includes(alias) || alias.includes(norm));
      if (isMatch) {
        mapping[field] = header;
        usedHeaders.add(header);
        break;
      }
    }
  }

  return mapping;
}

export function validateMapping(mapping: ColumnMapping): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  // Date is required for time-based metrics & filtering
  if (!mapping.date) {
    missingFields.push('Date');
  }

  // At least Revenue, Expense, or Profit must be mapped to render financial dashboard
  if (!mapping.revenue && !mapping.expense && !mapping.profit) {
    missingFields.push('Financial Metric (Revenue, Expense, or Profit)');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
