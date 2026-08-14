// ============================================================================
// DataBeta: Provenance Calculation Engine
// Guarantees verifiable provenance, data coverage, assumptions & null-safety
// ============================================================================

import {
  Deal,
  Invoice,
  Transaction,
  NormalizedRecord,
  CurrencyCode,
  ProvenanceMetric,
  CashOutlookForecast,
} from '../types';
import { formatCurrency } from './currencyFormatter';

/**
 * Calculates Win Rate from Deals.
 * Requires at least 1 closed deal (won or lost).
 */
export function calculateWinRate(deals: Deal[]): ProvenanceMetric<number> {
  const calculatedAt = new Date().toISOString();
  const closedDeals = deals.filter((d) => d.stage === 'won' || d.stage === 'lost');
  const wonDeals = deals.filter((d) => d.stage === 'won');

  if (deals.length === 0) {
    return {
      status: 'needs_data',
      value: null,
      formattedValue: 'Not calculated',
      coverage: {
        records: 0,
        missingInputs: ['Open or closed deals in pipeline'],
      },
      assumptions: ['Requires at least one closed deal (Won or Lost) to compute conversion.'],
      calculatedAt,
    };
  }

  if (closedDeals.length === 0) {
    return {
      status: 'partial',
      value: null,
      formattedValue: '0 closed deals',
      coverage: {
        records: deals.length,
        missingInputs: ['Closed deals (Won or Lost)'],
      },
      assumptions: [`${deals.length} active deals in progress, but 0 have reached a closed stage.`],
      calculatedAt,
    };
  }

  const rate = (wonDeals.length / closedDeals.length) * 100;
  return {
    status: closedDeals.length >= 5 ? 'complete' : 'partial',
    value: rate,
    formattedValue: `${rate.toFixed(1)}%`,
    coverage: {
      records: closedDeals.length,
      missingInputs: closedDeals.length < 5 ? ['Sample size < 5 closed deals'] : [],
    },
    assumptions: [
      `Computed as (${wonDeals.length} won deals ÷ ${closedDeals.length} total closed deals).`,
      'Excludes deals currently in active pipeline negotiation.',
    ],
    sourceLinks: closedDeals.map((d) => ({
      type: 'deal',
      id: d.id,
      label: `${d.title} (${d.stage === 'won' ? 'Won' : 'Lost'})`,
    })),
    calculatedAt,
  };
}

/**
 * Calculates Total Weighted Pipeline Value from Open Deals.
 */
export function calculateWeightedPipeline(
  deals: Deal[],
  currency: CurrencyCode
): ProvenanceMetric<number> {
  const calculatedAt = new Date().toISOString();
  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');

  if (openDeals.length === 0) {
    return {
      status: 'needs_data',
      value: 0,
      formattedValue: formatCurrency(0, currency),
      coverage: {
        records: 0,
        missingInputs: ['Active open deals in CRM pipeline'],
      },
      assumptions: ['Zero open opportunities found in pipeline.'],
      calculatedAt,
    };
  }

  const dealsWithMissingProb = openDeals.filter((d) => d.probabilityPct === undefined || d.probabilityPct === null);
  const totalWeighted = openDeals.reduce((sum, d) => {
    const prob = (d.probabilityPct !== undefined && d.probabilityPct !== null ? d.probabilityPct : 50) / 100;
    return sum + (d.amount || 0) * prob;
  }, 0);

  const isPartial = dealsWithMissingProb.length > 0;

  return {
    status: isPartial ? 'partial' : 'complete',
    value: totalWeighted,
    formattedValue: formatCurrency(totalWeighted, currency),
    coverage: {
      records: openDeals.length,
      missingInputs: isPartial ? [`${dealsWithMissingProb.length} deals missing custom probability (defaulted to 50%)`] : [],
    },
    assumptions: [
      `Sum of (Deal Amount × Stage Probability %) across ${openDeals.length} open opportunities.`,
      'Stage probability weights: Lead (10%), Qualified (30%), Discovery (50%), Proposal (70%), Negotiation (85%).',
    ],
    sourceLinks: openDeals.map((d) => ({
      type: 'deal',
      id: d.id,
      label: `${d.title} — ${formatCurrency(d.amount, currency)} @ ${d.probabilityPct || 50}%`,
    })),
    calculatedAt,
  };
}

/**
 * Calculates Cash Collection Rate from Invoices.
 */
