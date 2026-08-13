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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-zinc-800/80 px-2 py-2 flex items-center justify-around shadow-2xl no-print">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[56px] min-h-[48px] transition-all active:scale-95 ${
              isActive
                ? 'text-rose-600 dark:text-rose-500 font-extrabold'
                : 'text-slate-500 dark:text-zinc-400 font-semibold hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* Mobile AI Copilot Trigger */}
      <button
        onClick={onOpenAI}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[56px] min-h-[48px] active:scale-95 transition-all"
        title="Open AI Business Copilot"
      >
        <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
          <Bot className="w-4 h-4" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-extrabold text-rose-600 dark:text-rose-500">Copilot</span>
      </button>
    </div>
  );
};
