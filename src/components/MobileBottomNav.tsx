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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-slate-200/70 dark:border-zinc-800/70 px-2 py-1.5 flex items-center justify-around no-print">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[50px] transition-colors active:scale-95 ${
              isActive
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-400 dark:text-zinc-500 font-medium hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.8} />
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* Mobile AI Copilot Trigger */}
      <button
        onClick={onOpenAI}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[50px] active:scale-95 transition-colors"
        title="Open AI Business Copilot"
      >
        <div className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center shadow-xs">
          <Bot className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-bold text-rose-600 dark:text-rose-400">Copilot</span>
      </button>
    </div>
  );
};
