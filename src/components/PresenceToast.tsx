import React, { useState, useEffect } from 'react';
import { PresenceEngine, PresenceEvent } from '../intelligence/presenceEngine';
import {
  TrendingUp,
  AlertTriangle,
  Receipt,
  GitPullRequest,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';

interface PresenceToastProps {
  context?: 'landing' | 'overview' | 'crm' | 'finance' | 'insights' | 'reports';
  enabled?: boolean;
}

export const PresenceToast: React.FC<PresenceToastProps> = ({
  context = 'landing',
  enabled = true,
}) => {
  const [events, setEvents] = useState<PresenceEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loaded = PresenceEngine.getContextualEvents(context, 30);
    setEvents(loaded);
    setCurrentIndex(0);
  }, [context]);

  useEffect(() => {
    if (!enabled || isDismissed || events.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
        setIsVisible(true);
      }, 300);
    }, 14000); // 14-second serene rotation

    return () => clearInterval(interval);
  }, [enabled, isDismissed, events.length, isPaused]);

  if (!enabled || isDismissed || events.length === 0) return null;

  const current = events[currentIndex] || events[0];

  const renderIcon = (type: PresenceEvent['iconType']) => {
    switch (type) {
      case 'revenue':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
      case 'leak':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case 'tax':
        return <Receipt className="w-3.5 h-3.5 text-indigo-500" />;
      case 'crm':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-500" />;
      case 'runway':
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case 'audit':
        return <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />;
      case 'sync':
      default:
        return <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-20 md:bottom-6 left-4 md:left-20 z-30 max-w-sm w-[calc(100vw-2rem)] md:w-96 transition-all duration-300 select-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xl rounded-2xl p-3.5 space-y-1.5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 flex items-center justify-center shrink-0">
              {renderIcon(current.iconType)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Live Telemetry • {current.timeAgo}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-md transition-colors"
            title="Dismiss telemetry feed"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headline */}
        <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
          {current.headline}
        </div>

        {/* Concrete Operational Detail */}
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
          {current.detail}
        </p>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-900 text-[10px] text-slate-400 font-mono">
          <span className="truncate">{current.persona} • {current.location}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓ Verified</span>
        </div>
      </div>
    </div>
  );
};