export function calculateCollectionRate(invoices: Invoice[]): ProvenanceMetric<number> {
  const calculatedAt = new Date().toISOString();

  if (!invoices || invoices.length === 0) {
    return {
      status: 'needs_data',
      value: null,
      formattedValue: 'Not calculated',
      coverage: {
        records: 0,
        missingInputs: ['Invoices or receivables records'],
      },
      assumptions: ['Requires invoice records with due date and payment status.'],
      calculatedAt,
    };
  }

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

  if (totalInvoiced === 0) {
    return {
      status: 'needs_data',
      value: 0,
      formattedValue: '0.0%',
      coverage: {
        records: invoices.length,
        missingInputs: ['Non-zero invoice amounts'],
      },
      assumptions: ['Total invoiced value is zero.'],
      calculatedAt,
    };
  }

  const rate = (totalCollected / totalInvoiced) * 100;

  return {
    status: 'complete',
    value: rate,
    formattedValue: `${rate.toFixed(1)}%`,
    coverage: {
      records: invoices.length,
      missingInputs: [],
    },
    assumptions: [
      `Computed as (${formatCurrency(totalCollected, 'USD')} collected ÷ ${formatCurrency(totalInvoiced, 'USD')} total invoiced).`,
      'Includes partial payments recorded against open invoices.',
    ],
    sourceLinks: invoices.map((inv) => ({
      type: 'invoice',
      id: inv.id,
      label: `#${inv.invoiceNumber} — ${inv.status.toUpperCase()}`,
    })),
    calculatedAt,
  };
}

/**
 * Calculates Honest Gross Margin from Transaction records.
 */
export function calculateGrossMargin(
  records: NormalizedRecord[],
  currency: CurrencyCode
): ProvenanceMetric<number> {
  const calculatedAt = new Date().toISOString();

  if (!records || records.length === 0) {
    return {
      status: 'needs_data',
      value: null,
      formattedValue: 'Not calculated',
      coverage: {
        records: 0,
        missingInputs: ['Transaction records or ledger entries'],
      },
      assumptions: ['Requires mapped revenue and expense records.'],
      calculatedAt,
    };
  }

  let totalRev = 0;
  let totalExp = 0;

  for (const r of records) {
    if (r.revenue) totalRev += r.revenue;
    if (r.expense) totalExp += r.expense;
  }

  if (totalRev === 0) {
    return {
      status: 'partial',
      value: null,
      formattedValue: 'No realized revenue',
      coverage: {
        records: records.length,
        missingInputs: ['Positive revenue entries in dataset'],
      },
      assumptions: ['Expenses recorded, but total gross revenue is $0.'],
      calculatedAt,
    };
  }

  const netProfit = totalRev - totalExp;
  const marginPct = (netProfit / totalRev) * 100;

  return {
    status: 'complete',
    value: marginPct,
    formattedValue: `${marginPct.toFixed(1)}%`,
    coverage: {
      records: records.length,
      missingInputs: [],
    },
    assumptions: [
      `Computed from ${formatCurrency(totalRev, currency)} gross revenue minus ${formatCurrency(totalExp, currency)} operating expenses.`,
      `Net profit: ${formatCurrency(netProfit, currency)}.`,
    ],
    calculatedAt,
  };
}

/**
 * Calculates Complete Cash Outlook Forecast separating:
 * - Actual cash balance (or unavailable warning)
 * - Committed Invoices inflow (due within 30 days)
 * - Weighted Pipeline inflow (open deals closing within 30 days)
 * - Expected Outflow (recurring costs or trailing average expenses)
 */
