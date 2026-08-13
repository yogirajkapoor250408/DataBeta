import React, { useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { scanProfitLeaks } from '../intelligence/profitLeakEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { Droplet, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProfitLeakCardProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onNavigateTab?: (tab: 'overview' | 'transactions' | 'customers' | 'pipeline' | 'insights') => void;
}

export const ProfitLeakCard: React.FC<ProfitLeakCardProps> = ({
  records,
  currency,
  onNavigateTab,
}) => {
  const leakSummary = useMemo(() => scanProfitLeaks(records, currency), [records, currency]);

  if (!records || records.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-5 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold shrink-0">
            <Droplet className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Continuous Profit Leak Engine
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Identified Capital Leaks
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-black text-rose-600 dark:text-rose-500">
            {formatCurrency(leakSummary.totalMonthlyLeakage, currency)}
            <span className="text-xs text-slate-500 font-normal">/mo</span>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
            {formatCurrency(leakSummary.totalAnnualLeakage, currency)} annual impact
          </div>
        </div>
      </div>

      {/* Impact Statement */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center justify-between">
        <span>{leakSummary.healthImpactText}</span>
        <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
          {leakSummary.leakCount} Active Leaks
        </span>
      </div>

      {/* Leaks List */}
      <div className="space-y-2.5">
        {leakSummary.leaks.map((leak) => (
          <div
            key={leak.id}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-2 bg-white dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {leak.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{leak.title}</h4>
              </div>
              <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400">
                -{formatCurrency(leak.monthlyLeakAmount, currency)}/mo
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400">{leak.description}</p>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-zinc-500 font-medium">
                Fix: {leak.recommendedFix}
              </span>
              <button
                onClick={() => onNavigateTab && onNavigateTab('insights')}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Plug Leak</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {leakSummary.leaks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Zero Leaks Detected</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
              Your operational expenses and sales pricing are operating at optimal efficiency.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
