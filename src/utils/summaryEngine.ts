import { NormalizedRecord, BusinessObservation } from '../types';
import { calculateMetrics, formatCurrency } from './metricsCalculator';

export function generateBusinessSummary(records: NormalizedRecord[]): BusinessObservation[] {
  const observations: BusinessObservation[] = [];

  if (!records || records.length < 2) {
    return [
      {
        id: 'insufficient',
        type: 'info',
        title: 'More records needed for trend analysis',
        description: 'Upload additional transaction rows to enable automatic period-over-period trend detection.'
      }
    ];
  }

  // Sort records by date ascending
  const sorted = [...records].sort((a, b) => {
    if (!a.date) return -1;
    if (!b.date) return 1;
    return a.date.getTime() - b.date.getTime();
  });

  const totalMetrics = calculateMetrics(sorted);

  // Split into two sub-periods for comparison (First Half vs Second Half)
  const mid = Math.floor(sorted.length / 2);
  const period1Records = sorted.slice(0, mid);
  const period2Records = sorted.slice(mid);

  const p1Metrics = calculateMetrics(period1Records);
  const p2Metrics = calculateMetrics(period2Records);

  // Observation 1: Revenue Trend
  if (p1Metrics.totalRevenue !== null && p2Metrics.totalRevenue !== null && p1Metrics.totalRevenue > 0) {
    const revDiff = p2Metrics.totalRevenue - p1Metrics.totalRevenue;
    const revPct = (revDiff / p1Metrics.totalRevenue) * 100;

    if (Math.abs(revPct) >= 0.5) {
      if (revPct > 0) {
        observations.push({
          id: 'rev-growth',
          type: 'positive',
          title: 'Revenue Increased',
          description: `Total revenue grew by ${revPct.toFixed(1)}% (${formatCurrency(revDiff)}) compared to the previous period.`
        });
      } else {
        observations.push({
          id: 'rev-decline',
          type: 'negative',
          title: 'Revenue Decreased',
          description: `Total revenue declined by ${Math.abs(revPct).toFixed(1)}% (${formatCurrency(Math.abs(revDiff))}) compared to the previous period.`
        });
      }
    }
  }

  // Observation 2: Expense Growth vs Revenue Growth
  if (
    p1Metrics.totalRevenue !== null && p2Metrics.totalRevenue !== null && p1Metrics.totalRevenue > 0 &&
    p1Metrics.totalExpenses !== null && p2Metrics.totalExpenses !== null && p1Metrics.totalExpenses > 0
  ) {
    const revPct = ((p2Metrics.totalRevenue - p1Metrics.totalRevenue) / p1Metrics.totalRevenue) * 100;
    const expPct = ((p2Metrics.totalExpenses - p1Metrics.totalExpenses) / p1Metrics.totalExpenses) * 100;

    if (expPct > revPct && expPct > 0) {
      observations.push({
        id: 'exp-velocity',
        type: 'negative',
        title: 'Expenses Growing Faster Than Revenue',
        description: `Expenses increased by ${expPct.toFixed(1)}%, outpacing your revenue growth rate of ${revPct.toFixed(1)}%.`
      });
    } else if (revPct > expPct && revPct > 0) {
      observations.push({
        id: 'rev-velocity',
        type: 'positive',
        title: 'Revenue Outpacing Expense Growth',
        description: `Revenue growth (${revPct.toFixed(1)}%) is outperforming expense growth (${expPct.toFixed(1)}%), improving operational leverage.`
      });
    }
  }

  // Observation 3: Profit Margin Analysis
  if (totalMetrics.profitMargin !== null) {
    if (totalMetrics.profitMargin > 20) {
      observations.push({
        id: 'margin-strong',
        type: 'positive',
        title: 'Strong Profit Margin',
        description: `Your overall profit margin is ${totalMetrics.profitMargin.toFixed(1)}%, indicating healthy financial performance.`
      });
    } else if (totalMetrics.profitMargin < 0) {
      observations.push({
        id: 'margin-negative',
        type: 'negative',
        title: 'Negative Profit Margin',
        description: `Expenses exceed total revenue by ${formatCurrency(Math.abs(totalMetrics.estimatedProfit || 0))}. Consider auditing costs.`
      });
    } else if (totalMetrics.profitMargin < 10) {
      observations.push({
        id: 'margin-thin',
        type: 'neutral',
        title: 'Thin Profit Margin',
        description: `Your profit margin is ${totalMetrics.profitMargin.toFixed(1)}%. Small increases in expenses could affect profitability.`
      });
    }
  }

  // Observation 4: Category Breakdown - Highest Revenue Category
  const categoryRevMap: Record<string, number> = {};
  let totalRevForCat = 0;

  for (const r of sorted) {
    if (r.category && r.revenue) {
      categoryRevMap[r.category] = (categoryRevMap[r.category] || 0) + r.revenue;
      totalRevForCat += r.revenue;
    }
  }

  const catRevEntries = Object.entries(categoryRevMap).sort((a, b) => b[1] - a[1]);
  if (catRevEntries.length > 0 && totalRevForCat > 0) {
    const [topCat, topCatRev] = catRevEntries[0];
    const pctShare = (topCatRev / totalRevForCat) * 100;

    observations.push({
      id: 'top-category',
      type: 'info',
      title: `Top Revenue Category: ${topCat}`,
      description: `"${topCat}" generated ${formatCurrency(topCatRev)} (${pctShare.toFixed(1)}% of total categorized revenue).`
    });
  }

  // Observation 5: Average Transaction Value Shift
  if (p1Metrics.avgTransactionValue !== null && p2Metrics.avgTransactionValue !== null) {
    const avgDiff = p2Metrics.avgTransactionValue - p1Metrics.avgTransactionValue;
    const avgPct = (avgDiff / p1Metrics.avgTransactionValue) * 100;

    if (Math.abs(avgPct) >= 2) {
      observations.push({
        id: 'avg-tx-shift',
        type: avgDiff > 0 ? 'positive' : 'neutral',
        title: `Average Order Value ${avgDiff > 0 ? 'Increased' : 'Decreased'}`,
        description: `Average transaction value shifted from ${formatCurrency(p1Metrics.avgTransactionValue)} to ${formatCurrency(p2Metrics.avgTransactionValue)} (${avgPct > 0 ? '+' : ''}${avgPct.toFixed(1)}%).`
      });
    }
  }

  // Fallback if no specific observations triggered
  if (observations.length === 0) {
    observations.push({
      id: 'summary-stable',
      type: 'info',
      title: 'Stable Business Performance',
      description: `DataBeta processed ${sorted.length} transactions totaling ${formatCurrency(totalMetrics.totalRevenue)} in revenue and ${formatCurrency(totalMetrics.totalExpenses)} in expenses.`
    });
  }

  return observations;
}
