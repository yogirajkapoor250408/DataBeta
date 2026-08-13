import React from 'react';
import { LayoutDashboard, Users, DollarSign, Zap, FileText, Bot } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAI,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'insights', label: 'Insights', icon: Zap },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-slate-200/70 dark:border-zinc-800/70 px-2 pt-1 pb-safe flex items-center justify-around no-print shadow-lg select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[52px] min-h-[44px] touch-manipulation transition-all active:scale-95 ${
              isActive
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-400 dark:text-zinc-500 font-medium hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-600 dark:bg-rose-500" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">{tab.label}</span>
          </button>
        );
      })}

      {/* Mobile AI Copilot Trigger */}
      <button
        onClick={onOpenAI}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[52px] min-h-[44px] touch-manipulation active:scale-95 transition-all"
        title="Open AI Business Copilot"
      >
        <div className="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-2xs">
          <Bot className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
        <span className="text-[10px] mt-1 tracking-tight font-bold text-rose-600 dark:text-rose-400 leading-none">Copilot</span>
      </button>
    </div>
  );
};
