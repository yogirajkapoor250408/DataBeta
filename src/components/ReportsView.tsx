import React, { useState } from 'react';
import { NormalizedRecord, DatasetMeta, CurrencyCode } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateBusinessSummary } from '../utils/summaryEngine';
import { Printer, Building2, Upload, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ReportsViewProps {
  records: NormalizedRecord[];
  meta: DatasetMeta | null;
  currency: CurrencyCode;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ records, meta, currency }) => {
  const metrics = calculateMetrics(records);
  const observations = generateBusinessSummary(records);

  const [companyName, setCompanyName] = useState('My Online Business');
  const [executiveNotes, setExecutiveNotes] = useState(
    'This financial summary report was generated directly from operational transaction data using DataBeta local analytics.'
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Customizer Controls (Hidden on Print) */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Custom Executive PDF Report Customizer</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Personalize your business name, logo, and notes before printing or exporting to PDF.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all text-xs shrink-0"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Report / Save as PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-900">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Company / Store Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Company Logo (Optional)</label>
            <label className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Executive Notes</label>
            <textarea
              rows={1}
              value={executiveNotes}
              onChange={(e) => setExecutiveNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6 print-page max-w-4xl mx-auto text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Company Logo" className="h-12 w-auto max-w-[150px] object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{companyName}</h1>
              <p className="text-xs text-slate-500">Executive Financial Performance Summary</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Report Date: {format(new Date(), 'yyyy-MM-dd')}</div>
            <div>Source File: {meta?.fileName || 'DataBeta Export'}</div>
            <div>Records Evaluated: {records.length}</div>
          </div>
        </div>

        {/* Executive Notes */}
        {executiveNotes && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
            "{executiveNotes}"
          </div>
        )}

        {/* Key KPI Summary Grid */}
        <div className="grid grid-cols-4 gap-4 print-card p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {metrics.hasRevenueData ? formatCurrency(metrics.totalRevenue, currency) : 'N/A'}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Expenses</span>
            <div className="text-lg font-black text-rose-600 mt-0.5">
              {metrics.hasExpenseData ? formatCurrency(metrics.totalExpenses, currency) : 'N/A'}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Net Profit</span>
            <div className={`text-lg font-black mt-0.5 ${(metrics.estimatedProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {metrics.hasProfitData ? formatCurrency(metrics.estimatedProfit, currency) : 'N/A'}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Profit Margin</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Executive Observations List */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Key Business Observations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {observations.map((obs) => (
              <div key={obs.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{obs.title}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{obs.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report Footer */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div>Generated by DataBeta Business Intelligence Platform</div>
          <div>Confidential & Proprietary</div>
        </div>
      </div>
    </div>
  );
};
