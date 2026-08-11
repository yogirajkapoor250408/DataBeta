import React, { useState } from 'react';
import { NormalizedRecord, CurrencyCode, KPIGoals } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { formatCurrency } from '../utils/currencyFormatter';
import { Target, TrendingUp, ShieldAlert, Award, Edit3, CheckCircle2 } from 'lucide-react';

interface GoalTrackerCardProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
}

export const GoalTrackerCard: React.FC<GoalTrackerCardProps> = ({ records, currency }) => {
  const metrics = calculateMetrics(records);

  const [goals, setGoals] = useState<KPIGoals>({
    targetRevenue: 100000,
    targetProfitMarginPct: 25,
    maxExpenseCap: 25000,
  });

  const [isEditing, setIsEditing] = useState(false);

  const currentRev = metrics.totalRevenue || 0;
  const currentExp = metrics.totalExpenses || 0;
  const currentMargin = metrics.profitMargin || 0;

  const revProgressPct = goals.targetRevenue > 0 ? Math.min(100, (currentRev / goals.targetRevenue) * 100) : 0;
  const marginProgressPct = goals.targetProfitMarginPct > 0 ? Math.min(100, (currentMargin / goals.targetProfitMarginPct) * 100) : 0;
  const expenseCapPct = goals.maxExpenseCap > 0 ? Math.min(100, (currentExp / goals.maxExpenseCap) * 100) : 0;

  // Compute daily pace estimation
  const dates = records.map(r => r.date).filter(Boolean) as Date[];
  let daysCount = 30;
  if (dates.length >= 2) {
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    daysCount = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const dailyRevPace = currentRev / daysCount;
  const revRemaining = Math.max(0, goals.targetRevenue - currentRev);
  const daysToTarget = dailyRevPace > 0 ? Math.ceil(revRemaining / dailyRevPace) : null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Target Goals & Milestone Pace Tracker</h3>
            <p className="text-xs text-slate-500">Track progress towards key business financial targets</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Save Goals' : 'Set Targets'}</span>
        </button>
      </div>

      {/* Target Setter Controls */}
      {isEditing && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Revenue Goal</label>
            <input
              type="number"
              value={goals.targetRevenue}
              onChange={(e) => setGoals((prev) => ({ ...prev, targetRevenue: Number(e.target.value) }))}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Profit Margin (%)</label>
            <input
              type="number"
              value={goals.targetProfitMarginPct}
              onChange={(e) => setGoals((prev) => ({ ...prev, targetProfitMarginPct: Number(e.target.value) }))}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Max Expense Cap</label>
            <input
              type="number"
              value={goals.maxExpenseCap}
              onChange={(e) => setGoals((prev) => ({ ...prev, maxExpenseCap: Number(e.target.value) }))}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Goal Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Goal 1: Revenue Target */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Revenue Goal</span>
            <span className="font-mono font-bold text-indigo-600">{revProgressPct.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${revProgressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>{formatCurrency(currentRev, currency)}</span>
            <span>Target: {formatCurrency(goals.targetRevenue, currency)}</span>
          </div>
        </div>

        {/* Goal 2: Margin Target */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Margin Target</span>
            <span className="font-mono font-bold text-emerald-600">{marginProgressPct.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${marginProgressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Current: {currentMargin.toFixed(1)}%</span>
            <span>Target: {goals.targetProfitMarginPct}%</span>
          </div>
        </div>

        {/* Goal 3: Expense Cap */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Expense Cap Used</span>
            <span className={`font-mono font-bold ${expenseCapPct > 90 ? 'text-rose-600' : 'text-amber-600'}`}>
              {expenseCapPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                expenseCapPct > 90 ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${expenseCapPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Used: {formatCurrency(currentExp, currency)}</span>
            <span>Cap: {formatCurrency(goals.maxExpenseCap, currency)}</span>
          </div>
        </div>
      </div>

      {/* Daily Pace Projection Banner */}
      {daysToTarget !== null && daysToTarget > 0 && (
        <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              At your current daily sales rate of <strong className="font-bold">{formatCurrency(dailyRevPace, currency)}/day</strong>:
            </span>
          </div>
          <span className="font-extrabold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs">
            ~{daysToTarget} days to reach target
          </span>
        </div>
      )}
    </div>
  );
};
