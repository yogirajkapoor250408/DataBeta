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
  const dateObjs = records
    .map((r) => (r.date instanceof Date ? r.date : new Date(r.date)))
    .filter((d) => !isNaN(d.getTime()));
  let monthCount = 1;
  if (dateObjs.length >= 2) {
    const minDate = new Date(Math.min(...dateObjs.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dateObjs.map((d) => d.getTime())));
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
