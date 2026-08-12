import React, { useState, useMemo } from 'react';
import {
  NormalizedRecord,
  FinancialMetrics,
  DateFilterPreset,
  DateRange,
  BusinessObservation,
  CurrencyCode,
  CRMContact,
  FinancialHealthScorecard,
} from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateBusinessSummary } from '../utils/summaryEngine';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
import { calculateCustomerAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { NaturalQueryBar } from './NaturalQueryBar';
import { GoalTrackerCard } from './GoalTrackerCard';
import {
  TrendingUp,
  Calendar,
  Filter,
  ArrowUpRight,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Mail,
  Bot,
  Sparkles,
  Plus,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

interface DashboardViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onOpenUpload: () => void;
  crmContacts?: CRMContact[];
  onOpenAICopilot?: () => void;
  onNavigateTab?: (tab: 'crm' | 'analytics') => void;
  onAddManualRecord?: (record: NormalizedRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  currency,
  onOpenUpload,
  crmContacts = [],
  onOpenAICopilot,
  onNavigateTab,
  onAddManualRecord,
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('all');
  const [customRange, setCustomRange] = useState<DateRange>({ startDate: null, endDate: null });

  // Rapid Transaction Recorder Form State
  const [showRapidRecorder, setShowRapidRecorder] = useState(false);
  const [recCategory, setRecCategory] = useState('Software');
  const [recProduct, setRecProduct] = useState('');
  const [recCustomer, setRecCustomer] = useState('');
  const [recRevenue, setRecRevenue] = useState<number | ''>('');
  const [recExpense, setRecExpense] = useState<number | ''>('');

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

  const observations: BusinessObservation[] = useMemo(() => {
    return generateBusinessSummary(filteredRecords);
  }, [filteredRecords]);

  const healthScorecard: FinancialHealthScorecard = useMemo(() => {
    return calculateFinancialHealthScore(filteredRecords);
  }, [filteredRecords]);

  const customerStats = useMemo(() => {
    return calculateCustomerAnalytics(filteredRecords);
  }, [filteredRecords]);

  const pipelineSummary = useMemo(() => {
    return calculatePipelineSummary(crmContacts);
  }, [crmContacts]);

  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRev: Record<string, number> = {};
    let maxRev = 0;
    
    filteredRecords.forEach(r => {
      if (r.date && r.revenue) {
        const m = monthNames[r.date.getMonth()];
        monthlyRev[m] = (monthlyRev[m] || 0) + r.revenue;
        if (monthlyRev[m] > maxRev) maxRev = monthlyRev[m];
      }
    });

    // Default to last 6 months for chart display
    const currentMonthIdx = new Date().getMonth();
    const recentMonths: string[] = [];
    for (let i = 5; i >= 0; i--) {
        const idx = (currentMonthIdx - i + 12) % 12;
        recentMonths.push(monthNames[idx]);
    }
    
    return recentMonths.map((m, idx) => {
      const rev = monthlyRev[m] || 0;
      const height = maxRev > 0 ? `${Math.max(5, Math.round((rev / maxRev) * 100))}%` : '5%';
      return { month: m, height, active: idx === recentMonths.length - 1 };
    });
  }, [filteredRecords]);

  // CRM Categorized Lists
  const inTouchContacts = useMemo(() => crmContacts.filter((c) => c.stage === 'in_touch'), [crmContacts]);
  const offerSentContacts = useMemo(() => crmContacts.filter((c) => c.stage === 'offer_sent'), [crmContacts]);
  const discussionContacts = useMemo(() => crmContacts.filter((c) => c.stage === 'discussion'), [crmContacts]);

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recProduct.trim() && !recCustomer.trim()) return;

    const rev = recRevenue !== '' ? Number(recRevenue) : null;
    const exp = recExpense !== '' ? Number(recExpense) : null;
    const prof = rev !== null && exp !== null ? rev - exp : rev;

    const newRec: NormalizedRecord = {
      id: `manual-${Date.now()}`,
      date: new Date(),
      dateString: new Date().toISOString().split('T')[0],
      revenue: rev,
      expense: exp,
      profit: prof,
      category: recCategory,
      product: recProduct || 'Custom Transaction',
      customer: recCustomer || 'Direct Client',
    };

    if (onAddManualRecord) {
      onAddManualRecord(newRec);
    }

    setRecProduct('');
    setRecCustomer('');
    setRecRevenue('');
    setRecExpense('');
    setShowRapidRecorder(false);
  };

  return (
    <div className="space-y-6">
      {/* AI Copilot Quick Banner */}
      {onOpenAICopilot && (
        <div className="bg-zinc-950 text-white p-5 rounded-3xl border border-zinc-800 shadow-xl flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-bold shadow-md shadow-rose-600/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm">Rule-Based Insight Engine</h3>
                <span className="text-[10px] bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase">
                  100% Local Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ask queries about profit margins, tax savings, cost risks, or customer accounts.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAICopilot}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-100 rounded-full font-extrabold text-xs shadow-md transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>Launch Insight Engine</span>
          </button>
        </div>
      )}

      {/* NEW FEATURE 1: 0-100 FINANCIAL HEALTH SCORECARD DIAL */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-zinc-950 text-white border border-zinc-800 flex flex-col items-center justify-center shadow-xl shrink-0 relative">
            <span className="text-2xl font-black text-rose-500">{healthScorecard.score}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">/ 100</span>
            <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
              {healthScorecard.grade}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Business Financial Health Index</h3>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                Grade {healthScorecard.grade}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
              Composite score calculated from profit margins, expense control, volume consistency, and client diversification.
            </p>
          </div>
        </div>

        {/* Sub-Scores Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Margin</div>
            <div className="text-base font-black text-slate-900 dark:text-white">{healthScorecard.marginScore}/30</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Control</div>
            <div className="text-base font-black text-slate-900 dark:text-white">{healthScorecard.expenseControlScore}/25</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Volume</div>
            <div className="text-base font-black text-slate-900 dark:text-white">{healthScorecard.stabilityScore}/25</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Pareto</div>
            <div className="text-base font-black text-slate-900 dark:text-white">{healthScorecard.diversificationScore}/20</div>
          </div>
        </div>
      </div>

      {/* NEW FEATURE 2: INLINE RAPID TRANSACTION RECORDER */}
      <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Rapid Inline Transaction Recorder</h3>
          </div>
          <button
            onClick={() => setShowRapidRecorder(!showRapidRecorder)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-full transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showRapidRecorder ? 'Hide Form' : 'Record Transaction'}</span>
          </button>
        </div>

        {showRapidRecorder && (
          <form onSubmit={handleRecordSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs animate-fadeIn">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
              <select
                value={recCategory}
                onChange={(e) => setRecCategory(e.target.value)}
                className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1.5 font-medium"
              >
                <option value="Software">Software</option>
                <option value="Services">Services</option>
                <option value="Marketing">Marketing</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Product / Item</label>
              <input
                type="text"
                placeholder="Product name"
                value={recProduct}
                onChange={(e) => setRecProduct(e.target.value)}
                className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Customer / Account</label>
              <input
                type="text"
                placeholder="Customer name"
                value={recCustomer}
                onChange={(e) => setRecCustomer(e.target.value)}
                className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Revenue Income ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={recRevenue}
                onChange={(e) => setRecRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Expense Cost ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={recExpense}
                onChange={(e) => setRecExpense(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1.5 font-medium"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full text-xs shadow-md shadow-rose-600/30"
              >
                Add Record
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Natural Language Query Bar */}
      <NaturalQueryBar records={records} currency={currency} />

      {/* Filter Header */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-sm">
          <Filter className="w-4 h-4 text-rose-600" />
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
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    dateFilter === preset
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {labels[preset]}
                </button>
              );
            }
          )}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-zinc-900 p-2 rounded-full border border-slate-200 dark:border-zinc-800">
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
              className="bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1 text-slate-700 dark:text-zinc-200 font-medium focus:outline-none"
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
              className="bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1 text-slate-700 dark:text-zinc-200 font-medium focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* TOP ROW STAT CARDS (Exact Layout from Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: New Customer / Bar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <div className="text-xs font-semibold text-slate-400 dark:text-zinc-500">Total Unique Customers</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{customerStats.totalUniqueCustomers}</span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">/ actively generating revenue</span>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4">
            {chartData.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full rounded-lg transition-all duration-300 ${
                    item.active
                      ? 'bg-rose-600 dark:bg-rose-600 shadow-md shadow-rose-600/30'
                      : 'bg-zinc-900 dark:bg-zinc-800'
                  }`}
                  style={{ height: item.height }}
                />
                <span
                  className={`text-[11px] font-bold ${
                    item.active ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Successful Deals / 5x6 Dot Matrix (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <div className="text-xs font-semibold text-slate-400 dark:text-zinc-500">Successful deals</div>
          </div>

          <div className="my-auto py-2">
            <div className="grid grid-cols-6 gap-2.5 max-w-[220px] mx-auto">
              {Array.from({ length: 30 }).map((_, idx) => {
                const isRed = idx >= Math.round((pipelineSummary.winRatePct / 100) * 30);
                return (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-full transition-all ${
                      isRed ? 'bg-zinc-900 dark:bg-zinc-800' : 'bg-rose-600 shadow-sm shadow-rose-600/40'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{pipelineSummary.winRatePct.toFixed(1)}%</span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">/ win rate</span>
          </div>
        </div>

        {/* Card 3: Pitch Black Pill Cards Stack (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4 justify-between">
          <div className="bg-zinc-950 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between border border-zinc-800">
            <div>
              <div className="text-xs font-semibold text-zinc-400">Total Active Deals</div>
              <div className="text-3xl font-black mt-1">{pipelineSummary.totalDeals}</div>
              <div className="text-[11px] text-zinc-500 font-medium mt-0.5">/ pipeline records</div>
            </div>
            <button
              onClick={() => onNavigateTab?.('crm')}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-zinc-500">Gross Revenue</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatCurrency(metrics.totalRevenue || 0, currency)}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">/ current timeframe</div>
            </div>
            <button
              onClick={() => onNavigateTab?.('analytics')}
              className="w-10 h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Target KPI Goal Tracker */}
      <GoalTrackerCard records={filteredRecords} currency={currency} />

      {/* LOWER SECTION (Matches Crimson Red Action Card + Live CRM Kanban Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Vibrant Crimson Red Action Banner Card (4 Cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-rose-600 via-rose-600 to-rose-700 text-white p-7 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[340px]">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-rose-500/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-4 bottom-4 w-40 h-40 bg-white/10 rounded-3xl transform rotate-45 pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <h3 className="text-2xl font-black leading-snug tracking-tight">
              A new request has been received.
            </h3>
            <p className="text-xs text-rose-100 font-medium max-w-xs leading-relaxed">
              Please process it as soon as possible to keep client accounts synchronized.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <button
              onClick={onOpenUpload}
              className="px-6 py-3 bg-white text-rose-600 hover:bg-rose-50 font-extrabold text-xs rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Open request</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Right: Live Kanban CRM Columns (8 Cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: In Touch */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-zinc-200">
              <span>In Touch</span>
              <span className="text-slate-400 font-mono">/{inTouchContacts.length}</span>
            </div>

            {inTouchContacts.slice(0, 2).map((c) => (
              <div key={c.id} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`font-extrabold px-3 py-0.5 rounded-full text-[10px] ${c.tags.includes('Repeat') ? 'bg-rose-600 text-white' : 'bg-zinc-950 text-white dark:bg-white dark:text-black'}`}>
                    {c.tags[0] || 'New'}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(c.dealValue, currency)}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.company}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight truncate">
                    {c.notes || c.name}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-zinc-900">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{c.lastContactDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {c.commentsCount || 0}</span>
                    <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> {c.attachmentsCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Offer Sent */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-zinc-200">
              <span>Offer Sent</span>
              <span className="text-slate-400 font-mono">/{offerSentContacts.length}</span>
            </div>

            {offerSentContacts.slice(0, 1).map((c) => (
              <div key={c.id} className="bg-zinc-950 text-white p-4 rounded-2xl border border-zinc-800 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="border border-zinc-700 bg-zinc-900 text-zinc-200 font-bold px-3 py-0.5 rounded-full text-[10px]">
                    {c.tags[0] || 'Priority'}
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    {formatCurrency(c.dealValue, currency)}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{c.company}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight truncate">
                    {c.notes || c.name}
                  </p>
                </div>
                <div className="space-y-1 text-[11px] text-zinc-300 pt-1">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Mail className="w-3 h-3" />
                    <span>{c.email}</span>
                  </div>
                  {c.location && (
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <MapPin className="w-3 h-3" />
                      <span>{c.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{c.lastContactDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {c.commentsCount || 0}</span>
                    <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> {c.attachmentsCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: Discussion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-zinc-200">
              <span>Discussion</span>
              <span className="text-slate-400 font-mono">/{discussionContacts.length}</span>
            </div>

            {discussionContacts.slice(0, 2).map((c) => (
              <div key={c.id} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`font-extrabold px-3 py-0.5 rounded-full text-[10px] ${c.tags.includes('Repeat') ? 'bg-rose-600 text-white' : 'bg-zinc-950 text-white dark:bg-white dark:text-black'}`}>
                    {c.tags[0] || 'New'}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(c.dealValue, currency)}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.company}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight truncate">
                    {c.notes || c.name}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-zinc-900">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{c.lastContactDate}</span>
                  </div>
                  <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {c.commentsCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Summary Observations */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <span>Business Summary</span>
              <span className="text-xs bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 font-semibold px-3 py-0.5 rounded-full">
                Rule-Based Analysis
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Automated financial observations calculated directly from your transaction dataset.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {observations.map((obs) => {
            const iconMap = {
              positive: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
              negative: <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
              neutral: <Info className="w-5 h-5 text-slate-600 dark:text-zinc-300 shrink-0 mt-0.5" />,
              info: <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />,
            };

            const bgMap = {
              positive: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40',
              negative: 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40',
              neutral: 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800',
              info: 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800',
            };

            return (
              <div
                key={obs.id}
                className={`p-4 rounded-2xl border text-sm flex items-start gap-3 transition-all ${bgMap[obs.type]}`}
              >
                {iconMap[obs.type]}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{obs.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">{obs.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
