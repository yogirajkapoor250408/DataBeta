import { NormalizedRecord, QueryResultCard, CurrencyCode } from '../types';
import { formatCurrency } from './currencyFormatter';
import { calculateMetrics } from './metricsCalculator';
import { calculateCustomerAnalytics } from './customerProductAnalytics';
import { format } from 'date-fns';

export function evaluateNaturalQuery(
  query: string,
  records: NormalizedRecord[],
  currency: CurrencyCode = 'USD'
): QueryResultCard | null {
  if (!query || query.trim().length < 2 || !records || records.length === 0) {
    return null;
  }

  const q = query.toLowerCase().trim();
  const metrics = calculateMetrics(records);
  const customerStats = calculateCustomerAnalytics(records);

  // Pattern 1: Best Month / Highest Revenue Month
  if (q.includes('best month') || q.includes('highest revenue') || q.includes('top month') || q.includes('best sales month')) {
    const monthlyMap: Record<string, number> = {};
    for (const r of records) {
      if (r.date && r.revenue) {
        const k = format(r.date, 'MMMM yyyy');
        monthlyMap[k] = (monthlyMap[k] || 0) + r.revenue;
      }
    }

    const sortedMonths = Object.entries(monthlyMap).sort((a, b) => b[1] - a[1]);
    if (sortedMonths.length > 0) {
      const [topM, topRev] = sortedMonths[0];
      return {
        query,
        matchedType: 'month',
        title: `Highest Revenue Month: ${topM}`,
        valueString: formatCurrency(topRev, currency),
        subtitle: `Generated ${formatCurrency(topRev, currency)} in gross revenue.`,
      };
    }
  }

  // Pattern 2: Category Spend Query (e.g. "marketing spend", "software cost", "ads")
  const categories = Array.from(new Set(records.map(r => r.category).filter(Boolean))) as string[];
  for (const cat of categories) {
    if (q.includes(cat.toLowerCase())) {
      let catRev = 0;
      let catExp = 0;
      let count = 0;

      for (const r of records) {
        if (r.category && r.category.toLowerCase() === cat.toLowerCase()) {
          if (r.revenue) catRev += r.revenue;
          if (r.expense) catExp += r.expense;
          count++;
        }
      }

      const totalVal = catExp > 0 ? catExp : catRev;
      const isExp = catExp > 0;

      return {
        query,
        matchedType: 'category',
        title: `Category Analysis: "${cat}"`,
        valueString: formatCurrency(totalVal, currency),
        subtitle: `${count} records found. Total ${isExp ? 'Expense' : 'Revenue'}: ${formatCurrency(totalVal, currency)}.`,
      };
    }
  }

  // Pattern 3: Top Customer Query
  if (q.includes('customer') || q.includes('client') || q.includes('buyer') || q.includes('top account')) {
    if (customerStats.topCustomerName) {
      return {
        query,
        matchedType: 'customer',
        title: `Top Customer: ${customerStats.topCustomerName}`,
        valueString: formatCurrency(customerStats.topCustomerRevenue, currency),
        subtitle: `Accounts for ${customerStats.topCustomerSharePct.toFixed(1)}% of your overall sales revenue.`,
      };
    }
  }

  // Pattern 4: Total Expense / Spend Query
  if (q.includes('total expense') || q.includes('how much spent') || q.includes('spending') || q.includes('total cost')) {
    return {
      query,
      matchedType: 'metric',
      title: 'Total Operating Expenses',
      valueString: formatCurrency(metrics.totalExpenses, currency),
      subtitle: `Recorded across ${records.length} transactions.`,
    };
  }

  // Pattern 5: Profit Margin Query
  if (q.includes('profit margin') || q.includes('margin') || q.includes('profit percentage')) {
    return {
      query,
      matchedType: 'metric',
      title: 'Overall Net Profit Margin',
      valueString: metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'Not enough data',
      subtitle: `Net Profit: ${formatCurrency(metrics.estimatedProfit, currency)}`,
    };
  }

  // Pattern 6: Threshold Filter (e.g. "over 1000", "greater than 500")
  const numMatch = q.match(/(\d+)/);
  if (numMatch && (q.includes('over') || q.includes('greater') || q.includes('above') || q.includes('more than'))) {
    const threshold = parseFloat(numMatch[1]);
    const matchingRecords = records.filter(r => (r.revenue || 0) >= threshold || (r.expense || 0) >= threshold);
    const totalAmount = matchingRecords.reduce((sum, r) => sum + (r.revenue || r.expense || 0), 0);

    return {
      query,
      matchedType: 'general',
      title: `Transactions >= ${formatCurrency(threshold, currency)}`,
      valueString: `${matchingRecords.length} Transactions`,
      subtitle: `Combined value: ${formatCurrency(totalAmount, currency)}`,
    };
  }

  // Generic keyword match fallback
  const matchingRecords = records.filter(r => {
    return (
      r.product?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.customer?.toLowerCase().includes(q) ||
      r.dateString.includes(q)
    );
  });

  if (matchingRecords.length > 0) {
    const sumVal = matchingRecords.reduce((sum, r) => sum + (r.revenue || r.expense || 0), 0);
    return {
      query,
      matchedType: 'general',
      title: `Search Match for "${query}"`,
      valueString: `${matchingRecords.length} Records Found`,
      subtitle: `Total cumulative value: ${formatCurrency(sumVal, currency)}`,
    };
  }

  return null;
}
