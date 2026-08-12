import { CurrencyCode, CURRENCIES } from '../types';

export function cleanNumericString(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  let str = String(val).trim();
  if (!str) return null;

  // Remove currency symbols, spaces, letters
  str = str.replace(/[^0-9.,-]/g, '');

  if (!str) return null;

  // Handle European formatting (e.g. 1.250,50 -> 1250.50)
  if (str.includes(',') && str.includes('.')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    // Single comma - if 2 decimals after comma, treat as decimal point
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      str = parts[0] + '.' + parts[1];
    } else {
      str = str.replace(/,/g, '');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

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
