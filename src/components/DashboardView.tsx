import React, { useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateCustomerAnalytics, calculateProductAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
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
      {/* Overview Top Header Banner */}
      <div className="bg-zinc-950 text-white p-7 rounded-3xl border border-zinc-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">
            Executive Command Center
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Business Overview</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Real-time financial performance metrics, customer count, pipeline revenue, and operational insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('insights')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-extrabold text-xs rounded-full transition-all"
          >
            <Zap className="w-4 h-4 text-rose-500" />
            <span>View Insights</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-lg shadow-rose-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* 6 Executive Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Revenue</div>
          <div className="text-xl font-black text-white">
            {formatCurrency(metrics.totalRevenue || 0, currency)}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">{metrics.transactionCount} transactions</p>
        </div>

        <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Expenses</div>
          <div className="text-xl font-black text-zinc-300">
            {formatCurrency(metrics.totalExpenses || 0, currency)}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Operational costs</p>
        </div>

        <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Net Profit</div>
          <div className="text-xl font-black text-rose-500">
            {formatCurrency(metrics.estimatedProfit || 0, currency)}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Bottom line income</p>
        </div>

        <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Profit Margin</div>
          <div className="text-xl font-black text-emerald-400">
            {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Margin strength</p>
        </div>

        <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unique Customers</div>
          <div className="text-xl font-black text-white">{customerStats.totalUniqueCustomers}</div>
          <p className="text-[10px] text-zinc-500 font-mono">Buyer accounts</p>
        </div>

        <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Open Pipeline</div>
          <div className="text-xl font-black text-white">
            {formatCurrency(pipelineStats.totalPipelineValue, currency)}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">{pipelineStats.totalDeals} active deals</p>
        </div>
      </div>

      {/* Primary Highlighted Insight Banner */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-600/40 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Important Insight</div>
            <p className="text-xs text-white font-medium mt-0.5">{primaryInsightText}</p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('insights')}
          className="text-xs font-bold text-rose-400 hover:text-white flex items-center gap-1 shrink-0"
        >
          <span>Explore All Insights</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Revenue & Profit Charts Section */}
      {monthlyChartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-white text-base">Revenue & Expense Trend</h3>
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

          <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-white text-base">Net Profit Trajectory</h3>
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
        <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Recent Transactions</h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1"
            >
              <span>View All ({records.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto border border-zinc-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-zinc-400 font-bold uppercase text-[10px] border-b border-zinc-800">
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer / Product</th>
                  <th className="p-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {records.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/50">
                    <td className="p-3 text-zinc-400 font-mono">{r.dateString}</td>
                    <td className="p-3 font-medium text-white">{r.customer || r.product || 'Sale'}</td>
                    <td className="p-3 text-right font-extrabold text-emerald-400">
                      {formatCurrency(r.revenue || 0, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers Leaderboard */}
        <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Top Customer Accounts</h3>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {customerStats.topCustomersList.slice(0, 5).map((c) => (
              <div
                key={c.name}
                className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-600/20 text-rose-500 font-bold flex items-center justify-center border border-rose-600/30">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{c.orderCount} orders</div>
                  </div>
                </div>

                <div className="text-right font-extrabold text-rose-500">
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
