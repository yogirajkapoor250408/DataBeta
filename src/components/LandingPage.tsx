import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Users,
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
  Briefcase,
  Layers,
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  Check,
  X,
  Mail,
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onExploreDemo }) => {
  const [monthlyPipeline, setMonthlyPipeline] = useState(75000);
  const [invoicedReceivables, setInvoicedReceivables] = useState(40000);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Transparent calculations for interactive calculator
  const estimatedRecoveredFollowups = Math.round(monthlyPipeline * 0.08); // 8% recovered stall rate
  const estimatedAcceleratedCash = Math.round(invoicedReceivables * 0.15); // 15% reduction in aging delay

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setShowContactModal(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="DataBeta Icon" className="w-8 h-8 object-contain rounded-xl shadow-xs" />
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                DataBeta
              </span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                Sales & Cash Operating System
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-zinc-400">
            <a href="#product" className="hover:text-slate-900 dark:hover:text-white transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#calculator" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cash Impact</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onExploreDemo}
              className="hidden sm:flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all border border-slate-200 dark:border-zinc-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Explore Demo</span>
            </button>

            <button
              onClick={() => onOpenAuth('signin')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all"
            >
              Sign In
            </button>

            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all active:scale-95"
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-2xs mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
          <span>Built for 2–25 Person Businesses • Zero Fake Intelligence</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.12]">
          Know exactly who to follow up with today and what it means for your cash.
        </h1>

        <p className="text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Stop losing deals across WhatsApp, scattered notes, and disconnected spreadsheets. DataBeta turns your daily sales follow-ups into clear, reliable cash flow and margin visibility.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Create Free Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-zinc-800 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Try Safe Demo Mode</span>
          </button>
        </div>

        {/* Hero Interactive Console Mockup */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold text-slate-400 ml-2">Today's Action Console</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Verified Provenance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Next Action Due</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Proposal Review • Sarah Chen</div>
                <p className="text-[11px] text-slate-500">Proposal sent 3 days ago ($85,000 deal value). Follow up today.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Weighted Pipeline Inflow</span>
                <div className="text-sm font-black text-emerald-600 font-mono">$187,000</div>
                <p className="text-[11px] text-slate-500">Probability-adjusted cash closing this calendar month.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Overdue Collections</span>
                <div className="text-sm font-black text-rose-600 font-mono">$22,500 Due</div>
                <p className="text-[11px] text-slate-500">Invoice #001 (Nexus Dynamics) is 9 days past due.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white dark:bg-zinc-950 border-y border-slate-200/80 dark:border-zinc-800 px-6">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
              3-Step Workflow
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
              How DataBeta Solves Your Daily Sales-and-Cash Disconnect
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 font-black">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Connect Leads & Invoices</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add deals in 10 seconds or import your CSV/Excel spreadsheet. DataBeta maps your contacts, deals, and open billing with pre-write validation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 font-black">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Execute Today's Action Queue</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log calls, copy drafted WhatsApp follow-up scripts with one tap, and advance deals through 7 customizable pipeline stages without losing context.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 font-black">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Real Cash & Margin Clarity</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                See committed invoice cash vs weighted pipeline inflow and operating overhead. Every metric is backed by full record provenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Cash Acceleration Calculator */}
      <section id="calculator" className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
            Transparent ROI Model
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Estimate Your Pipeline Recovery & Cash Acceleration
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Illustrative estimate based on typical 8% deal salvage from timely follow-ups and 15% reduction in invoice aging delay.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-zinc-300">Monthly Open Pipeline ($):</span>
                <span className="font-mono text-rose-600 font-bold">{formatCurrency(monthlyPipeline, 'USD')}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={monthlyPipeline}
                onChange={(e) => setMonthlyPipeline(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Total volume of active quotes and proposals</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-zinc-300">Invoiced Receivables Outstanding ($):</span>
                <span className="font-mono text-emerald-600 font-bold">{formatCurrency(invoicedReceivables, 'USD')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={invoicedReceivables}
                onChange={(e) => setInvoicedReceivables(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Average monthly billed billing awaiting collection</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Pipeline Recovered / Mo</span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-0.5">
                +{formatCurrency(estimatedRecoveredFollowups, 'USD')}
              </div>
              <p className="text-[11px] text-slate-500">Deals saved by timely Next Best Action follow-ups</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Accelerated Cash Flow / Mo</span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">
                +{formatCurrency(estimatedAcceleratedCash, 'USD')}
              </div>
              <p className="text-[11px] text-slate-500">Collected faster via automated reminder workflows</p>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Pricing Section */}
      <section id="pricing" className="py-16 bg-white dark:bg-zinc-950 border-y border-slate-200/80 dark:border-zinc-800 px-6">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full">
              Transparent Pricing
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
              Simple, Honest Plans for Growing Teams
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              No hidden fees, no enterprise exaggerations, and no credit card required to start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {/* Free Starter */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Starter</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">$0</div>
                <p className="text-xs text-slate-500">For solo founders tracking leads and cash manually.</p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                  <li className="flex items-center gap-2">✓ 1 Workspace user</li>
                  <li className="flex items-center gap-2">✓ Up to 50 active deals & invoices</li>
                  <li className="flex items-center gap-2">✓ Today's action queue</li>
                  <li className="flex items-center gap-2">✓ CSV import & templates</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold"
              >
                Get Started Free
              </button>
            </div>

            {/* Team Tier */}
            <div className="p-6 rounded-2xl border-2 border-rose-600 bg-white dark:bg-zinc-950 space-y-4 flex flex-col justify-between shadow-xl relative">
              <span className="absolute -top-3 right-6 px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Most Popular
              </span>
              <div className="space-y-3">
                <span className="text-xs font-bold text-rose-600 uppercase">Team Tier</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">$29 <span className="text-xs text-slate-400 font-normal">/ user / mo</span></div>
                <p className="text-xs text-slate-500">For small teams closing deals and managing receivables together.</p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <li className="flex items-center gap-2">✓ Unlimited deals & contacts</li>
                  <li className="flex items-center gap-2">✓ 30-Day Cash Calendar & Outlook</li>
                  <li className="flex items-center gap-2">✓ Role-based permissions & audit logs</li>
                  <li className="flex items-center gap-2">✓ WhatsApp follow-up copy scripts</li>
                  <li className="flex items-center gap-2">✓ Printable executive PDF reports</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/30"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Growth Tier */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Growth</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">$79 <span className="text-xs text-slate-400 font-normal">/ mo flat</span></div>
                <p className="text-xs text-slate-500">For established operations requiring dedicated onboarding.</p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                  <li className="flex items-center gap-2">✓ Up to 10 team seats included</li>
                  <li className="flex items-center gap-2">✓ Advanced customer margin analytics</li>
                  <li className="flex items-center gap-2">✓ Complete JSON/CSV data backups</li>
                  <li className="flex items-center gap-2">✓ Priority email & chat support</li>
                </ul>
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-900 dark:text-white rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700"
              >
                Talk to Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section id="security" className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full">
            Trust & Architecture
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Enterprise-Grade Isolation Without the Complexity
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
            <Lock className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Row-Level Tenant Isolation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every query is secured with PostgreSQL Row Level Security (RLS) policies. Your records are strictly partitioned.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Encrypted at Rest & Transit</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              TLS 1.3 encryption across all network transfers and AES-256 encrypted database storage on Supabase Cloud.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">You Own Your Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export your full workspace anytime as JSON or CSV. Zero lock-in, zero selling of customer contact information.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 py-12 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="DataBeta" className="w-6 h-6 rounded-lg" />
            <span className="font-bold text-slate-900 dark:text-white">DataBeta Technologies</span>
            <span>• Sales & Cash OS</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={() => setShowContactModal(true)} className="hover:text-slate-900 dark:hover:text-white">
              Contact & Demo
            </button>
            <a href="#security" className="hover:text-slate-900 dark:hover:text-white">Security Architecture</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white">Pricing</a>
          </div>
        </div>
      </footer>

      {/* Contact / Book a Demo Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Contact & Book a Demo</h3>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-sm font-bold text-slate-900 dark:text-white">Request Received</div>
                <p className="text-xs text-slate-500">We will reach out to you within 24 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">How can we help?</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your team size and sales workflow..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold shadow-xs"
                >
                  Send Demo Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
