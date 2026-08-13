import React, { useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateCustomerAnalytics, calculateProductAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
import { WorkloadWaveCard } from './WorkloadWaveCard';
import { BusinessPlannerCard } from './BusinessPlannerCard';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  GitPullRequest,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onOpenUpload: () => void;
  crmContacts: CRMContact[];
  onNavigateTab: (tab: 'overview' | 'transactions' | 'customers' | 'pipeline' | 'insights') => void;
  onAddManualRecord: (rec: NormalizedRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  currency,
  onOpenUpload,
  crmContacts,
  onNavigateTab,
}) => {
  const metrics = useMemo(() => calculateMetrics(records), [records]);
  const customerStats = useMemo(() => calculateCustomerAnalytics(records), [records]);
  const pipelineStats = useMemo(() => calculatePipelineSummary(crmContacts), [crmContacts]);
  const healthScore = useMemo(() => calculateFinancialHealthScore(records), [records]);

  // Aggregate monthly trend data from records
  const monthlyChartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    const map: Record<string, { revenue: number; expense: number; profit: number }> = {};
    records.forEach((r) => {
      const monthKey = r.dateString ? r.dateString.substring(0, 7) : 'Unknown';
      if (!map[monthKey]) map[monthKey] = { revenue: 0, expense: 0, profit: 0 };
      const rev = r.revenue || 0;
      const exp = r.expense || 0;
      map[monthKey].revenue += rev;
      map[monthKey].expense += exp;
      map[monthKey].profit += rev - exp;
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month,
        Revenue: data.revenue,
        Expense: data.expense,
        Profit: data.profit,
      }));
  }, [records]);

  const primaryInsightText = useMemo(() => {
    if (records.length === 0) return 'Import your first transaction dataset to generate automatic operational insights.';
    if (metrics.profitMargin && metrics.profitMargin >= 25) {
      return `Strong financial performance: Net profit margin of ${metrics.profitMargin.toFixed(1)}% across ${metrics.transactionCount} transactions.`;
    }
    if (customerStats.topCustomerSharePct > 30) {
      return `Concentration notice: Your top client generates ${customerStats.topCustomerSharePct.toFixed(1)}% of total revenue.`;
    }
    return `Operational overview: Total revenue stands at ${formatCurrency(metrics.totalRevenue || 0, currency)}.`;
  }, [records, metrics, customerStats, currency]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Counselor Executive Header Banner */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
            <Zap className="w-4 h-4 text-rose-600" />
            <span>Business Command Center</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Strategic Advisory Briefing
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            {primaryInsightText}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('insights')}
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-extrabold rounded-full transition-all flex items-center gap-2 border border-slate-200 dark:border-zinc-800"
          >
            <span>Deep Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Spreadsheet</span>
          </button>
        </div>
      </div>


      {/* 6 Executive Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-lift transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Revenue</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {metrics.totalRevenue !== null ? formatCurrency(metrics.totalRevenue, currency) : <span className="text-slate-400 dark:text-zinc-600 text-sm font-medium">No data</span>}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{metrics.transactionCount} transactions</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-lift transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Expenses</div>
          <div className="text-xl font-black text-slate-700 dark:text-zinc-300">
            {metrics.totalExpenses !== null ? formatCurrency(metrics.totalExpenses, currency) : <span className="text-slate-400 dark:text-zinc-600 text-sm font-medium">No data</span>}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Operational costs</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-lift transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Net Profit</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-500">
            {metrics.estimatedProfit !== null ? formatCurrency(metrics.estimatedProfit, currency) : <span className="text-slate-400 dark:text-zinc-600 text-sm font-medium">No data</span>}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Bottom line income</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-lift transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Profit Margin</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Margin strength</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-lift transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Unique Customers</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{customerStats.totalUniqueCustomers}</div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Buyer accounts</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-lift transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Open Pipeline</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {formatCurrency(pipelineStats.totalPipelineValue, currency)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{pipelineStats.totalDeals} active deals</p>
        </div>
      </div>

      {/* Primary Highlighted Insight Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Important Insight</div>
            <p className="text-xs text-slate-900 dark:text-white font-medium mt-0.5">{primaryInsightText}</p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('insights')}
          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0 active:scale-95 transition-all"
        >
          <span>Explore All Insights</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Sleek 2-Column Workload & Operational Planner Grid (Inspired by Modern Minimalist UX) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WorkloadWaveCard
          records={records}
          currency={currency}
          onNavigateTab={onNavigateTab}
        />
        <BusinessPlannerCard
          records={records}
          crmDeals={crmContacts}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* Revenue & Profit Charts Section with Minimalist Time-frame Controls */}
      {monthlyChartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Revenue & Expense Trend</h3>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 rounded-full text-[10px] font-bold font-mono">
                <button className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs">1M</button>
                <button className="px-2 py-0.5 rounded-full text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">3M</button>
                <button className="px-2 py-0.5 rounded-full text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">6M</button>
                <button className="px-2 py-0.5 rounded-full text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">1Y</button>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#e11d48" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Net Profit Trajectory</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {/* Top Customers & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions Table */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Transactions</h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-rose-600 dark:text-rose-500 hover:underline flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>View All ({records.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer / Product</th>
                  <th className="p-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {records.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 text-slate-500 dark:text-zinc-400 font-mono">{r.dateString}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{r.customer || r.product || 'Sale'}</td>
                    <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(r.revenue || 0, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers Leaderboard */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Top Customer Accounts</h3>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-bold text-rose-600 dark:text-rose-500 hover:underline flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {customerStats.topCustomersList.slice(0, 5).map((c) => (
              <div
                key={c.name}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-500 font-bold flex items-center justify-center border border-rose-200 dark:border-rose-900/60">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono">{c.orderCount} orders</div>
                  </div>
                </div>

                <div className="text-right font-extrabold text-rose-600 dark:text-rose-500">
                  {formatCurrency(c.totalRevenue, currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
