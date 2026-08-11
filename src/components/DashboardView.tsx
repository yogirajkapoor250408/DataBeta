import React, { useState, useMemo } from 'react';
import {
  NormalizedRecord,
  FinancialMetrics,
  DateFilterPreset,
  DateRange,
  BusinessObservation,
  CurrencyCode,
} from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateBusinessSummary } from '../utils/summaryEngine';
import { calculateCashFlowProjections } from '../utils/forecastingEngine';
import { NaturalQueryBar } from './NaturalQueryBar';
import { GoalTrackerCard } from './GoalTrackerCard';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart as PieIcon,
  Percent,
  Receipt,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

interface DashboardViewProps {
  records: NormalizedRecord[];
  isDemo: boolean;
  currency: CurrencyCode;
  onOpenUpload: () => void;
}

const CATEGORY_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#64748b'];

export const DashboardView: React.FC<DashboardViewProps> = ({ records, isDemo, currency, onOpenUpload }) => {
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('all');
  const [customRange, setCustomRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Filter records based on selected date filter
  const filteredRecords = useMemo(() => {
    if (!records || records.length === 0) return [];
    if (dateFilter === 'all') return records;

    const now = new Date();

    if (dateFilter === 'this_month') {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return records.filter((r) => r.date && isWithinInterval(r.date, { start, end }));
    }

    if (dateFilter === 'last_month') {
      const prevMonth = subMonths(now, 1);
      const start = startOfMonth(prevMonth);
      const end = endOfMonth(prevMonth);
      return records.filter((r) => r.date && isWithinInterval(r.date, { start, end }));
    }

    if (dateFilter === 'last_3_months') {
      const start = startOfMonth(subMonths(now, 3));
      const end = endOfMonth(now);
      return records.filter((r) => r.date && isWithinInterval(r.date, { start, end }));
    }

    if (dateFilter === 'custom' && customRange.startDate && customRange.endDate) {
      return records.filter(
        (r) =>
          r.date &&
          isWithinInterval(r.date, {
            start: customRange.startDate!,
            end: customRange.endDate!,
          })
      );
    }

    return records;
  }, [records, dateFilter, customRange]);

  const metrics: FinancialMetrics = useMemo(() => {
    return calculateMetrics(filteredRecords);
  }, [filteredRecords]);

  const cashFlow = useMemo(() => {
    return calculateCashFlowProjections(filteredRecords);
  }, [filteredRecords]);

  const observations: BusinessObservation[] = useMemo(() => {
    return generateBusinessSummary(filteredRecords);
  }, [filteredRecords]);

  const timeSeriesData = useMemo(() => {
    if (filteredRecords.length === 0) return [];

    const monthlyMap: Record<string, { month: string; revenue: number; expense: number; profit: number }> = {};

    const sorted = [...filteredRecords].sort((a, b) => {
      if (!a.date) return -1;
      if (!b.date) return 1;
      return a.date.getTime() - b.date.getTime();
    });

    for (const r of sorted) {
      if (!r.date) continue;
      const key = format(r.date, 'MMM yyyy');
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, revenue: 0, expense: 0, profit: 0 };
      }

      if (r.revenue !== null) monthlyMap[key].revenue += r.revenue;
      if (r.expense !== null) monthlyMap[key].expense += r.expense;
    }

    return Object.values(monthlyMap).map((m) => ({
      ...m,
      profit: m.revenue - m.expense,
    }));
  }, [filteredRecords]);

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    for (const r of filteredRecords) {
      if (r.category) {
        const val = r.revenue || r.expense || 0;
        catMap[r.category] = (catMap[r.category] || 0) + val;
      }
    }

    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  return (
    <div className="space-y-6">
      {/* Natural Language Query Bar */}
      <NaturalQueryBar records={records} currency={currency} />

      {/* Date Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Date Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {(['all', 'this_month', 'last_month', 'last_3_months', 'custom'] as DateFilterPreset[]).map(
            (preset) => {
              const labels: Record<DateFilterPreset, string> = {
                all: 'All Time',
                this_month: 'This Month',
                last_month: 'Last Month',
                last_3_months: 'Last 3 Months',
                custom: 'Custom Range',
              };

              return (
                <button
                  key={preset}
                  onClick={() => setDateFilter(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    dateFilter === preset
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {labels[preset]}
                </button>
              );
            }
          )}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={customRange.startDate ? format(customRange.startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) =>
                setCustomRange((prev) => ({
                  ...prev,
                  startDate: e.target.value ? parseISO(e.target.value) : null,
                }))
              }
              className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 font-medium focus:outline-none"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customRange.endDate ? format(customRange.endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) =>
                setCustomRange((prev) => ({
                  ...prev,
                  endDate: e.target.value ? parseISO(e.target.value) : null,
                }))
              }
              className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 font-medium focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {metrics.hasRevenueData ? formatCurrency(metrics.totalRevenue, currency) : 'Not enough data'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross sales income</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {metrics.hasExpenseData ? formatCurrency(metrics.totalExpenses, currency) : 'Not enough data'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Fixed & variable costs</p>
        </div>

        {/* Estimated Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Estimated Profit</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                (metrics.estimatedProfit || 0) >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl font-bold ${
              metrics.hasProfitData
                ? (metrics.estimatedProfit || 0) >= 0
                  ? 'text-emerald-600'
                  : 'text-rose-600'
                : 'text-slate-900'
            }`}
          >
            {metrics.hasProfitData ? formatCurrency(metrics.estimatedProfit, currency) : 'Not enough data'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Net profit margin</p>
        </div>

        {/* Profit Margin */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Profit Margin</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'Not enough data'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Profit share of revenue</p>
        </div>

        {/* Break-Even Target */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Break-Even Sales</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {metrics.breakEvenRevenue ? formatCurrency(metrics.breakEvenRevenue, currency) : 'Not enough data'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Minimum target sales</p>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Order Value</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {metrics.avgTransactionValue !== null
              ? formatCurrency(metrics.avgTransactionValue, currency)
              : 'Not enough data'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Revenue per sale</p>
        </div>
      </div>

      {/* Target KPI Goal Tracker */}
      <GoalTrackerCard records={filteredRecords} currency={currency} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Financial Performance Over Time</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly revenue, expense, and profit breakdown</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  chartType === 'area' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  chartType === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val), currency)}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val), currency)}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No time-series date entries found.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Category Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Category distribution</p>
          </div>

          <div className="h-60 w-full my-auto">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val), currency)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No category data detected.
              </div>
            )}
          </div>

          {categoryData.length > 0 && (
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {categoryData.slice(0, 4).map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-slate-700 truncate">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 shrink-0">{formatCurrency(cat.value, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Business Summary Observations */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>Business Summary</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-2 py-0.5 rounded-full">
                Rule-Based Analysis
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Automated financial observations calculated directly from your transaction dataset.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {observations.map((obs) => {
            const iconMap = {
              positive: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
              negative: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
              neutral: <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />,
              info: <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />,
            };

            const bgMap = {
              positive: 'bg-emerald-50/60 border-emerald-200/80',
              negative: 'bg-rose-50/60 border-rose-200/80',
              neutral: 'bg-indigo-50/60 border-indigo-200/80',
              info: 'bg-slate-50 border-slate-200',
            };

            return (
              <div
                key={obs.id}
                className={`p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${bgMap[obs.type]}`}
              >
                {iconMap[obs.type]}
                <div>
                  <h4 className="font-bold text-slate-900">{obs.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{obs.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
