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
  ShieldCheck,
  Zap,
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
        title: topLeak.title,
        subtitle: `${topLeak.description} (Estimated annual drain: ${formatCurrency(topLeak.monthlyLeakAmount * 12, currency)})`,
        actionText: 'Investigate Profit Leaks',
        actionTab: 'insights',
        severity: 'critical',
      });
    }

    // 2. High-value closing deals
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
        severity: 'warning',
      });
    }

    return items.slice(0, 3);
  }, [profitLeaks, crmContacts, customerStats, runway, currency]);

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-7 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 px-2 py-0.5 rounded-md">
              Health Grade: {healthScore.grade} ({healthScore.score}/100)
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              • {metrics.transactionCount} entries active
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Command Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-xl">
            Real-time financial pulse, primary performance trajectory, and immediate daily priorities.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowQuickModal(true)}
            className="px-3.5 py-2 bg-slate-100/80 dark:bg-zinc-900/80 hover:bg-slate-200/70 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200/60 dark:border-zinc-800 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-rose-600" />
            <span>Quick Entry</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Core Pulse Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" strokeWidth={1.8} />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
            {metrics.totalRevenue !== null ? formatCurrency(metrics.totalRevenue, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            {metrics.transactionCount} gross transactions
          </p>
        </div>

        {/* Operating Costs */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Operating Expenses</span>
            <TrendingDown className="w-4 h-4 text-slate-400" strokeWidth={1.8} />
          </div>
          <div className="text-2xl font-black text-slate-700 dark:text-zinc-300 tabular-nums font-mono">
            {metrics.totalExpenses !== null ? formatCurrency(metrics.totalExpenses, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            {metrics.totalRevenue && metrics.totalExpenses ? `${((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1)}% of revenue` : 'Overhead costs'}
          </p>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Operating Profit</span>
            <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-500" strokeWidth={1.8} />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-500 tabular-nums font-mono">
            {metrics.estimatedProfit !== null ? formatCurrency(metrics.estimatedProfit, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}% net margin` : 'Bottom-line'}
          </p>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Open CRM Pipeline</span>
            <GitPullRequest className="w-4 h-4 text-indigo-500" strokeWidth={1.8} />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
            {formatCurrency(pipelineStats.totalPipelineValue, currency)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            {pipelineStats.totalDeals} active sales deals
          </p>
        </div>
      </div>

      {/* LEVEL 1: Dominant Primary Visualization (Revenue vs Expense Performance Trajectory) */}
      {records.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-7 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Primary Business Horizon</div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Financial Performance Trajectory</h3>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Ledger Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ShopifyAnalyticsChart records={records} currency={currency} />
        </div>
      )}

      {/* LEVEL 2: Secondary Supporting Visualizations (3-Card Balanced Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card A: Net Profit Velocity */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Margin Efficiency</div>
            <div className="flex items-baseline justify-between mt-1">
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {(metrics.profitMargin || 0).toFixed(1)}%
              </div>
              <span className={`text-[11px] font-semibold ${(metrics.profitMargin || 0) >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                {(metrics.profitMargin || 0) >= 20 ? 'Optimal' : 'Needs Optimization'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Realized net earnings of {metrics.estimatedProfit !== null ? formatCurrency(metrics.estimatedProfit, currency) : '$0'} on {formatCurrency(metrics.totalRevenue || 0, currency)} revenue.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs">
            <span className="text-slate-400">Fixed Overhead:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-zinc-300">{formatCurrency(metrics.fixedExpenses, currency)}</span>
          </div>
        </div>

        {/* Card B: CRM Deal Distribution */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Sales Conversion Velocity</div>
            <div className="flex items-baseline justify-between mt-1">
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(pipelineStats.totalPipelineValue, currency)}
              </div>
              <span className="text-[11px] font-mono text-indigo-500 font-bold">{pipelineStats.totalDeals} Deals</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Historical win rate: <strong className="font-mono text-slate-800 dark:text-zinc-200">{pipelineStats.winRatePct.toFixed(0)}%</strong> with average deal size of {formatCurrency(pipelineStats.avgDealSize, currency)}.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs">
            <button onClick={() => onNavigateTab('crm')} className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1">
              <span>View Pipeline Kanban</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card C: Cash Runway & Reserve Horizon */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Liquidity Horizon</div>
            <div className="flex items-baseline justify-between mt-1">
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {runway.runwayMonths > 50 ? '50+ Mo' : `${runway.runwayMonths.toFixed(1)} Mo`}
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Stable Buffer</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Monthly burn velocity is {formatCurrency(runway.monthlyBurnRate, currency)} based on trailing operating expenses.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs">
            <span className="text-slate-400">Daily Burn:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-zinc-300">{formatCurrency(runway.dailyVelocity, currency)}/day</span>
          </div>
        </div>
      </div>

      {/* LEVEL 3: Immediate Attention & Tactical Feeds */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600 dark:text-rose-500" strokeWidth={1.8} />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
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
                className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {item.severity === 'critical' && <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />}
                    {item.severity === 'warning' && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                    {item.severity === 'opportunity' && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                    <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-snug line-clamp-2">{item.subtitle}</p>
                </div>

                <button
                  onClick={() => onNavigateTab(item.actionTab)}
                  className="w-full py-1.5 bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-900 dark:text-white text-xs font-semibold rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3 h-3 text-rose-600" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 text-center text-xs text-slate-500 dark:text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            All business vectors normal. No critical anomalies or overdue tasks detected.
          </div>
        )}
      </div>

      {/* 2-Column Split: Sales Pipeline Snapshot + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Pipeline Snapshot */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pipeline Highlights</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">{crmContacts.length} total client opportunities</p>
            </div>
            <button
              onClick={() => onNavigateTab('crm')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>CRM ({pipelineStats.totalDeals})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {crmContacts.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigateTab('crm')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{c.company || c.name}</div>
                  <div className="text-[11px] text-slate-400 dark:text-zinc-500">{c.name} • {c.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-slate-900 dark:text-white font-mono">{formatCurrency(c.dealValue, currency)}</div>
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">{c.stage.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Financial Transactions */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Ledger Activity</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">{records.length} total recorded entries</p>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>Finance ({records.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200/70 dark:border-zinc-800/70 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase text-[10px] border-b border-slate-200/70 dark:border-zinc-800">
                  <th className="p-3">Date</th>
                  <th className="p-3">Account / Item</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {records.slice(0, 4).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{r.dateString || '—'}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      <div className="truncate max-w-[140px] sm:max-w-[200px]">{r.customer || r.product || r.category || 'General Transaction'}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {r.revenue && r.revenue > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(r.revenue, currency)}</span>
                      ) : r.expense && r.expense > 0 ? (
                        <span className="text-slate-600 dark:text-zinc-400">-{formatCurrency(r.expense, currency)}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Transaction Entry Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-900">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Quick Transaction Entry</h3>
              <button onClick={() => setShowQuickModal(false)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="flex rounded-lg bg-slate-100 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setQType('revenue')}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition-colors ${
                    qType === 'revenue' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  Income / Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setQType('expense')}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition-colors ${
                    qType === 'expense' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  Operating Expense
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={qAmount}
                  onChange={(e) => setQAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={qDate}
                    onChange={(e) => setQDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Customer / Client (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={qCustomer}
                  onChange={(e) => setQCustomer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Product / Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. SaaS Subscription"
                  value={qProduct}
                  onChange={(e) => setQProduct(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
