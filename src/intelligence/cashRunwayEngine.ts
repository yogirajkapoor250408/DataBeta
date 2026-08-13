import { NormalizedRecord } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';

export interface CashRunwaySummary {
  monthlyBurnRate: number;
  runwayMonths: number;
  dailyVelocity: number;
  annualizedBurn: number;
}

export function calculateCashRunway(records: NormalizedRecord[], cashReserve: number = 50000): CashRunwaySummary {
  const metrics = calculateMetrics(records);
  const totalExp = metrics.totalExpenses || 0;

  // Calculate distinct month span in dataset
  const dates = records.map((r) => r.date).filter(Boolean) as Date[];
  let monthCount = 1;
  if (dates.length >= 2) {
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const diffMonths = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth());
    monthCount = Math.max(1, diffMonths + 1);
  }

  const monthlyBurn = totalExp / monthCount;
  const dailyVel = monthlyBurn / 30;
  const runwayMo = monthlyBurn > 0 ? cashReserve / monthlyBurn : 99;

  return {
    monthlyBurnRate: monthlyBurn,
    runwayMonths: runwayMo,
    dailyVelocity: dailyVel,
    annualizedBurn: monthlyBurn * 12,
  };
}
