import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

export interface BreakdownFactor {
  name: string;
  deltaPct: number;
  deltaValue: number;
  isPositive: boolean;
  explanation: string;
}

export interface BusinessDiagnosisResult {
  hasEnoughData: boolean;
  headline: string;
  trendDirection: 'improving' | 'declining' | 'stable';
  netProfitChangePct: number;
  netProfitChangeValue: number;
  breakdown: BreakdownFactor[];
  primaryCause: string;
  secondaryCause?: string;
  estimatedImpact: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedAction: string;
  diagnosisTree: {
    node: string;
    value: string;
    subNodes: { node: string; value: string; impact: string }[];
  };
}

/**
 * Pure Deterministic Root-Cause Business Diagnosis Engine.
 * Analyzes period-over-period financial variance without LLMs/Hallucinations.
 */
export function diagnoseBusinessPerformance(
  records: NormalizedRecord[],
  currency: CurrencyCode = 'USD'
): BusinessDiagnosisResult {
  if (!records || records.length < 4) {
    return {
      hasEnoughData: false,
      headline: 'Awaiting sufficient transaction history to compute automatic diagnosis.',
      trendDirection: 'stable',
      netProfitChangePct: 0,
      netProfitChangeValue: 0,
      breakdown: [],
      primaryCause: 'Insufficient data points (minimum 4 records required).',
      estimatedImpact: 0,
      priority: 'LOW',
      suggestedAction: 'Import at least 1 month of business transactions to trigger automatic diagnosis.',
      diagnosisTree: {
        node: 'Data Ingestion',
        value: 'Awaiting Data',
        subNodes: [],
      },
    };
  }

  // 1. Split records chronologically into 2 periods (Recent vs Previous)
  const validRecords = [...records]
    .filter((r) => r.date || r.dateString)
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date || a.dateString || 0).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date || b.dateString || 0).getTime();
      return dateA - dateB;
    });

  const midPoint = Math.floor(validRecords.length / 2);
  const prevPeriod = validRecords.slice(0, midPoint);
  const currPeriod = validRecords.slice(midPoint);

  // Helper metrics aggregator
  const aggregate = (recs: NormalizedRecord[]) => {
    let rev = 0;
    let exp = 0;
    const catExpMap: Record<string, number> = {};
    const prodRevMap: Record<string, number> = {};

    recs.forEach((r) => {
      if (r.revenue) {
        rev += r.revenue;
        const prod = r.product || r.category || 'General Sales';
        prodRevMap[prod] = (prodRevMap[prod] || 0) + r.revenue;
      }
      if (r.expense) {
        exp += r.expense;
        const cat = r.category || 'Uncategorized';
        catExpMap[cat] = (catExpMap[cat] || 0) + r.expense;
      }
    });

    return { rev, exp, profit: rev - exp, catExpMap, prodRevMap };
  };

  const prev = aggregate(prevPeriod);
  const curr = aggregate(currPeriod);

  const netProfitChangeValue = curr.profit - prev.profit;
  const netProfitChangePct = prev.profit !== 0 ? (netProfitChangeValue / Math.abs(prev.profit)) * 100 : 0;
  const revChangeValue = curr.rev - prev.rev;
  const revChangePct = prev.rev !== 0 ? (revChangeValue / prev.rev) * 100 : 0;
  const expChangeValue = curr.exp - prev.exp;
  const expChangePct = prev.exp !== 0 ? (expChangeValue / prev.exp) * 100 : 0;

  const trendDirection: 'improving' | 'declining' | 'stable' =
    netProfitChangeValue > 50 ? 'improving' : netProfitChangeValue < -50 ? 'declining' : 'stable';

  // 2. Identify Primary Category Drivers for Expense Spikes
  let topExpenseGrowthCategory = '';
  let topExpenseGrowthDelta = 0;
  Object.keys(curr.catExpMap).forEach((cat) => {
    const currCatExp = curr.catExpMap[cat] || 0;
    const prevCatExp = prev.catExpMap[cat] || 0;
    const delta = currCatExp - prevCatExp;
    if (delta > topExpenseGrowthDelta) {
      topExpenseGrowthDelta = delta;
      topExpenseGrowthCategory = cat;
    }
  });

  // 3. Identify Revenue Decline Drivers
  let topRevenueDeclineProduct = '';
  let topRevenueDeclineDelta = 0;
  Object.keys(prev.prodRevMap).forEach((prod) => {
    const currProdRev = curr.prodRevMap[prod] || 0;
    const prevProdRev = prev.prodRevMap[prod] || 0;
    const drop = prevProdRev - currProdRev;
    if (drop > topRevenueDeclineDelta) {
      topRevenueDeclineDelta = drop;
      topRevenueDeclineProduct = prod;
    }
  });

  // 4. Synthesize Root Cause & Diagnosis Tree
  const breakdown: BreakdownFactor[] = [
    {
      name: 'Revenue Velocity',
      deltaPct: parseFloat(revChangePct.toFixed(1)),
      deltaValue: revChangeValue,
      isPositive: revChangeValue >= 0,
      explanation: `Gross revenue changed by ${revChangePct >= 0 ? '+' : ''}${revChangePct.toFixed(1)}% (${formatCurrency(revChangeValue, currency)}).`,
    },
    {
      name: 'Expense Acceleration',
      deltaPct: parseFloat(expChangePct.toFixed(1)),
      deltaValue: expChangeValue,
      isPositive: expChangeValue <= 0, // Less expense is positive
      explanation: `Operational expenses changed by ${expChangePct >= 0 ? '+' : ''}${expChangePct.toFixed(1)}% (${formatCurrency(expChangeValue, currency)}).`,
    },
  ];

  let primaryCause = '';
  let secondaryCause: string | undefined = undefined;
  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let suggestedAction = '';

  if (trendDirection === 'declining') {
    if (expChangeValue > 0 && topExpenseGrowthCategory) {
      primaryCause = `Primary driver: Expense growth in "${topExpenseGrowthCategory}" increased spending by ${formatCurrency(topExpenseGrowthDelta, currency)}.`;
      if (topRevenueDeclineProduct && topRevenueDeclineDelta > 100) {
        secondaryCause = `Secondary driver: Sales decline in "${topRevenueDeclineProduct}" reduced revenue by ${formatCurrency(topRevenueDeclineDelta, currency)}.`;
      }
      priority = Math.abs(netProfitChangePct) > 15 ? 'CRITICAL' : 'HIGH';
      suggestedAction = `Audit and cap spending in "${topExpenseGrowthCategory}" to restore net margin baseline.`;
    } else if (topRevenueDeclineProduct) {
      primaryCause = `Primary driver: Sales drop in "${topRevenueDeclineProduct}" reduced overall top-line revenue by ${formatCurrency(topRevenueDeclineDelta, currency)}.`;
      priority = 'HIGH';
      suggestedAction = `Re-engage top buyers of "${topRevenueDeclineProduct}" or introduce promotional bundles.`;
    } else {
      primaryCause = `Primary driver: General margin compression as expenses outpaced revenue velocity.`;
      priority = 'MEDIUM';
      suggestedAction = `Review fixed vs variable operational overhead.`;
    }
  } else {
    primaryCause = `Primary driver: Strong performance with revenue growth outpacing expense velocity.`;
    if (topExpenseGrowthCategory) {
      secondaryCause = `Note: Watch rising expenses in "${topExpenseGrowthCategory}" (+${formatCurrency(topExpenseGrowthDelta, currency)}).`;
    }
    priority = 'LOW';
    suggestedAction = `Reinvest positive net profit flow into top-performing acquisition channels.`;
  }

  const headline = trendDirection === 'declining'
    ? `Net Profit decreased by ${Math.abs(netProfitChangePct).toFixed(1)}% (${formatCurrency(netProfitChangeValue, currency)}) compared to prior baseline.`
    : trendDirection === 'improving'
    ? `Net Profit increased by +${netProfitChangePct.toFixed(1)}% (+${formatCurrency(netProfitChangeValue, currency)}) compared to prior baseline.`
    : `Net Profit remained stable (${formatCurrency(curr.profit, currency)}).`;

  const subNodes = [
    {
      node: 'Revenue Velocity',
      value: `${revChangePct >= 0 ? '+' : ''}${revChangePct.toFixed(1)}%`,
      impact: formatCurrency(revChangeValue, currency),
    },
    {
      node: 'Expense Growth',
      value: `${expChangePct >= 0 ? '+' : ''}${expChangePct.toFixed(1)}%`,
      impact: formatCurrency(expChangeValue, currency),
    },
  ];

  if (topExpenseGrowthCategory) {
    subNodes.push({
      node: `Top Cost Driver (${topExpenseGrowthCategory})`,
      value: `+${formatCurrency(topExpenseGrowthDelta, currency)}`,
      impact: 'Expense Increase',
    });
  }

  return {
    hasEnoughData: true,
    headline,
    trendDirection,
    netProfitChangePct: parseFloat(netProfitChangePct.toFixed(1)),
    netProfitChangeValue,
    breakdown,
    primaryCause,
    secondaryCause,
    estimatedImpact: Math.abs(netProfitChangeValue),
    priority,
    suggestedAction,
    diagnosisTree: {
      node: 'Net Profit Diagnosis',
      value: formatCurrency(curr.profit, currency),
      subNodes,
    },
  };
}
