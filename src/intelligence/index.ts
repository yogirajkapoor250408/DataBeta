import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { FiscalConfig, DEFAULT_FISCAL_CONFIG, getFiscalPeriodMapping, FiscalPeriodMapping } from './fiscalEngine';
import { calculateFiscalComparison, FiscalPeriodComparisonResult } from './fiscalComparison';
import { profileDataset, DatasetProfile } from './dataProfiler';
import { cleanDataset, CleanedDatasetResult } from './dataCleaner';
import { calculateStatisticalSummary, StatisticalSummary } from './statisticalEngine';
import { detectAnomalies, DataAnomalyItem } from './anomalyEngine';
import { calculateCustomerIntelligence, CustomerIntelligenceResult } from './customerIntelligence';
import { calculateTaxOptimization, TaxOptimizerResult } from './taxIntelligence';
import { calculateMetrics } from '../utils/metricsCalculator';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
import { classifyExpenses, calculateCashFlowProjections, simulateScenario } from '../utils/forecastingEngine';

export interface MasterIntelligenceResult {
  fiscalMapping: FiscalPeriodMapping;
  fiscalComparison: FiscalPeriodComparisonResult;
  datasetProfile: DatasetProfile;
  cleanedData: CleanedDatasetResult;
  statisticalSummary: StatisticalSummary;
  anomalies: DataAnomalyItem[];
  customerIntelligence: CustomerIntelligenceResult;
  taxOptimization: TaxOptimizerResult;
  healthScorecard: ReturnType<typeof calculateFinancialHealthScore>;
  cashForecast: ReturnType<typeof calculateCashFlowProjections>;
  expenseClassification: ReturnType<typeof classifyExpenses>;
  executiveSummary: string;
}

/**
 * Master Unified DataBeta Intelligence Engine
 * Executes all 16 layered statistical, fiscal, anomaly, and forecasting modules deterministically.
 */
export function runMasterDataBetaIntelligence(
  records: NormalizedRecord[],
  crmDeals: CRMContact[] = [],
  currency: CurrencyCode = 'USD',
  fiscalConfig: FiscalConfig = DEFAULT_FISCAL_CONFIG
): MasterIntelligenceResult {
  const cleanedData = cleanDataset(records);
  const datasetProfile = profileDataset(
    ['Date', 'Revenue', 'Expense', 'Category', 'Product', 'Customer'],
    cleanedData.cleanedRecords.map((r) => ({
      Date: r.dateString,
      Revenue: r.revenue,
      Expense: r.expense,
      Category: r.category,
      Product: r.product,
      Customer: r.customer,
    }))
  );

  const sortedDates = cleanedData.cleanedRecords.map((r) => r.date).filter(Boolean).sort((a, b) => (a as Date).getTime() - (b as Date).getTime()) as Date[];
  const latestDate = sortedDates[sortedDates.length - 1] || new Date();
  const fiscalMapping = getFiscalPeriodMapping(latestDate, fiscalConfig);
  const fiscalComparison = calculateFiscalComparison(cleanedData.cleanedRecords, currency, fiscalConfig);

  const revenues = cleanedData.cleanedRecords.map((r) => r.revenue || 0);
  const statisticalSummary = calculateStatisticalSummary(revenues);
  const anomalies = detectAnomalies(cleanedData.cleanedRecords, currency);
  const customerIntelligence = calculateCustomerIntelligence(cleanedData.cleanedRecords, currency);
  const taxOptimization = calculateTaxOptimization(cleanedData.cleanedRecords, currency);
  const healthScorecard = calculateFinancialHealthScore(cleanedData.cleanedRecords);
  const cashForecast = calculateCashFlowProjections(cleanedData.cleanedRecords);
  const expenseClassification = classifyExpenses(cleanedData.cleanedRecords);

  const metrics = calculateMetrics(cleanedData.cleanedRecords);
  const executiveSummary = metrics.totalRevenue !== null
    ? `${fiscalMapping.fiscalYearLabel} Realized Revenue is ${fiscalComparison.summaryText} Financial Health is rated Grade ${healthScorecard.grade} (${healthScorecard.score}/100 pts) with ${anomalies.length} active risk anomalies flagged.`
    : 'Awaiting dataset ingestion to generate executive financial intelligence.';

  return {
    fiscalMapping,
    fiscalComparison,
    datasetProfile,
    cleanedData,
    statisticalSummary,
    anomalies,
    customerIntelligence,
    taxOptimization,
    healthScorecard,
    cashForecast,
    expenseClassification,
    executiveSummary,
  };
}

export * from './fiscalEngine';
export * from './fiscalComparison';
export * from './dataProfiler';
export * from './dataCleaner';
export * from './statisticalEngine';
export * from './anomalyEngine';
export * from './customerIntelligence';
export * from './taxIntelligence';
