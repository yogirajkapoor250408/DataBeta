import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { calculateCustomerAnalytics, calculateProductAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateBusinessSummary } from '../utils/summaryEngine';
import { calculateFinancialHealthScore } from '../utils/healthCalculator';
import { classifyExpenses, calculateCashFlowProjections, simulateScenario } from '../utils/forecastingEngine';
import { BusinessDiagnosisCard } from './BusinessDiagnosisCard';
import { ProfitLeakCard } from './ProfitLeakCard';
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
  Sparkles,
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
  businessId,
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
        title: 'Net Operating Margin Efficiency',
        detail: `Your business generated ${formatCurrency(metrics.totalRevenue, currency)} in realized revenue with a net profit margin of ${marginStr}.`,
        actionText: isHighMargin
          ? 'Maintain operating leverage while scaling client acquisition.'
          : 'Audit non-essential vendor overhead to widen operating margin.',
        metric: marginStr,
      });
    }

    // 2. Customer Concentration
    if (customerStats.topCustomerName && customerStats.topCustomerSharePct > 0) {
      const isHighRisk = customerStats.topCustomerSharePct > 30;
      list.push({
        id: 'ins-cust',
        type: isHighRisk ? 'warning' : 'info',
        title: 'Client Concentration & Pareto Dependency',
        detail: `Your top client "${customerStats.topCustomerName}" accounts for ${customerStats.topCustomerSharePct.toFixed(1)}% of total revenue.`,
        actionText: isHighRisk
          ? `Lock in a multi-month contract with ${customerStats.topCustomerName} while acquiring mid-market clients to mitigate key-account dependency.`
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
        actionText: `Consider bundling complimentary services with ${productStats.topProductByRevenue.name} to expand average deal size.`,
        metric: formatCurrency(productStats.topProductByRevenue.revenue, currency),
      });
    }

    // 4. Sales Pipeline Coverage
    if (pipelineStats.totalPipelineValue > 0 && metrics.totalRevenue && metrics.totalRevenue > 0) {
      const coverageRatio = (pipelineStats.totalPipelineValue / metrics.totalRevenue).toFixed(1);
      const isStrong = Number(coverageRatio) >= 1.5;
      list.push({
        id: 'ins-pipe',
        type: isStrong ? 'positive' : 'info',
        title: 'Sales Pipeline Coverage Ratio',
        detail: `Active CRM deal value (${formatCurrency(pipelineStats.totalPipelineValue, currency)}) equals ${coverageRatio}× of realized historical revenue.`,
        actionText: isStrong
          ? 'Pipeline coverage is robust. Focus effort on closing deals in Proposal & Negotiation stages.'
          : 'Nurture top-of-funnel leads to maintain a 2.0× pipeline coverage buffer.',
        metric: `${coverageRatio}× Coverage`,
      });
    }

    return list;
  }, [records, metrics, customerStats, productStats, pipelineStats, currency]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full">
              Deterministic Business Intelligence Engine
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              • 100% statistical certainty • Zero LLM hallucinations
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Intelligence & Diagnosis Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Mathematical root-cause performance diagnosis, continuous profit leak audits, and predictive what-if simulators.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-4 py-2 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Calculated From Real Data</span>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="bg-white dark:bg-zinc-950 p-2 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setSubtab('diagnosis')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            subtab === 'diagnosis'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Root-Cause Diagnosis</span>
          </div>
        </button>

        <button
          onClick={() => setSubtab('leaks')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            subtab === 'leaks'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Profit Leak Scanner</span>
          </div>
        </button>

        <button
          onClick={() => setSubtab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            subtab === 'simulator'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If Growth Simulator</span>
          </div>
        </button>

        <button
          onClick={() => setSubtab('risks')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            subtab === 'risks'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5" />
            <span>Health & Pareto Risk</span>
          </div>
        </button>
      </div>

      {records.length > 0 ? (
        <>
          {/* Subtab 1: Diagnosis */}
          {subtab === 'diagnosis' && (
            <div className="space-y-4">
              <BusinessDiagnosisCard records={records} currency={currency} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2 hover-card-subtle"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{insight.title}</span>
                      {insight.metric && (
                        <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full">
                          {insight.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">{insight.detail}</p>
                    <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl text-xs text-slate-900 dark:text-zinc-200 font-medium">
                      💡 <strong>Executive Action:</strong> {insight.actionText}
                    </div>
                  </div>
                ))}
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
            <div className="bg-white dark:bg-zinc-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Mathematical What-If Growth Simulator</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Model the exact financial bottom-line impact of adjusting pricing, sales volume, and cost overhead</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-zinc-300">Price Adjustment:</span>
                    <span className="font-mono text-rose-600">{priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="50"
                    step="1"
                    value={priceChange}
                    onChange={(e) => setPriceChange(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Direct impact on gross unit revenue</p>
                </div>

                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-zinc-300">Sales Volume:</span>
                    <span className="font-mono text-emerald-600">{volumeChange > 0 ? `+${volumeChange}%` : `${volumeChange}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="100"
                    step="5"
                    value={volumeChange}
                    onChange={(e) => setVolumeChange(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Increases transactional units and variable costs</p>
                </div>

                {/* Expense Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-zinc-300">Operating Cost Shift:</span>
                    <span className="font-mono text-slate-700 dark:text-zinc-300">{expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    step="5"
                    value={expenseChange}
                    onChange={(e) => setExpenseChange(Number(e.target.value))}
                    className="w-full accent-slate-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Overhead, payroll, and SaaS expenses</p>
                </div>
              </div>

              {/* Simulated Results Banner */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Simulated Revenue</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {formatCurrency(scenarioResult.projectedRevenue, currency)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-mono mt-0.5">
                    +{formatCurrency(scenarioResult.projectedRevenue - (metrics.totalRevenue || 0), currency)} lift
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Simulated Net Profit</span>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-500 font-mono mt-1">
                    {formatCurrency(scenarioResult.projectedProfit, currency)}
                  </div>
                  <div className="text-[11px] text-rose-600 font-mono mt-0.5">
                    {scenarioResult.profitDelta >= 0 ? `+${formatCurrency(scenarioResult.profitDelta, currency)}` : formatCurrency(scenarioResult.profitDelta, currency)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Projected Net Margin</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {scenarioResult.projectedMargin.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    vs {(metrics.profitMargin || 0).toFixed(1)}% current
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab 4: Health & Pareto Risk */}
          {subtab === 'risks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Financial Health Audit</span>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-rose-600 dark:text-rose-500 font-mono">{healthScorecard.grade}</div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">Score: {healthScorecard.score}/100</div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Composite index across margin, stability, and expense control</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-900 text-xs">
                  {healthScorecard.factors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pareto 80/20 Concentration</span>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {customerStats.topCustomerSharePct.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Top Client Revenue Concentration ({customerStats.topCustomerName || 'N/A'})</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                  {customerStats.topCustomerSharePct > 25
                    ? '⚠️ Warning: Over 25% of business revenue relies on a single customer. Acquiring additional recurring accounts will reduce cashflow volatility.'
                    : '✅ Healthy client diversification. No single account dominates overall business cashflow.'}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-zinc-950 p-12 rounded-3xl border border-slate-200/80 dark:border-zinc-800 text-center text-slate-400 dark:text-zinc-500 space-y-2">
          <Zap className="w-8 h-8 mx-auto text-rose-600 opacity-60" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No Data Loaded</h3>
          <p className="text-xs max-w-sm mx-auto">Upload a transaction spreadsheet on the Overview page to generate automatic root-cause analysis and profit leak reports.</p>
        </div>
      )}
    </div>
  );
};
