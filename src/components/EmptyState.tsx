import React from 'react';
import { Upload, Database, BarChart3, ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  onOpenUpload: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenUpload }) => {
  return (
    <div className="max-w-3xl mx-auto my-8 bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm p-8 sm:p-12 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto shadow-inner">
        <BarChart3 className="w-8 h-8 text-rose-600" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Understand Your Business Finances Instantly
        </h2>
        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          Upload your business sales or expense data (CSV or Excel) to calculate profit margins, revenue trends, and key metrics automatically.
        </p>
      </div>

      <div className="flex items-center justify-center pt-2">
        <button
          onClick={onOpenUpload}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Business Data (CSV / Excel)</span>
        </button>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-start gap-2.5">
          <Database className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">CSV & Excel Support</span>
            Automatic column mapping for date, revenue, expense, and category.
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <BarChart3 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">No Hardcoded Values</span>
            Calculations are performed strictly on your uploaded dataset.
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">100% Private</span>
            Runs entirely inside your browser. No server uploads or AI tracking.
          </div>
        </div>
      </div>
    </div>
  );
};
