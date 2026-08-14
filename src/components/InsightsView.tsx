import React, { useState, useMemo } from 'react';
import {
  NormalizedRecord,
  Deal,
  Invoice,
  CurrencyCode,
  ProvenanceMetric,
} from '../types';
import {
  calculateGrossMargin,
  calculateWinRate,
  calculateCollectionRate,
  calculateWeightedPipeline,
} from '../utils/provenanceEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  TrendingUp,
  PieChart,
  Users,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';

interface InsightsViewProps {
  records: NormalizedRecord[];
  deals: Deal[];
  invoices: Invoice[];
  currency: CurrencyCode;
  onOpenUpload: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  records,
  deals,
  invoices,
  currency,
  onOpenUpload,
}) => {
  const [selectedMetricForDrilldown, setSelectedMetricForDrilldown] = useState<ProvenanceMetric<any> | null>(null);

  // 1. Gross Margin Metric
  const grossMargin = useMemo(() => calculateGrossMargin(records, currency), [records, currency]);

  // 2. Win Rate Metric
  const winRate = useMemo(() => calculateWinRate(deals), [deals]);

  // 3. Collection Rate Metric
  const collectionRate = useMemo(() => calculateCollectionRate(invoices), [invoices]);

  // 4. Average Deal Size
  const avgDealSize: ProvenanceMetric<number> = useMemo(() => {
    const calculatedAt = new Date().toISOString();
    if (deals.length === 0) {
      return {
        status: 'needs_data',
        value: null,
        formattedValue: 'Not calculated',
        coverage: { records: 0, missingInputs: ['CRM Deals'] },
        assumptions: ['Requires deal records in CRM pipeline.'],
        calculatedAt,
      };
    }
    const total = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avg = total / deals.length;
    return {
      status: 'complete',
      value: avg,
      formattedValue: formatCurrency(avg, currency),
      coverage: { records: deals.length, missingInputs: [] },
      assumptions: [`Computed as (${formatCurrency(total, currency)} total pipeline ÷ ${deals.length} deals).`],
      calculatedAt,
    };
  }, [deals, currency]);

  // 5. Customer Profitability (from records)
  const customerBreakdown = useMemo(() => {
    const map: Record<string, { revenue: number; expense: number; count: number }> = {};
    for (const r of records) {
      const name = (r.customer || 'Direct Client').trim();
      if (!map[name]) map[name] = { revenue: 0, expense: 0, count: 0 };
      if (r.revenue) map[name].revenue += r.revenue;
      if (r.expense) map[name].expense += r.expense;
      map[name].count += 1;
    }

    return Object.entries(map)
      .map(([name, data]) => {
        const netMargin = data.revenue > 0 ? ((data.revenue - data.expense) / data.revenue) * 100 : 0;
        return {
          name,
          revenue: data.revenue,
          expense: data.expense,
          profit: data.revenue - data.expense,
          marginPct: netMargin,
          orders: data.count,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [records]);

  // Render Provenance Coverage Badge
  const renderCoverageBadge = (metric: ProvenanceMetric<any>) => {
    if (metric.status === 'complete') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Complete ({metric.coverage.records} records)
        </span>
      );
    }
    if (metric.status === 'partial') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">
          <Info className="w-3 h-3 text-amber-500" />
          Partial ({metric.coverage.records} records)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3 text-slate-400" />
        Needs Data
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-950 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/60 px-2.5 py-0.5 rounded-full">
              Financial Health & Provenance
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              • Deterministic formulas • Zero speculative scores
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Profitability & Unit Economics
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Every calculation includes data coverage, explicit assumptions, and direct source provenance.
          </p>
        </div>

        {/* 4 Provenance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-900">
          {/* Gross Margin */}
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Gross Operating Margin</span>
              {renderCoverageBadge(grossMargin)}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {grossMargin.formattedValue}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {grossMargin.assumptions[0] || 'Requires uploaded revenue/expense transactions.'}
            </p>
          </div>

          {/* Win Rate */}
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Sales Win Rate</span>
              {renderCoverageBadge(winRate)}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {winRate.formattedValue}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {winRate.assumptions[0] || 'Calculated from closed won vs closed lost deals.'}
            </p>
          </div>

          {/* Collection Rate */}
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Collection Rate</span>
              {renderCoverageBadge(collectionRate)}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {collectionRate.formattedValue}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {collectionRate.assumptions[0] || 'Percentage of invoiced billing collected.'}
            </p>
          </div>

          {/* Average Deal Size */}
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Average Deal Size</span>
              {renderCoverageBadge(avgDealSize)}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {avgDealSize.formattedValue}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {avgDealSize.assumptions[0] || 'Mean value of pipeline opportunities.'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Profitability Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Customer Profitability & Margin Contribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Ranked by total realized revenue and net profit contribution.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-zinc-800 transition-all"
          >
            Import Records
          </button>
        </div>

        {customerBreakdown.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
            <div className="text-sm font-bold text-slate-900 dark:text-white">No customer transactions available</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload a transaction ledger with customer names and revenues to calculate client profitability.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/80 dark:border-zinc-800">
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Orders / Invoices</th>
                  <th className="p-3.5">Gross Revenue</th>
                  <th className="p-3.5">Direct Costs</th>
                  <th className="p-3.5">Net Profit Contribution</th>
                  <th className="p-3.5 text-right">Net Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {customerBreakdown.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{cust.name}</td>
                    <td className="p-3.5 font-mono text-slate-500">{cust.orders}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(cust.revenue, currency)}
                    </td>
                    <td className="p-3.5 font-mono text-rose-600 dark:text-rose-400">
                      {cust.expense > 0 ? formatCurrency(cust.expense, currency) : '—'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(cust.profit, currency)}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-right text-slate-900 dark:text-white">
                      {cust.marginPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
