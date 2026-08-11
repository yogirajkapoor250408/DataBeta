import React, { useState } from 'react';
import { NormalizedRecord, DatasetMeta, CurrencyCode, ReportBranding } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateBusinessSummary } from '../utils/summaryEngine';
import { detectAnomalies } from '../utils/anomalyDetector';
import { calculateCustomerAnalytics, calculateProductAnalytics } from '../utils/customerProductAnalytics';
import { Printer, Database, Image as ImageIcon, Building, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

interface ReportsViewProps {
  records: NormalizedRecord[];
  meta: DatasetMeta;
  currency: CurrencyCode;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ records, meta, currency }) => {
  const metrics = calculateMetrics(records);
  const observations = generateBusinessSummary(records);
  const anomalies = detectAnomalies(records);
  const customerStats = calculateCustomerAnalytics(records);
  const productStats = calculateProductAnalytics(records);

  const [branding, setBranding] = useState<ReportBranding>({
    companyName: 'My Online Business LLC',
    logoUrl: '',
    executiveNotes: 'Quarterly financial performance review and unit economics evaluation.',
  });

  const [isEditingBranding, setIsEditingBranding] = useState(false);

  const dates = records
    .map((r) => r.date)
    .filter(Boolean)
    .sort((a, b) => a!.getTime() - b!.getTime()) as Date[];

  const startDateStr = dates.length > 0 ? format(dates[0], 'MMM d, yyyy') : 'N/A';
  const endDateStr = dates.length > 0 ? format(dates[dates.length - 1], 'MMM d, yyyy') : 'N/A';

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBranding((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Executive Report Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900">Custom Executive PDF & Print Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add custom company branding, logo, and notes before printing or exporting to PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingBranding(!isEditingBranding)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditingBranding ? 'Close Customizer' : 'Customize Branding'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Branding Editor Panel */}
      {isEditingBranding && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 no-print">
          <h3 className="font-bold text-sm text-indigo-300">Executive Report Customization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Enterprise Name</label>
              <input
                type="text"
                value={branding.companyName}
                onChange={(e) => setBranding((prev) => ({ ...prev, companyName: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Logo (Upload Image)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Executive Notes & Observations</label>
              <textarea
                rows={2}
                value={branding.executiveNotes}
                onChange={(e) => setBranding((prev) => ({ ...prev, executiveNotes: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Printable PDF Report Document Card */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl space-y-8 print-page print-card">
        {/* Header with Custom Logo & Branding */}
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div className="space-y-2">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-12 object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">DataBeta Executive Summary</span>
              </div>
            )}

            <div>
              <h1 className="text-xl font-black text-slate-900">{branding.companyName}</h1>
              <p className="text-xs text-slate-500">Business Data & Financial Performance Report</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-1">
            <p>
              <span className="font-semibold text-slate-800">Source:</span> {meta.fileName}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Period:</span> {startDateStr} – {endDateStr}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Generated:</span> {format(new Date(), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Executive Notes Box */}
        {branding.executiveNotes && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-slate-900 block mb-1">Executive Statement</span>
            <p className="italic leading-relaxed">{branding.executiveNotes}</p>
          </div>
        )}

        {/* Financial Metrics Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Financial Indicators & Key Ratios
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total Revenue</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.hasRevenueData ? formatCurrency(metrics.totalRevenue, currency) : 'Not enough data'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total Expenses</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.hasExpenseData ? formatCurrency(metrics.totalExpenses, currency) : 'Not enough data'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Estimated Net Profit</div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  (metrics.estimatedProfit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {metrics.hasProfitData ? formatCurrency(metrics.estimatedProfit, currency) : 'Not enough data'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Profit Margin</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'Not enough data'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Break-Even Revenue</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {metrics.breakEvenRevenue ? formatCurrency(metrics.breakEvenRevenue, currency) : 'Not enough data'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Average Order Value</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {metrics.avgTransactionValue !== null
                  ? formatCurrency(metrics.avgTransactionValue, currency)
                  : 'Not enough data'}
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Product Highlights Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 mb-1">Customer Intelligence</h4>
            <p className="text-slate-600">Total Unique Clients: {customerStats.totalUniqueCustomers}</p>
            <p className="text-slate-600">Top Account: {customerStats.topCustomerName || 'N/A'}</p>
            <p className="text-slate-600">
              Pareto 80/20 Ratio: {customerStats.paretoRatioPct.toFixed(1)}% revenue from top 20%
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 mb-1">Product Intelligence</h4>
            <p className="text-slate-600">Total Catalog Products: {productStats.totalProducts}</p>
            <p className="text-slate-600">Top Grossing Item: {productStats.topProductByRevenue?.name || 'N/A'}</p>
            <p className="text-slate-600">
              Top Item Revenue: {formatCurrency(productStats.topProductByRevenue?.revenue || 0, currency)}
            </p>
          </div>
        </div>

        {/* Business Observations */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Automated Business Summary
          </h3>

          <div className="space-y-2.5">
            {observations.map((obs) => (
              <div key={obs.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
                <div className="font-bold text-slate-900">{obs.title}</div>
                <div className="text-slate-600 mt-1">{obs.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          Generated automatically by DataBeta v2.0 Pro. All financial calculations evaluated 100% client-side.
        </div>
      </div>
    </div>
  );
};
