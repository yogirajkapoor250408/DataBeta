import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from './metricsCalculator';
import { generateBusinessSummary } from './summaryEngine';
import { calculateTaxDeductions } from './taxEstimator';
import { calculateCustomerAnalytics, calculateProductAnalytics } from './customerProductAnalytics';
import { detectAnomalies } from './anomalyDetector';
import { formatCurrency } from './currencyFormatter';
import { scanProfitLeaks } from '../intelligence/profitLeakEngine';
import { diagnoseBusinessPerformance } from '../intelligence/diagnosisEngine';

export interface AICopilotResponse {
  answerText: string;
  cards?: {
    title: string;
    value: string;
    detail: string;
    type?: 'positive' | 'negative' | 'info';
  }[];
}

export function generateAICopilotResponse(
  userQuery: string,
  records: NormalizedRecord[],
  currency: CurrencyCode,
  crmContacts: CRMContact[] = []
): AICopilotResponse {
  const query = userQuery.toLowerCase().trim();
  const metrics = calculateMetrics(records);
  const taxSummary = calculateTaxDeductions(records);
  const customerStats = calculateCustomerAnalytics(records);
  const productStats = calculateProductAnalytics(records);
  const anomalies = detectAnomalies(records);
  const profitLeakSummary = scanProfitLeaks(records, currency);
  const profitLeaks = profitLeakSummary.leaks;
  const diagnosis = diagnoseBusinessPerformance(records, currency);

  const revStr = formatCurrency(metrics.totalRevenue || 0, currency);
  const expStr = formatCurrency(metrics.totalExpenses || 0, currency);
  const profitStr = formatCurrency(metrics.estimatedProfit || 0, currency);
  const marginStr = metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A';

  // 1. Profit Leaks / Cost Drain Scanner
  if (
    query.includes('leak') ||
    query.includes('drain') ||
    query.includes('waste') ||
    query.includes('losing money') ||
    query.includes('loss')
  ) {
    const leakTotal = profitLeaks.reduce((acc, l) => acc + (l.monthlyLeakAmount * 12), 0);
    return {
      answerText: `Our 5-vector deterministic scanner detected ${profitLeaks.length} operational profit leaks totaling an annualized impact of ${formatCurrency(leakTotal, currency)}.\n\n${profitLeaks.map((l, idx) => `${idx + 1}. **${l.title}**: ${l.description} *(Action: ${l.recommendedFix})*`).join('\n\n')}`,
      cards: profitLeaks.slice(0, 3).map((l) => ({
        title: l.title,
        value: formatCurrency(l.monthlyLeakAmount * 12, currency) + '/yr',
        detail: l.recommendedFix,
        type: l.severity === 'CRITICAL' ? 'negative' : 'info',
      })),
    };
  }

  // 2. Cash Runway & Burn Rate
  if (
    query.includes('runway') ||
    query.includes('burn') ||
    query.includes('cash') ||
    query.includes('how long')
  ) {
    const monthlyBurn = metrics.monthlyBurnRate || (metrics.totalExpenses ? metrics.totalExpenses / 3 : 5000);
    const estimatedRunwayMonths = (metrics.estimatedProfit && metrics.estimatedProfit > 0)
      ? 'Infinite (Cash Flow Positive)'
      : `${Math.max(1, Math.round((metrics.totalRevenue || 50000) / (monthlyBurn || 1)))} months`;

    return {
      answerText: `Based on your transaction velocity, your estimated monthly operating burn rate is ${formatCurrency(monthlyBurn, currency)}.\n\n${(metrics.estimatedProfit || 0) >= 0 ? '✅ Your business is operating with positive net profit, self-funding ongoing working capital.' : '⚠️ Operations are currently cash-flow negative. Implement immediate cost reductions on variable vendor overhead.'}`,
      cards: [
        {
          title: 'Monthly Burn Rate',
          value: formatCurrency(monthlyBurn, currency),
          detail: 'Average 30-day operational outflow',
          type: 'info',
        },
        {
          title: 'Runway Estimation',
          value: estimatedRunwayMonths,
          detail: 'Operating endurance at current burn',
          type: (metrics.estimatedProfit || 0) >= 0 ? 'positive' : 'negative',
        },
      ],
    };
  }

  // 3. Quarterly Estimated Tax Payments
  if (
    query.includes('quarter') ||
    query.includes('estimated tax') ||
    query.includes('1040-es') ||
    query.includes('cpa') ||
    query.includes('safe harbor')
  ) {
    const netIncome = Math.max(0, metrics.estimatedProfit || 0);
    const estTax = (netIncome * 0.24); // 24% standard rate
    const quarterly = estTax / 4;

    return {
      answerText: `Based on year-to-date net profit of ${profitStr}, your estimated annual federal & state tax liability is ${formatCurrency(estTax, currency)} (24% standard bracket).\n\nRecommended quarterly IRS installment: **${formatCurrency(quarterly, currency)} per quarter** (Q1: Apr 15, Q2: Jun 15, Q3: Sep 15, Q4: Jan 15).`,
      cards: [
        {
          title: 'Quarterly Installment',
          value: formatCurrency(quarterly, currency),
          detail: 'IRS Form 1040-ES estimated target',
          type: 'info',
        },
        {
          title: 'Identified Tax Deductions',
          value: formatCurrency(taxSummary.totalDeductibleExpense, currency),
          detail: `Potential tax shield: ${formatCurrency(taxSummary.estimatedTaxSavings, currency)}`,
          type: 'positive',
        },
      ],
    };
  }

  // 4. Executive Briefing / General Health Summary
  if (
    query.includes('briefing') ||
    query.includes('executive') ||
    query.includes('summary') ||
    query.includes('health') ||
    query.includes('overview')
  ) {
    return {
      answerText: `Here is your Executive Financial Briefing based on ${metrics.transactionCount} analyzed transactions. Realized gross revenue stands at ${revStr} with net income of ${profitStr} (${marginStr} net margin).\n\n**Key Finding**: ${diagnosis.headline}`,
      cards: [
        {
          title: 'Total Realized Revenue',
          value: revStr,
          detail: `${metrics.transactionCount} total line items`,
          type: 'positive',
        },
        {
          title: 'Net Profit Margin',
          value: marginStr,
          detail: `Net Income: ${profitStr}`,
          type: (metrics.profitMargin || 0) >= 20 ? 'positive' : 'negative',
        },
        {
          title: 'Tax Shield Savings',
          value: formatCurrency(taxSummary.estimatedTaxSavings, currency),
          detail: `${formatCurrency(taxSummary.totalDeductibleExpense, currency)} in Schedule C deductions`,
          type: 'info',
        },
      ],
    };
  }

  // 5. Product Leaderboard / Best Sellers
  if (
    query.includes('product') ||
    query.includes('item') ||
    query.includes('sell') ||
    query.includes('sku') ||
    query.includes('inventory')
  ) {
    const topProd = productStats.topProductByRevenue;
    return {
      answerText: `You have ${productStats.totalProducts} unique products in your catalog. Your top revenue driver is "${topProd?.name || 'N/A'}", generating ${formatCurrency(topProd?.revenue || 0, currency)} across ${topProd?.quantity || 0} units sold.`,
      cards: productStats.productLeaderboard.slice(0, 3).map((p, idx) => ({
        title: `#${idx + 1} ${p.name}`,
        value: formatCurrency(p.revenue, currency),
        detail: `${p.quantity} units sold (${formatCurrency(p.avgPrice, currency)}/unit)`,
        type: 'positive',
      })),
    };
  }

  // 6. Profit Improvement / Margin Growth / Simulation
  if (
    query.includes('profit') ||
    query.includes('increase') ||
    query.includes('margin') ||
    query.includes('grow') ||
    query.includes('simulate') ||
    query.includes('what if')
  ) {
    const topProd = productStats.topProductByRevenue?.name || 'Top Product';
    const topCustShare = customerStats.topCustomerSharePct.toFixed(1);

    return {
      answerText: `To increase your net profit margin above ${marginStr}, our mathematical model isolates 3 high-impact operational vectors:\n\n1. **Price Optimization (+5%)**: A 5% price adjustment increases annual bottom line by approximately ${formatCurrency((metrics.totalRevenue || 0) * 0.05, currency)} with near-zero additional variable cost.\n2. **Trim Fixed Vendor Overhead**: Fixed costs represent ${formatCurrency(metrics.fixedExpenses, currency)} of your operating expenses.\n3. **De-risk Customer Concentration**: Your top buyer currently generates ${topCustShare}% of total income. Target 5 additional mid-tier accounts to stabilize cash flow.`,
      cards: [
        {
          title: 'Target Break-Even Sales',
          value: formatCurrency(metrics.breakEvenRevenue || 0, currency),
          detail: 'Minimum revenue to cover fixed costs',
          type: 'info',
        },
        {
          title: 'Fixed vs Variable Costs',
          value: `${formatCurrency(metrics.fixedExpenses, currency)} / ${formatCurrency(metrics.variableExpenses, currency)}`,
          detail: 'Fixed Overhead / Variable Direct Cost',
          type: 'info',
        },
      ],
    };
  }

  // 7. Operational Cost Risk / Anomaly Alert
  if (query.includes('cost') || query.includes('risk') || query.includes('expense') || query.includes('anomaly')) {
    return {
      answerText: `Total operational expenses are ${expStr}. Our statistical anomaly engine evaluated standard deviation across transaction batches and isolated ${anomalies.length} risk point(s).`,
      cards: anomalies.slice(0, 3).map((a) => ({
        title: a.title,
        value: a.metric,
        detail: a.description,
        type: a.severity === 'high' ? 'negative' : 'info',
      })),
    };
  }

  // 8. Tax Savings & Deductions
  if (query.includes('tax') || query.includes('deduct') || query.includes('write off')) {
    return {
      answerText: `Based on IRS Schedule C business deduction rules, we identified ${formatCurrency(taxSummary.totalDeductibleExpense, currency)} in qualified deductible operating costs, projecting a tax liability reduction of ${formatCurrency(taxSummary.estimatedTaxSavings, currency)} (~25% pass-through rate).`,
      cards: taxSummary.breakdown.slice(0, 3).map((b) => ({
        title: b.taxScheduleCategory,
        value: formatCurrency(b.estimatedDeduction, currency),
        detail: `${b.categoryName} (${b.deductiblePct}% deductible)`,
        type: 'positive',
      })),
    };
  }

  // 9. CRM & Customer Account Insights / At-Risk Accounts
  if (
    query.includes('customer') ||
    query.includes('client') ||
    query.includes('crm') ||
    query.includes('deal') ||
    query.includes('churn') ||
    query.includes('at risk')
  ) {
    const activeDeals = crmContacts.length;
    const topCust = customerStats.topCustomerName || 'Primary Account';

    return {
      answerText: `You have ${customerStats.totalUniqueCustomers} unique customer accounts in your dataset and ${activeDeals} CRM opportunities in your sales pipeline. Your top buyer "${topCust}" drives ${customerStats.topCustomerSharePct.toFixed(1)}% of total business revenue.`,
      cards: [
        {
          title: 'Pareto 80/20 Concentration',
          value: `${customerStats.paretoRatioPct.toFixed(1)}%`,
          detail: 'Generated by top 20% of accounts',
          type: 'info',
        },
        {
          title: 'Top Account',
          value: topCust,
          detail: `Concentration: ${customerStats.topCustomerSharePct.toFixed(1)}%`,
          type: 'positive',
        },
      ],
    };
  }

  // Default Fallback
  return {
    answerText: `Analysis for "${userQuery}": Based on your ${metrics.transactionCount} transactions, your business has realized revenue of ${revStr}, total expenses of ${expStr}, and net profit of ${profitStr} (${marginStr} net margin).`,
    cards: [
      {
        title: 'Gross Revenue',
        value: revStr,
        detail: `${metrics.transactionCount} transactions analyzed`,
        type: 'positive',
      },
      {
        title: 'Net Profit',
        value: profitStr,
        detail: `Margin: ${marginStr}`,
        type: (metrics.profitMargin || 0) >= 0 ? 'positive' : 'negative',
      },
    ],
  };
}
