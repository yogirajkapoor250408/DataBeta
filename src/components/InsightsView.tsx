import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { calculateCustomerAnalytics, calculateProductAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateBusinessSummary } from '../utils/summaryEngine';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
import { classifyExpenses, calculateCashFlowProjections, simulateScenario } from '../utils/forecastingEngine';
import { GoalTrackerCard } from './GoalTrackerCard';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  ShieldCheck,
  Award,
  DollarSign,
  PieChart,
  Sliders,
  ArrowRight,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';

interface InsightsViewProps {
  records: NormalizedRecord[];
  crmDeals: CRMContact[];
  currency: CurrencyCode;
  businessId?: string;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  records,
  crmDeals,
  currency,
  businessId,
}) => {
  const metrics = useMemo(() => calculateMetrics(records), [records]);
  const customerStats = useMemo(() => calculateCustomerAnalytics(records), [records]);
  const productStats = useMemo(() => calculateProductAnalytics(records), [records]);
  const pipelineStats = useMemo(() => calculatePipelineSummary(crmDeals), [crmDeals]);
  const observations = useMemo(() => generateBusinessSummary(records), [records]);
  const healthScorecard = useMemo(() => calculateFinancialHealthScore(records), [records]);
  const expenseClassification = useMemo(() => classifyExpenses(records), [records]);
  const cashForecast = useMemo(() => calculateCashFlowProjections(records), [records]);

  // Interactive Scenario Simulator Inputs State
  const [priceChange, setPriceChange] = useState(5); // +5%
  const [volumeChange, setVolumeChange] = useState(10); // +10%
  const [expenseChange, setExpenseChange] = useState(0); // 0%

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

    // 1. Profit Margin Efficiency & Action
    if (metrics.totalRevenue && metrics.totalRevenue > 0) {
      const marginStr = metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A';
      const isHighMargin = (metrics.profitMargin || 0) >= 25;
      list.push({
        id: 'ins-margin',
        type: isHighMargin ? 'positive' : 'warning',
        title: 'Net Profit Margin Efficiency',
        detail: `Your business generated ${formatCurrency(metrics.totalRevenue, currency)} in realized revenue with a net profit margin of ${marginStr}.`,
        actionText: isHighMargin
          ? 'Maintain operating leverage while scaling client acquisition.'
          : 'Audit non-essential SaaS and vendor overhead to widen operating margin.',
        metric: marginStr,
      });
    }

    // 2. Customer Pareto & Concentration Action
    if (customerStats.topCustomerName && customerStats.topCustomerSharePct > 0) {
      const isHighRisk = customerStats.topCustomerSharePct > 30;
      list.push({
        id: 'ins-cust',
        type: isHighRisk ? 'warning' : 'info',
        title: 'Client Concentration & Pareto Risk',
        detail: `Your top client "${customerStats.topCustomerName}" accounts for ${customerStats.topCustomerSharePct.toFixed(1)}% of total revenue.`,
        actionText: isHighRisk
          ? `Lock in a multi-month retainer with ${customerStats.topCustomerName} while acquiring mid-market clients to mitigate key-account dependency.`
          : 'Client revenue distribution is well diversified across your accounts.',
        metric: `${customerStats.topCustomerSharePct.toFixed(1)}% Share`,
      });
    }

    // 3. Primary Product Driver
    if (productStats.topProductByRevenue) {
      list.push({
        id: 'ins-prod',
        type: 'positive',
        title: 'Primary Revenue Generator',
        detail: `"${productStats.topProductByRevenue.name}" is your highest grossing item, generating ${formatCurrency(productStats.topProductByRevenue.revenue, currency)} across ${productStats.topProductByRevenue.quantity} orders.`,
        actionText: `Consider bundling complimentary services with ${productStats.topProductByRevenue.name} to expand order value.`,
        metric: formatCurrency(productStats.topProductByRevenue.revenue, currency),
      });
    }

    // 4. CRM Pipeline Velocity Ratio
    if (pipelineStats.totalPipelineValue > 0 && metrics.totalRevenue && metrics.totalRevenue > 0) {
      const coverageRatio = (pipelineStats.totalPipelineValue / metrics.totalRevenue).toFixed(1);
      const isStrong = Number(coverageRatio) >= 1.5;
      list.push({
        id: 'ins-pipe',
        type: isStrong ? 'positive' : 'info',
        title: 'Sales Pipeline Coverage Ratio',
        detail: `Active CRM deal value (${formatCurrency(pipelineStats.totalPipelineValue, currency)}) equals ${coverageRatio}× of realized historical revenue.`,
        actionText: isStrong
          ? 'Pipeline coverage is robust. Focus effort on closing deals in the Proposal & Negotiation stages.'
          : 'Nurture top-of-funnel leads to maintain a 2.0× pipeline coverage buffer.',
        metric: `${coverageRatio}× Coverage`,
      });
    }

    return list;
  }, [records, metrics, customerStats, productStats, pipelineStats, currency]);

  // Category expense breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    records.forEach((r) => {
      if (r.expense && r.expense > 0 && r.category) {
        map[r.category] = (map[r.category] || 0) + r.expense;
        total += r.expense;
      }
    });
    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [records]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover-card-lift transition-all">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
            <Zap className="w-4 h-4 text-rose-600" />
            <span>DataBeta Strategic Analytical Intelligence</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Financial Intelligence Suite
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Real-time diagnostic analytics, cashflow run-rate projections, risk audits, and deterministic scenario forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-4 py-2 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>100% Deterministic & Private</span>
        </div>
      </div>

      {records.length > 0 ? (
        <>
          {/* Executive Diagnostic Scorecard & Cashflow Forecast Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. Financial Health Scorecard Gauge */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4 hover-card-lift transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    Financial Health Index
                  </span>
                  <span className="text-xs font-bold font-mono px-3 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                    Grade {healthScorecard.grade}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {healthScorecard.score}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    out of 100 points
                  </span>
                </div>
              </div>

              {/* Sub-score Progress Meters */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-900">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                    <span>Profit Margin (30 pts max)</span>
                    <span className="font-mono">{healthScorecard.marginScore} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(healthScorecard.marginScore / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                    <span>Expense Control (25 pts max)</span>
                    <span className="font-mono">{healthScorecard.expenseControlScore} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${(healthScorecard.expenseControlScore / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                    <span>Account Portfolio Diversification</span>
                    <span className="font-mono">{healthScorecard.diversificationScore} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${(healthScorecard.diversificationScore / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 30/60/90-Day Cashflow Run-Rate Projections */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4 hover-card-lift transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    Predictive Cash Velocity
                  </span>
                  <Activity className="w-4 h-4 text-rose-600" />
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2">
                  30-90 Day Cashflow Forecast
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Extrapolated from your historical transaction volume.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-900">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">30 Days</span>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {formatCurrency(cashForecast.projected30Days || 0, currency)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">60 Days</span>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {formatCurrency(cashForecast.projected60Days || 0, currency)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">90 Days</span>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(cashForecast.projected90Days || 0, currency)}
                  </div>
                </div>
              </div>

              {cashForecast.monthlyBurnRate !== null && cashForecast.monthlyBurnRate > 0 && (
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Monthly Burn Rate: {formatCurrency(cashForecast.monthlyBurnRate, currency)}/mo</span>
                </div>
              )}
            </div>

            {/* 3. Expense Classification: Fixed vs Variable Cost Allocation */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4 hover-card-lift transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    Cost Audit Breakdown
                  </span>
                  <PieChart className="w-4 h-4 text-rose-600" />
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2">
                  Fixed vs Variable Overhead
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fixed Costs</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(expenseClassification.fixedExpenses, currency)}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Software, rent, SaaS</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Variable Costs</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(expenseClassification.variableExpenses, currency)}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">COGS, marketing</span>
                </div>
              </div>

              {/* Category Breakdown Progress Bar */}
              {categoryBreakdown.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-900">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Top Expense Categories
                  </span>
                  <div className="space-y-1.5">
                    {categoryBreakdown.slice(0, 3).map((cat) => (
                      <div key={cat.name} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate max-w-[120px]">{cat.name}</span>
                        <span className="font-mono text-slate-900 dark:text-white font-bold">{formatCurrency(cat.amount, currency)} ({cat.pct.toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive What-If Scenario Simulator Component */}
          <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-6 hover-card-lift transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-500">
                  <Sliders className="w-4 h-4" />
                  <span>Real-Time Scenario Modeling</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  What-If Revenue & Profit Simulator
                </h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-500">
                <span>Simulate Price & Volume Shifts</span>
              </div>
            </div>

            {/* Controls Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <span>Price Adjustment</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">{priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={priceChange}
                  onChange={(e) => setPriceChange(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <span>Sales Volume Change</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{volumeChange > 0 ? `+${volumeChange}%` : `${volumeChange}%`}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="100"
                  value={volumeChange}
                  onChange={(e) => setVolumeChange(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
                <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <span>Expense Drift</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={expenseChange}
                  onChange={(e) => setExpenseChange(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Projected Impact Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Projected Revenue</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {scenarioResult.projectedRevenue !== null ? formatCurrency(scenarioResult.projectedRevenue, currency) : 'N/A'}
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block font-mono">
                  {scenarioResult.revenueDelta >= 0 ? `+${formatCurrency(scenarioResult.revenueDelta, currency)}` : formatCurrency(scenarioResult.revenueDelta, currency)} delta
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Projected Net Profit</span>
                <div className={`text-xl font-black ${(scenarioResult.projectedProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
                  {scenarioResult.projectedProfit !== null ? formatCurrency(scenarioResult.projectedProfit, currency) : 'N/A'}
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block font-mono">
                  {scenarioResult.profitDelta >= 0 ? `+${formatCurrency(scenarioResult.profitDelta, currency)}` : formatCurrency(scenarioResult.profitDelta, currency)} profit gain
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Projected Margin</span>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                  {scenarioResult.projectedMargin !== null ? `${scenarioResult.projectedMargin.toFixed(1)}%` : 'N/A'}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-mono">Modeled Margin Strength</span>
              </div>
            </div>
          </div>

          {/* Actionable Strategic Insights Grid */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <span>Strategic Action Directives</span>
              <span className="text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-bold px-3 py-0.5 rounded-full">
                {dataInsights.length} Recommendations
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataInsights.map((ins) => (
                <div
                  key={ins.id}
                  className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between hover-card-lift transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        ins.type === 'positive'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          : ins.type === 'warning'
                          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                          : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800'
                      }`}>
                        {ins.type === 'positive' ? <CheckCircle2 className="w-4 h-4" /> : ins.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{ins.title}</h3>
                    </div>

                    {ins.metric && (
                      <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-rose-600 dark:text-rose-400 shrink-0">
                        {ins.metric}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">{ins.detail}</p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Action Plan:</strong> {ins.actionText}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Summary Observations */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4 hover-card-lift transition-all">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <span>Financial Observations Ledger</span>
              <span className="text-xs bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold px-3 py-0.5 rounded-full">
                {observations.length} Observations Recorded
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{obs.title}</span>
                    {obs.metric && <span className="font-mono text-rose-600 dark:text-rose-400">{obs.metric}</span>}
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">{obs.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Tracker integrated at bottom of Insights */}
          <GoalTrackerCard records={records} currency={currency} businessId={businessId} />
        </>
      ) : (
        <div className="bg-white dark:bg-zinc-950 p-12 rounded-3xl border border-slate-200/80 dark:border-zinc-800 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No Data Available for Insights</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Upload your business transaction spreadsheet to unlock automated financial insights and recommendations.
          </p>
        </div>
      )}
    </div>
  );
};
