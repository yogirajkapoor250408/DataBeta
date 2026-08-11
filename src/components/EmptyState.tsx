import React from 'react';
import { Upload, Sparkles, Database, BarChart3, ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  onOpenUpload: () => void;
  onLoadDemo: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenUpload, onLoadDemo }) => {
  return (
    <div className="max-w-3xl mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
        <BarChart3 className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Understand Your Business Finances Instantly
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Upload your business sales or expense data (CSV or Excel) to calculate profit margins, revenue trends, and key metrics automatically.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onOpenUpload}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all focus:ring-2 focus:ring-indigo-500"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Business Data</span>
        </button>

        <button
          onClick={onLoadDemo}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-300 font-semibold text-sm rounded-xl transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Try Demo Data</span>
        </button>
      </div>

      <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-slate-500">
        <div className="flex items-start gap-2.5">
          <Database className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 block">CSV & Excel Support</span>
            Automatic column mapping for date, revenue, expense, and category.
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 block">No Hardcoded Values</span>
            Calculations are performed strictly on your uploaded dataset.
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 block">100% Private</span>
            Runs entirely inside your browser. No server uploads or AI tracking.
          </div>
        </div>
      </div>
    </div>
  );
};
