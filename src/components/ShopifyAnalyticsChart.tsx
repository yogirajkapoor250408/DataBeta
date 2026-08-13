import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Layers } from 'lucide-react';

interface ShopifyAnalyticsChartProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
}

type TimeframeOption = '1M' | '3M' | '6M' | 'ALL';

export const ShopifyAnalyticsChart: React.FC<ShopifyAnalyticsChartProps> = ({
  records,
  currency,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('1M');
  const [activeTab, setActiveTab] = useState<'revenue' | 'profit'>('revenue');

  // Intelligent Shopify-style dataset aggregation engine
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    // Filter by timeframe window
    const now = new Date();
    const sorted = [...records].filter((r) => r.date).sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());
    if (sorted.length === 0) return [];

    const minDate = sorted[0].date as Date;
    const maxDate = sorted[sorted.length - 1].date as Date;
    const totalDaysSpan = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Determine granularity: if span <= 45 days or timeframe == '1M', aggregate DAILY/3-DAY
    const isDaily = timeframe === '1M' || totalDaysSpan <= 45;
    const isWeekly = timeframe === '3M' && totalDaysSpan > 45;

    const map: Record<string, { label: string; revenue: number; expense: number; profit: number }> = {};

    sorted.forEach((r) => {
      const d = r.date as Date;
      let key = '';
      let label = '';

      if (isDaily) {
        // Daily key: YYYY-MM-DD -> e.g. "Aug 12"
        key = d.toISOString().substring(0, 10);
        label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (isWeekly) {
        // Weekly key: Year + Week
        const weekNum = Math.ceil(d.getDate() / 7);
        key = `${d.getFullYear()}-W${weekNum}-${d.getMonth()}`;
        label = `${d.toLocaleDateString('en-US', { month: 'short' })} W${weekNum}`;
      } else {
        // Monthly key: YYYY-MM
        key = d.toISOString().substring(0, 7);
        label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      if (!map[key]) {
        map[key] = { label, revenue: 0, expense: 0, profit: 0 };
      }

      const rev = r.revenue || 0;
      const exp = r.expense || 0;
      map[key].revenue += rev;
      map[key].expense += exp;
      map[key].profit += rev - exp;
    });

    const result = Object.values(map);

    // If only 1 data point generated, synthesize start/end bounds so line/area renders continuously
    if (result.length === 1) {
      const single = result[0];
      return [
        { label: 'Start', revenue: 0, expense: 0, profit: 0 },
        single,
      ];
    }

    return result;
  }, [records, timeframe]);

  // Executive summary metrics for chart header
  const totals = useMemo(() => {
    let rev = 0;
    let exp = 0;
    records.forEach((r) => {
      rev += r.revenue || 0;
      exp += r.expense || 0;
    });
    const profit = rev - exp;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;
    return { rev, exp, profit, margin };
  }, [records]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: Revenue & Expense Trend (Shopify Design Standard) */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-4 hover-card-lift transition-all">
        {/* Header with KPI + Timeframe Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-900">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Revenue & Expense Trend</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-800">
                {records.length} records
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totals.rev, currency)}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Gross Income</span>
              </span>
            </div>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-1 rounded-full text-[11px] font-bold font-mono self-start sm:self-auto">
            {(['1M', '3M', '6M', 'ALL'] as TimeframeOption[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  timeframe === tf
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-extrabold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-zinc-600 inline-block" />
            <span>Expense</span>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="shopifyRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="shopifyExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200/80 dark:text-zinc-800/80"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                stroke="#71717a"
                fontSize={11}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="#71717a"
                fontSize={11}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-md text-white border border-slate-700/80 dark:border-zinc-800 p-3 rounded-2xl shadow-xl text-xs space-y-1 font-sans">
                        <div className="font-bold text-slate-300 border-b border-slate-700/80 pb-1 mb-1">{label}</div>
                        <div className="flex justify-between gap-4 font-semibold text-rose-400">
                          <span>Revenue:</span>
                          <span>{formatCurrency(Number(payload[0]?.value || 0), currency)}</span>
                        </div>
                        {payload[1] && (
                          <div className="flex justify-between gap-4 font-semibold text-slate-300">
                            <span>Expense:</span>
                            <span>{formatCurrency(Number(payload[1]?.value || 0), currency)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="#e11d48"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#shopifyRev)"
                activeDot={{ r: 6, stroke: '#e11d48', strokeWidth: 2, fill: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="Expense"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#shopifyExp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Net Profit Trajectory (Shopify Design Standard) */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-4 hover-card-lift transition-all">
        {/* Header with Net Profit KPI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-900">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Net Profit Trajectory</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                {totals.margin.toFixed(1)}% margin
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black tracking-tight ${totals.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
                {formatCurrency(totals.profit, currency)}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Bottom-line earnings
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/60 self-start sm:self-auto">
            <TrendingUp className="w-4 h-4" />
            <span>Health Rating</span>
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Net Profit</span>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="shopifyProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200/80 dark:text-zinc-800/80"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                stroke="#71717a"
                fontSize={11}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="#71717a"
                fontSize={11}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const profitVal = Number(payload[0]?.value || 0);
                    return (
                      <div className="bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-md text-white border border-slate-700/80 dark:border-zinc-800 p-3 rounded-2xl shadow-xl text-xs space-y-1 font-sans">
                        <div className="font-bold text-slate-300 border-b border-slate-700/80 pb-1 mb-1">{label}</div>
                        <div className={`flex justify-between gap-4 font-semibold ${profitVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <span>Net Profit:</span>
                          <span>{formatCurrency(profitVal, currency)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="Profit"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#shopifyProfit)"
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
