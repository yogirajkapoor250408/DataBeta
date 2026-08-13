import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

export interface RFMCustomerSegment {
  customerName: string;
  recencyDays: number;
  orderCount: number;
  totalSpent: number;
  avgOrderValue: number;
  segmentLabel: 'Champions' | 'Loyal Accounts' | 'At-Risk' | 'Declining High-Value' | 'New Buyers' | 'Casual Buyers';
  estimatedLTV: number;
}

export interface CustomerIntelligenceResult {
  totalCustomers: number;
  segments: RFMCustomerSegment[];
  championsCount: number;
  atRiskCount: number;
  topCustomerParetoPct: number;
  avgCustomerLTV: number;
}

/**
 * Intelligent RFM & Customer Lifetime Value (LTV) Segmentation Engine.
 */
export function calculateCustomerIntelligence(
  records: NormalizedRecord[],
  currency: CurrencyCode = 'USD'
): CustomerIntelligenceResult {
  if (!records || records.length === 0) {
    return {
      totalCustomers: 0,
      segments: [],
      championsCount: 0,
      atRiskCount: 0,
      topCustomerParetoPct: 0,
      avgCustomerLTV: 0,
    };
  }

  const sortedDates = records.map((r) => r.date).filter(Boolean).sort((a, b) => (a as Date).getTime() - (b as Date).getTime()) as Date[];
  const maxDate = sortedDates[sortedDates.length - 1] || new Date();

  const customerMap: Record<string, { totalSpent: number; orderCount: number; lastDate: Date; firstDate: Date }> = {};
  let grossRevenue = 0;

  records.forEach((r) => {
    const cust = (r.customer || 'Direct Client').trim();
    const rev = r.revenue || 0;
    grossRevenue += rev;

    if (!customerMap[cust]) {
      const d = r.date || maxDate;
      customerMap[cust] = { totalSpent: 0, orderCount: 0, lastDate: d, firstDate: d };
    }

    customerMap[cust].totalSpent += rev;
    customerMap[cust].orderCount += 1;
    if (r.date && r.date > customerMap[cust].lastDate) customerMap[cust].lastDate = r.date;
    if (r.date && r.date < customerMap[cust].firstDate) customerMap[cust].firstDate = r.date;
  });

  let champions = 0;
  let atRisk = 0;
  let totalLTV = 0;

  const segments: RFMCustomerSegment[] = Object.entries(customerMap).map(([custName, data]) => {
    const recencyDays = Math.max(0, Math.floor((maxDate.getTime() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgOrderValue = data.orderCount > 0 ? data.totalSpent / data.orderCount : 0;
    
    // Estimate LTV (Avg Order Value * Order Frequency Factor)
    const lifespanMonths = Math.max(1, (data.lastDate.getTime() - data.firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const monthlyFrequency = data.orderCount / lifespanMonths;
    const estimatedLTV = Math.round(data.totalSpent + avgOrderValue * monthlyFrequency * 6); // 6-month forward horizon
    totalLTV += estimatedLTV;

    let segmentLabel: RFMCustomerSegment['segmentLabel'] = 'Casual Buyers';
    if (data.totalSpent > 1000 && recencyDays <= 30) {
      segmentLabel = 'Champions';
      champions++;
    } else if (data.orderCount >= 3 && recencyDays <= 60) {
      segmentLabel = 'Loyal Accounts';
    } else if (data.totalSpent > 1000 && recencyDays > 60) {
      segmentLabel = 'Declining High-Value';
      atRisk++;
    } else if (recencyDays > 90) {
      segmentLabel = 'At-Risk';
      atRisk++;
    } else if (data.orderCount === 1 && recencyDays <= 30) {
      segmentLabel = 'New Buyers';
    }

    return {
      customerName: custName,
      recencyDays,
      orderCount: data.orderCount,
      totalSpent: data.totalSpent,
      avgOrderValue,
      segmentLabel,
      estimatedLTV,
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  const topCustSpent = segments.length > 0 ? segments[0].totalSpent : 0;
  const topCustomerParetoPct = grossRevenue > 0 ? (topCustSpent / grossRevenue) * 100 : 0;
  const avgCustomerLTV = segments.length > 0 ? totalLTV / segments.length : 0;

  return {
    totalCustomers: segments.length,
    segments,
    championsCount: champions,
    atRiskCount: atRisk,
    topCustomerParetoPct,
    avgCustomerLTV,
  };
}
