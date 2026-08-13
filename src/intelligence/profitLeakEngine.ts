import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { detectAnomalies } from './anomalyEngine';
import { calculateTaxOptimization } from './taxIntelligence';

export interface ProfitLeakItem {
  id: string;
  vector: 'subzero_margin' | 'vendor_creep' | 'expense_outlier' | 'customer_erosion' | 'tax_leakage';
  title: string;
  category: string;
  monthlyLeakAmount: number;
  confidenceScore: number; // 0 - 100%
  description: string;
  recommendedFix: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface ProfitLeakSummary {
  totalMonthlyLeakage: number;
  totalAnnualLeakage: number;
  leakCount: number;
  leaks: ProfitLeakItem[];
  healthImpactText: string;
}

/**
 * Pure Deterministic 5-Vector Continuous Profit Leak Engine.
 * Pinpoints exactly where money is disappearing from the business.
 */
export function scanProfitLeaks(
  records: NormalizedRecord[],
  currency: CurrencyCode = 'USD'
): ProfitLeakSummary {
  const leaks: ProfitLeakItem[] = [];

  if (!records || records.length === 0) {
    return {
      totalMonthlyLeakage: 0,
      totalAnnualLeakage: 0,
      leakCount: 0,
      leaks: [],
      healthImpactText: 'No transactions ingested to scan for profit leaks.',
    };
  }

  // Vector 1: Sub-Zero / Negative Margin Transactions
  let subZeroLeakSum = 0;
  let subZeroCount = 0;
  records.forEach((r, idx) => {
    if (r.revenue && r.expense && r.expense > r.revenue) {
      const loss = r.expense - r.revenue;
      subZeroLeakSum += loss;
      subZeroCount++;
    } else if (r.revenue && r.revenue > 0 && r.expense && r.profit !== null && r.profit < 0) {
      const loss = Math.abs(r.profit);
      subZeroLeakSum += loss;
      subZeroCount++;
    }
  });

  if (subZeroLeakSum > 0) {
    leaks.push({
      id: 'leak-vec-subzero',
      vector: 'subzero_margin',
      title: 'Negative Margin Transactions',
      category: 'Pricing Strategy',
      monthlyLeakAmount: Math.round(subZeroLeakSum),
      confidenceScore: 98,
      description: `Identified ${subZeroCount} transactions where operational costs exceeded gross sales revenue.`,
      recommendedFix: 'Adjust minimum pricing thresholds or eliminate negative-margin product variations.',
      severity: 'CRITICAL',
    });
  }

  // Vector 2: Expense Outlier Spikes (Z-Score > 3.5)
  const anomalies = detectAnomalies(records, currency);
  const expenseOutliers = anomalies.filter((a) => a.type === 'expense_spike');
  if (expenseOutliers.length > 0) {
    const outlierLeakSum = expenseOutliers.reduce((acc, curr) => acc + (curr.value || 0), 0);
    leaks.push({
      id: 'leak-vec-outliers',
      vector: 'expense_outlier',
      title: 'Statistical Expense Outliers',
      category: 'Overhead Control',
      monthlyLeakAmount: Math.round(outlierLeakSum * 0.4), // Estimated portion that is reducible
      confidenceScore: 92,
      description: `Detected ${expenseOutliers.length} anomalous expense spikes exceeding normal distribution thresholds (>3.5 MAD).`,
      recommendedFix: `Audit recurring vendor contracts for ${expenseOutliers[0]?.title || 'unusual line items'}.`,
      severity: 'HIGH',
    });
  }

  // Vector 3: Tax Leakage (Unclaimed Schedule C Deductions)
  const taxOpt = calculateTaxOptimization(records, currency);
  if (taxOpt.estimatedTaxSavings > 100) {
    leaks.push({
      id: 'leak-vec-tax',
      vector: 'tax_leakage',
      title: 'Unoptimized Tax Deductions',
      category: 'Tax Efficiency',
      monthlyLeakAmount: Math.round(taxOpt.estimatedTaxSavings / 12),
      confidenceScore: 95,
      description: `Uncategorized software, utility, or promo expenses result in missed IRS Schedule C write-offs.`,
      recommendedFix: 'Classify operational software and ad spend under appropriate Schedule C line items.',
      severity: 'MEDIUM',
    });
  }

  // Vector 4: Vendor & Category Creep (Top category consuming >35% of total expenses)
  const totalExp = records.reduce((acc, r) => acc + (r.expense || 0), 0);
  if (totalExp > 0) {
    const catMap: Record<string, number> = {};
    records.forEach((r) => {
      if (r.expense) {
        const cat = r.category || 'General Expense';
        catMap[cat] = (catMap[cat] || 0) + r.expense;
      }
    });

    Object.entries(catMap).forEach(([cat, amt]) => {
      const share = amt / totalExp;
      if (share > 0.35 && amt > 500) {
        leaks.push({
          id: `leak-vec-creep-${cat}`,
          vector: 'vendor_creep',
          title: `Expense Concentration in "${cat}"`,
          category: 'Vendor Management',
          monthlyLeakAmount: Math.round(amt * 0.15), // 15% estimated inefficiency reduction
          confidenceScore: 88,
          description: `"${cat}" accounts for ${(share * 100).toFixed(1)}% of total operational expenditure.`,
          recommendedFix: `Renegotiate vendor terms or consolidate SaaS tools in "${cat}".`,
          severity: share > 0.5 ? 'HIGH' : 'MEDIUM',
        });
      }
    });
  }

  const totalMonthlyLeakage = leaks.reduce((acc, l) => acc + l.monthlyLeakAmount, 0);
  const totalAnnualLeakage = totalMonthlyLeakage * 12;

  const healthImpactText =
    totalMonthlyLeakage > 1000
      ? `Eliminating flagged profit leaks could restore ${formatCurrency(totalAnnualLeakage, currency)} to annual net margin.`
      : totalMonthlyLeakage > 0
      ? `Minor leakages detected amounting to ${formatCurrency(totalMonthlyLeakage, currency)}/month.`
      : 'Zero significant profit leaks detected across current transactions.';

  return {
    totalMonthlyLeakage,
    totalAnnualLeakage,
    leakCount: leaks.length,
    leaks: leaks.sort((a, b) => b.monthlyLeakAmount - a.monthlyLeakAmount),
    healthImpactText,
  };
}
