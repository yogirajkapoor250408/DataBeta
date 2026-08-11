import React from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { calculateTaxDeductions } from '../utils/taxEstimator';
import { formatCurrency } from '../utils/currencyFormatter';
import { ShieldCheck, FileCheck, DollarSign, Calculator, Download, Printer } from 'lucide-react';

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
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 p-6 rounded-2xl border border-emerald-800/40 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
              Tax & Deductible Expense Module
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Tax Deduction & Schedule C Estimator</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Auto-categorizes tax-deductible business operating costs to estimate potential year-end tax savings.
            </p>
          </div>

          <button
            onClick={handlePrintTaxReport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all no-print"
          >
            <Printer className="w-4 h-4" />
            <span>Print Tax Summary</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            Total Operating Expenses
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(taxSummary.totalGrossExpense, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross deductible candidate expenses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            Total Deductible Expenses
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(taxSummary.totalDeductibleExpense, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% Schedule C compliant deductions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            Estimated Tax Savings (~25% Bracket)
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {formatCurrency(taxSummary.estimatedTaxSavings, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Estimated reduction in year-end tax debt</p>
        </div>
      </div>

      {/* Tax Deduction Schedule C Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Schedule C Tax Deduction Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Categorized according to standard business expense lines</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="p-3">Expense Category</th>
                <th className="p-3">Tax Schedule Line</th>
                <th className="p-3 text-right">Deductible %</th>
                <th className="p-3 text-right">Gross Total</th>
                <th className="p-3 text-right">Deduction Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taxSummary.breakdown.length > 0 ? (
                taxSummary.breakdown.map((row) => (
                  <tr key={row.categoryName} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">{row.categoryName}</td>
                    <td className="p-3 text-slate-600 font-medium">{row.taxScheduleCategory}</td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-600">{row.deductiblePct}%</td>
                    <td className="p-3 text-right font-medium text-slate-700">
                      {formatCurrency(row.totalExpense, currency)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      {formatCurrency(row.estimatedDeduction, currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                    No expense records found to evaluate for tax deductions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Tax Note: </span>
            This summary provides rule-based estimates for small business financial planning. Consult a certified CPA or tax professional for official tax filings.
          </div>
        </div>
      </div>
    </div>
  );
};
