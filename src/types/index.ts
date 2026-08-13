// Core Dataset & Column Mapping Types
export type StandardField = 'date' | 'revenue' | 'expense' | 'profit' | 'category' | 'product' | 'customer' | 'quantity';

export interface FieldDefinition {
  key: StandardField;
  label: string;
  required: boolean;
  description: string;
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  { key: 'date', label: 'Date', required: true, description: 'Transaction date' },
  { key: 'revenue', label: 'Revenue', required: false, description: 'Sales income ($)' },
  { key: 'expense', label: 'Expense', required: false, description: 'Costs / Expenses ($)' },
  { key: 'profit', label: 'Profit', required: false, description: 'Net profit ($)' },
  { key: 'category', label: 'Category', required: false, description: 'Grouping / Category' },
  { key: 'product', label: 'Product / Item', required: false, description: 'Product or service name' },
  { key: 'customer', label: 'Customer', required: false, description: 'Client or buyer name' },
  { key: 'quantity', label: 'Quantity', required: false, description: 'Unit quantity' },
];

export interface ColumnMapping {
  date: string | null;
  revenue: string | null;
  expense: string | null;
  profit: string | null;
  category: string | null;
  product: string | null;
  customer: string | null;
  quantity: string | null;
}

export interface DatasetMeta {
  fileName: string;
  fileSize: number;
  rowCount: number;
  headers: string[];
  uploadedAt: Date;
  mapping: ColumnMapping;
  platformPreset?: string;
}

export interface NormalizedRecord {
  id: string;
  date: Date | null;
  dateString: string;
  revenue: number | null;
  expense: number | null;
  profit: number | null;
  category: string | null | undefined;
  product: string | null | undefined;
  customer: string | null | undefined;
  quantity?: number;
  isDuplicate?: boolean;
  raw?: Record<string, any>;
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
  breakEvenRevenue: number | null;
  fixedExpenses: number;
  variableExpenses: number;
  hasRevenueData: boolean;
  hasExpenseData: boolean;
  hasProfitData: boolean;
  monthlyBurnRate?: number | null;
}

export interface FinancialHealthScorecard {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  marginScore: number;
  stabilityScore: number;
  expenseControlScore: number;
  diversificationScore: number;
  factors: string[];
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', label: 'US Dollar ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound (£)', locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)', locale: 'en-AU' },
};

export type DateFilterPreset = 'all' | 'this_month' | 'last_month' | 'last_3_months' | 'custom';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface BusinessObservation {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'info';
  title: string;
  description: string;
  metric?: string;
}

export type PlatformPreset = 'shopify' | 'stripe' | 'woocommerce' | 'square' | 'quickbooks' | 'paypal';

export interface PlatformPresetConfig {
  id: PlatformPreset;
  name: string;
  iconName?: string;
  description?: string;
  mapping: ColumnMapping;
}

export interface CustomerAnalytics {
  totalUniqueCustomers: number;
  topCustomerSharePct: number;
  paretoRatioPct: number;
  topCustomerName: string | null;
  topCustomerRevenue?: number;
  topCustomersList: { name: string; totalRevenue: number; orderCount: number }[];
}

export interface ProductAnalytics {
  totalProducts: number;
  topProductByRevenue: { name: string; revenue: number; quantity: number } | null;
  topProductByMargin: { name: string; avgPrice: number; marginPct?: number } | null;
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

export interface QueryResultCard {
  query: string;
  title: string;
  valueString: string;
  subtitle: string;
  category?: string;
  matchedType?: string;
}

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
  estimatedTaxSavings: number;
  breakdown: TaxCategoryBreakdown[];
}

export interface KPIGoals {
  targetRevenue: number;
  targetProfitMarginPct: number;
  maxExpenseCap: number;
}

export interface CohortItem {
  month: string;
  newCustomerCount?: number;
  newCustomers?: number;
  totalRevenue: number;
  repeatPurchaseRatePct?: number;
  repeatCount?: number;
}

export interface CohortSummary {
  month?: string;
  newCustomerCount?: number;
  totalRevenue?: number;
  repeatPurchaseRatePct?: number;
  cohorts?: CohortItem[];
  overallRepeatRatePct?: number;
}

// CRM TYPES
export type CRMStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'in_touch' | 'offer_sent' | 'discussion';

export interface CRMContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  location?: string;
  stage: CRMStage;
  dealValue: number;
  tags: string[];
  notes?: string;
  managerName?: string;
  lastContactDate: string;
  createdAt: string;
  totalSpent: number;
  orderCount: number;
  commentsCount?: number;
  attachmentsCount?: number;
}

export interface CRMActivity {
  id: string;
  contactId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change';
  description: string;
  timestamp: string;
}

export interface CRMPipelineSummary {
  totalPipelineValue: number;
  totalDeals: number;
  winRatePct: number;
  avgDealSize: number;
  stageCounts: Record<CRMStage, number>;
}

// LOCAL AI COPILOT TYPES
export interface AICopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  cards?: {
    title: string;
    value: string;
    detail: string;
    type?: 'positive' | 'negative' | 'info';
  }[];
}

// AUTH & ADMIN CONSOLE TYPES
export type UserRole = 'owner' | 'admin' | 'user';
export type AuthProvider = 'google' | 'apple' | 'email';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  authProvider: AuthProvider;
  createdAt: string;
  lastLogin: string;
  isFirstTimeUser: boolean;
  subscriptionStatus: 'free' | 'paid';
  isAdmin: boolean;
}

export interface LoginSessionLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  ipLocation: string;
  provider: AuthProvider;
}

export interface AdminSystemStats {
  totalUsers: number;
  totalLogins: number;
  totalDatasetsUploaded: number;
  totalAIQueriesExecuted: number;
  totalCRMDealsCreated: number;
  systemUptimePct: number;
}
