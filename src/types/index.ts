// ============================================================================
// DataBeta: Sales & Cash Operating System Type Definitions
// Production-Grade Relational, Provenance & Operating Schema
// ============================================================================

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'SGD' | 'AED' | 'JPY';

export type UserRole = 'admin' | 'owner' | 'member' | 'viewer' | 'user';

export type WorkspaceRole =
  | 'owner'
  | 'admin'
  | 'sales_manager'
  | 'salesperson'
  | 'finance_viewer'
  | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  baseCurrency: CurrencyCode;
  displayCurrency: CurrencyCode;
  locale: string;
  timezone: string;
  fiscalYearStartMonth: number; // 1-12
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: WorkspaceRole;
  invitedAt?: string;
  acceptedAt?: string;
}

// ----------------------------------------------------------------------------
// METRIC PROVENANCE ENVELOPE (Non-Negotiable Trust Rule)
// ----------------------------------------------------------------------------
export interface MetricCoverage {
  records: number;
  startDate?: string;
  endDate?: string;
  missingInputs: string[];
}

export interface MetricSourceLink {
  type: 'deal' | 'invoice' | 'transaction' | 'contact' | 'task';
  id: string;
  label: string;
}

export interface ProvenanceMetric<T = number> {
  status: 'complete' | 'partial' | 'needs_data';
  value: T | null;
  formattedValue: string;
  coverage: MetricCoverage;
  assumptions: string[];
  sourceLinks?: MetricSourceLink[];
  calculatedAt: string;
}

