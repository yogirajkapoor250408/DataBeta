import { NormalizedRecord, AnomalyAlert } from '../types';
import { calculateMetrics } from './metricsCalculator';
import { calculateCustomerAnalytics } from './customerProductAnalytics';
import { formatCurrency } from './currencyFormatter';
import { format } from 'date-fns';

export function detectAnomalies(records: NormalizedRecord[]): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = [];

  if (!records || records.length < 3) return alerts;

  const customerStats = calculateCustomerAnalytics(records);

  // Anomaly 1: High Customer Concentration Risk (> 30% of total revenue)
  if (customerStats.topCustomerName && customerStats.topCustomerSharePct >= 30) {
    alerts.push({
      id: 'anomaly-customer-conc',
      severity: 'high',
      title: 'High Customer Concentration Risk',
      description: `Customer "${customerStats.topCustomerName}" accounts for ${customerStats.topCustomerSharePct.toFixed(1)}% of your total revenue. Losing this single client would significantly impact cash flow.`,
      metric: `${customerStats.topCustomerSharePct.toFixed(1)}% share`,
    });
  }

  // Anomaly 2: Category Expense Surge
  const categoryExpenseMap: Record<string, number> = {};
  let totalExp = 0;
  for (const r of records) {
    if (r.category && r.expense) {
      categoryExpenseMap[r.category] = (categoryExpenseMap[r.category] || 0) + r.expense;
      totalExp += r.expense;
    }
  }

  if (totalExp > 0) {
    for (const [cat, amount] of Object.entries(categoryExpenseMap)) {
      const share = (amount / totalExp) * 100;
      if (share >= 40) {
        alerts.push({
          id: `anomaly-exp-${cat}`,
          severity: 'medium',
          title: `Dominant Cost Category: ${cat}`,
          description: `"${cat}" represents ${share.toFixed(1)}% (${formatCurrency(amount)}) of all business expenses.`,
          metric: `${share.toFixed(1)}% of expenses`,
        });
      }
    }
  }

  // Anomaly 3: Month-over-Month Expense Spike Detection
  const sorted = [...records].sort((a, b) => (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0));
  const monthlyExpenses: Record<string, number> = {};
  for (const r of sorted) {
    if (r.date && r.expense) {
      const key = format(r.date, 'MMM yyyy');
      monthlyExpenses[key] = (monthlyExpenses[key] || 0) + r.expense;
    }
  }

  const months = Object.keys(monthlyExpenses);
  for (let i = 1; i < months.length; i++) {
    const prevMonth = months[i - 1];
    const currMonth = months[i];
    const prevVal = monthlyExpenses[prevMonth];
    const currVal = monthlyExpenses[currMonth];

    if (prevVal > 0) {
      const spikePct = ((currVal - prevVal) / prevVal) * 100;
      if (spikePct >= 35) {
        alerts.push({
          id: `anomaly-spike-${currMonth}`,
          severity: 'high',
          title: `Expense Surge in ${currMonth}`,
          description: `Total expenses increased by ${spikePct.toFixed(1)}% in ${currMonth} (${formatCurrency(currVal)}) compared to ${prevMonth} (${formatCurrency(prevVal)}).`,
          metric: `+${spikePct.toFixed(1)}% surge`,
          month: currMonth,
        });
      }
    }
  }

  return alerts;
}
