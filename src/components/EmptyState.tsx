import React from 'react';
import {
  UserPlus,
  Briefcase,
  CalendarCheck2,
  FileSpreadsheet,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface EmptyStateProps {
  onOpenUpload: () => void;
  onOpenAddDeal?: () => void;
  onOpenAddTask?: () => void;
  onOpenAddInvoice?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenUpload,
  onOpenAddDeal,
  onOpenAddTask,
  onOpenAddInvoice,
}) => {
  return (
    <div className="max-w-4xl mx-auto my-8 bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm p-6 sm:p-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Clean Workspace Initialized
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Your Sales & Cash Operating System
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
          This workspace starts completely empty and stores only verified data entered by your team or imported from your ledger.
        </p>
      </div>

      {/* 5-Step Operational Onboarding Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Step 1 */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 font-bold text-xs">
              1
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Add Contact</h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
              Save client decision makers and contact info.
            </p>
          </div>
          {onOpenAddDeal && (
            <button
              onClick={onOpenAddDeal}
              className="w-full py-1.5 px-2 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
            >
              <UserPlus className="w-3 h-3 text-rose-500" />
              <span>Add Lead</span>
            </button>
          )}
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Create Deal</h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
              Track value, stage, probability, and next step.
            </p>
          </div>
          {onOpenAddDeal && (
            <button
              onClick={onOpenAddDeal}
              className="w-full py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-xs transition-all"
            >
              <Briefcase className="w-3 h-3" />
              <span>New Deal</span>
            </button>
          )}
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 font-bold text-xs">
              3
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Follow-Up Task</h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
              Prevent stalled pipeline with daily follow-up queues.
            </p>
          </div>
          {onOpenAddTask && (
            <button
              onClick={onOpenAddTask}
              className="w-full py-1.5 px-2 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
            >
              <CalendarCheck2 className="w-3 h-3 text-rose-500" />
              <span>Add Task</span>
            </button>
          )}
        </div>

        {/* Step 4 */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 font-bold text-xs">
              4
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Invoice / Ledger</h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
              Record invoices or import past revenue and expense CSVs.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="w-full py-1.5 px-2 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
          >
            <FileSpreadsheet className="w-3 h-3 text-rose-500" />
            <span>Import CSV</span>
          </button>
        </div>

        {/* Step 5 */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold text-xs">
              5
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Cash & Margins</h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
              Real-time cash forecasting with complete provenance.
            </p>
          </div>
          <div className="py-1 px-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Auditable</span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Import CSV or Excel Ledger</span>
        </button>
        {onOpenAddDeal && (
          <button
            onClick={onOpenAddDeal}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-all"
          >
            <Briefcase className="w-4 h-4 text-rose-500" />
            <span>Create First Deal Manually</span>
          </button>
        )}
      </div>
    </div>
  );
};
