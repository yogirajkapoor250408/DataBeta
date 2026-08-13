export interface StatisticalSummary {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  coefficientOfVariation: number; // Volatility measure (stdDev / mean)
  min: number;
  max: number;
  p25: number;
  p75: number;
  iqr: number; // Interquartile Range
  zScores: number[];
  modifiedZScores: number[]; // Robust to extreme outliers using MAD
}

/**
 * Advanced Statistical Analysis Engine (Rolling averages, EMA, Z-Score, IQR, MAD, Volatility).
 */
export function calculateStatisticalSummary(values: number[]): StatisticalSummary {
  if (!values || values.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      variance: 0,
      coefficientOfVariation: 0,
      min: 0,
      max: 0,
      p25: 0,
      p75: 0,
      iqr: 0,
      zScores: [],
      modifiedZScores: [],
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Percentiles
  const p25 = sorted[Math.floor(n * 0.25)] || sorted[0];
  const p75 = sorted[Math.floor(n * 0.75)] || sorted[n - 1];
  const iqr = Math.max(0, p75 - p25);

  // Variance & StdDev
  const squaredDiffs = sorted.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (n || 1);
  const stdDev = Math.sqrt(variance);

  // Coefficient of Variation
  const coefficientOfVariation = mean !== 0 ? stdDev / Math.abs(mean) : 0;

  // Standard Z-Scores
  const zScores = values.map((v) => (stdDev > 0 ? (v - mean) / stdDev : 0));

  // Modified Z-Scores using Median Absolute Deviation (MAD)
  const absDeviations = values.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
  const madMid = Math.floor(absDeviations.length / 2);
  const mad = absDeviations.length % 2 !== 0 ? absDeviations[madMid] : (absDeviations[madMid - 1] + absDeviations[madMid]) / 2;

  const modifiedZScores = values.map((v) => (mad > 0 ? (0.6745 * (v - median)) / mad : 0));

  return {
    mean,
    median,
    stdDev,
    variance,
    coefficientOfVariation,
    min: sorted[0],
    max: sorted[n - 1],
    p25,
    p75,
    iqr,
    zScores,
    modifiedZScores,
  };
}

/**
 * Exponential Moving Average (EMA) calculation for smoothing financial trend lines.
 */
export function calculateEMA(values: number[], period: number = 7): number[] {
  if (!values || values.length === 0) return [];
  const k = 2 / (period + 1);
  const emaValues: number[] = [values[0]];

  for (let i = 1; i < values.length; i++) {
    const prevEMA = emaValues[i - 1];
    const currentEMA = values[i] * k + prevEMA * (1 - k);
    emaValues.push(currentEMA);
  }

  return emaValues;
}
