import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, BarChart2, LineChart } from 'lucide-react';

interface ShopifyAnalyticsChartProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
}

type TimeframeOption = '1M' | '3M' | '6M' | 'ALL';
type ChartType = 'area' | 'bar';

export const ShopifyAnalyticsChart: React.FC<ShopifyAnalyticsChartProps> = ({
  records,
  currency,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('ALL');
  const [chartType, setChartType] = useState<ChartType>('area');

  // Smart Dataset Aggregation
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    const sorted = [...records]
      .filter((r) => r.date)
      .map((r) => ({
        ...r,
        parsedDate: r.date instanceof Date ? r.date : new Date(r.date),
      }))
      .filter((r) => !isNaN(r.parsedDate.getTime()))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    if (sorted.length === 0) return [];

    const dateMap: Record<string, { label: string; revenue: number; expense: number; profit: number; rawDate: Date }> = {};

    sorted.forEach((r) => {
      const d = r.parsedDate;
      const key = d.toISOString().substring(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!dateMap[key]) {
        dateMap[key] = { label, revenue: 0, expense: 0, profit: 0, rawDate: d };
      }

      const rev = r.revenue || 0;
      const exp = r.expense || 0;
      dateMap[key].revenue += rev;
      dateMap[key].expense += exp;
      dateMap[key].profit += rev - exp;
    });

    const entries = Object.values(dateMap);

    // If only 1-2 distinct dates exist, synthesize a smooth horizon
    if (entries.length <= 2) {
      const singleDate = entries[0].rawDate;
      const year = singleDate.getFullYear();
      const month = singleDate.getMonth();
      const targetDay = singleDate.getDate();

      const horizonDays = [1, 5, 9, 13, 17, 21, 25, 28];
      return horizonDays.map((day) => {
        const syntheticDate = new Date(year, month, day);
        const label = syntheticDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (day === targetDay || (targetDay >= day && targetDay < day + 4)) {
          return entries[0];
        }

        return {
          label,
          revenue: 0,
          expense: 0,
          profit: 0,
          rawDate: syntheticDate,
        };
      });
    }

    return entries;
  }, [records, timeframe]);

  // Totals calculations
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
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-zinc-900">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {formatCurrency(totals.rev, currency)}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{totals.margin.toFixed(1)}% margin</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
            Gross realized revenue vs. operating expenditures
          </p>
        </div>

        {/* Quiet Minimalist Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {/* Chart Type */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-800">
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-md transition-colors touch-manipulation ${
                chartType === 'area'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
              title="Area Trend"
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-md transition-colors touch-manipulation ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
              title="Bar Breakdown"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeframe */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-800 text-[10px] sm:text-[11px] font-mono font-semibold">
            {(['1M', '3M', '6M', 'ALL'] as TimeframeOption[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 sm:px-2 py-1 rounded-md transition-colors touch-manipulation ${
                  timeframe === tf
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Indicators */}
      <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-600" />
          <span className="font-semibold text-slate-700 dark:text-zinc-300">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600" />
          <span>Expenses</span>
        </div>
      </div>

      {/* Responsive Canvas Height (h-56 on phone, h-64 on tablet, h-76 on desktop) */}
      <div className="h-52 sm:h-64 lg:h-76 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="heroRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="heroExpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200/60 dark:text-zinc-800/60" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#71717a" fontSize={10} tickMargin={6} />
              <YAxis axisLine={false} tickLine={false} stroke="#71717a" fontSize={10} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-md text-white border border-slate-700/80 dark:border-zinc-800 p-2.5 sm:p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans">
                        <div className="font-bold text-slate-300 border-b border-slate-700/80 pb-1 mb-1">{label}</div>
                        <div className="flex justify-between gap-3 font-semibold text-rose-400">
                          <span>Revenue:</span>
                          <span className="font-mono">{formatCurrency(Number(payload[0]?.value || 0), currency)}</span>
                        </div>
                        {payload[1] && (
                          <div className="flex justify-between gap-3 font-semibold text-slate-300">
                            <span>Expense:</span>
                            <span className="font-mono">{formatCurrency(Number(payload[1]?.value || 0), currency)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#heroRevGrad)" activeDot={{ r: 4, stroke: '#e11d48', strokeWidth: 2, fill: '#fff' }} />
              <Area type="monotone" dataKey="expense" stroke="#64748b" strokeWidth={1.5} fillOpacity={1} fill="url(#heroExpGrad)" />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200/60 dark:text-zinc-800/60" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#71717a" fontSize={10} tickMargin={6} />
              <YAxis axisLine={false} tickLine={false} stroke="#71717a" fontSize={10} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-md text-white border border-slate-700/80 dark:border-zinc-800 p-2.5 sm:p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans">
                        <div className="font-bold text-slate-300 border-b border-slate-700/80 pb-1 mb-1">{label}</div>
                        <div className="flex justify-between gap-3 font-semibold text-rose-400">
                          <span>Revenue:</span>
                          <span className="font-mono">{formatCurrency(Number(payload[0]?.value || 0), currency)}</span>
                        </div>
                        {payload[1] && (
                          <div className="flex justify-between gap-3 font-semibold text-slate-300">
                            <span>Expense:</span>
                            <span className="font-mono">{formatCurrency(Number(payload[1]?.value || 0), currency)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" fill="#e11d48" radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" fill="#64748b" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
