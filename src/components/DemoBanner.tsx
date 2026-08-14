import React from 'react';
import { AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface DemoBannerProps {
  onSwitchToReal: () => void;
  onResetDemo?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onSwitchToReal, onResetDemo }) => {
  return (
    <div className="bg-amber-500/15 dark:bg-amber-950/40 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 no-print">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
          <AlertCircle className="w-3 h-3" />
          Demo Workspace
        </span>
        <span className="font-bold">
          Demo workspace — changes are not saved to your business data.
        </span>
        <span className="text-amber-700/80 dark:text-amber-300/70 hidden sm:inline">
          Explore realistic sales pipeline and cash operations risk-free.
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/50 dark:bg-black/40 hover:bg-white dark:hover:bg-black text-[11px] font-bold transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        )}
        <button
          onClick={onSwitchToReal}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-extrabold shadow-xs transition-all"
        >
          <span>Exit Demo & Open Real Workspace</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
