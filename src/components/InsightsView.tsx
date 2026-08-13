import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { calculateCustomerAnalytics, calculateProductAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
import { simulateScenario } from '../utils/forecastingEngine';
import { BusinessDiagnosisCard } from './BusinessDiagnosisCard';
import { ProfitLeakCard } from './ProfitLeakCard';
import {
  TrendingUp,
  CheckCircle2,
  Zap,
  Sliders,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface InsightsViewProps {
  records: NormalizedRecord[];
  crmDeals: CRMContact[];
  currency: CurrencyCode;
  businessId?: string;
}

type InsightsSubtab = 'diagnosis' | 'leaks' | 'simulator' | 'risks';

export const InsightsView: React.FC<InsightsViewProps> = ({
  records,
  crmDeals,
  currency,
}) => {
  const [subtab, setSubtab] = useState<InsightsSubtab>('diagnosis');

  const metrics = useMemo(() => calculateMetrics(records), [records]);
  const customerStats = useMemo(() => calculateCustomerAnalytics(records), [records]);
  const productStats = useMemo(() => calculateProductAnalytics(records), [records]);
  const pipelineStats = useMemo(() => calculatePipelineSummary(crmDeals), [crmDeals]);
  const healthScorecard = useMemo(() => calculateFinancialHealthScore(records), [records]);

  // Interactive Scenario Simulator Inputs State
  const [priceChange, setPriceChange] = useState(5);
  const [volumeChange, setVolumeChange] = useState(10);
  const [expenseChange, setExpenseChange] = useState(0);

  const scenarioResult = useMemo(() => {
    return simulateScenario(metrics, {
      priceChangePct: priceChange,
      volumeChangePct: volumeChange,
      expenseChangePct: expenseChange,
    });
  }, [metrics, priceChange, volumeChange, expenseChange]);

  // Actionable strategic recommendations generated from real data
  const dataInsights = useMemo(() => {
    const list: {
      id: string;
      type: 'positive' | 'warning' | 'info';
      title: string;
      detail: string;
      actionText: string;
      metric?: string;
    }[] = [];

    if (!records || records.length === 0) return list;

    // 1. Profit Margin Efficiency
    if (metrics.totalRevenue && metrics.totalRevenue > 0) {
      const marginStr = metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A';
      const isHighMargin = (metrics.profitMargin || 0) >= 25;
      list.push({
        id: 'ins-margin',
        type: isHighMargin ? 'positive' : 'warning',
        title: 'Operating Margin Efficiency',
        detail: `Your business generated ${formatCurrency(metrics.totalRevenue, currency)} in revenue with a net profit margin of ${marginStr}.`,
        actionText: isHighMargin
          ? 'Maintain operating leverage while scaling acquisition.'
          : 'Audit non-essential vendor overhead to widen margins.',
        metric: marginStr,
      });
    }

    // 2. Customer Concentration
    if (customerStats.topCustomerName && customerStats.topCustomerSharePct > 0) {
      const isHighRisk = customerStats.topCustomerSharePct > 30;
      list.push({
        id: 'ins-cust',
        type: isHighRisk ? 'warning' : 'info',
        title: 'Customer Concentration Profile',
        detail: `${customerStats.topCustomerName} accounts for ${customerStats.topCustomerSharePct.toFixed(1)}% of your total income.`,
        actionText: isHighRisk
          ? 'Diversify client acquisition to mitigate single-buyer churn risk.'
          : 'Customer revenue is well-distributed across buyers.',
        metric: `${customerStats.topCustomerSharePct.toFixed(0)}% Share`,
      });
    }

    // 3. Product Line Concentration
    if (productStats.topProductByRevenue && metrics.totalRevenue && metrics.totalRevenue > 0) {
      const topProd = productStats.topProductByRevenue;
      const sharePct = (topProd.revenue / metrics.totalRevenue) * 100;
      list.push({
        id: 'ins-prod',
        type: 'info',
        title: 'Top Offering Driver',
        detail: `${topProd.name} is your flagship offering generating ${formatCurrency(topProd.revenue, currency)} (${sharePct.toFixed(1)}% of total revenue).`,
        actionText: 'Package as a recurring subscription tier to increase customer lifetime value.',
        metric: formatCurrency(topProd.revenue, currency),
      });
    }

    return list;
  }, [records, metrics, customerStats, productStats, currency]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Studio Top Header */}
      <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 lg:p-7 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 px-2 py-0.5 rounded-md">
              Continuous Intelligence Engine
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-zinc-500 font-mono">
              • {records.length} records analyzed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Business Intelligence & Diagnostics
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-xl hidden sm:block">
            Autonomous health scores, profit leak detection, and growth simulation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 flex-1 sm:flex-none justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Health: {healthScorecard.grade} ({healthScorecard.score}/100)</span>
          </div>
        </div>
      </div>

      {/* 4 Pulse KPI Cards (2x2 on Mobile, 4-Col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-zinc-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Health Index</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums truncate">
            {healthScorecard.grade} ({healthScorecard.score} pts)
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 truncate">Multi-factor rating</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Top Customer Share</span>
          <div className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tabular-nums truncate">
            {customerStats.topCustomerSharePct.toFixed(1)}%
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 truncate">{customerStats.topCustomerName || 'None'}</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Top Product</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums truncate">
            {productStats.topProductByRevenue ? formatCurrency(productStats.topProductByRevenue.revenue, currency) : '—'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 truncate">{productStats.topProductByRevenue?.name || 'Standard'}</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Simulated Upside</span>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums truncate">
            +{formatCurrency(scenarioResult.profitDelta, currency)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 truncate">At +5% price lift</p>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="bg-white dark:bg-zinc-950 p-2 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs flex items-center gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setSubtab('diagnosis')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 touch-manipulation ${
            subtab === 'diagnosis'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Diagnosis Dossier</span>
          </div>
        </button>

        <button
          onClick={() => setSubtab('leaks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 touch-manipulation ${
            subtab === 'leaks'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Profit Leaks</span>
          </div>
        </button>

        <button
          onClick={() => setSubtab('simulator')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 touch-manipulation ${
            subtab === 'simulator'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Growth Simulator</span>
          </div>
        </button>
      </div>

      {/* Subtab 1: Business Diagnosis */}
      {subtab === 'diagnosis' && (
        <div className="space-y-4">
          <BusinessDiagnosisCard records={records} currency={currency} />

          {/* Strategic Action Cards */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Strategic Growth Directives ({dataInsights.length})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {dataInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white dark:bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{insight.title}</span>
                      {insight.metric && (
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md">
                          {insight.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{insight.detail}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl text-xs text-slate-800 dark:text-zinc-200 font-medium">
                    💡 {insight.actionText}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Profit Leaks */}
      {subtab === 'leaks' && (
        <div className="space-y-4">
          <ProfitLeakCard records={records} currency={currency} />
        </div>
      )}

      {/* Subtab 3: Growth Simulator */}
      {subtab === 'simulator' && (
        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 lg:p-7 rounded-2xl border border-slate-200/70 dark:border-zinc-800 shadow-2xs space-y-5 sm:space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Mathematical What-If Growth Simulator</h3>
            <p className="text-xs text-slate-400 mt-0.5">Model the exact financial bottom-line impact of adjusting pricing, sales volume, and cost overhead.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Price Slider */}
            <div className="space-y-2 bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-zinc-300">Price Adjustment:</span>
                <span className="font-mono font-bold text-rose-600">{priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}</span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="1"
                value={priceChange}
                onChange={(e) => setPriceChange(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer h-5 touch-manipulation"
              />
              <p className="text-[10px] text-slate-400">Direct impact on gross unit revenue</p>
            </div>

            {/* Volume Slider */}
            <div className="space-y-2 bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-zinc-300">Sales Volume:</span>
                <span className="font-mono font-bold text-emerald-600">{volumeChange > 0 ? `+${volumeChange}%` : `${volumeChange}%`}</span>
              </div>
              <input
                type="range"
                min="-30"
                max="100"
                step="5"
                value={volumeChange}
                onChange={(e) => setVolumeChange(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-5 touch-manipulation"
              />
              <p className="text-[10px] text-slate-400">Increases transactional units and variable costs</p>
            </div>

            {/* Expense Slider */}
            <div className="space-y-2 bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-zinc-300">Cost Shift:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}</span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={expenseChange}
                onChange={(e) => setExpenseChange(Number(e.target.value))}
                className="w-full accent-slate-500 cursor-pointer h-5 touch-manipulation"
              />
              <p className="text-[10px] text-slate-400">Overhead, payroll, and operational expenses</p>
            </div>
          </div>

          {/* Simulated Results Banner */}
          <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Simulated Revenue</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {formatCurrency(scenarioResult.projectedRevenue, currency)}
              </div>
              <div className="text-[11px] text-emerald-600 font-mono mt-0.5">
                +{formatCurrency((scenarioResult.projectedRevenue || 0) - (metrics.totalRevenue || 0), currency)} lift
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Simulated Net Profit</span>
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-500 font-mono mt-1">
                {formatCurrency(scenarioResult.projectedProfit, currency)}
              </div>
              <div className="text-[11px] text-rose-600 font-mono mt-0.5">
                {scenarioResult.profitDelta >= 0 ? `+${formatCurrency(scenarioResult.profitDelta, currency)}` : formatCurrency(scenarioResult.profitDelta, currency)}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Projected Net Margin</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {scenarioResult.projectedMargin !== null ? `${scenarioResult.projectedMargin.toFixed(1)}%` : '0.0%'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                vs {(metrics.profitMargin || 0).toFixed(1)}% current
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
