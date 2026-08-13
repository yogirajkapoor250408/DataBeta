import React, { useMemo, useState } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateCustomerAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
import { scanProfitLeaks } from '../intelligence/profitLeakEngine';
import { calculateCashRunway } from '../intelligence/cashRunwayEngine';
import { ShopifyAnalyticsChart } from './ShopifyAnalyticsChart';
import { CoreTab } from './Navbar';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  GitPullRequest,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
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
  const profitLeaks = useMemo(() => scanProfitLeaks(records, currency), [records, currency]);
  const runway = useMemo(() => calculateCashRunway(records), [records]);

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

  // Top critical attention items
  const attentionItems = useMemo(() => {
    const items: {
      id: string;
      type: 'leak' | 'deal' | 'risk' | 'opportunity';
      title: string;
      subtitle: string;
      actionText: string;
      actionTab: CoreTab;
      severity: 'critical' | 'warning' | 'opportunity';
    }[] = [];

    // 1. Critical profit leaks
    if (profitLeaks.leaks.length > 0) {
      const topLeak = profitLeaks.leaks[0];
      items.push({
        id: 'top-leak',
        type: 'leak',
        title: `Profit Leak: ${topLeak.title}`,
        subtitle: `${topLeak.description} (Annualized drain: ${formatCurrency(topLeak.monthlyLeakAmount * 12, currency)})`,
        actionText: 'Review Leak Fix',
        actionTab: 'insights',
        severity: 'critical',
      });
    }

    // 2. High-value closing opportunities
    const hotDeals = crmContacts.filter((c) => c.stage === 'proposal' || c.stage === 'negotiation');
    if (hotDeals.length > 0) {
      const deal = hotDeals[0];
      items.push({
        id: 'hot-deal',
        type: 'deal',
        title: `Pending Close: ${deal.company || deal.name}`,
        subtitle: `Deal value ${formatCurrency(deal.dealValue, currency)} in ${deal.stage.toUpperCase()} stage. Follow-up required.`,
        actionText: 'Open CRM Pipeline',
        actionTab: 'crm',
        severity: 'opportunity',
      });
    }

    // 3. Customer Concentration Risk
    if (customerStats.topCustomerSharePct > 25 && customerStats.topCustomerName) {
      items.push({
        id: 'customer-risk',
        type: 'risk',
        title: `Customer Concentration: ${customerStats.topCustomerSharePct.toFixed(1)}% Revenue Share`,
        subtitle: `${customerStats.topCustomerName} generates over a quarter of total revenue. Diversify client acquisition.`,
        actionText: 'View CRM Contacts',
        actionTab: 'crm',
        severity: 'warning',
      });
    }

    // 4. Working Capital / Runway Alert
    if (runway.runwayMonths < 4 && runway.runwayMonths > 0) {
      items.push({
        id: 'runway-alert',
        type: 'risk',
        title: `Cash Runway: ${runway.runwayMonths.toFixed(1)} Months Remaining`,
        subtitle: `Based on trailing 30-day burn rate of ${formatCurrency(runway.monthlyBurnRate, currency)}/mo.`,
        actionText: 'Inspect Runway',
        actionTab: 'insights',
        severity: 'critical',
      });
    }

    return items.slice(0, 3);
  }, [profitLeaks, crmContacts, customerStats, runway, currency]);

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full">
              Live Business Health Grade: {healthScore.grade} ({healthScore.score}/100)
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              • {metrics.transactionCount} records synchronized
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Command Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Continuous deterministic briefing on operational health, revenue trajectory, and immediate daily priorities.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowQuickModal(true)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-extrabold rounded-full transition-all flex items-center gap-2 border border-slate-200 dark:border-zinc-800 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-rose-600" />
            <span>Quick Entry</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Pulse Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
            {metrics.totalRevenue !== null ? formatCurrency(metrics.totalRevenue, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            {metrics.transactionCount} gross transactions logged
          </p>
        </div>

        {/* Operating Costs */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Operating Expenses</span>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-700 dark:text-zinc-300 tabular-nums font-mono">
            {metrics.totalExpenses !== null ? formatCurrency(metrics.totalExpenses, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            {metrics.totalRevenue && metrics.totalExpenses ? `${((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1)}% of gross revenue` : 'Operational overhead'}
          </p>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Profit</span>
            <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-500 tabular-nums font-mono">
            {metrics.estimatedProfit !== null ? formatCurrency(metrics.estimatedProfit, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}% net margin` : 'Bottom-line margin'}
          </p>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Open Pipeline CRM</span>
            <GitPullRequest className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
            {formatCurrency(pipelineStats.totalPipelineValue, currency)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            {pipelineStats.totalDeals} active sales opportunities
          </p>
        </div>
      </div>

      {/* Daily Attention & Immediate Action Feed */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600 dark:text-rose-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Immediate Attention & Action Feed
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
            {attentionItems.length} active priority alerts
          </span>
        </div>

        {attentionItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {item.severity === 'critical' && <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />}
                    {item.severity === 'warning' && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                    {item.severity === 'opportunity' && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-snug line-clamp-2">{item.subtitle}</p>
                </div>

                <button
                  onClick={() => onNavigateTab(item.actionTab)}
                  className="w-full py-2 bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 text-center text-xs text-slate-500 dark:text-zinc-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            All business vectors normal. No critical anomalies or overdue tasks detected.
          </div>
        )}
      </div>

      {/* Visual Revenue & Cash Trend Curve */}
      {records.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Financial Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Historical revenue vs. operational costs performance</p>
            </div>
            <button
              onClick={() => onNavigateTab('insights')}
              className="text-xs font-bold text-rose-600 dark:text-rose-500 hover:underline flex items-center gap-1 active:scale-[0.98]"
            >
              <span>View Financial Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ShopifyAnalyticsChart records={records} currency={currency} />
        </div>
      )}

      {/* 2-Column Split: Sales Pipeline Snapshot + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Pipeline Snapshot */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Sales Pipeline Status</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{crmContacts.length} total client opportunities</p>
            </div>
            <button
              onClick={() => onNavigateTab('crm')}
              className="text-xs font-bold text-rose-600 dark:text-rose-500 hover:underline flex items-center gap-1 active:scale-[0.98]"
            >
              <span>Open CRM ({pipelineStats.totalDeals})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {crmContacts.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigateTab('crm')}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between hover:border-rose-500/40 cursor-pointer transition-all active:scale-[0.98]"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">{c.company || c.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{c.name} • {c.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xs text-slate-900 dark:text-white font-mono">{formatCurrency(c.dealValue, currency)}</div>
                  <span className="text-[10px] uppercase font-extrabold text-rose-600 dark:text-rose-400">{c.stage.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Financial Transactions */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Recent Ledger Entries</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{records.length} total entries</p>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs font-bold text-rose-600 dark:text-rose-500 hover:underline flex items-center gap-1 active:scale-[0.98]"
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
                {records.slice(0, 4).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3 font-mono text-slate-600 dark:text-zinc-400">{r.dateString || '—'}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{r.customer || r.product || 'General Transaction'}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">{r.category || 'General'}</span>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 dark:text-white font-mono">
                      {r.revenue ? formatCurrency(r.revenue, currency) : '—'}
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
