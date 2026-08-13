import React, { useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { ArrowUpRight, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface CashRunwayCardProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onNavigateTab: (tab: 'overview' | 'transactions' | 'customers' | 'pipeline' | 'insights') => void;
}

export const CashRunwayCard: React.FC<CashRunwayCardProps> = ({
  records,
  currency,
  onNavigateTab,
}) => {
  const runwayData = useMemo(() => {
    if (!records || records.length === 0) {
      return { avgMonthlyBurn: 0, estimatedCash: 0, monthsRunway: 0, status: 'unknown' };
    }

    let totalRevenue = 0;
    let totalExpense = 0;
    const monthsSet = new Set<string>();

    records.forEach(r => {
      if (r.revenue) totalRevenue += r.revenue;
      if (r.expense) totalExpense += r.expense;
      if (r.dateString) {
        monthsSet.add(r.dateString.substring(0, 7)); // YYYY-MM
      }
    });

    const monthsCount = Math.max(1, monthsSet.size);
    const avgMonthlyBurn = totalExpense / monthsCount;
    const netCash = totalRevenue - totalExpense; // Proxy for current cash on hand based on total historical P&L

    if (netCash <= 0) {
       return { avgMonthlyBurn, estimatedCash: netCash, monthsRunway: 0, status: 'critical' };
    }

    if (avgMonthlyBurn === 0) {
       return { avgMonthlyBurn, estimatedCash: netCash, monthsRunway: 999, status: 'infinite' };
    }

    const monthsRunway = parseFloat((netCash / avgMonthlyBurn).toFixed(1));
    let status = 'healthy';
    if (monthsRunway < 3) status = 'critical';
    else if (monthsRunway < 6) status = 'warning';

    return { avgMonthlyBurn, estimatedCash: netCash, monthsRunway, status };
  }, [records]);

  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between h-full min-h-[220px] transition-all hover-card-lift group">
      {/* Background Fluid Wave Animation - Colored based on runway status */}
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none opacity-10 dark:opacity-20 transition-opacity overflow-hidden">
        <svg
          className={`w-[120%] h-full animate-wave ${
            runwayData.status === 'critical' ? 'text-rose-600' :
            runwayData.status === 'warning' ? 'text-amber-500' :
            'text-emerald-500'
          }`}
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
            Cash Runway Forecast
          </span>
          {runwayData.status === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />}
          {runwayData.status === 'warning' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          {runwayData.status === 'healthy' || runwayData.status === 'infinite' ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> : null}
        </div>

        <button
          onClick={() => onNavigateTab('insights')}
          className="text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Analyze</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Metric Display */}
      <div className="relative z-10 my-4 space-y-1">
        <div className="flex items-baseline gap-2">
          {runwayData.status === 'infinite' ? (
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-8 h-8" /> Safe
            </span>
          ) : runwayData.status === 'unknown' ? (
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ---
            </span>
          ) : (
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {runwayData.monthsRunway} <span className="text-lg">months</span>
            </span>
          )}
        </div>

        {runwayData.status === 'infinite' ? (
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-1.5">
             Zero calculated burn rate. You are cash flow positive.
          </p>
        ) : runwayData.status === 'unknown' ? (
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
             Import data to calculate runway
          </p>
        ) : (
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-1.5">
            {runwayData.status === 'critical' ? (
               <><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> High risk of cash depletion.</>
            ) : runwayData.status === 'warning' ? (
               <><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Moderate runway. Monitor expenses.</>
            ) : (
               <><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Strong cash position.</>
            )}
          </p>
        )}
      </div>

      {/* Bottom Context Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mt-2">
         <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Est. Cash Buffer</div>
            <div className="font-mono text-sm font-bold text-slate-700 dark:text-zinc-300">
               {formatCurrency(runwayData.estimatedCash, currency)}
            </div>
         </div>
         <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Avg Monthly Burn</div>
            <div className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
               <Flame className="w-3 h-3" />
               {formatCurrency(runwayData.avgMonthlyBurn, currency)}
            </div>
         </div>
      </div>
    </div>
  );
};
