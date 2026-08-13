import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck, ArrowRight, Building2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  user: User | null;
  businessName?: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  user,
  businessName = 'Your Business',
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');

  if (!isOpen || !user) return null;

  // If admin or already paid, skip subscription gating
  if (user.isAdmin || user.subscriptionStatus === 'paid') {
    onSuccess();
    return null;
  }

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'paid' })
        .eq('id', user.id);

      setLoading(false);
      onSuccess();
    } catch (err) {
      alert('Failed to activate trial. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative space-y-6 my-8 transition-colors">

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-500 shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest">Business Ready</span>
              <span className="text-[10px] bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <Building2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                {businessName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
              Choose Your DataBeta Plan
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
          Welcome <strong className="text-slate-900 dark:text-white">{user.name}</strong>! Your workspace for <strong className="text-rose-600 dark:text-rose-400">{businessName}</strong> is ready. Select a plan to unlock financial analytics, cashflow insights, CRM pipeline management, and deterministic intelligence reporting.
        </p>

        {/* Dev / Beta Access Banner */}
        <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl px-4 py-2.5 text-[11px] text-amber-800 dark:text-amber-400">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span><strong>Beta Access:</strong> Plans are currently free during the beta period. No payment required.</span>
        </div>

        {/* Pricing Plan Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Pro Plan */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'pro'
                ? 'border-rose-600 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-md shadow-rose-600/10 ring-1 ring-rose-600 dark:ring-rose-500'
                : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Pro</span>
              <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">POPULAR</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">$29 <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">/mo</span></div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 mb-4">Complete financial analysis, cashflow insights & custom reports for {businessName}.</p>
            <ul className="space-y-2 text-[11px] text-slate-700 dark:text-zinc-300">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" /> DataBeta Intelligence Engine</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" /> CSV/Excel Data Import</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" /> CRM Sales Pipeline</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" /> Financial Reports (PDF)</li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div
            onClick={() => setSelectedPlan('enterprise')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'enterprise'
                ? 'border-rose-600 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-md shadow-rose-600/10 ring-1 ring-rose-600 dark:ring-rose-500'
                : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">Enterprise</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">$79 <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">/mo</span></div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 mb-4">Multi-location tracking, priority support & executive export suite.</p>
            <ul className="space-y-2 text-[11px] text-slate-700 dark:text-zinc-300">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" /> All Pro features</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" /> Unlimited Team Accounts</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" /> Multi-business Workspaces</li>
            </ul>
          </div>
        </div>

        {/* Action Button & Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 dark:text-zinc-500">
            By proceeding, you agree to DataBeta's Terms of Service.
          </p>

          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Start Free Beta Trial</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
