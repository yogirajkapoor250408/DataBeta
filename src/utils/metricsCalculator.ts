import { NormalizedRecord, FinancialMetrics, CurrencyCode } from '../types';
import { formatCurrency as formatCurr } from './currencyFormatter';
import { classifyExpenses, calculateBreakEven } from './forecastingEngine';

export function calculateMetrics(records: NormalizedRecord[]): FinancialMetrics {
  if (!records || records.length === 0) {
    return {
      totalRevenue: null,
      totalExpenses: null,
      estimatedProfit: null,
      profitMargin: null,
      transactionCount: 0,
      avgTransactionValue: null,
      hasRevenueData: false,
      hasExpenseData: false,
      hasProfitData: false,
      fixedExpenses: 0,
      variableExpenses: 0,
      breakEvenRevenue: null,
      monthlyBurnRate: null,
    };
  }

  let revenueSum = 0;
  let revenueCount = 0;

  let expenseSum = 0;
  let expenseCount = 0;

  let profitSum = 0;
  let profitCount = 0;

  for (const rec of records) {
    if (rec.revenue !== null) {
      revenueSum += rec.revenue;
      revenueCount++;
    }
    if (rec.expense !== null) {
      expenseSum += rec.expense;
      expenseCount++;
    }
    if (rec.profit !== null) {
      profitSum += rec.profit;
      profitCount++;
    }
  }

  const hasRevenueData = revenueCount > 0;
  const hasExpenseData = expenseCount > 0;
  const hasProfitData = profitCount > 0 || (hasRevenueData && hasExpenseData);

  const totalRevenue = hasRevenueData ? revenueSum : null;
  const totalExpenses = hasExpenseData ? expenseSum : null;

  let estimatedProfit: number | null = null;
  if (profitCount > 0) {
    estimatedProfit = profitSum;
  } else if (hasRevenueData && hasExpenseData) {
    estimatedProfit = revenueSum - expenseSum;
  }

  let profitMargin: number | null = null;
  if (estimatedProfit !== null && totalRevenue !== null && totalRevenue > 0) {
    profitMargin = (estimatedProfit / totalRevenue) * 100;
  }

  const transactionCount = records.length;

  let avgTransactionValue: number | null = null;
  if (hasRevenueData && transactionCount > 0 && totalRevenue !== null) {
    avgTransactionValue = totalRevenue / transactionCount;
  }

  const { fixedExpenses, variableExpenses } = classifyExpenses(records);
  const breakEvenRevenue = calculateBreakEven(totalRevenue, fixedExpenses, variableExpenses);

  return {
    totalRevenue,
    totalExpenses,
    estimatedProfit,
    profitMargin,
    transactionCount,
    avgTransactionValue,
    hasRevenueData,
    hasExpenseData,
    hasProfitData,
    fixedExpenses,
    variableExpenses,
    breakEvenRevenue,
    monthlyBurnRate: estimatedProfit && estimatedProfit < 0 ? Math.abs(estimatedProfit) : null,
  };
}

export function formatCurrency(amount: number | null, currency: CurrencyCode = 'USD'): string {
  return formatCurr(amount, currency);
}

export function formatPercentage(pct: number | null): string {
  if (pct === null || pct === undefined) return 'Not enough data';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
}
