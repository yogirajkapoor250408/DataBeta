import React, { useEffect, useState, useCallback } from 'react';
import { NormalizedRecord, CurrencyCode, KPIGoals } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { goalService } from '../services/goalService';
import { Target, TrendingUp, Edit3, Loader2 } from 'lucide-react';

interface GoalTrackerCardProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  businessId?: string;
}

export const GoalTrackerCard: React.FC<GoalTrackerCardProps> = ({ records, currency, businessId }) => {
  const metrics = calculateMetrics(records);

  const [goals, setGoals] = useState<KPIGoals>({
    targetRevenue: 100000,
    targetProfitMarginPct: 25,
    maxExpenseCap: 25000,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  // Load goals from Supabase on mount
  useEffect(() => {
    if (!businessId) return;
    setIsLoadingGoals(true);
    goalService.getBusinessGoals(businessId)
      .then((loadedGoals) => setGoals(loadedGoals))
      .catch((err) => console.error('Failed to load goals:', err))
      .finally(() => setIsLoadingGoals(false));
  }, [businessId]);

  const handleSaveGoals = useCallback(async () => {
    if (!businessId) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    const { error } = await goalService.updateBusinessGoals(businessId, goals);
    if (error) {
      console.error('Failed to save goals:', error);
    }
    setIsSaving(false);
    setIsEditing(false);
  }, [businessId, goals]);

  const currentRev = metrics.totalRevenue ?? 0;
  const currentExp = metrics.totalExpenses ?? 0;
  const currentMargin = metrics.profitMargin ?? 0;

  const targetRev = goals.targetRevenue || 100000;
  const targetMargin = goals.targetProfitMarginPct || 25;
  const maxExp = goals.maxExpenseCap || 25000;

  const revProgressPct = targetRev > 0 ? Math.min(100, (currentRev / targetRev) * 100) : 0;
  const marginProgressPct = targetMargin > 0 ? Math.min(100, (currentMargin / targetMargin) * 100) : 0;
  const expenseCapPct = maxExp > 0 ? Math.min(100, (currentExp / maxExp) * 100) : 0;

  const dateObjs = records
    .map((r) => (r.date instanceof Date ? r.date : new Date(r.date)))
    .filter((d) => !isNaN(d.getTime()));
  let daysCount = 30;
  if (dateObjs.length >= 2) {
    const minTime = Math.min(...dateObjs.map((d) => d.getTime()));
    const maxTime = Math.max(...dateObjs.map((d) => d.getTime()));
    daysCount = Math.max(1, Math.ceil((maxTime - minTime) / (1000 * 60 * 60 * 24)));
  }

  const dailyRevPace = daysCount > 0 ? currentRev / daysCount : 0;
  const revRemaining = Math.max(0, targetRev - currentRev);
  const daysToTarget = dailyRevPace > 0 ? Math.ceil(revRemaining / dailyRevPace) : null;

  if (isLoadingGoals) {
    return (
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 text-rose-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 flex items-center justify-center font-bold">
            <Target className="w-5 h-5 text-slate-900 dark:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Target Goals & Milestone Tracker</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {businessId ? 'Goals saved to your business account.' : 'Track progress towards key financial targets.'}
            </p>
          </div>
        </div>

        <button
          onClick={isEditing ? handleSaveGoals : () => setIsEditing(true)}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-full text-xs font-bold transition-colors"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Edit3 className="w-3.5 h-3.5" />
          )}
          <span>{isEditing ? (isSaving ? 'Saving...' : 'Save Goals') : 'Set Targets'}</span>
        </button>
      </div>

      {/* Target Setter Controls */}
      {isEditing && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Target Revenue Goal</label>
            <input
              type="number"
              value={goals.targetRevenue}
              onChange={(e) => setGoals((prev) => ({ ...prev, targetRevenue: Number(e.target.value) }))}
              className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Target Profit Margin (%)</label>
            <input
              type="number"
              value={goals.targetProfitMarginPct}
              onChange={(e) => setGoals((prev) => ({ ...prev, targetProfitMarginPct: Number(e.target.value) }))}
              className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Max Expense Cap</label>
            <input
              type="number"
              value={goals.maxExpenseCap}
              onChange={(e) => setGoals((prev) => ({ ...prev, maxExpenseCap: Number(e.target.value) }))}
              className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-full px-3 py-1.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      )}

      {/* Goal Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Goal 1: Revenue Target */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200">Revenue Goal</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{revProgressPct.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-600 rounded-full transition-all duration-500"
              style={{ width: `${revProgressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>{formatCurrency(currentRev, currency)}</span>
            <span>Target: {formatCurrency(goals.targetRevenue, currency)}</span>
          </div>
        </div>

        {/* Goal 2: Margin Target */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200">Margin Target</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{marginProgressPct.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${marginProgressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Current: {currentMargin.toFixed(1)}%</span>
            <span>Target: {goals.targetProfitMarginPct}%</span>
          </div>
        </div>

        {/* Goal 3: Expense Cap */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200">Expense Cap Used</span>
            <span className={`font-mono font-bold ${expenseCapPct > 90 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {expenseCapPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${expenseCapPct > 90 ? 'bg-rose-600' : 'bg-amber-500'}`}
              style={{ width: `${expenseCapPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Used: {formatCurrency(currentExp, currency)}</span>
            <span>Cap: {formatCurrency(goals.maxExpenseCap, currency)}</span>
          </div>
        </div>
      </div>

      {/* Daily Pace Projection Banner */}
      {daysToTarget !== null && daysToTarget > 0 && (
        <div className="p-4 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              At your current daily revenue rate of <strong className="font-bold">{formatCurrency(dailyRevPace, currency)}/day</strong>:
            </span>
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white bg-white dark:bg-black px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-800 shadow-xs">
            ~{daysToTarget} days to target
          </span>
        </div>
      )}
    </div>
  );
};
