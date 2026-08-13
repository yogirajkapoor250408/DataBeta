import React, { useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, KPIGoals } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { ArrowUpRight, Zap, Target } from 'lucide-react';

interface WorkloadWaveCardProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  goals?: KPIGoals;
  onNavigateTab: (tab: 'overview' | 'transactions' | 'customers' | 'pipeline' | 'insights') => void;
}

export const WorkloadWaveCard: React.FC<WorkloadWaveCardProps> = ({
  records,
  currency,
  goals,
  onNavigateTab,
}) => {
  const metrics = useMemo(() => calculateMetrics(records), [records]);

  const targetRev = goals?.targetRevenue || 100000;
  const currentRev = metrics.totalRevenue || 0;

  // Calculate actual revenue progress percentage
  const progressPct = targetRev > 0 ? Math.min(100, Math.round((currentRev / targetRev) * 100)) : 0;
  const isHealthy = progressPct >= 50;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between h-full min-h-[220px] transition-all group">
      {/* Background Fluid Wave Animation */}
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none opacity-20 dark:opacity-30 transition-opacity">
        <svg
          className="w-full h-full text-rose-600 dark:text-rose-500"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,192C672,192,768,160,864,138.7C960,117,1056,107,1152,122.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
            Workload & Target Capacity
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
        </div>

        <button
          onClick={() => onNavigateTab('insights')}
          className="text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Manage</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Metric Display */}
      <div className="relative z-10 my-4 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {progressPct}%
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
            revenue goal throughput
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
          {formatCurrency(currentRev, currency)} achieved of {formatCurrency(targetRev, currency)} target
        </p>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500">
          <span>Current {progressPct}%</span>
          <span>Target 100%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-zinc-800/60">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
