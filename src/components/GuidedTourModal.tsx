import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, LayoutDashboard, Table, Users, GitPullRequest, Zap, Upload } from 'lucide-react';
import { User } from '../types';
import { CoreTab } from './Navbar';

interface GuidedTourModalProps {
  isOpen: boolean;
  user: User;
  activeTab: CoreTab;
  setActiveTab: (tab: CoreTab) => void;
  onClose: (updatedUser: User) => void;
}

interface TourStep {
  step: number;
  title: string;
  tab: CoreTab;
  description: string;
  targetSelector: string;
  highlightText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: 'Executive Overview Dashboard',
    tab: 'overview',
    description: 'This is your company control center. It computes real-time margins, revenue trends, and daily priority attention items.',
    targetSelector: 'main',
    highlightText: 'Executive Command Center'
  },
  {
    step: 2,
    title: 'Connected CRM & Pipeline Studio',
    tab: 'crm',
    description: 'Manage active deals across the 6-stage Kanban board, search contacts & companies, and track follow-up tasks.',
    targetSelector: 'main',
    highlightText: 'CRM & Pipeline'
  },
  {
    step: 3,
    title: 'Financial Intelligence & Ledger',
    tab: 'finance',
    description: 'Track double-entry transactions, calculate IRS Schedule C quarterly tax liabilities, and monitor cash runway.',
    targetSelector: 'main',
    highlightText: 'Financial Intelligence'
  },
  {
    step: 4,
    title: 'Root-Cause Intelligence & Leaks',
    tab: 'insights',
    description: 'Explore root-cause performance diagnosis, 5-vector profit leak scanners, and mathematical what-if growth simulators.',
    targetSelector: 'main',
    highlightText: 'Intelligence Studio'
  },
  {
    step: 5,
    title: 'Publication-Grade Reports',
    tab: 'reports',
    description: 'Generate customized executive PDF reports with company logos, custom titles, and P&L statements.',
    targetSelector: 'main',
    highlightText: 'Reports Publisher'
  },
  {
    step: 6,
    title: 'Import Spreadsheet Files',
    tab: 'overview',
    description: 'Upload any standard Shopify, Stripe, or custom CSV/Excel files. DataBeta auto-maps header columns instantly.',
    targetSelector: 'button:has(svg.lucide-upload), button:contains("Import")',
    highlightText: 'Import Utility'
  }
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  user,
  activeTab,
  setActiveTab,
  onClose,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Sync tab with active tour step
  useEffect(() => {
    if (isOpen) {
      setActiveTab(TOUR_STEPS[currentStepIdx].tab);
    }
  }, [currentStepIdx, isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    const updated = { ...user, isFirstTimeUser: false };
    onClose(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center sm:items-center p-4">
      {/* Floating Tour Guide Box */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 max-w-md w-full p-6 relative space-y-4 animate-fadeIn transition-all duration-200 mb-20 sm:mb-0">
        <button
          onClick={handleComplete}
          className="absolute top-5 right-5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200"
        >
          <X className="w-5 h-5 active:scale-90 transition-transform" />
        </button>

        {/* Header Indicator */}
        <div className="flex items-center justify-between">
          <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
            Step {currentStep.step} of {TOUR_STEPS.length}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            Target: {currentStep.highlightText}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600 animate-pulse" />
            <span>{currentStep.title}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed pt-1">
            {currentStep.description}
          </p>
        </div>

        {/* Interactive Pointer Notification Box */}
        <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
          <div className="font-extrabold shrink-0 mt-0.5">TIP:</div>
          <p className="font-medium">
            Notice how the interface automatically switches to the <span className="font-bold underline">{currentStep.tab.toUpperCase()}</span> screen to guide your workspace setup.
          </p>
        </div>

        {/* Tour Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-900">
          <button
            onClick={handleComplete}
            className="text-xs text-slate-400 dark:text-zinc-500 font-bold hover:text-slate-600 dark:hover:text-zinc-300 active:scale-95 transition-all"
          >
            End Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIdx > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-full active:scale-95 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-md shadow-rose-600/30 active:scale-95 transition-all"
            >
              <span>{currentStepIdx === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
