import React, { useState } from 'react';
import { Sparkles, FileSpreadsheet, BarChart3, Users, Bot, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { markTourCompleted } from '../utils/authEngine';
import { User } from '../types';

interface GuidedTourModalProps {
  isOpen: boolean;
  user: User;
  onClose: (updatedUser: User) => void;
}

const STEPS = [
  {
    step: 1,
    title: 'Upload Spreadsheets & Auto-Mapping',
    icon: FileSpreadsheet,
    description: 'Upload any CSV or Excel transaction file from Shopify, Stripe, WooCommerce, QuickBooks, or Square. DataBeta auto-detects columns and processes data 100% locally in browser memory.',
    badge: 'Step 1 of 4',
  },
  {
    step: 2,
    title: 'Financial Intelligence & Unit Margins',
    icon: BarChart3,
    description: 'View real-time profit margins, break-even targets, Pareto 80/20 customer spend distributions, and IRS Schedule C tax deduction estimates.',
    badge: 'Step 2 of 4',
  },
  {
    step: 3,
    title: 'Integrated CRM Deal Pipeline',
    icon: Users,
    description: 'DataBeta automatically links customer sales to CRM contact cards, tracks Lifetime Value (LTV), and allows moving deals across Kanban pipeline stages.',
    badge: 'Step 3 of 4',
  },
  {
    step: 4,
    title: 'Private Local Insight Engine',
    icon: Bot,
    description: 'Consult your private Rule-Based Insight Engine for executive briefings, cost risk analysis, and margin growth advice — 100% algorithm driven with zero cloud API keys.',
    badge: 'Step 4 of 4',
  },
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIdx];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const updated = markTourCompleted(user);
    onClose(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 max-w-lg w-full p-8 relative space-y-6 animate-fadeIn">
        <button
          onClick={handleComplete}
          className="absolute top-5 right-5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold flex items-center gap-1"
        >
          <span>Skip Tour</span>
          <X className="w-4 h-4" />
        </button>

        {/* Step Badge & Title Header */}
        <div className="space-y-3">
          <span className="bg-rose-600 text-white font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
            {currentStep.badge}
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome, {user.name}!
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Let’s take a quick 4-step guided tour of DataBeta’s features.
          </p>
        </div>

        {/* Active Step Graphic Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-600/30">
            <StepIcon className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{currentStep.title}</h4>
          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Progress Step Indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`h-2 rounded-full transition-all ${
                idx === currentStepIdx
                  ? 'w-8 bg-rose-600'
                  : 'w-2 bg-slate-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Next / Finish Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleComplete}
            className="text-xs text-slate-500 dark:text-zinc-400 font-bold hover:text-slate-900 dark:hover:text-white"
          >
            Skip & Open Platform
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full text-xs shadow-md shadow-rose-600/30 transition-all hover:scale-105"
          >
            <span>{currentStepIdx === STEPS.length - 1 ? 'Finish & Launch Platform' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
