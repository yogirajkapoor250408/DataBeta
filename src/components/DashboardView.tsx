import React, { useState, useMemo } from 'react';
import {
  Deal,
  Contact,
  Task,
  Invoice,
  NormalizedRecord,
  CurrencyCode,
  CoreTab,
  NextBestAction,
  DailySalesTarget,
} from '../types';
import { calculateWeightedPipeline, calculateCashOutlook } from '../utils/provenanceEngine';
import { generateNextBestActions } from '../utils/actionEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Phone,
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle,
  FileSpreadsheet,
  Users,
  Copy,
  Check,
  RotateCcw,
  Inbox,
  Filter,
} from 'lucide-react';

interface DashboardViewProps {
  deals: Deal[];
  contacts: Contact[];
  tasks: Task[];
  invoices: Invoice[];
  records: NormalizedRecord[];
  currency: CurrencyCode;
  isDemo?: boolean;
  onNavigateTab: (tab: CoreTab) => void;
  onOpenUpload: () => void;
  onOpenAddDeal: () => void;
  onOpenAddTask: () => void;
  onOpenAddInvoice: () => void;
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string) => void;
  onSwitchToDemo?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  deals,
  contacts,
  tasks,
  invoices,
  records,
  currency,
  isDemo = false,
  onNavigateTab,
  onOpenUpload,
  onOpenAddDeal,
  onOpenAddTask,
  onOpenAddInvoice,
  onCompleteTask,
  onSnoozeTask,
  onSwitchToDemo,
}) => {
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<'all' | 'urgent' | 'deals' | 'collections'>('all');

  // Next Best Action heuristics
  const nextBestActions = useMemo(
    () => generateNextBestActions(deals, contacts, tasks, invoices),
    [deals, contacts, tasks, invoices]
  );

  // Filtered Actions
  const filteredActions = useMemo(() => {
    if (actionFilter === 'urgent') return nextBestActions.filter((a) => a.priority === 'urgent');
    if (actionFilter === 'deals') return nextBestActions.filter((a) => a.entityType === 'deal');
    if (actionFilter === 'collections') return nextBestActions.filter((a) => a.entityType === 'invoice');
    return nextBestActions;
  }, [nextBestActions, actionFilter]);

  // Cash Outlook Forecast
  const cashOutlook = useMemo(
    () => calculateCashOutlook(invoices, deals, records, currency),
    [invoices, deals, records, currency]
  );

  // Weighted Pipeline
  const weightedPipeline = useMemo(
    () => calculateWeightedPipeline(deals, currency),
    [deals, currency]
  );

  // Daily Sales Target computation
  const dailyTarget: DailySalesTarget = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const completedTasksToday = tasks.filter((t) => t.status === 'completed');
    const callsDone = completedTasksToday.filter((t) => t.title.toLowerCase().includes('call')).length;
    const followupsDone = completedTasksToday.length;
    const proposalsSent = deals.filter((d) => d.stage === 'proposal_sent' || d.stage === 'negotiation').length;
    const collectionsPaid = invoices.filter((inv) => inv.status === 'paid').length;

    return {
      callsTarget: 5,
      callsDone: Math.min(5, callsDone + (isDemo ? 3 : 0)),
      followupsTarget: 8,
      followupsDone: Math.min(8, followupsDone + (isDemo ? 5 : 0)),
      proposalsTarget: 2,
      proposalsDone: Math.min(2, proposalsSent),
      collectionsTarget: 3,
      collectionsDone: Math.min(3, collectionsPaid),
    };
  }, [tasks, deals, invoices, isDemo]);

  const targetProgressPct = Math.round(
    ((dailyTarget.callsDone + dailyTarget.followupsDone + dailyTarget.proposalsDone + dailyTarget.collectionsDone) /
      (dailyTarget.callsTarget + dailyTarget.followupsTarget + dailyTarget.proposalsTarget + dailyTarget.collectionsTarget)) *
      100
  );

  // Overdue and At-Risk Deals
  const atRiskDeals = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return deals.filter((d) => {
      if (d.stage === 'won' || d.stage === 'lost') return false;
      const closePassed = d.expectedCloseDate && d.expectedCloseDate < todayStr;
      const missingNextStep = !d.nextStep || d.nextStep.trim() === '';
      return closePassed || missingNextStep;
    });
  }, [deals]);

  // Handle WhatsApp Copy Action
  const handleCopyWhatsAppScript = (action: NextBestAction) => {
    const script = `Hi ${action.contactName || 'there'}, following up regarding our discussion on ${action.title}. Let me know if you have 5 minutes today for a quick call. Thanks!`;
    navigator.clipboard.writeText(script);
    setCopiedActionId(action.id);
    setTimeout(() => setCopiedActionId(null), 2500);
  };

  // Check if workspace is completely empty
  const isEmptyWorkspace =
    deals.length === 0 && contacts.length === 0 && invoices.length === 0 && records.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Daily Command Header */}
      <div className="bg-white dark:bg-zinc-950 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full">
                Today's Command Center
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Action Plan & Daily Priorities
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
              Who to contact, what is likely to close, and what it means for your cash today.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={onOpenAddDeal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <span>+ New Deal</span>
            </button>
            <button
              onClick={onOpenAddTask}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-zinc-800 transition-all active:scale-95"
            >
              <span>+ Add Task</span>
            </button>
          </div>
        </div>

        {/* Daily Execution Target Progress Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-zinc-400">Daily Target Pace</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">{targetProgressPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, targetProgressPct)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {dailyTarget.followupsDone + dailyTarget.callsDone} of {dailyTarget.followupsTarget + dailyTarget.callsTarget} actions completed
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Follow-ups Due</span>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {nextBestActions.length} Pending
            </div>
            <p className="text-[10px] text-slate-400">{nextBestActions.filter((a) => a.priority === 'urgent').length} marked urgent</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Weighted Pipeline Inflow</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {weightedPipeline.formattedValue}
            </div>
            <p className="text-[10px] text-slate-400">{deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length} open opportunities</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Committed Invoices</span>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {cashOutlook.committedInvoicesInflow.formattedValue}
            </div>
            <p className="text-[10px] text-slate-400">{invoices.filter((i) => i.status === 'overdue').length} overdue for collection</p>
          </div>
        </div>
      </div>

      {/* First-Run Onboarding Checklist (If workspace is empty) */}
      {isEmptyWorkspace && (
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-md">
                First-Run Setup Checklist
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                Let's set up your Sales & Cash Command Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                Complete these 4 steps to unlock daily follow-up actions, pipeline cash forecasts, and collections tracking.
              </p>
            </div>

            {onSwitchToDemo && (
              <button
                onClick={onSwitchToDemo}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Try Demo Workspace</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-300">
                  1
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Import or Add CRM Contacts</span>
              </div>
              <p className="text-xs text-slate-500">Unlocks customer timeline, communication history, and key accounts.</p>
              <button
                onClick={() => onNavigateTab('crm')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 pt-1"
              >
                <span>Add first contact</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-300">
                  2
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Add Open Deals to Pipeline</span>
              </div>
              <p className="text-xs text-slate-500">Unlocks stage conversion probability, weighted cash inflow, and risk alerts.</p>
              <button
                onClick={onOpenAddDeal}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 pt-1"
              >
                <span>Create first deal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-300">
                  3
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Create Customer Invoices</span>
              </div>
              <p className="text-xs text-slate-500">Unlocks committed cash inflows, collection rates, and overdue invoice alerts.</p>
              <button
                onClick={onOpenAddInvoice}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 pt-1"
              >
                <span>Create invoice</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-300">
                  4
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Upload Historical CSV Ledger</span>
              </div>
              <p className="text-xs text-slate-500">Unlocks operating expenses, gross margins, and historical customer profitability.</p>
              <button
                onClick={onOpenUpload}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 pt-1"
              >
                <span>Import CSV / Excel</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Command Center Grid: Next Best Actions + Cash Outlook */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Next Best Action Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-rose-600" />
                  <span>Next Best Actions ({filteredActions.length})</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Ordered by urgency and revenue impact with actionable rationale.
                </p>
              </div>

              {/* Action Filters */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActionFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    actionFilter === 'all'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  All ({nextBestActions.length})
                </button>
                <button
                  onClick={() => setActionFilter('urgent')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    actionFilter === 'urgent'
                      ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  Urgent ({nextBestActions.filter((a) => a.priority === 'urgent').length})
                </button>
                <button
                  onClick={() => setActionFilter('deals')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    actionFilter === 'deals'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  Deals
                </button>
                <button
                  onClick={() => setActionFilter('collections')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    actionFilter === 'collections'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  Collections
                </button>
              </div>
            </div>

            {/* Action Cards List */}
            {filteredActions.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-sm font-bold text-slate-900 dark:text-white">All caught up for today!</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No overdue follow-ups or stale proposals. Create new deals or schedule next tasks to keep your pipeline moving.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              action.priority === 'urgent'
                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                                : action.priority === 'high'
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                            }`}
                          >
                            {action.priority} priority
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {action.title}
                          </span>
                          {action.dealValue && action.dealValue > 0 && (
                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700">
                              {formatCurrency(action.dealValue, currency)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    {/* Operational Rationale */}
                    <div className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200/50 dark:border-zinc-800/50 text-[11px] text-slate-600 dark:text-zinc-400 flex items-start gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white shrink-0">💡 Why now:</span>
                      <span>{action.reason}</span>
                    </div>

                    {/* Quick Execution Actions */}
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        {action.contactPhone && (
                          <a
                            href={`tel:${action.contactPhone}`}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Call</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleCopyWhatsAppScript(action)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all"
                          title="Copy prepared follow-up message to clipboard"
                        >
                          {copiedActionId === action.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{copiedActionId === action.id ? 'Copied script!' : 'Copy WhatsApp message'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {action.entityType === 'task' && (
                          <button
                            onClick={() => onCompleteTask(action.entityId)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                          >
                            ✓ Complete
                          </button>
                        )}
                        {action.entityType === 'deal' && (
                          <button
                            onClick={() => onNavigateTab('crm')}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                          >
                            <span>Open in CRM</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {action.entityType === 'invoice' && (
                          <button
                            onClick={() => onNavigateTab('finance')}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                          >
                            <span>View Invoice</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cash Outlook & Deals at Risk */}
        <div className="space-y-6">
          {/* Cash Outlook Card */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>30-Day Cash Outlook</span>
                </h3>
                <p className="text-[11px] text-slate-400">Separates committed from weighted cash</p>
              </div>
              <button
                onClick={() => onNavigateTab('finance')}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-0.5"
              >
                <span>Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Committed Inflow */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">Committed Invoices</span>
                  <span className="text-[10px] text-slate-400">Due within 30 days</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {cashOutlook.committedInvoicesInflow.formattedValue}
                </span>
              </div>

              {/* Weighted Pipeline */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">Weighted Pipeline</span>
                  <span className="text-[10px] text-slate-400">Probability-adjusted inflow</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {cashOutlook.weightedPipelineInflow.formattedValue}
                </span>
              </div>

              {/* Expected Outflow */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">Expected Outflow</span>
                  <span className="text-[10px] text-slate-400">Trailing operating expenses</span>
                </div>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                  -{cashOutlook.expectedOutflow.formattedValue}
                </span>
              </div>

              {/* Net Cash Outlook */}
              <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between">
                <div>
                  <span className="font-black text-slate-900 dark:text-white block">Net 30-Day Outlook</span>
                  <span className="text-[10px] text-rose-700/80 dark:text-rose-400">Inflow minus expenses</span>
                </div>
                <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-base">
                  {cashOutlook.netCashOutlook.formattedValue}
                </span>
              </div>
            </div>
          </div>

          {/* Deals at Risk Card */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Deals at Risk ({atRiskDeals.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('crm')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                CRM Board
              </button>
            </div>

            {atRiskDeals.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No deals with passed close dates or missing next steps.</p>
            ) : (
              <div className="space-y-2">
                {atRiskDeals.slice(0, 3).map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {deal.companyName || deal.title}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {formatCurrency(deal.amount, currency)}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      {!deal.nextStep ? 'Missing scheduled next action' : `Close date ${deal.expectedCloseDate} passed`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
