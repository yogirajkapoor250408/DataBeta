import React, { useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { diagnoseBusinessPerformance } from '../intelligence/diagnosisEngine';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

interface BusinessDiagnosisCardProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onNavigateTab?: (tab: 'overview' | 'transactions' | 'customers' | 'pipeline' | 'insights') => void;
}

export const BusinessDiagnosisCard: React.FC<BusinessDiagnosisCardProps> = ({
  records,
  currency,
  onNavigateTab,
}) => {
  const diagnosis = useMemo(() => diagnoseBusinessPerformance(records, currency), [records, currency]);

  if (!diagnosis.hasEnoughData) {
    return null;
  }

  const isDeclining = diagnosis.trendDirection === 'declining';
  const isImproving = diagnosis.trendDirection === 'improving';

  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-5 animate-fadeIn">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${
            isDeclining
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
              : isImproving
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
              : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Automatic Diagnostic System
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Root-Cause Variance Analysis
            </h3>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          diagnosis.priority === 'CRITICAL'
            ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
            : diagnosis.priority === 'HIGH'
            ? 'bg-amber-500 text-white'
            : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'
        }`}>
          {diagnosis.priority} PRIORITY
        </span>
      </div>

      {/* Main Headline */}
      <div className={`p-4 rounded-2xl border ${
        isDeclining
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40 text-rose-950 dark:text-rose-200'
          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200'
      }`}>
        <div className="flex items-start gap-3">
          {isDeclining ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-sm font-bold tracking-tight">{diagnosis.headline}</h4>
            <p className="text-xs mt-1 font-medium opacity-90">{diagnosis.primaryCause}</p>
            {diagnosis.secondaryCause && (
              <p className="text-xs mt-1 opacity-75 font-mono">{diagnosis.secondaryCause}</p>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostic Tree Diagram */}
      <div className="space-y-3 pt-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Variance Attribution Breakdown Tree
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {diagnosis.breakdown.map((factor, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">{factor.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 max-w-[180px] line-clamp-1">
                  {factor.explanation}
                </div>
              </div>
              <div className={`text-xs font-mono font-black ${
                factor.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {factor.deltaPct >= 0 ? '+' : ''}{factor.deltaPct}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Action Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 font-medium">
          <ChevronRight className="w-4 h-4 text-rose-500 shrink-0" />
          <span><strong className="text-slate-900 dark:text-white">Action:</strong> {diagnosis.suggestedAction}</span>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('insights')}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Deep Diagnostic Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
