import { NormalizedRecord, CurrencyCode } from '../types';
import { FiscalConfig, DEFAULT_FISCAL_CONFIG, getFiscalPeriodMapping, FiscalPeriodMapping } from './fiscalEngine';
import { formatCurrency } from '../utils/currencyFormatter';

export interface FiscalPeriodComparisonResult {
  currentFYLabel: string;
  previousFYLabel: string;
  currentFYRevenue: number;
  previousFYRevenuePaceNormalized: number;
  fyGrowthPct: number;
  currentFQRevenue: number;
  previousFQRevenuePaceNormalized: number;
  fqGrowthPct: number;
  currentFMRevenue: number;
  previousFMRevenuePaceNormalized: number;
  fmGrowthPct: number;
  isPaceNormalized: boolean;
  completionPct: number;
  summaryText: string;
}

/**
 * Intelligent Fiscal Period Comparison Engine supporting pace-normalized partial period growth metrics.
 */
export function calculateFiscalComparison(
  records: NormalizedRecord[],
  currency: CurrencyCode = 'USD',
  config: FiscalConfig = DEFAULT_FISCAL_CONFIG
): FiscalPeriodComparisonResult {
  if (!records || records.length === 0) {
    return {
      currentFYLabel: 'FY Current',
      previousFYLabel: 'FY Previous',
      currentFYRevenue: 0,
      previousFYRevenuePaceNormalized: 0,
      fyGrowthPct: 0,
      currentFQRevenue: 0,
      previousFQRevenuePaceNormalized: 0,
      fqGrowthPct: 0,
      currentFMRevenue: 0,
      previousFMRevenuePaceNormalized: 0,
      fmGrowthPct: 0,
      isPaceNormalized: false,
      completionPct: 0,
      summaryText: 'Awaiting transaction dataset for fiscal period comparison.',
    };
  }

  // Get mapping for latest transaction date
  const dateObjs = records
    .map((r) => (r.date instanceof Date ? r.date : new Date(r.date)))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  const latestDate = dateObjs[dateObjs.length - 1] || new Date();
  const currentMapping = getFiscalPeriodMapping(latestDate, config);

  const currentFY = currentMapping.fiscalYear;
  const previousFY = currentFY - 1;

  let currentFYRev = 0;
  let prevFYRev = 0;
  let currentFQRev = 0;
  let prevFQRev = 0;
  let currentFMRev = 0;
  let prevFMRev = 0;

  records.forEach((r) => {
    if (!r.date || !r.revenue) return;
    const mapping = getFiscalPeriodMapping(r.date, config);

    // Current FY
    if (mapping.fiscalYear === currentFY) {
      // Check if within current FY YTD window
      if (mapping.daysIntoFiscalYear <= currentMapping.daysIntoFiscalYear) {
        currentFYRev += r.revenue;
      }
      if (mapping.fiscalQuarter === currentMapping.fiscalQuarter) {
        currentFQRev += r.revenue;
      }
      if (mapping.fiscalMonth === currentMapping.fiscalMonth) {
        currentFMRev += r.revenue;
      }
    }

    // Previous FY Pace-Normalized (Same days into fiscal year)
    if (mapping.fiscalYear === previousFY) {
      if (mapping.daysIntoFiscalYear <= currentMapping.daysIntoFiscalYear) {
        prevFYRev += r.revenue;
      }
      if (mapping.fiscalQuarter === currentMapping.fiscalQuarter) {
        prevFQRev += r.revenue;
      }
      if (mapping.fiscalMonth === currentMapping.fiscalMonth) {
        prevFMRev += r.revenue;
      }
    }
  });

  const fyGrowthPct = prevFYRev > 0 ? ((currentFYRev - prevFYRev) / prevFYRev) * 100 : 0;
  const fqGrowthPct = prevFQRev > 0 ? ((currentFQRev - prevFQRev) / prevFQRev) * 100 : 0;
  const fmGrowthPct = prevFMRev > 0 ? ((currentFMRev - prevFMRev) / prevFMRev) * 100 : 0;

  const previousFYLabel = getFiscalPeriodMapping(new Date(currentMapping.fiscalPeriodStart.getFullYear() - 1, currentMapping.fiscalPeriodStart.getMonth(), 15), config).fiscalYearLabel;

  const summaryText = prevFYRev > 0
    ? `${currentMapping.fiscalYearLabel} YTD revenue is ${fyGrowthPct >= 0 ? '+' : ''}${fyGrowthPct.toFixed(1)}% compared to ${previousFYLabel} pace (${formatCurrency(currentFYRev, currency)} vs ${formatCurrency(prevFYRev, currency)}).`
    : `${currentMapping.fiscalYearLabel} YTD realized revenue stands at ${formatCurrency(currentFYRev, currency)}.`;

  return {
    currentFYLabel: currentMapping.fiscalYearLabel,
    previousFYLabel,
    currentFYRevenue: currentFYRev,
    previousFYRevenuePaceNormalized: prevFYRev,
    fyGrowthPct,
    currentFQRevenue: currentFQRev,
    previousFQRevenuePaceNormalized: prevFQRev,
    fqGrowthPct,
    currentFMRevenue: currentFMRev,
    previousFMRevenuePaceNormalized: prevFMRev,
    fmGrowthPct,
    isPaceNormalized: true,
    completionPct: currentMapping.fiscalYearCompletionPct,
    summaryText,
  };
}
