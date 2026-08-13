import React, { useMemo, useState } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateCustomerAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
import { CashRunwayCard } from './CashRunwayCard';
import { BusinessPlannerCard } from './BusinessPlannerCard';
import { TaxSavingsWidget } from './TaxSavingsWidget';
import { BusinessDiagnosisCard } from './BusinessDiagnosisCard';
import { ProfitLeakCard } from './ProfitLeakCard';
import { ShopifyAnalyticsChart } from './ShopifyAnalyticsChart';
import { CoreTab } from './Navbar';
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
  BarChart3,
  Receipt,
  FileText,
  Settings,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Download,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';

interface DashboardViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onOpenUpload: () => void;
  crmContacts: CRMContact[];
  onNavigateTab: (tab: CoreTab) => void;
  onAddManualRecord: (rec: NormalizedRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  currency,
  onOpenUpload,
  crmContacts,
  onNavigateTab,
  onAddManualRecord,
}) => {
  const metrics = useMemo(() => calculateMetrics(records), [records]);
  const customerStats = useMemo(() => calculateCustomerAnalytics(records), [records]);
  const pipelineStats = useMemo(() => calculatePipelineSummary(crmContacts), [crmContacts]);
  const healthScore = useMemo(() => calculateFinancialHealthScore(records), [records]);

  // Quick Manual Transaction Modal State
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [qType, setQType] = useState<'revenue' | 'expense'>('revenue');
  const [qAmount, setQAmount] = useState<number | ''>(250);
  const [qCategory, setQCategory] = useState('Sales');
  const [qCustomer, setQCustomer] = useState('');
  const [qProduct, setQProduct] = useState('');
  const [qDate, setQDate] = useState(new Date().toISOString().split('T')[0]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(qAmount) || 0;
    if (amt <= 0) return;

    const newRecord: NormalizedRecord = {
      id: `quick-${Date.now()}`,
      date: new Date(qDate),
      dateString: qDate,
      revenue: qType === 'revenue' ? amt : 0,
      expense: qType === 'expense' ? amt : 0,
      profit: qType === 'revenue' ? amt : -amt,
      category: qCategory || (qType === 'revenue' ? 'Sales' : 'Operations'),
      customer: qCustomer.trim() || undefined,
      product: qProduct.trim() || undefined,
      quantity: 1,
    };

    onAddManualRecord(newRecord);
    setShowQuickModal(false);
    setQAmount(250);
    setQCustomer('');
    setQProduct('');
  };

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
      {/* Platform Navigation Pills - Quick Jump to All 8 Feature Modules */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar text-xs font-bold no-print">
        <button
          onClick={() => onNavigateTab('insights')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Intelligence Insights</span>
        </button>

        <button
          onClick={() => onNavigateTab('analytics')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-zinc-800 hover:border-slate-300 active:scale-95 transition-all"
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
          <span>Advanced Analytics</span>
        </button>

        <button
          onClick={() => onNavigateTab('tax')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-zinc-800 hover:border-slate-300 active:scale-95 transition-all"
        >
          <Receipt className="w-3.5 h-3.5 text-amber-500" />
          <span>Tax & Schedule C</span>
        </button>

        <button
          onClick={() => onNavigateTab('reports')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-zinc-800 hover:border-slate-300 active:scale-95 transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          <span>Executive Reports (PDF)</span>
        </button>

        <button
          onClick={() => onNavigateTab('customers')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-zinc-800 hover:border-slate-300 active:scale-95 transition-all"
        >
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          <span>Customer 360</span>
        </button>

        <button
          onClick={() => onNavigateTab('pipeline')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-zinc-800 hover:border-slate-300 active:scale-95 transition-all"
        >
          <GitPullRequest className="w-3.5 h-3.5 text-purple-500" />
          <span>Pipeline CRM</span>
        </button>

        <button
          onClick={() => onNavigateTab('transactions')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-zinc-800 hover:border-slate-300 active:scale-95 transition-all"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          <span>Transaction Ledger</span>
        </button>

        <button
          onClick={() => onNavigateTab('settings')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-zinc-800 hover:border-slate-300 active:scale-95 transition-all"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* Executive Command Header */}
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

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowQuickModal(true)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-extrabold rounded-full transition-all flex items-center gap-2 border border-slate-200 dark:border-zinc-800 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-rose-600" />
            <span>Quick Entry</span>
          </button>
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
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Revenue</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {metrics.totalRevenue !== null ? formatCurrency(metrics.totalRevenue, currency) : <span className="text-slate-400 dark:text-zinc-600 text-sm font-medium">No data</span>}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{metrics.transactionCount} transactions</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Expenses</div>
          <div className="text-xl font-black text-slate-700 dark:text-zinc-300">
            {metrics.totalExpenses !== null ? formatCurrency(metrics.totalExpenses, currency) : <span className="text-slate-400 dark:text-zinc-600 text-sm font-medium">No data</span>}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Operational costs</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Net Profit</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-500">
            {metrics.estimatedProfit !== null ? formatCurrency(metrics.estimatedProfit, currency) : <span className="text-slate-400 dark:text-zinc-600 text-sm font-medium">No data</span>}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Bottom line income</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Profit Margin</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Margin strength</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle transition-all">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Unique Customers</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{customerStats.totalUniqueCustomers}</div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Buyer accounts</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle transition-all">
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
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Deterministic Engine Insight</div>
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

      {/* Automatic Business Diagnosis & Continuous Profit Leak Detector Grid */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BusinessDiagnosisCard records={records} currency={currency} onNavigateTab={onNavigateTab as any} />
          <ProfitLeakCard records={records} currency={currency} onNavigateTab={onNavigateTab as any} />
        </div>
      )}

      {/* 3-Column Action Grid for SMBs: Runway, Action Center, Tax Savings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CashRunwayCard
          records={records}
          currency={currency}
          onNavigateTab={onNavigateTab as any}
        />
        <BusinessPlannerCard
          records={records}
          crmDeals={crmContacts}
          currency={currency}
          onNavigateTab={onNavigateTab as any}
        />
        <TaxSavingsWidget
          records={records}
          currency={currency}
          onNavigateTab={onNavigateTab as any}
        />
      </div>

      {/* Shopify / Stripe Grade Analytics Chart Section */}
      {records.length > 0 && (
        <ShopifyAnalyticsChart records={records} currency={currency} />
      )}

      {/* Top Customers & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions Table */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Transactions</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickModal(true)}
                className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
              <button
                onClick={() => onNavigateTab('transactions')}
                className="text-xs font-bold text-rose-600 dark:text-rose-500 hover:underline flex items-center gap-1 active:scale-95 transition-all"
              >
                <span>View All ({records.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
                {records.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-400 dark:text-zinc-500 text-xs">
                      No records logged yet.
                    </td>
                  </tr>
                )}
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
            {customerStats.topCustomersList.length === 0 && (
              <div className="p-6 text-center text-slate-400 dark:text-zinc-500 text-xs">
                No customer transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Entry Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 relative space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">Log Transaction</h3>
              </div>
              <button
                onClick={() => setShowQuickModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setQType('revenue')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    qType === 'revenue'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  + Income / Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setQType('expense')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    qType === 'expense'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  - Cost / Expense
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={qAmount}
                  onChange={(e) => setQAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={qDate}
                    onChange={(e) => setQDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Consulting, SaaS, Rent"
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Customer / Client</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={qCustomer}
                    onChange={(e) => setQCustomer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Product / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly Retainer"
                    value={qProduct}
                    onChange={(e) => setQProduct(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="px-4 py-2 rounded-full text-slate-500 dark:text-zinc-400 font-bold hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
