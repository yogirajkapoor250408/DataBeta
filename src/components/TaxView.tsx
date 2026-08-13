import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { calculateTaxDeductions } from '../utils/taxEstimator';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  ShieldCheck,
  Printer,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  HelpCircle,
  TrendingDown,
  Clock,
  Layers,
  CheckCircle2,
  Sliders,
  Award,
} from 'lucide-react';

interface TaxViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
}

export const TaxView: React.FC<TaxViewProps> = ({ records, currency }) => {
  const [taxRatePct, setTaxRatePct] = useState<number>(24); // Standard pass-through / small business tax bracket
  const taxSummary = useMemo(() => calculateTaxDeductions(records), [records]);
  const metrics = useMemo(() => calculateMetrics(records), [records]);

  const netIncome = Math.max(0, metrics.estimatedProfit || 0);

  // Recalculate estimated tax liability and savings dynamically based on custom bracket
  const estimatedTaxLiability = useMemo(() => {
    return (netIncome * taxRatePct) / 100;
  }, [netIncome, taxRatePct]);

  const dynamicTaxSavings = useMemo(() => {
    return (taxSummary.totalDeductibleExpense * taxRatePct) / 100;
  }, [taxSummary.totalDeductibleExpense, taxRatePct]);

  // Quarterly Estimated Installments (IRS Form 1040-ES / Safe Harbor)
  const quarterlyInstallment = useMemo(() => {
    return estimatedTaxLiability / 4;
  }, [estimatedTaxLiability]);

  const quarterlyDates = [
    { quarter: 'Q1', dueDate: 'April 15', description: 'Covers Jan 1 – Mar 31 income' },
    { quarter: 'Q2', dueDate: 'June 15', description: 'Covers Apr 1 – May 31 income' },
    { quarter: 'Q3', dueDate: 'September 15', description: 'Covers Jun 1 – Aug 31 income' },
    { quarter: 'Q4', dueDate: 'January 15', description: 'Covers Sep 1 – Dec 31 income' },
  ];

  const handlePrintTaxReport = () => {
    window.print();
  };

  const handleExportTaxCSV = () => {
    if (taxSummary.breakdown.length === 0) return;
    const headers = ['Category Name', 'Schedule C Tax Line', 'Deductibility %', 'Gross Total Expense', 'Deductible Amount'];
    const rows = taxSummary.breakdown.map((r) => [
      `"${r.categoryName.replace(/"/g, '""')}"`,
      `"${r.taxScheduleCategory.replace(/"/g, '""')}"`,
      `${r.deductiblePct}%`,
      r.totalExpense,
      r.estimatedDeduction,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `databeta-schedule-c-tax-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Tax Intelligence & Deductions</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tax Deduction & Schedule C Estimator</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Auto-categorizes tax-deductible operating expenses, projects quarterly estimated payments, and generates CPA-ready deduction schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          <button
            onClick={handleExportTaxCSV}
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-extrabold text-xs rounded-full border border-slate-200 dark:border-zinc-800 flex items-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export for CPA (CSV)</span>
          </button>

          <button
            onClick={handlePrintTaxReport}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-md shadow-rose-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Tax Summary</span>
          </button>
        </div>
      </div>

      {/* Tax Bracket Slider & Customizer */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Effective Tax Rate Bracket</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Select your federal + state business pass-through or corporate rate.</p>
          </div>
          <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-xl">
            {taxRatePct}% Bracket
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
          {[
            { label: '15% (Small Sole Prop)', rate: 15 },
            { label: '21% (C-Corp Flat)', rate: 21 },
            { label: '24% (LLC Standard)', rate: 24 },
            { label: '32% (High Earner)', rate: 32 },
            { label: '37% (Top Bracket)', rate: 37 },
          ].map((b) => (
            <button
              key={b.rate}
              onClick={() => setTaxRatePct(b.rate)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                taxRatePct === b.rate
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Tax Intelligence Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Total Operating Costs
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(taxSummary.totalGrossExpense, currency)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Gross operational outflow</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Deductible Expenses
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(taxSummary.totalDeductibleExpense, currency)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Schedule C eligible costs</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Tax Shield Savings ({taxRatePct}%)
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(dynamicTaxSavings, currency)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Deductions × {taxRatePct}% rate</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Est. Annual Tax Liability
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatCurrency(estimatedTaxLiability, currency)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Based on {formatCurrency(netIncome, currency)} net profit</p>
        </div>
      </div>

      {/* Quarterly Estimated Tax Schedule Table */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Quarterly Estimated Tax Installments</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Recommended IRS Form 1040-ES payment milestones to avoid underpayment penalties.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {formatCurrency(quarterlyInstallment, currency)} / quarter
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quarterlyDates.map((q) => (
            <div
              key={q.quarter}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  {q.quarter} Installment
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{q.dueDate}</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(quarterlyInstallment, currency)}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">{q.description}</p>
            </div>
          ))}
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
                <th className="p-3 text-right">Est. Tax Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {taxSummary.breakdown.length > 0 ? (
                taxSummary.breakdown.map((row) => {
                  const lineSavings = (row.estimatedDeduction * taxRatePct) / 100;
                  return (
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
                      <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400 font-mono">
                        {formatCurrency(lineSavings, currency)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-zinc-500 text-sm">
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
            <span className="font-bold text-slate-800 dark:text-white">Tax Notice: </span>
            This summary provides rule-based deductions and estimated quarterly payment benchmarks for small businesses. Consult a certified CPA or tax attorney for official state and federal filings.
          </div>
        </div>
      </div>
    </div>
  );
};
