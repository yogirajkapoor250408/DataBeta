import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

export interface TaxDeductionCategory {
  name: string;
  scheduleCLine: string;
  totalAmount: number;
  transactionCount: number;
  deductiblePct: number;
  estimatedSavings: number;
  explanation: string;
}

export interface TaxOptimizerResult {
  estimatedNetProfit: number;
  totalEligibleDeductions: number;
  estimatedTaxSavings: number;
  categories: TaxDeductionCategory[];
  taxDisclaimer: string;
}

/**
 * Transparent Schedule C Business Tax Deduction Audit & Optimization Engine.
 */
export function calculateTaxOptimization(
  records: NormalizedRecord[],
  currency: CurrencyCode = 'USD',
  taxRatePct: number = 25
): TaxOptimizerResult {
  const categoriesMap: Record<string, { scheduleCLine: string; amount: number; count: number; pct: number; explanation: string }> = {
    Software: { scheduleCLine: 'Line 18 (Office Expense / Software)', amount: 0, count: 0, pct: 100, explanation: 'Operational software & SaaS tools are 100% deductible business expenses.' },
    Marketing: { scheduleCLine: 'Line 8 (Advertising)', amount: 0, count: 0, pct: 100, explanation: 'Advertising, paid ads, and promo campaigns are fully tax-deductible.' },
    Professional: { scheduleCLine: 'Line 17 (Legal & Professional Services)', amount: 0, count: 0, pct: 100, explanation: 'Accounting, legal, advisory, and consulting fees qualify as direct deductions.' },
    Travel: { scheduleCLine: 'Line 24a (Travel & Meals)', amount: 0, count: 0, pct: 50, explanation: 'Business meals are generally 50% deductible under IRS Schedule C.' },
    Utilities: { scheduleCLine: 'Line 25 (Utilities / Web Hosting)', amount: 0, count: 0, pct: 100, explanation: 'Web hosting, domain registration, and server infrastructure are 100% deductible.' },
  };

  let totalDeductions = 0;

  records.forEach((r) => {
    if (!r.expense || r.expense <= 0) return;
    const catLower = (r.category || '').toLowerCase();
    const prodLower = (r.product || '').toLowerCase();

    if (catLower.includes('software') || catLower.includes('cloud') || prodLower.includes('saas')) {
      categoriesMap['Software'].amount += r.expense;
      categoriesMap['Software'].count += 1;
      totalDeductions += r.expense * (categoriesMap['Software'].pct / 100);
    } else if (catLower.includes('market') || catLower.includes('ad') || catLower.includes('promo')) {
      categoriesMap['Marketing'].amount += r.expense;
      categoriesMap['Marketing'].count += 1;
      totalDeductions += r.expense * (categoriesMap['Marketing'].pct / 100);
    } else if (catLower.includes('prof') || catLower.includes('legal') || catLower.includes('consult')) {
      categoriesMap['Professional'].amount += r.expense;
      categoriesMap['Professional'].count += 1;
      totalDeductions += r.expense * (categoriesMap['Professional'].pct / 100);
    } else if (catLower.includes('travel') || catLower.includes('meal')) {
      categoriesMap['Travel'].amount += r.expense;
      categoriesMap['Travel'].count += 1;
      totalDeductions += r.expense * (categoriesMap['Travel'].pct / 100);
    } else if (catLower.includes('host') || catLower.includes('domain') || catLower.includes('util')) {
      categoriesMap['Utilities'].amount += r.expense;
      categoriesMap['Utilities'].count += 1;
      totalDeductions += r.expense * (categoriesMap['Utilities'].pct / 100);
    }
  });

  const estimatedTaxSavings = Math.round(totalDeductions * (taxRatePct / 100));

  const categories: TaxDeductionCategory[] = Object.entries(categoriesMap)
    .filter(([_, data]) => data.amount > 0)
    .map(([name, data]) => ({
      name,
      scheduleCLine: data.scheduleCLine,
      totalAmount: data.amount,
      transactionCount: data.count,
      deductiblePct: data.pct,
      estimatedSavings: Math.round(data.amount * (data.pct / 100) * (taxRatePct / 100)),
      explanation: data.explanation,
    }));

  return {
    estimatedNetProfit: 0,
    totalEligibleDeductions: totalDeductions,
    estimatedTaxSavings,
    categories,
    taxDisclaimer: 'This automated calculation provides an analytical estimate based on IRS Schedule C categories. Consult a certified CPA for official tax filings.',
  };
}
