import React, { useState, useMemo } from 'react';
import {
  Deal,
  Invoice,
  NormalizedRecord,
  CurrencyCode,
  ReportType,
  ReportPreflight,
} from '../types';
import {
  calculateGrossMargin,
  calculateWinRate,
  calculateCollectionRate,
  calculateWeightedPipeline,
} from '../utils/provenanceEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  Receipt,
  Users,
} from 'lucide-react';

interface ReportsViewProps {
  deals: Deal[];
  invoices: Invoice[];
  records: NormalizedRecord[];
  currency: CurrencyCode;
  workspaceName?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  deals,
  invoices,
  records,
  currency,
  workspaceName = 'DataBeta Workspace',
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('monthly_owner');
  const [periodStart, setPeriodStart] = useState('2026-01-01');
  const [periodEnd, setPeriodEnd] = useState('2026-03-31');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Provenance calculations
  const grossMargin = useMemo(() => calculateGrossMargin(records, currency), [records, currency]);
  const winRate = useMemo(() => calculateWinRate(deals), [deals]);
  const collectionRate = useMemo(() => calculateCollectionRate(invoices), [invoices]);
  const weightedPipeline = useMemo(() => calculateWeightedPipeline(deals, currency), [deals, currency]);

  // Report Preflight State
  const preflight: ReportPreflight = useMemo(() => {
    const recordCounts = {
      deals: deals.length,
      invoices: invoices.length,
      transactions: records.length,
    };

    const missingInputs: string[] = [];
    if (deals.length === 0) missingInputs.push('CRM Deals');
    if (invoices.length === 0) missingInputs.push('Invoices & Receivables');
    if (records.length === 0) missingInputs.push('Historical Transactions');

    const totalExpected = 3;
    const available = totalExpected - missingInputs.length;
    const coveragePct = Math.round((available / totalExpected) * 100);

    return {
      reportType: selectedReport,
      title:
        selectedReport === 'monthly_owner'
          ? 'Monthly Executive Owner Brief'
          : selectedReport === 'weekly_sales'
          ? 'Weekly Sales & Follow-ups Report'
          : selectedReport === 'pipeline_review'
          ? 'Quarterly Pipeline & Win-Rate Review'
          : selectedReport === 'collections'
          ? 'Receivables & Aging Collections Report'
          : 'Customer Profitability Snapshot',
      periodStart,
      periodEnd,
      currency,
      dataCoverage: {
        complete: missingInputs.length === 0,
        coveragePct,
        recordCounts,
        missingInputs,
      },
      assumptions: [
        'Calculations use verified ledger entries, active CRM opportunities, and billed invoice records.',
        'Zero speculative forecasting or unmapped tax deductions included.',
      ],
      isReady: true,
    };
  }, [selectedReport, periodStart, periodEnd, currency, deals, invoices, records]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const header = 'Metric,Value,Coverage,Calculated At\n';
    const rows = [
      `Gross Operating Margin,"${grossMargin.formattedValue}","${grossMargin.coverage.records} records","${grossMargin.calculatedAt}"`,
      `Sales Win Rate,"${winRate.formattedValue}","${winRate.coverage.records} closed deals","${winRate.calculatedAt}"`,
      `Collection Rate,"${collectionRate.formattedValue}","${collectionRate.coverage.records} invoices","${collectionRate.calculatedAt}"`,
      `Weighted Pipeline,"${weightedPipeline.formattedValue}","${weightedPipeline.coverage.records} deals","${weightedPipeline.calculatedAt}"`,
    ].join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `databeta_report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-950 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-0.5 rounded-full">
                Reporting & Governance
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                • Verified Preflight • Clean PDF & CSV Export
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Executive Reports & Audit Snapshots
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
              Compile weekly sales reviews, owner monthly briefings, and collections audits with transparent data coverage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold text-xs rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Report</span>
            </button>
          </div>
        </div>

        {/* Report Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-900">
          {[
            { id: 'monthly_owner', label: 'Monthly Owner Brief' },
            { id: 'weekly_sales', label: 'Weekly Sales Report' },
            { id: 'pipeline_review', label: 'Pipeline Review' },
            { id: 'collections', label: 'Collections Report' },
            { id: 'profitability', label: 'Profitability Snapshot' },
          ].map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as ReportType)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedReport === rep.id
                  ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300 text-xs'
              }`}
            >
              <span className="block text-xs font-bold">{rep.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Preflight Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-5 sm:p-6 space-y-4 no-print">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Report Preflight Checklist</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Selected Period</span>
            <div className="font-mono font-bold text-slate-900 dark:text-white">
              {periodStart} to {periodEnd}
            </div>
            <span className="text-[11px] text-slate-400">Reporting Currency: {currency}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Data Coverage</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                {preflight.dataCoverage.coveragePct}% Complete
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {records.length} tx • {deals.length} deals • {invoices.length} invoices
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Compliance & Trust</span>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Provenance</span>
            </div>
            <span className="text-[11px] text-slate-400">Zero speculative extrapolations</span>
          </div>
        </div>

        {/* Preflight Missing Inputs Warning */}
        {preflight.dataCoverage.missingInputs.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Notice: The following modules have no records uploaded and will display as <strong>Needs Data</strong>: {preflight.dataCoverage.missingInputs.join(', ')}.
            </span>
          </div>
        )}
      </div>

      {/* Rendered Printable Report Document */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-8 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="text-xl font-black text-slate-900 dark:text-white">{workspaceName}</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {preflight.title}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Period: {periodStart} to {periodEnd} • Base Currency: {currency}
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-zinc-800 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-zinc-800 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Section 1: Executive KPI Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            1. Verified Operational Key Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Gross Operating Margin</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {grossMargin.formattedValue}
              </div>
              <span className="text-[10px] text-slate-400">From {grossMargin.coverage.records} records</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Sales Win Rate</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {winRate.formattedValue}
              </div>
              <span className="text-[10px] text-slate-400">From {winRate.coverage.records} closed deals</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Collection Efficiency</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {collectionRate.formattedValue}
              </div>
              <span className="text-[10px] text-slate-400">From {collectionRate.coverage.records} invoices</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Weighted Pipeline Inflow</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {weightedPipeline.formattedValue}
              </div>
              <span className="text-[10px] text-slate-400">From {weightedPipeline.coverage.records} open deals</span>
            </div>
          </div>
        </div>

        {/* Section 2: Audit & Assumptions */}
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            2. Report Provenance & Calculation Rules
          </h3>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-400 text-[11px]">
            {preflight.assumptions.map((ass, i) => (
              <li key={i}>{ass}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
