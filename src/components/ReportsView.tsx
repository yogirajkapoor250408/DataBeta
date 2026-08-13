import React, { useState, useMemo } from 'react';
import { NormalizedRecord, DatasetMeta, CurrencyCode } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateBusinessSummary } from '../utils/summaryEngine';
import { calculateCustomerAnalytics, calculateProductAnalytics } from '../utils/customerProductAnalytics';
import { Printer, Building2, Upload, CheckCircle2, FileText, Download, ShieldCheck, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface ReportsViewProps {
  records: NormalizedRecord[];
  meta: DatasetMeta | null;
  currency: CurrencyCode;
  businessName?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ records, meta, currency, businessName }) => {
  const metrics = useMemo(() => calculateMetrics(records), [records]);
  const observations = useMemo(() => generateBusinessSummary(records), [records]);
  const customerStats = useMemo(() => calculateCustomerAnalytics(records), [records]);
  const productStats = useMemo(() => calculateProductAnalytics(records), [records]);

  const [companyName, setCompanyName] = useState(businessName || 'DataBeta Client Business');
  const [reportTitle, setReportTitle] = useState('Monthly Financial & Operational Report');
  const [executiveNotes, setExecutiveNotes] = useState(
    'This financial executive summary was generated directly from verified transaction records using the DataBeta Intelligence Engine.'
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Category breakdown for P&L
  const categoryBreakdown = useMemo(() => {
    const revMap: Record<string, number> = {};
    const expMap: Record<string, number> = {};

    records.forEach((r) => {
      const cat = r.category || 'General';
      if (r.revenue) revMap[cat] = (revMap[cat] || 0) + r.revenue;
      if (r.expense) expMap[cat] = (expMap[cat] || 0) + r.expense;
    });

    return {
      revenueCategories: Object.entries(revMap).sort((a, b) => b[1] - a[1]),
      expenseCategories: Object.entries(expMap).sort((a, b) => b[1] - a[1]),
    };
  }, [records]);

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
    <div className="space-y-6 animate-fadeIn">
      {/* Report Customizer Controls (Hidden on Print) */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Publication-Grade Reporting</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Executive PDF Report Customizer</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Personalize your business name, report title, company logo, and executive commentary before printing or exporting to PDF.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all text-xs shrink-0 active:scale-95"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-900">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Company / Store Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Report Heading Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Company Logo (Optional)</label>
            <label className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800">
              <span className="truncate">{logoUrl ? 'Change Logo Image' : 'Upload Logo PNG/JPG'}</span>
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Executive Summary Commentary</label>
          <textarea
            rows={2}
            value={executiveNotes}
            onChange={(e) => setExecutiveNotes(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-8 print-page max-w-4xl mx-auto text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Company Logo" className="h-12 w-auto max-w-[160px] object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{companyName}</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{reportTitle}</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono">
            <div><strong className="text-slate-700">Date:</strong> {format(new Date(), 'MMMM d, yyyy')}</div>
            <div><strong className="text-slate-700">Records Analyzed:</strong> {records.length} transactions</div>
            <div><strong className="text-slate-700">Currency:</strong> {currency}</div>
          </div>
        </div>

        {/* Executive Commentary Callout */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
          "{executiveNotes}"
        </div>

        {/* 4 Financial Key Indicators Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Revenue</div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {formatCurrency(metrics.totalRevenue || 0, currency)}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Operating Expense</div>
            <div className="text-xl font-black text-slate-700 font-mono">
              {formatCurrency(metrics.totalExpenses || 0, currency)}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Net Operating Income</div>
            <div className="text-xl font-black text-rose-600 font-mono">
              {formatCurrency(metrics.estimatedProfit || 0, currency)}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Net Profit Margin</div>
            <div className="text-xl font-black text-emerald-600 font-mono">
              {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Profit & Loss Statement Snapshot Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-200">
            Statement of Financial Performance (P&L Snapshot)
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="p-2.5">Line Item Category</th>
                <th className="p-2.5 text-right">Amount ({currency})</th>
                <th className="p-2.5 text-right">% of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="font-bold text-slate-900 bg-slate-50/50">
                <td className="p-2.5">Realized Gross Revenue</td>
                <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                  {formatCurrency(metrics.totalRevenue || 0, currency)}
                </td>
                <td className="p-2.5 text-right font-mono">100.0%</td>
              </tr>

              {categoryBreakdown.revenueCategories.map(([cat, val]) => (
                <tr key={cat} className="text-slate-600">
                  <td className="p-2.5 pl-6">↳ {cat}</td>
                  <td className="p-2.5 text-right font-mono">{formatCurrency(val, currency)}</td>
                  <td className="p-2.5 text-right font-mono text-[11px] text-slate-400">
                    {metrics.totalRevenue ? ((val / metrics.totalRevenue) * 100).toFixed(1) + '%' : '—'}
                  </td>
                </tr>
              ))}

              <tr className="font-bold text-slate-900 bg-slate-50/50">
                <td className="p-2.5">Total Operating Expenses</td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-700">
                  {formatCurrency(metrics.totalExpenses || 0, currency)}
                </td>
                <td className="p-2.5 text-right font-mono">
                  {metrics.totalRevenue && metrics.totalExpenses ? ((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1) + '%' : '—'}
                </td>
              </tr>

              {categoryBreakdown.expenseCategories.map(([cat, val]) => (
                <tr key={cat} className="text-slate-600">
                  <td className="p-2.5 pl-6">↳ {cat}</td>
                  <td className="p-2.5 text-right font-mono">{formatCurrency(val, currency)}</td>
                  <td className="p-2.5 text-right font-mono text-[11px] text-slate-400">
                    {metrics.totalRevenue ? ((val / metrics.totalRevenue) * 100).toFixed(1) + '%' : '—'}
                  </td>
                </tr>
              ))}

              <tr className="font-black text-sm bg-rose-50/60 border-t-2 border-rose-600 text-rose-700">
                <td className="p-3">Net Operating Profit</td>
                <td className="p-3 text-right font-mono font-black">
                  {formatCurrency(metrics.estimatedProfit || 0, currency)}
                </td>
                <td className="p-3 text-right font-mono font-black">
                  {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Strategic Operational Findings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-200">
            Automated Diagnostic Findings
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {observations.slice(0, 4).map((obs, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-snug">{obs.description || obs.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div>Report generated with DataBeta Technologies • Client-Side Deterministic Financial Engine</div>
          <div>Confidential • For Internal Business Management</div>
        </div>
      </div>
    </div>
  );
};
