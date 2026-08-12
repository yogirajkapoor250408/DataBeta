import React, { useState } from 'react';
import {
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  Bot,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Globe,
  Sliders,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onExploreDemo }) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(35000);

  const estimatedTaxSavings = Math.round(monthlyRevenue * 0.12 * 0.25 * 12);
  const estimatedMarginLift = Math.round(monthlyRevenue * 0.08 * 12);

  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Goodwill Header Navigation */}
      <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-rose-600/30">
              DB
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                DataBeta
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Financial Intelligence & CRM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExploreDemo}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all"
            >
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>Try Live Platform</span>
            </button>

            <button
              onClick={() => onOpenAuth('signin')}
              className="px-5 py-2 rounded-full text-xs font-extrabold text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all"
            >
              Sign In
            </button>

            <button
              onClick={() => onOpenAuth('signup')}
              className="px-5 py-2 rounded-full text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto text-center space-y-8 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-extrabold shadow-xs mx-auto">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span>100% In-Browser Privacy Guarantee • Zero Cloud Uploads</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Financial Intelligence & Integrated CRM Built for Premium Businesses.
        </h1>

        <p className="text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Upload any CSV or Excel sales spreadsheet to calculate profit margins, track customer pipeline deals, estimate IRS Schedule C tax savings, and consult your private Local AI Advisor.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-full shadow-xl shadow-rose-600/30 transition-all hover:scale-105"
          >
            <span>Start Free Today</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-950 dark:bg-white text-white dark:text-black font-extrabold text-sm rounded-full shadow-lg transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Explore Interactive Demo</span>
          </button>
        </div>

        {/* Hero Card Graphic Preview */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl text-left space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-600" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-zinc-400 ml-2">databeta-executive-console.v3</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                Live Preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-xs text-zinc-400 font-semibold">New Customer Growth</div>
                <div className="text-3xl font-black text-white mt-1">52</div>
                <div className="text-[11px] text-zinc-500 mt-1">/ 6-months average</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-xs text-zinc-400 font-semibold">Successful Deals Rate</div>
                <div className="text-3xl font-black text-rose-500 mt-1">73%</div>
                <div className="text-[11px] text-zinc-500 mt-1">/ +6 % in this month</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-xs text-zinc-400 font-semibold">Active Prepayments</div>
                <div className="text-3xl font-black text-white mt-1">$22,091</div>
                <div className="text-[11px] text-zinc-500 mt-1">/ 100% verified locally</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Financial ROI Calculator Widget */}
      <section className="py-16 bg-white dark:bg-zinc-950 border-y border-slate-200/80 dark:border-zinc-800 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest">
              Interactive ROI Calculator
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              See How Much Tax & Margin You Save
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Drag your monthly revenue slider to calculate projected annual savings using DataBeta algorithms.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-zinc-200 mb-2">
                <span>Monthly Business Revenue:</span>
                <span className="text-rose-600 dark:text-rose-400 font-mono text-base font-extrabold">
                  {formatCurrency(monthlyRevenue, 'USD')} / mo
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                <span>$5,000 / mo</span>
                <span>$100,000 / mo</span>
                <span>$250,000 / mo</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Estimated Annual Tax Savings</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(estimatedTaxSavings, 'USD')}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Based on Schedule C expense deduction mapping</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Projected Annual Profit Margin Lift</div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {formatCurrency(estimatedMarginLift, 'USD')}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Through operational anomaly & price optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Showcase */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Designed for Modern Businesses & Founders
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-xl mx-auto">
            Everything you need to analyze revenues, control expenses, manage deals, and consult AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Financial Intelligence</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Instant profit margins, break-even targets, unit economics, and Pareto 80/20 customer concentration.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Integrated CRM Pipeline</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Auto-links client LTV from sales data. Manage deals across Kanban stages with full activity logs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Local AI Financial Advisor</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Ask natural language queries and get instant executive briefings powered 100% by local algorithms.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Tax Schedule C Estimator</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Auto-categorizes tax-deductible operating expenses to estimate potential year-end tax debt reduction.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tier Cards */}
      <section className="py-16 bg-white dark:bg-zinc-950 border-t border-slate-200/80 dark:border-zinc-800 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest">
              Simple Transparent Pricing
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Start Free, Scale as You Grow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Free */}
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Starter Free
                </span>
                <div className="text-4xl font-black text-slate-900 dark:text-white">$0</div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Perfect for solopreneurs & small stores testing financial data.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 5,000 transactions/file</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% In-Browser Local Memory</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Basic CRM Deal Pipeline</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full font-bold text-xs"
              >
                Get Started Free
              </button>
            </div>

            {/* Growth Pro */}
            <div className="p-7 rounded-3xl bg-zinc-950 text-white border-2 border-rose-600 shadow-xl space-y-6 flex flex-col justify-between relative">
              <span className="absolute -top-3.5 right-6 bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Most Popular
              </span>
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
                  Growth Pro
                </span>
                <div className="text-4xl font-black text-white">$29 <span className="text-xs text-zinc-400 font-normal">/ month</span></div>
                <p className="text-xs text-zinc-400">
                  Full intelligence suite for growing e-commerce & SaaS businesses.
                </p>
                <ul className="space-y-2 text-xs text-zinc-200 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> Unlimited CSV & Excel Records</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> Local AI Financial Advisor Engine</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> Auto-Linked LTV CRM Pipeline</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> IRS Schedule C Tax Deduction Suite</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full text-xs shadow-md shadow-rose-600/30"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Enterprise
                </span>
                <div className="text-4xl font-black text-slate-900 dark:text-white">$99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Dedicated multi-user account management and custom reporting.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dedicated Admin Monitoring Console</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Custom PDF Report Branding</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority 24/7 Support</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full font-bold text-xs"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Goodwill Footer */}
      <footer className="bg-zinc-950 text-white py-12 px-6 border-t border-zinc-900 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
              DB
            </div>
            <div>
              <span className="font-extrabold text-white block">DataBeta Inc.</span>
              <span>100% In-Browser Privacy Financial Intelligence Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={onExploreDemo} className="hover:text-white">Live Platform Demo</button>
            <button onClick={() => onOpenAuth('signin')} className="hover:text-white">Sign In</button>
            <button onClick={() => onOpenAuth('signup')} className="hover:text-white">Sign Up</button>
          </div>

          <div className="text-right text-[11px] text-zinc-500">
            © {new Date().getFullYear()} DataBeta • All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
