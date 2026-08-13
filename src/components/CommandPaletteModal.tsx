import React, { useState, useEffect } from 'react';
import { Search, LayoutDashboard, BarChart3, Zap, GitPullRequest, Bot, Settings, FileText, ArrowRight, X, Table, Users, Receipt, DollarSign } from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenAI,
}) => {
  const [search, setSearch] = useState('');

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'overview', title: 'Executive Overview Command Center', category: 'Navigation', icon: LayoutDashboard, action: () => { setActiveTab('overview'); onClose(); } },
    { id: 'crm', title: 'CRM, Pipeline, Contacts & Tasks', category: 'CRM', icon: Users, action: () => { setActiveTab('crm'); onClose(); } },
    { id: 'finance', title: 'Finance Ledger, P&L, Taxes & Runway', category: 'Finance', icon: DollarSign, action: () => { setActiveTab('finance'); onClose(); } },
    { id: 'insights', title: 'Business Intelligence, Leaks & Forecaster', category: 'Intelligence', icon: Zap, action: () => { setActiveTab('insights'); onClose(); } },
    { id: 'reports', title: 'Executive Financial Reports & Statements', category: 'Reports', icon: FileText, action: () => { setActiveTab('reports'); onClose(); } },
    { id: 'settings', title: 'Business Settings & Data Backup', category: 'Settings', icon: Settings, action: () => { setActiveTab('settings'); onClose(); } },
    { id: 'ai', title: 'Ask AI Business Copilot', category: 'AI Assistant', icon: Bot, action: () => { onClose(); onOpenAI(); } },
  ];

  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-zinc-800 w-full max-w-xl shadow-2xl overflow-hidden space-y-0">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between gap-3">
          <Search className="w-5 h-5 text-rose-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search platform (e.g., 'Show revenue', 'Insights')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-900/80 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-rose-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{cmd.title}</div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{cmd.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">No matching commands found</div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-900 flex justify-between items-center text-[10px] font-mono text-slate-400 px-4">
          <span>Navigate with Arrow keys</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
