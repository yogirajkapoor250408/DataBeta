import { NormalizedRecord, ScenarioInputs, ScenarioResult, FinancialMetrics } from '../types';
import { calculateMetrics } from './metricsCalculator';

const FIXED_CATEGORY_KEYWORDS = ['software', 'cloud', 'hosting', 'office', 'rent', 'subscription', 'payroll', 'salary', 'legal', 'accounting', 'domain', 'saas'];

export function classifyExpenses(records: NormalizedRecord[]): { fixedExpenses: number; variableExpenses: number } {
  let fixedSum = 0;
  let variableSum = 0;

  for (const r of records) {
    if (r.expense && r.expense > 0) {
      const cat = (r.category || '').toLowerCase();
      const prod = (r.product || '').toLowerCase();

      const isFixed = FIXED_CATEGORY_KEYWORDS.some(kw => cat.includes(kw) || prod.includes(kw));

      if (isFixed) {
        fixedSum += r.expense;
      } else {
        variableSum += r.expense;
      }
    }
  }

  return { fixedExpenses: fixedSum, variableExpenses: variableSum };
}

export function calculateBreakEven(
  totalRevenue: number | null,
  fixedExpenses: number,
  variableExpenses: number
): number | null {
  if (!totalRevenue || totalRevenue <= 0) return null;
  const contributionMarginRatio = 1 - (variableExpenses / totalRevenue);
  if (contributionMarginRatio <= 0) return null;

  return fixedExpenses / contributionMarginRatio;
}

export function calculateCashFlowProjections(records: NormalizedRecord[]): {
  projected30Days: number | null;
  projected60Days: number | null;
  projected90Days: number | null;
  monthlyBurnRate: number | null;
  cashFlowSeries: { month: string; actualProfit: number | null; projectedCash: number }[];
} {
  const metrics = calculateMetrics(records);

  if (!records || records.length === 0 || metrics.estimatedProfit === null) {
    return {
      projected30Days: null,
      projected60Days: null,
      projected90Days: null,
      monthlyBurnRate: null,
      cashFlowSeries: [],
    };
  }

  // Count months in dataset
  const dates = records.map(r => r.date).filter(Boolean) as Date[];
  let monthCount = 1;
  if (dates.length >= 2) {
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const diffMonths = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth());
    monthCount = Math.max(1, diffMonths + 1);
  }

  const avgMonthlyProfit = metrics.estimatedProfit / monthCount;
  const monthlyBurnRate = avgMonthlyProfit < 0 ? Math.abs(avgMonthlyProfit) : null;

  const proj30 = avgMonthlyProfit;
  const proj60 = avgMonthlyProfit * 2;
  const proj90 = avgMonthlyProfit * 3;

  const series = [
    { month: 'Current', actualProfit: metrics.estimatedProfit, projectedCash: metrics.estimatedProfit },
    { month: '+30 Days', actualProfit: null, projectedCash: metrics.estimatedProfit + proj30 },
    { month: '+60 Days', actualProfit: null, projectedCash: metrics.estimatedProfit + proj60 },
    { month: '+90 Days', actualProfit: null, projectedCash: metrics.estimatedProfit + proj90 },
  ];

  return {
    projected30Days: proj30,
    projected60Days: proj60,
    projected90Days: proj90,
    monthlyBurnRate,
    cashFlowSeries: series,
  };
}

export function simulateScenario(
  metrics: FinancialMetrics,
  inputs: ScenarioInputs
): ScenarioResult {
  if (metrics.totalRevenue === null || metrics.totalExpenses === null) {
    return {
      projectedRevenue: null,
      projectedExpenses: null,
      projectedProfit: null,
      projectedMargin: null,
      revenueDelta: 0,
      profitDelta: 0,
    };
  }

  // Volume & Price multipliers
  const volumeMult = 1 + inputs.volumeChangePct / 100;
  const priceMult = 1 + inputs.priceChangePct / 100;
  const expMult = 1 + inputs.expenseChangePct / 100;

  // New Revenue = Base Revenue * Volume Multiplier * Price Multiplier
  const projRev = metrics.totalRevenue * volumeMult * priceMult;

  // New Expenses = Fixed Expenses + (Variable Expenses * Volume Multiplier) adjusted by expense change multiplier
  const projExp = (metrics.fixedExpenses + metrics.variableExpenses * volumeMult) * expMult;

  const projProf = projRev - projExp;
  const projMarg = projRev > 0 ? (projProf / projRev) * 100 : 0;

  const currentProf = metrics.estimatedProfit || 0;

  return {
    projectedRevenue: projRev,
    projectedExpenses: projExp,
    projectedProfit: projProf,
    projectedMargin: projMarg,
    revenueDelta: projRev - metrics.totalRevenue,
    profitDelta: projProf - currentProf,
  };
}
