import { NormalizedRecord, FinancialHealthScorecard } from '../types';
import { calculateMetrics } from './metricsCalculator';
import { calculateCustomerAnalytics } from './customerProductAnalytics';

export function calculateFinancialHealthScore(records: NormalizedRecord[]): FinancialHealthScorecard {
  if (!records || records.length === 0) {
    return {
      score: 50,
      grade: 'C',
      marginScore: 50,
      stabilityScore: 50,
      expenseControlScore: 50,
      diversificationScore: 50,
      factors: ['Awaiting transaction dataset for real-time scoring.'],
    };
  }

  const metrics = calculateMetrics(records);
  const customerStats = calculateCustomerAnalytics(records);
  const factors: string[] = [];

  // 1. Margin Score (0-30 pts)
  let marginScore = 15;
  const margin = metrics.profitMargin || 0;
  if (margin >= 35) {
    marginScore = 30;
    factors.push('Exceptional profit margin (>35%).');
  } else if (margin >= 20) {
    marginScore = 24;
    factors.push('Healthy profit margin (20-35%).');
  } else if (margin >= 10) {
    marginScore = 18;
    factors.push('Moderate profit margin (10-20%).');
  } else if (margin > 0) {
    marginScore = 12;
    factors.push('Low profit margin (<10%). Re-examine pricing.');
  } else {
    marginScore = 5;
    factors.push('Negative profit margin (Operating at a loss).');
  }

  // 2. Expense Control Score (0-25 pts)
  let expenseControlScore = 15;
  const expRatio = metrics.totalRevenue && metrics.totalExpenses ? metrics.totalExpenses / metrics.totalRevenue : 0.8;
  if (expRatio <= 0.5) {
    expenseControlScore = 25;
    factors.push('Low expense ratio (<50% of revenue).');
  } else if (expRatio <= 0.7) {
    expenseControlScore = 20;
    factors.push('Controlled operational spending (50-70% of revenue).');
  } else if (expRatio <= 0.9) {
    expenseControlScore = 14;
    factors.push('Elevated overhead costs (70-90% of revenue).');
  } else {
    expenseControlScore = 6;
    factors.push('High expense ratio (>90% of revenue).');
  }

  // 3. Revenue Stability & Volume Score (0-25 pts)
  let stabilityScore = 15;
  const count = metrics.transactionCount;
  if (count >= 50) {
    stabilityScore = 25;
    factors.push('High transaction volume (>50 orders).');
  } else if (count >= 20) {
    stabilityScore = 20;
    factors.push('Consistent sales activity (20-50 orders).');
  } else {
    stabilityScore = 12;
    factors.push('Low transaction volume (<20 orders).');
  }

  // 4. Pareto Diversification Score (0-20 pts)
  let diversificationScore = 10;
  const topShare = customerStats.topCustomerSharePct;
  if (topShare > 0 && topShare <= 25) {
    diversificationScore = 20;
    factors.push('Well-diversified customer account portfolio.');
  } else if (topShare <= 45) {
    diversificationScore = 15;
    factors.push('Moderate client concentration (Top account generates <45%).');
  } else {
    diversificationScore = 8;
    factors.push(`High client concentration risk (Top account generates ${topShare.toFixed(1)}%).`);
  }

  const totalScore = Math.min(100, Math.max(0, Math.round(marginScore + expenseControlScore + stabilityScore + diversificationScore)));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
  if (totalScore >= 92) grade = 'A+';
  else if (totalScore >= 82) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 55) grade = 'C';
  else if (totalScore >= 40) grade = 'D';
  else grade = 'F';

  return {
    score: totalScore,
    grade,
    marginScore,
    stabilityScore,
    expenseControlScore,
    diversificationScore,
    factors,
  };
}
