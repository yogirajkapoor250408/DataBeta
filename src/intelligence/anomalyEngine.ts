import { NormalizedRecord, CurrencyCode } from '../types';
import { calculateStatisticalSummary } from './statisticalEngine';
import { formatCurrency } from '../utils/currencyFormatter';

export interface DataAnomalyItem {
  id: string;
  type: 'expense_spike' | 'revenue_spike' | 'margin_compression' | 'customer_concentration' | 'unusual_transaction';
  severity: 'high' | 'medium' | 'low';
  title: string;
  whatHappened: string;
  whyUnusual: string;
  potentialImpact: string;
  confidence: number; // 0-100%
  suggestedAction: string;
  recordId?: string;
  value?: number;
}

/**
 * Intelligent Anomaly Detection Engine using Z-Scores, Modified Z-Scores (MAD), and IQR outlier bounds.
 */
export function detectAnomalies(
  records: NormalizedRecord[],
  currency: CurrencyCode = 'USD'
): DataAnomalyItem[] {
  const anomalies: DataAnomalyItem[] = [];
  if (!records || records.length === 0) return anomalies;

  // 1. Transaction-level Expense Anomalies (Modified Z-Score > 3.0)
  const expenses = records.map((r) => r.expense || 0).filter((v) => v > 0);
  if (expenses.length >= 3) {
    const stats = calculateStatisticalSummary(expenses);
    records.forEach((r, idx) => {
      if (r.expense && r.expense > 0) {
        const modZ = stats.modifiedZScores[idx] || 0;
        if (modZ > 3.5 || (stats.iqr > 0 && r.expense > stats.p75 + 2.5 * stats.iqr)) {
          anomalies.push({
            id: `anom-exp-${r.id || idx}`,
            type: 'expense_spike',
            severity: modZ > 5 ? 'high' : 'medium',
            title: `Unusual Expense Outlier: ${formatCurrency(r.expense, currency)}`,
            whatHappened: `Single transaction in category "${r.category || 'General'}" of ${formatCurrency(r.expense, currency)} is significantly higher than average.`,
            whyUnusual: `Modified Z-Score is ${modZ.toFixed(2)}, exceeding normal distribution thresholds by >3.5 MAD deviations.`,
            potentialImpact: `Increases overhead cost velocity and compresses net operating margin.`,
            confidence: Math.min(99, Math.round(80 + modZ * 3)),
            suggestedAction: `Audit transaction details for vendor invoice accuracy or unexpected charge duplicates.`,
            recordId: r.id,
            value: r.expense,
          });
        }
      }
    });
  }

  // 2. Transaction-level Revenue Anomalies
  const revenues = records.map((r) => r.revenue || 0).filter((v) => v > 0);
  if (revenues.length >= 3) {
    const stats = calculateStatisticalSummary(revenues);
    records.forEach((r, idx) => {
      if (r.revenue && r.revenue > 0) {
        const modZ = stats.modifiedZScores[idx] || 0;
        if (modZ > 4.0) {
          anomalies.push({
            id: `anom-rev-${r.id || idx}`,
            type: 'revenue_spike',
            severity: 'low', // Positive anomaly
            title: `Major Revenue Spike: ${formatCurrency(r.revenue, currency)}`,
            whatHappened: `Single order for "${r.product || r.category || 'Product'}" generated ${formatCurrency(r.revenue, currency)}.`,
            whyUnusual: `Exceeds average order baseline by ${modZ.toFixed(1)} MAD deviations.`,
            potentialImpact: `Substantially lifts period gross revenue.`,
            confidence: 95,
            suggestedAction: `Identify acquisition channel or customer driver to replicate order size.`,
            recordId: r.id,
            value: r.revenue,
          });
        }
      }
    });
  }

  return anomalies.slice(0, 8); // Top anomalies
}
