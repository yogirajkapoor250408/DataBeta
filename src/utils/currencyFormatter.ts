import { CurrencyCode, CURRENCIES } from '../types';

export function formatCurrency(amount: number | null | undefined, currencyCode: CurrencyCode = 'USD'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Not enough data';
  }

  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(2)}`;
  }
}

export function formatCompactCurrency(amount: number | null | undefined, currencyCode: CurrencyCode = 'USD'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Not enough data';
  }

  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;

  if (Math.abs(amount) >= 1_000_000) {
    return `${config.symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${config.symbol}${(amount / 1_000).toFixed(1)}k`;
  }

  return formatCurrency(amount, currencyCode);
}
