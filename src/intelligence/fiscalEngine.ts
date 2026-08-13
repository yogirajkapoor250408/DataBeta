export interface FiscalConfig {
  startMonth: number; // 1 = Jan, 4 = Apr, 7 = Jul, 10 = Oct, etc.
  startDay: number; // default 1
  labelFormat: 'FY{YYYY_START}-{YY_END}' | 'FY{YYYY_START}' | 'FY{YYYY_END}';
  country?: string;
  currency?: string;
  timezone?: string;
  accountingBasis?: 'cash' | 'accrual';
}

export interface FiscalPeriodMapping {
  transactionDate: Date;
  calendarYear: number;
  calendarQuarter: number;
  calendarMonth: number;
  fiscalYear: number;
  fiscalQuarter: number;
  fiscalMonth: number; // 1 to 12 (Month 1 = Start Month)
  fiscalYearLabel: string;
  fiscalPeriodStart: Date;
  fiscalPeriodEnd: Date;
  daysIntoFiscalYear: number;
  totalDaysInFiscalYear: number;
  fiscalYearCompletionPct: number;
}

export const DEFAULT_FISCAL_CONFIG: FiscalConfig = {
  startMonth: 4, // Default April 1 (India / UK standard)
  startDay: 1,
  labelFormat: 'FY{YYYY_START}-{YY_END}',
  country: 'United States',
  currency: 'USD',
  timezone: 'UTC',
  accountingBasis: 'accrual',
};

/**
 * Authoritative single source of truth for mapping any date to its fiscal year, quarter, month, and period bounds.
 */
export function getFiscalPeriodMapping(
  dateInput: Date | string | number,
  config: FiscalConfig = DEFAULT_FISCAL_CONFIG
): FiscalPeriodMapping {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    const fallbackDate = new Date();
    return getFiscalPeriodMapping(fallbackDate, config);
  }

  const calYear = date.getFullYear();
  const calMonth = date.getMonth() + 1; // 1-12
  const calQuarter = Math.ceil(calMonth / 3);

  const startMonth = Math.max(1, Math.min(12, config.startMonth || 1));
  const startDay = Math.max(1, Math.min(31, config.startDay || 1));

  // Determine Fiscal Year
  let fiscalYearStartYear = calYear;
  if (calMonth < startMonth || (calMonth === startMonth && date.getDate() < startDay)) {
    fiscalYearStartYear = calYear - 1;
  }

  const fiscalYearEndYear = fiscalYearStartYear + 1;

  // Fiscal Month (1 to 12)
  let fiscalMonth = calMonth - startMonth + 1;
  if (fiscalMonth <= 0) {
    fiscalMonth += 12;
  }

  // Fiscal Quarter (1 to 4)
  const fiscalQuarter = Math.ceil(fiscalMonth / 3);

  // Fiscal Year Label Format
  let fiscalYearLabel = `FY${fiscalYearStartYear}`;
  if (config.labelFormat === 'FY{YYYY_START}-{YY_END}') {
    const endYY = String(fiscalYearEndYear).substring(2);
    fiscalYearLabel = `FY${fiscalYearStartYear}–${endYY}`;
  } else if (config.labelFormat === 'FY{YYYY_END}') {
    fiscalYearLabel = `FY${fiscalYearEndYear}`;
  }

  // Fiscal Period Start & End Bounds
  const fiscalPeriodStart = new Date(fiscalYearStartYear, startMonth - 1, startDay);
  const fiscalPeriodEnd = new Date(fiscalYearEndYear, startMonth - 1, startDay - 1, 23, 59, 59, 999);

  // Completion Pct
  const totalMs = Math.max(1, fiscalPeriodEnd.getTime() - fiscalPeriodStart.getTime());
  const elapsedMs = Math.max(0, Math.min(totalMs, date.getTime() - fiscalPeriodStart.getTime()));
  const daysIntoFiscalYear = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const totalDaysInFiscalYear = Math.round(totalMs / (1000 * 60 * 60 * 24));
  const fiscalYearCompletionPct = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

  return {
    transactionDate: date,
    calendarYear: calYear,
    calendarQuarter: calQuarter,
    calendarMonth: calMonth,
    fiscalYear: fiscalYearStartYear,
    fiscalQuarter,
    fiscalMonth,
    fiscalYearLabel,
    fiscalPeriodStart,
    fiscalPeriodEnd,
    daysIntoFiscalYear,
    totalDaysInFiscalYear,
    fiscalYearCompletionPct,
  };
}
