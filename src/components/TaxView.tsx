import React from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { calculateTaxDeductions } from '../utils/taxEstimator';
import { formatCurrency } from '../utils/currencyFormatter';
import { ShieldCheck, Printer } from 'lucide-react';

interface TaxViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
}

export const TaxView: React.FC<TaxViewProps> = ({ records, currency }) => {
  const taxSummary = calculateTaxDeductions(records);

  const handlePrintTaxReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-rose-600 via-rose-600 to-rose-700 p-7 rounded-3xl shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-100 uppercase tracking-widest mb-1">
              Tax & Deductible Expense Module
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Tax Deduction & Schedule C Estimator</h2>
            <p className="text-xs text-rose-100 mt-1 max-w-2xl leading-relaxed">
              Auto-categorizes tax-deductible business operating costs to estimate potential year-end tax savings.
            </p>
          </div>

          <button
            onClick={handlePrintTaxReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-full text-xs font-extrabold shadow-md transition-all no-print"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            <span>Print Tax Summary</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
            Total Operating Expenses
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(taxSummary.totalGrossExpense, currency)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Gross deductible candidate expenses</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
            Total Deductible Expenses
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(taxSummary.totalDeductibleExpense, currency)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">100% Schedule C compliant deductions</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
            Estimated Tax Savings (~25% Bracket)
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(taxSummary.estimatedTaxSavings, currency)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Estimated reduction in year-end tax debt</p>
        </div>
      </div>

      {/* Tax Deduction Schedule C Table */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4 print-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Schedule C Tax Deduction Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Categorized according to standard business expense lines</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 dark:border-zinc-800 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-200 font-semibold border-b border-slate-200 dark:border-zinc-800 uppercase tracking-wider">
                <th className="p-3">Expense Category</th>
                <th className="p-3">Tax Schedule Line</th>
                <th className="p-3 text-right">Deductible %</th>
                <th className="p-3 text-right">Gross Total</th>
                <th className="p-3 text-right">Deduction Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {taxSummary.breakdown.length > 0 ? (
                taxSummary.breakdown.map((row) => (
                  <tr key={row.categoryName} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">{row.categoryName}</td>
                    <td className="p-3 text-slate-600 dark:text-zinc-400 font-medium">{row.taxScheduleCategory}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{row.deductiblePct}%</td>
                    <td className="p-3 text-right font-medium text-slate-700 dark:text-zinc-300">
                      {formatCurrency(row.totalExpense, currency)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.estimatedDeduction, currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-zinc-500 text-sm">
                    No expense records found to evaluate for tax deductions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-white">Tax Note: </span>
            This summary provides rule-based estimates for small business financial planning. Consult a certified CPA or tax professional for official tax filings.
          </div>
        </div>
      </div>
    </div>
  );
};
