import React, { useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { calculateCustomerAnalytics, calculateProductAnalytics } from '../utils/customerProductAnalytics';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { generateBusinessSummary } from '../utils/summaryEngine';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Info, Target, Users, Zap, ShieldCheck } from 'lucide-react';

interface InsightsViewProps {
  records: NormalizedRecord[];
  crmDeals: CRMContact[];
  currency: CurrencyCode;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ records, crmDeals, currency }) => {
  const metrics = useMemo(() => calculateMetrics(records), [records]);
  const customerStats = useMemo(() => calculateCustomerAnalytics(records), [records]);
  const productStats = useMemo(() => calculateProductAnalytics(records), [records]);
  const pipelineStats = useMemo(() => calculatePipelineSummary(crmDeals), [crmDeals]);
  const observations = useMemo(() => generateBusinessSummary(records), [records]);

  // Generate deterministic data-backed insights
  const dataInsights = useMemo(() => {
    const list: { id: string; type: 'positive' | 'warning' | 'info'; title: string; detail: string; metric?: string }[] = [];

    if (!records || records.length === 0) return list;

    // 1. Revenue & Margin Insight
    if (metrics.totalRevenue && metrics.totalRevenue > 0) {
      const marginStr = metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A';
      list.push({
        id: 'ins-margin',
        type: (metrics.profitMargin || 0) >= 20 ? 'positive' : 'warning',
        title: 'Net Profit Margin Efficiency',
        detail: `Your business has generated ${formatCurrency(metrics.totalRevenue, currency)} with a net margin of ${marginStr}.`,
        metric: marginStr,
      });
    }

    // 2. Customer Concentration Insight
    if (customerStats.topCustomerName && customerStats.topCustomerSharePct > 0) {
      const isHigh = customerStats.topCustomerSharePct > 30;
      list.push({
        id: 'ins-cust',
        type: isHigh ? 'warning' : 'info',
        title: 'Client Concentration Risk',
        detail: `Your top client "${customerStats.topCustomerName}" accounts for ${customerStats.topCustomerSharePct.toFixed(1)}% of your total revenue. ${isHigh ? 'Diversifying mid-tier clients is advised to mitigate dependence risk.' : 'Your customer revenue distribution is balanced.'}`,
        metric: `${customerStats.topCustomerSharePct.toFixed(1)}%`,
      });
    }

    // 3. Top Product Insight
    if (productStats.topProductByRevenue) {
      list.push({
        id: 'ins-prod',
        type: 'positive',
        title: 'Primary Revenue Driver',
        detail: `"${productStats.topProductByRevenue.name}" is your highest grossing item, driving ${formatCurrency(productStats.topProductByRevenue.revenue, currency)} across ${productStats.topProductByRevenue.quantity} units sold.`,
        metric: formatCurrency(productStats.topProductByRevenue.revenue, currency),
      });
    }

    // 4. CRM Pipeline Coverage Ratio
    if (pipelineStats.totalPipelineValue > 0 && metrics.totalRevenue && metrics.totalRevenue > 0) {
      const coverageRatio = (pipelineStats.totalPipelineValue / metrics.totalRevenue).toFixed(1);
      list.push({
        id: 'ins-pipe',
        type: Number(coverageRatio) >= 1.5 ? 'positive' : 'info',
        title: 'Pipeline Coverage Ratio',
        detail: `Your active CRM pipeline ($${formatCurrency(pipelineStats.totalPipelineValue, currency)}) represents ${coverageRatio}× your realized revenue.`,
        metric: `${coverageRatio}× Coverage`,
      });
    }

    return list;
  }, [records, metrics, customerStats, productStats, pipelineStats, currency]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-950 text-white p-7 rounded-3xl border border-zinc-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">
            Data-Backed Analytical Intelligence
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Business Insights Engine</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Automated recommendations calculated directly from your database records. No fabricated claims or fake AI models.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-xs font-bold text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Deterministic & Private</span>
        </div>
      </div>

      {records.length > 0 ? (
        <>
          {/* Key Insights List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataInsights.map((ins) => (
              <div
                key={ins.id}
                className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      ins.type === 'positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : ins.type === 'warning'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                    }`}>
                      {ins.type === 'positive' ? <CheckCircle2 className="w-4 h-4" /> : ins.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <h3 className="font-bold text-white text-sm">{ins.title}</h3>
                  </div>

                  {ins.metric && (
                    <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-rose-400">
                      {ins.metric}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-medium">{ins.detail}</p>
              </div>
            ))}
          </div>

          {/* Business Summary Observations */}
          <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <span>Financial Observations Summary</span>
              <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold px-3 py-0.5 rounded-full">
                {observations.length} Observations Generated
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1"
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{obs.title}</span>
                    {obs.metric && <span className="font-mono text-rose-400">{obs.metric}</span>}
                  </div>
                  <p className="text-zinc-400 leading-relaxed">{obs.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-zinc-950 p-12 rounded-3xl border border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">No Data Available for Insights</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Upload your business transaction spreadsheet to unlock automated financial insights and recommendations.
          </p>
        </div>
      )}
    </div>
  );
};
