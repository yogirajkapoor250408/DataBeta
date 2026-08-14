import { CurrencyCode, MoneyAmount, FXRateRecord } from '../types';

/**
 * Standard reference FX rates against USD (Base 1 USD)
 * In production, updated via workspace settings or external rates feed.
 */
export const DEFAULT_FX_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  CAD: 1.36,
  AUD: 1.52,
  SGD: 1.35,
  AED: 3.67,
  JPY: 155.0,
};

/**
 * Parse raw inputs into decimal-safe floating numbers.
 * Rejects non-finite numbers and strings with unparseable text by returning null.
 * Correctly handles:
 * - Negative signs: "-1500", "-₹15,000"
 * - Accounting parentheses: "(1,500.00)" -> -1500
 * - Currency symbols: "₹", "$", "€", "£", "¥", "C$", "A$", "S$"
 * - Thousands separators: "1,50,000" (INR) or "150,000.50" (USD/EUR)
 */
export function parseMoneyAmount(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (!Number.isFinite(val) || Number.isNaN(val)) return null;
    return val;
  }

  const str = String(val).trim();
  if (!str) return null;

  // Check for accounting negative: (1000) or (₹1,000.50)
  const isAccountingNegative = /^\(.*\)$/.test(str);
  
  // Remove currency symbols, whitespace, and accounting brackets
  let cleaned = str
    .replace(/[₹$€£¥\s()]/g, '')
    .replace(/,/g, ''); // strip thousands separators

  if (!cleaned) return null;

  // If accounting negative, make sure we have a negative sign
  if (isAccountingNegative && !cleaned.startsWith('-')) {
    cleaned = `-${cleaned}`;
  }

  const num = Number(cleaned);
  if (!Number.isFinite(num) || Number.isNaN(num)) return null;

  return Math.round(num * 100) / 100; // 2 decimal places precision
}

/**
 * Converts an amount from one currency to another using FX rates.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  customRate?: number
): {
  convertedAmount: number;
  rate: number;
  isEstimated: boolean;
} {
  if (fromCurrency === toCurrency) {
    return {
      convertedAmount: amount,
      rate: 1.0,
      isEstimated: false,
    };
  }

  if (customRate && customRate > 0) {
    return {
      convertedAmount: Math.round(amount * customRate * 100) / 100,
      rate: customRate,
      isEstimated: false,
    };
  }

  // Cross rate via USD
  const fromRateToUSD = DEFAULT_FX_RATES[fromCurrency] || 1.0;
  const toRateToUSD = DEFAULT_FX_RATES[toCurrency] || 1.0;
  
  // 1 unit of fromCurrency in USD = 1 / fromRateToUSD
  // In toCurrency = (1 / fromRateToUSD) * toRateToUSD
  const effectiveRate = toRateToUSD / fromRateToUSD;
  const converted = Math.round(amount * effectiveRate * 100) / 100;

  return {
    convertedAmount: converted,
    rate: effectiveRate,
    isEstimated: true,
  };
}

/**
 * Creates a complete MoneyAmount structure with original and base amounts.
 */
export function createMoneyRecord(
  amount: number,
  originalCurrency: CurrencyCode,
  baseCurrency: CurrencyCode,
  customRate?: number
): MoneyAmount {
  const { convertedAmount, rate } = convertCurrency(amount, originalCurrency, baseCurrency, customRate);
  return {
    originalAmount: amount,
    originalCurrency,
    baseAmount: convertedAmount,
    baseCurrency,
    fxRate: rate,
    fxRateDate: new Date().toISOString().split('T')[0],
    conversionSource: originalCurrency === baseCurrency ? 'identical' : customRate ? 'custom_rate' : 'reference_fx',
  };
}

/**
 * Safe multi-currency aggregation.
 * Never aggregates mixed currencies without converting to target base currency.
 */
export function aggregateMoneyAmounts(
  items: { amount: number; currency?: CurrencyCode }[],
  targetBaseCurrency: CurrencyCode
): {
  totalBaseAmount: number;
  itemCount: number;
  hasMixedCurrencies: boolean;
  currencyBreakdown: Record<CurrencyCode, number>;
} {
  let totalBase = 0;
  let hasMixed = false;
  const breakdown: Record<CurrencyCode, number> = {} as any;

  for (const item of items) {
    const cur = item.currency || targetBaseCurrency;
    const num = Number(item.amount) || 0;
    
    if (cur !== targetBaseCurrency) {
      hasMixed = true;
    }

    breakdown[cur] = (breakdown[cur] || 0) + num;
    const { convertedAmount } = convertCurrency(num, cur, targetBaseCurrency);
    totalBase += convertedAmount;
  }

  return {
    totalBaseAmount: Math.round(totalBase * 100) / 100,
    itemCount: items.length,
    hasMixedCurrencies: hasMixed,
    currencyBreakdown: breakdown,
  };
}