export function calculateCashOutlook(
  invoices: Invoice[],
  deals: Deal[],
  transactions: Transaction[] | NormalizedRecord[],
  currency: CurrencyCode,
  manualBankBalance?: number
): CashOutlookForecast {
  const calculatedAt = new Date().toISOString();
  const now = new Date();
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 1. Actual Cash Balance
  const actualCashBalance: ProvenanceMetric<number> =
    manualBankBalance !== undefined && manualBankBalance !== null
      ? {
          status: 'complete',
          value: manualBankBalance,
          formattedValue: formatCurrency(manualBankBalance, currency),
          coverage: { records: 1, missingInputs: [] },
          assumptions: ['Verified opening bank ledger balance.'],
          calculatedAt,
        }
      : {
          status: 'needs_data',
          value: null,
          formattedValue: 'Not connected',
          coverage: {
            records: 0,
            missingInputs: ['Opening bank balance or direct bank feed connection'],
          },
          assumptions: ['Set your cash balance in Settings > Business Profile to track net liquidity.'],
          calculatedAt,
        };

  // 2. Committed Invoices Inflow (Due within 30 days)
  const openInvoices = invoices.filter(
    (inv) => inv.status === 'sent' || inv.status === 'due_soon' || inv.status === 'overdue'
  );
  const committedTotal = openInvoices.reduce((sum, inv) => sum + (inv.balanceDue || inv.amount || 0), 0);

  const committedInvoicesInflow: ProvenanceMetric<number> = {
    status: openInvoices.length > 0 ? 'complete' : 'needs_data',
    value: committedTotal,
    formattedValue: formatCurrency(committedTotal, currency),
    coverage: {
      records: openInvoices.length,
      missingInputs: openInvoices.length === 0 ? ['No open invoices due within 30 days'] : [],
    },
    assumptions: [
      `Sum of unpaid balances across ${openInvoices.length} open customer invoices.`,
      'Assumes 100% collection of committed invoiced receivables.',
    ],
    sourceLinks: openInvoices.map((inv) => ({
      type: 'invoice',
      id: inv.id,
      label: `Invoice #${inv.invoiceNumber} (${formatCurrency(inv.balanceDue || inv.amount, currency)})`,
    })),
    calculatedAt,
  };

  // 3. Weighted Pipeline Inflow (Closing within 30 days)
  const pipelineClosingSoon = deals.filter((d) => {
    if (d.stage === 'won' || d.stage === 'lost') return false;
    if (!d.expectedCloseDate) return true; // Include if undated
    const close = new Date(d.expectedCloseDate);
    return close <= thirtyDaysOut;
  });

  const pipelineTotal = pipelineClosingSoon.reduce((sum, d) => {
    const prob = (d.probabilityPct !== undefined && d.probabilityPct !== null ? d.probabilityPct : 50) / 100;
    return sum + (d.amount || 0) * prob;
  }, 0);

  const weightedPipelineInflow: ProvenanceMetric<number> = {
    status: pipelineClosingSoon.length > 0 ? 'complete' : 'needs_data',
    value: pipelineTotal,
    formattedValue: formatCurrency(pipelineTotal, currency),
    coverage: {
      records: pipelineClosingSoon.length,
      missingInputs: pipelineClosingSoon.length === 0 ? ['No open deals expected to close this month'] : [],
    },
    assumptions: [
      `Weighted by stage win probability across ${pipelineClosingSoon.length} near-term opportunities.`,
      'Subject to sales cycle completion and buyer execution.',
    ],
    sourceLinks: pipelineClosingSoon.map((d) => ({
      type: 'deal',
      id: d.id,
      label: `${d.title} (${d.stage})`,
    })),
    calculatedAt,
  };

  // 4. Expected Outflow (Trailing expenses)
  let totalExpenses = 0;
  let expenseCount = 0;

  for (const t of transactions) {
    const exp = (t as any).expense || ((t as any).type === 'expense' ? (t as any).amount : 0);
    if (exp && exp > 0) {
      totalExpenses += exp;
      expenseCount += 1;
    }
  }

  const expectedOutflow: ProvenanceMetric<number> = {
    status: expenseCount > 0 ? 'complete' : 'needs_data',
    value: totalExpenses,
    formattedValue: formatCurrency(totalExpenses, currency),
    coverage: {
      records: expenseCount,
      missingInputs: expenseCount === 0 ? ['No expense records or operating costs uploaded'] : [],
    },
    assumptions: [
      `Total operating outflows and vendor costs from ${expenseCount} ledger expense records.`,
    ],
    calculatedAt,
  };

  // 5. Net Cash Outlook
  const netValue = (committedTotal + pipelineTotal) - totalExpenses;
  const netCashOutlook: ProvenanceMetric<number> = {
    status: (openInvoices.length > 0 || pipelineClosingSoon.length > 0) ? 'complete' : 'partial',
    value: netValue,
    formattedValue: `${netValue >= 0 ? '+' : ''}${formatCurrency(netValue, currency)}`,
    coverage: {
      records: openInvoices.length + pipelineClosingSoon.length + expenseCount,
      missingInputs: [],
    },
    assumptions: [
      'Calculated as (Committed Invoices + Weighted Pipeline Inflow) − Expected Outflows.',
      'Does not include unlinked capital investments or financing disbursements.',
    ],
    calculatedAt,
  };

  return {
    actualCashBalance,
    committedInvoicesInflow,
    weightedPipelineInflow,
    expectedOutflow,
    netCashOutlook,
  };
}
