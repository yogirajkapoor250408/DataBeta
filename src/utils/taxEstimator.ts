import { NormalizedRecord, TaxDeductionSummary, TaxCategoryBreakdown } from '../types';

interface TaxCategoryRule {
  taxScheduleCategory: string;
  keywords: string[];
  deductiblePct: number;
}

const TAX_RULES: TaxCategoryRule[] = [
  {
    taxScheduleCategory: 'Advertising & Digital Marketing (Line 8)',
    keywords: ['marketing', 'ads', 'google ads', 'meta', 'facebook', 'ad spend', 'influencer', 'promo', 'search engine'],
    deductiblePct: 100,
  },
  {
    taxScheduleCategory: 'Software & Cloud Infrastructure (Line 18)',
    keywords: ['software', 'cloud', 'aws', 'hosting', 'domain', 'saas', 'digitalocean', 'database', 'cdn', 'cloudflare'],
    deductiblePct: 100,
  },
  {
    taxScheduleCategory: 'Office & Operating Supplies (Line 22)',
    keywords: ['office', 'supplies', 'packaging', 'paper', 'stationery', 'equipment', 'desk', 'chair'],
    deductiblePct: 100,
  },
  {
    taxScheduleCategory: 'Freight & Shipping Expenses (Line 27a)',
    keywords: ['shipping', 'freight', 'logistics', 'dhl', 'fedex', 'ups', 'postage', 'fulfillment'],
    deductiblePct: 100,
  },
  {
    taxScheduleCategory: 'Legal & Professional Services (Line 17)',
    keywords: ['legal', 'accounting', 'advisor', 'consultant', 'attorney', 'cpa', 'bookkeeper'],
    deductiblePct: 100,
  },
];

export function calculateTaxDeductions(records: NormalizedRecord[]): TaxDeductionSummary {
  let totalGrossExpense = 0;
  const categoryMap: Record<string, { total: number; scheduleCategory: string; pct: number }> = {};

  for (const r of records) {
    if (r.expense && r.expense > 0) {
      totalGrossExpense += r.expense;
      const cat = (r.category || 'Other Operating Expense').trim();
      const prod = (r.product || '').toLowerCase();
      const catLower = cat.toLowerCase();

      // Find matching tax rule
      let matchedRule = TAX_RULES.find(rule =>
        rule.keywords.some(kw => catLower.includes(kw) || prod.includes(kw))
      );

      if (!matchedRule) {
        matchedRule = {
          taxScheduleCategory: 'Other Business Operating Expenses (Line 27a)',
          keywords: [],
          deductiblePct: 100,
        };
      }

      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          total: 0,
          scheduleCategory: matchedRule.taxScheduleCategory,
          pct: matchedRule.deductiblePct,
        };
      }

      categoryMap[cat].total += r.expense;
    }
  }

  const breakdown: TaxCategoryBreakdown[] = Object.entries(categoryMap).map(([catName, data]) => {
    const deduction = data.total * (data.pct / 100);
    return {
      categoryName: catName,
      taxScheduleCategory: data.scheduleCategory,
      totalExpense: data.total,
      deductiblePct: data.pct,
      estimatedDeduction: deduction,
    };
  }).sort((a, b) => b.totalExpense - a.totalExpense);

  const totalDeductibleExpense = breakdown.reduce((sum, item) => sum + item.estimatedDeduction, 0);
  const estimatedTaxSavings = totalDeductibleExpense * 0.25; // Estimated 25% tax bracket

  return {
    totalGrossExpense,
    totalDeductibleExpense,
    estimatedTaxSavings,
    breakdown,
  };
}
