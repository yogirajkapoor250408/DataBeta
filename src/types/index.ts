export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  CAD: { code: 'CAD', symbol: '$', label: 'CAD (CA$)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: '$', label: 'AUD (A$)', locale: 'en-AU' },
};

export type PlatformPreset = 'generic' | 'shopify' | 'stripe' | 'woocommerce' | 'square' | 'quickbooks' | 'paypal';

export interface PlatformPresetConfig {
  id: PlatformPreset;
  name: string;
  description: string;
  iconName: string;
  mapping: ColumnMapping;
}

export type StandardField = 
  | 'date'
  | 'revenue'
  | 'expense'
  | 'profit'
  | 'product'
  | 'category'
  | 'customer'
  | 'quantity';

export interface FieldDefinition {
  key: StandardField;
  label: string;
  required: boolean;
  type: 'date' | 'number' | 'string';
  description: string;
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  { key: 'date', label: 'Date', required: true, type: 'date', description: 'Transaction or invoice date' },
  { key: 'revenue', label: 'Revenue / Sales', required: false, type: 'number', description: 'Total revenue or sales income' },
  { key: 'expense', label: 'Expense / Cost', required: false, type: 'number', description: 'Total expense or cost incurred' },
  { key: 'profit', label: 'Profit', required: false, type: 'number', description: 'Net profit value (optional)' },
  { key: 'category', label: 'Category', required: false, type: 'string', description: 'Product category or expense classification' },
  { key: 'product', label: 'Product / Service', required: false, type: 'string', description: 'Item name or service description' },
  { key: 'customer', label: 'Customer', required: false, type: 'string', description: 'Client or buyer name' },
  { key: 'quantity', label: 'Quantity', required: false, type: 'number', description: 'Units sold or purchased' },
];

export type ColumnMapping = Record<StandardField, string | null>;

export interface NormalizedRecord {
  id: string;
  date: Date | null;
  dateString: string;
  revenue: number | null;
  expense: number | null;
  profit: number | null;
  product?: string;
  category?: string;
  customer?: string;
  quantity?: number;
  raw: Record<string, any>;
  isDuplicate?: boolean;
  isOutlier?: boolean;
}

export interface DatasetMeta {
  fileName: string;
  fileSize?: number;
  rowCount: number;
  headers: string[];
  isDemo: boolean;
  uploadedAt: Date;
  mapping: ColumnMapping;
  platformPreset?: PlatformPreset;
}

export interface Dataset {
  meta: DatasetMeta;
  records: NormalizedRecord[];
}

export interface FinancialMetrics {
  totalRevenue: number | null;
  totalExpenses: number | null;
  estimatedProfit: number | null;
  profitMargin: number | null;
  transactionCount: number;
  avgTransactionValue: number | null;
  hasRevenueData: boolean;
  hasExpenseData: boolean;
  hasProfitData: boolean;
  fixedExpenses: number;
  variableExpenses: number;
  breakEvenRevenue: number | null;
  monthlyBurnRate: number | null;
}

export interface CustomerAnalytics {
  totalUniqueCustomers: number;
  topCustomerName: string | null;
  topCustomerRevenue: number;
  topCustomerSharePct: number;
  paretoRatioPct: number;
  topCustomersList: { name: string; totalRevenue: number; orderCount: number }[];
}

export interface ProductAnalytics {
  totalProducts: number;
  topProductByRevenue: { name: string; revenue: number; quantity: number } | null;
  topProductByMargin: { name: string; avgPrice: number; marginPct: number } | null;
  productLeaderboard: { name: string; revenue: number; quantity: number; avgPrice: number }[];
}

export interface ScenarioInputs {
  volumeChangePct: number;
  priceChangePct: number;
  expenseChangePct: number;
}

export interface ScenarioResult {
  projectedRevenue: number | null;
  projectedExpenses: number | null;
  projectedProfit: number | null;
  projectedMargin: number | null;
  revenueDelta: number;
  profitDelta: number;
}

export interface AnomalyAlert {
  id: string;
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  metric: string;
  month?: string;
}

export interface ReportBranding {
  companyName: string;
  logoUrl?: string;
  executiveNotes?: string;
}

export interface BusinessObservation {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'info';
  title: string;
  description: string;
}

export type DateFilterPreset = 'all' | 'this_month' | 'last_month' | 'last_3_months' | 'custom';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// Natural Language Search / Query Card Types
export interface QueryResultCard {
  query: string;
  matchedType: 'month' | 'category' | 'customer' | 'metric' | 'outlier' | 'general';
  title: string;
  valueString: string;
  subtitle: string;
  details?: string;
}

// Tax Deduction Types
export interface TaxCategoryBreakdown {
  categoryName: string;
  taxScheduleCategory: string;
  totalExpense: number;
  deductiblePct: number;
  estimatedDeduction: number;
}

export interface TaxDeductionSummary {
  totalGrossExpense: number;
  totalDeductibleExpense: number;
  estimatedTaxSavings: number; // calculated at ~25% estimated tax bracket
  breakdown: TaxCategoryBreakdown[];
}

// Target KPI Goals
export interface KPIGoals {
  targetRevenue: number;
  targetProfitMarginPct: number;
  maxExpenseCap: number;
}

export interface GoalProgress {
  revenueProgressPct: number;
  marginProgressPct: number;
  expenseCapUsedPct: number;
  projectedGoalDays: number | null;
}

// Customer Cohort Types
export interface CohortSummary {
  month: string;
  newCustomerCount: number;
  totalRevenue: number;
  repeatPurchaseRatePct: number;
}