// ----------------------------------------------------------------------------
// CRM RELATIONAL DATA MODEL
// ----------------------------------------------------------------------------
export type DealStage =
  | 'lead'
  | 'qualified'
  | 'discovery'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface Contact {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone?: string;
  companyId?: string;
  companyName?: string;
  roleTitle?: string;
  tags: string[];
  notes?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  workspaceId: string;
  name: string;
  domain?: string;
  industry?: string;
  sizeRange?: string;
  tier?: 'Enterprise' | 'Mid-Market' | 'SMB';
  phone?: string;
  website?: string;
  address?: string;
  totalWonRevenue?: number;
  openPipelineValue?: number;
  contactsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Deal {
  id: string;
  workspaceId: string;
  title: string;
  name?: string;
  companyId?: string;
  companyName: string;
  company?: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  email?: string;
  contactPhone?: string;
  phone?: string;
  stage: DealStage;
  amount: number;
  dealValue?: number;
  currency: CurrencyCode;
  expectedCloseDate: string; // YYYY-MM-DD
  probabilityPct: number; // 0-100
  source?: string;
  ownerId?: string;
  ownerName?: string;
  nextStep?: string;
  lastActivityAt?: string;
  lastContactDate?: string;
  lossReason?: string;
  notes?: string;
  products?: DealProduct[];
  tags: string[];
  totalSpent?: number;
  orderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'call' | 'whatsapp' | 'email' | 'meeting' | 'note' | 'task';

export interface Activity {
  id: string;
  workspaceId: string;
  dealId?: string;
  contactId?: string;
  type: ActivityType;
  description: string;
  outcome?: string;
  loggedByUserId?: string;
  loggedByName?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  dealId?: string;
  contactId?: string;
  dealTitle?: string;
  contactName?: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'completed' | 'snoozed';
  assignedToUserId?: string;
  assignedToName?: string;
  snoozedUntil?: string;
  createdAt: string;
}

export interface ProductService {
  id: string;
  workspaceId: string;
  name: string;
  sku?: string;
  category?: string;
  unitPrice: number;
  unitCost?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// CASH & INVOICES / RECEIVABLES
// ----------------------------------------------------------------------------
export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'due_soon'
  | 'overdue'
  | 'paid'
  | 'disputed';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productSku?: string;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  dealId?: string;
  status: InvoiceStatus;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  promisedPaymentDate?: string; // YYYY-MM-DD
  amount: number;
  currency: CurrencyCode;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  lineItems?: InvoiceLineItem[];
  lastReminderSentAt?: string;
  nextReminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  workspaceId: string;
  invoiceId: string;
  amount: number;
  currency: CurrencyCode;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  workspaceId: string;
  date: string; // YYYY-MM-DD
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  currency: CurrencyCode;
  customerName?: string;
  productName?: string;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  createdAt: string;
}

// Legacy Record compatibility bridge for CSV/Dataset views
export interface NormalizedRecord {
  id: string;
  date: Date | string | any;
  dateString?: string;
  revenue: number | null | any;
  expense: number | null | any;
  profit: number | null | any;
  category?: string;
  customer?: string;
  product?: string;
  quantity?: number;
  unitPrice?: number;
  currency?: string;
  paymentMethod?: string;
  type?: string;
  amount?: number;
  raw?: Record<string, any>;
  notes?: string;
}

// ----------------------------------------------------------------------------
// TODAY & COMMAND CENTER ACTION QUEUE
// ----------------------------------------------------------------------------
export interface NextBestAction {
  id: string;
  type:
    | 'stale_deal'
    | 'overdue_followup'
    | 'uncontacted_lead'
    | 'closing_opportunity'
    | 'overdue_invoice'
    | 'missing_decision_maker';
  priority: 'urgent' | 'high' | 'medium';
  title: string;
  description: string;
  reason: string;
  entityId: string;
  entityType: 'deal' | 'contact' | 'invoice' | 'task';
  dealValue?: number;
  actionLabel: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface DailySalesTarget {
  callsTarget: number;
  callsDone: number;
  followupsTarget: number;
  followupsDone: number;
  proposalsTarget: number;
  proposalsDone: number;
  collectionsTarget: number;
  collectionsDone: number;
}

export interface CashOutlookForecast {
  actualCashBalance: ProvenanceMetric<number>;
  committedInvoicesInflow: ProvenanceMetric<number>;
  weightedPipelineInflow: ProvenanceMetric<number>;
  expectedOutflow: ProvenanceMetric<number>;
  netCashOutlook: ProvenanceMetric<number>;
}

// ----------------------------------------------------------------------------
// IMPORT & DATA QUALITY CENTER
// ----------------------------------------------------------------------------
export type ImportEntityType =
  | 'contacts'
  | 'companies'
  | 'deals'
  | 'tasks'
  | 'invoices'
  | 'transactions'
  | 'products';

export interface ImportRowError {
  rowIndex: number;
  field: string;
  value: any;
  reason: string;
}

export interface ImportPreviewResult {
  entityType: ImportEntityType;
  fileName: string;
  totalRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  proposedCreates: number;
  proposedUpdates: number;
  proposedSkips: number;
  sampleRows: Record<string, any>[];
  errors: ImportRowError[];
}

export interface ImportJobRecord {
  id: string;
  workspaceId: string;
  entityType: ImportEntityType;
  fileName: string;
  fileSize: number;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportRowError[];
  status: 'preview' | 'completed' | 'failed' | 'rolled_back';
  createdAt: string;
  createdBy: string;
}

// ----------------------------------------------------------------------------
// REPORT BUILDER & PREFLIGHT
// ----------------------------------------------------------------------------
export type ReportType =
  | 'weekly_sales'
  | 'monthly_owner'
  | 'pipeline_review'
  | 'collections'
  | 'profitability';

export interface ReportPreflight {
  reportType: ReportType;
  title: string;
  periodStart: string;
  periodEnd: string;
  currency: CurrencyCode;
  dataCoverage: {
    complete: boolean;
    coveragePct: number;
    recordCounts: Record<string, number>;
    missingInputs: string[];
  };
  assumptions: string[];
  isReady: boolean;
}

// ----------------------------------------------------------------------------
// AUDIT LOG
// ----------------------------------------------------------------------------
export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  action:
    | 'workspace_created'
    | 'base_currency_changed'
    | 'member_invited'
    | 'member_role_updated'
    | 'member_removed'
    | 'data_imported'
    | 'data_exported'
    | 'data_deleted'
    | 'report_generated'
    | 'deal_stage_advanced'
    | 'invoice_created'
    | 'invoice_paid';
  entityType: string;
  entityId?: string;
  details: Record<string, any>;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// USER SESSION & AUTH
// ----------------------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: UserRole;
  subscriptionTier?: 'free' | 'starter' | 'team' | 'growth';
  subscriptionStatus?: 'free' | 'trialing' | 'paid' | 'expired';
  isAdmin?: boolean;
  authProvider?: string;
  createdAt?: string;
  lastLogin?: string;
  isFirstTimeUser?: boolean;
}

export interface DatasetMeta {
  fileName: string;
  fileSize: number;
  rowCount: number;
  headers: string[];
  uploadedAt: Date | string;
  mapping: Record<string, string | null>;
}

export interface Dataset {
  id?: string;
  meta?: DatasetMeta;
  fileName?: string;
  uploadedAt?: string;
  recordCount?: number;
  records: NormalizedRecord[];
}

export const CURRENCIES: Record<CurrencyCode, { code: CurrencyCode; symbol: string; label: string; locale: string }> = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  CAD: { code: 'CAD', symbol: '$', label: 'CAD ($)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: '$', label: 'AUD ($)', locale: 'en-AU' },
  SGD: { code: 'SGD', symbol: '$', label: 'SGD ($)', locale: 'en-SG' },
  AED: { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ)', locale: 'ar-AE' },
  JPY: { code: 'JPY', symbol: '¥', label: 'JPY (¥)', locale: 'ja-JP' },
};

export type CoreTab = 'overview' | 'crm' | 'finance' | 'insights' | 'reports' | 'settings';

export type CRMContact = Deal;

export interface KPIGoals {
  targetRevenue?: number;
  targetProfitMarginPct?: number;
  maxExpenseCap?: number;
  monthlyRevenueTarget?: number;
  monthlyExpenseLimit?: number;
  grossMarginTarget?: number;
  netMarginTarget?: number;
  quarterlyGrowthRate?: number;
}

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

export interface AICopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'ai';
  text: string;
  timestamp: string;
  cards?: any[];
}

export interface QueryResultCard {
  title: string;
  query?: string;
  matchedType?: string;
  value?: string;
  valueString?: string;
  description?: string;
  subtitle?: string;
  trend?: string;
}

export interface ScenarioInputs {
  volumeChangePct: number;
  priceChangePct: number;
  expenseChangePct: number;
  revenueGrowthPct?: number;
  costReductionPct?: number;
  newDealsCount?: number;
}

export interface CustomerDetail {
  name: string;
  email?: string;
  phone?: string;
  totalSpent: number;
  orderCount: number;
  firstSeen: string;
  lastSeen: string;
  transactions: NormalizedRecord[];
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

export type StandardField = 'date' | 'revenue' | 'expense' | 'profit' | 'category' | 'product' | 'customer' | 'quantity';

export const FIELD_DEFINITIONS: { field: StandardField; label: string; required: boolean; description: string; aliases: string[] }[] = [
  { field: 'date', label: 'Transaction Date', required: true, description: 'Date of sale or expenditure', aliases: ['date', 'timestamp', 'created_at', 'order_date', 'invoice_date', 'day'] },
  { field: 'revenue', label: 'Revenue / Inflow', required: false, description: 'Gross sale amount or incoming cash', aliases: ['revenue', 'income', 'sales', 'credit', 'inflow', 'amount_paid', 'total_price', 'gross_sales'] },
  { field: 'expense', label: 'Expense / Outflow', required: false, description: 'Cost, operational expense, or outgoing cash', aliases: ['expense', 'cost', 'spend', 'debit', 'outflow', 'fee', 'cogs'] },
  { field: 'profit', label: 'Net Profit', required: false, description: 'Realized net profit (if precomputed)', aliases: ['profit', 'net', 'margin', 'net_profit', 'net_income'] },
  { field: 'category', label: 'Category', required: false, description: 'Accounting category or department', aliases: ['category', 'department', 'type', 'account', 'tag'] },
  { field: 'product', label: 'Product / Service', required: false, description: 'Item name, SKU, or service description', aliases: ['product', 'item', 'sku', 'service', 'description', 'line_item'] },
  { field: 'customer', label: 'Customer / Client', required: false, description: 'Client name, account, or payer', aliases: ['customer', 'client', 'buyer', 'account', 'payer', 'company'] },
  { field: 'quantity', label: 'Quantity / Units', required: false, description: 'Units sold or quantity billed', aliases: ['quantity', 'qty', 'units', 'count'] },
];

export interface PlatformPresetConfig {
  id: string;
  name: string;
  category?: string;
  icon?: string;
  iconName?: string;
  description: string;
  sampleFileName?: string;
  mapping: ColumnMapping;
  sampleHeaders?: string[];
}

export type PlatformPreset = 'shopify' | 'stripe' | 'quickbooks' | 'xero' | 'square' | 'generic';

export interface AnomalyAlert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  metric: string;
  differencePct?: number;
  month?: string;
}

export interface CohortSummary {
  month?: string;
  cohortMonth?: string;
  initialSize?: number;
  newCustomerCount?: number;
  totalRevenue?: number;
  repeatPurchaseRatePct?: number;
  retentionByMonth?: number[];
}

export type CRMStage = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface CRMPipelineSummary {
  totalPipelineValue: number;
  totalDeals?: number;
  winRatePct?: number;
  avgDealSize?: number;
  stageCounts?: Record<string, number>;
  weightedPipelineValue?: number;
  dealsByStage?: Record<string, { count: number; value: number }>;
  stageConversionRates?: Record<string, number>;
  staleDealsCount?: number;
  avgDealCycleDays?: number;
}

export interface ScenarioResult {
  projectedRevenue: number | null | any;
  projectedExpenses: number | null | any;
  projectedProfit: number | null | any;
  projectedMargin?: number | null | any;
  projectedMarginPct?: number | null | any;
  revenueDelta?: number | null | any;
  profitDelta?: number | null | any;
}

export interface FinancialMetrics {
  totalRevenue?: number | null | any;
  totalExpenses?: number | null | any;
  netProfit?: number | null | any;
  profitMargin?: number | null | any;
  estimatedProfit?: number | null | any;
  monthlyBurnRate?: number | null | any;
  breakEvenRevenue?: number | null | any;
  fixedExpenses?: number | null | any;
  variableExpenses?: number | null | any;
  hasRevenueData?: boolean;
  hasExpenseData?: boolean;
  hasProfitData?: boolean;
  hasData?: boolean;
  transactionCount?: number | null | any;
  avgTransactionValue?: number | null | any;
}

export interface FinancialHealthScorecard {
  score?: number;
  overallScore?: number;
  grade?: string;
  healthGrade?: string;
  marginScore?: number;
  growthScore?: number;
  efficiencyScore?: number;
  stabilityScore?: number;
  expenseControlScore?: number;
  diversificationScore?: number;
  factors?: Record<string, any>;
  strengths?: string[];
  risks?: string[];
}

export interface BusinessObservation {
  id: string;
  category?: string;
  title: string;
  detail?: string;
  description?: string;
  type?: string;
  impact?: 'positive' | 'warning' | 'neutral';
}

export interface TaxDeductionSummary {
  totalDeductibleExpenses?: number;
  totalDeductibleExpense?: number;
  totalGrossExpense?: number;
  estimatedTaxSavings?: number;
  effectiveTaxRatePct?: number;
  breakdown: TaxCategoryBreakdown[];
}

export interface TaxCategoryBreakdown {
  categoryName: string;
  taxScheduleCategory: string;
  deductiblePct: number;
  totalExpense: number;
  estimatedDeduction: number;
}
