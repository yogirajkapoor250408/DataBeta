import { NormalizedRecord, CohortSummary } from '../types';
import { format } from 'date-fns';

export function calculateCohortRetention(records: NormalizedRecord[]): {
  cohorts: CohortSummary[];
  overallRepeatPurchaseRatePct: number;
  avgOrderFrequency: number;
} {
  const customerFirstSeen: Record<string, { cohortMonth: string; orders: number; revenue: number }> = {};

  // Sort chronologically
  const sorted = [...records].sort((a, b) => (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0));

  for (const r of sorted) {
    if (r.customer && r.date) {
      const cust = r.customer.trim();
      const monthKey = format(r.date, 'MMM yyyy');

      if (!customerFirstSeen[cust]) {
        customerFirstSeen[cust] = {
          cohortMonth: monthKey,
          orders: 1,
          revenue: r.revenue || 0,
        };
      } else {
        customerFirstSeen[cust].orders += 1;
        if (r.revenue) customerFirstSeen[cust].revenue += r.revenue;
      }
    }
  }

  const customerEntries = Object.values(customerFirstSeen);
  const totalCustomers = customerEntries.length;

  if (totalCustomers === 0) {
    return {
      cohorts: [],
      overallRepeatPurchaseRatePct: 0,
      avgOrderFrequency: 0,
    };
  }

  const repeatCustomers = customerEntries.filter(c => c.orders > 1).length;
  const overallRepeatPurchaseRatePct = (repeatCustomers / totalCustomers) * 100;
  const totalOrdersSum = customerEntries.reduce((sum, c) => sum + c.orders, 0);
  const avgOrderFrequency = totalOrdersSum / totalCustomers;

  // Group into Cohorts by First Month Seen
  const cohortMap: Record<string, { newCust: number; totalRev: number; repeatCust: number }> = {};

  for (const c of customerEntries) {
    if (!cohortMap[c.cohortMonth]) {
      cohortMap[c.cohortMonth] = { newCust: 0, totalRev: 0, repeatCust: 0 };
    }

    cohortMap[c.cohortMonth].newCust += 1;
    cohortMap[c.cohortMonth].totalRev += c.revenue;
    if (c.orders > 1) {
      cohortMap[c.cohortMonth].repeatCust += 1;
    }
  }

  const cohorts: CohortSummary[] = Object.entries(cohortMap).map(([month, data]) => ({
    month,
    newCustomerCount: data.newCust,
    totalRevenue: data.totalRev,
    repeatPurchaseRatePct: data.newCust > 0 ? (data.repeatCust / data.newCust) * 100 : 0,
  }));

  return {
    cohorts,
    overallRepeatPurchaseRatePct,
    avgOrderFrequency,
  };
}
