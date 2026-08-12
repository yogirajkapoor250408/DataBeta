import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from './metricsCalculator';
import { generateBusinessSummary } from './summaryEngine';
import { calculateTaxDeductions } from './taxEstimator';
import { calculateCustomerAnalytics, calculateProductAnalytics } from './customerProductAnalytics';
import { detectAnomalies } from './anomalyDetector';
import { formatCurrency } from './currencyFormatter';

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

  const revStr = formatCurrency(metrics.totalRevenue || 0, currency);
  const expStr = formatCurrency(metrics.totalExpenses || 0, currency);
  const profitStr = formatCurrency(metrics.estimatedProfit || 0, currency);
  const marginStr = metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A';

  // 1. Executive Briefing / General Health Summary
  if (
    query.includes('briefing') ||
    query.includes('executive') ||
    query.includes('summary') ||
    query.includes('health') ||
    query.includes('overview')
  ) {
    return {
      answerText: `Here is your automated Executive Financial Briefing based on ${metrics.transactionCount} analyzed transactions. Your business generated ${revStr} in revenue with net profit of ${profitStr} (${marginStr} margin).`,
      cards: [
        {
          title: 'Total Revenue Income',
          value: revStr,
          detail: `${metrics.transactionCount} total orders processed`,
          type: 'positive',
        },
        {
          title: 'Net Profit Margin',
          value: marginStr,
          detail: `Net profit: ${profitStr}`,
          type: (metrics.profitMargin || 0) >= 20 ? 'positive' : 'negative',
        },
        {
          title: 'Tax Savings Opportunity',
          value: formatCurrency(taxSummary.estimatedTaxSavings, currency),
          detail: `${formatCurrency(taxSummary.totalDeductibleExpense, currency)} in deductible costs`,
          type: 'info',
        },
      ],
    };
  }

  // 2. Profit Improvement / Margin Growth
  if (query.includes('profit') || query.includes('increase') || query.includes('margin') || query.includes('grow')) {
    const topProd = productStats.topProductByRevenue?.name || 'Top Product';
    const topCustShare = customerStats.topCustomerSharePct.toFixed(1);

    return {
      answerText: `To increase your profit margin above ${marginStr}, our algorithm recommends 3 immediate operational levers:\n\n1. **Optimize High-Margin Product Scale**: Reallocate ad spend towards "${topProd}", which currently drives your primary sales.\n2. **Negotiate Variable Overheads**: Variable costs make up ${formatCurrency(metrics.variableExpenses, currency)} of total expenses.\n3. **Diversify Client Revenue**: Your top client generates ${topCustShare}% of total income. Expanding mid-tier clients reduces concentration risk.`,
      cards: [
        {
          title: 'Target Break-Even Revenue',
          value: formatCurrency(metrics.breakEvenRevenue || 0, currency),
          detail: 'Minimum sales required to cover fixed costs',
          type: 'info',
        },
        {
          title: 'Fixed vs Variable Ratio',
          value: `${formatCurrency(metrics.fixedExpenses, currency)} / ${formatCurrency(metrics.variableExpenses, currency)}`,
          detail: 'Fixed Overhead / Variable Direct Cost',
          type: 'info',
        },
      ],
    };
  }

  // 3. Operational Cost Risk / Anomaly Alert
  if (query.includes('cost') || query.includes('risk') || query.includes('expense') || query.includes('anomaly')) {
    const highRisk = anomalies.filter((a) => a.severity === 'high');

    return {
      answerText: `Total operational expenses are ${expStr}. Our anomaly detector analyzed expense distributions across categories and flagged ${anomalies.length} risk observation(s).`,
      cards: anomalies.map((a) => ({
        title: a.title,
        value: a.metric,
        detail: a.description,
        type: a.severity === 'high' ? 'negative' : 'info',
      })),
    };
  }

  // 4. Tax Savings & Deductions
  if (query.includes('tax') || query.includes('deduct') || query.includes('write off')) {
    return {
      answerText: `Based on IRS Schedule C business deduction guidelines, we identified ${formatCurrency(taxSummary.totalDeductibleExpense, currency)} in eligible deductible business expenses, estimating a potential tax debt reduction of ${formatCurrency(taxSummary.estimatedTaxSavings, currency)} (~25% tax bracket).`,
      cards: taxSummary.breakdown.map((b) => ({
        title: b.taxScheduleCategory,
        value: formatCurrency(b.estimatedDeduction, currency),
        detail: `${b.categoryName} (${b.deductiblePct}% deductible)`,
        type: 'positive',
      })),
    };
  }

  // 5. CRM & Customer Account Insights
  if (query.includes('customer') || query.includes('client') || query.includes('crm') || query.includes('deal')) {
    const activeDeals = crmContacts.length;
    const topCust = customerStats.topCustomerName || 'Primary Account';

    return {
      answerText: `You have ${customerStats.totalUniqueCustomers} unique buyers in your dataset and ${activeDeals} CRM deal records. Your top account "${topCust}" generates ${customerStats.topCustomerSharePct.toFixed(1)}% of your total revenue.`,
      cards: [
        {
          title: 'Pareto 80/20 Concentration',
          value: `${customerStats.paretoRatioPct.toFixed(1)}%`,
          detail: 'Revenue generated by top 20% of accounts',
          type: 'info',
        },
        {
          title: 'Top Account Name',
          value: topCust,
          detail: `Share: ${customerStats.topCustomerSharePct.toFixed(1)}%`,
          type: 'positive',
        },
      ],
    };
  }

  // Default General Query Answer
  return {
    answerText: `Analysis for "${userQuery}": Based on your ${metrics.transactionCount} transactions, your business has total revenue of ${revStr}, net profit of ${profitStr}, and an estimated ${marginStr} profit margin.`,
    cards: [
      {
        title: 'Gross Revenue',
        value: revStr,
        detail: `${metrics.transactionCount} total records`,
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
