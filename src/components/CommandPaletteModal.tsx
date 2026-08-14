import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Zap,
  Settings,
  FileText,
  Users,
  DollarSign,
  Plus,
  FileSpreadsheet,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { CoreTab } from '../types';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: CoreTab) => void;
  setActiveTab?: (tab: string) => void;
  onOpenAI?: () => void;
  onOpenUpload?: () => void;
  onOpenAddDeal?: () => void;
  onOpenAddTask?: () => void;
  onToggleTheme?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  setActiveTab,
  onOpenUpload,
  onOpenAddDeal,
  onOpenAddTask,
  onToggleTheme,
}) => {
  const [search, setSearch] = useState('');

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

  const navigateTo = (tab: CoreTab) => {
    if (onNavigate) onNavigate(tab);
    if (setActiveTab) setActiveTab(tab);
    onClose();
  };

  const commands = [
    {
      id: 'overview',
      title: "Today's Command Center",
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => navigateTo('overview'),
    },
    {
      id: 'crm',
      title: 'Sales CRM & Pipeline',
      category: 'Navigation',
      icon: Users,
      action: () => navigateTo('crm'),
    },
    {
      id: 'finance',
      title: 'Cash & Collections',
      category: 'Navigation',
      icon: DollarSign,
      action: () => navigateTo('finance'),
    },
    {
      id: 'insights',
      title: 'Profitability & Provenance',
      category: 'Navigation',
      icon: Zap,
      action: () => navigateTo('insights'),
    },
    {
      id: 'reports',
      title: 'Executive Reports',
      category: 'Navigation',
      icon: FileText,
      action: () => navigateTo('reports'),
    },
    {
      id: 'settings',
      title: 'Workspace Settings & Team',
      category: 'Navigation',
      icon: Settings,
      action: () => navigateTo('settings'),
    },
    {
      id: 'add-deal',
      title: 'Add New Sales Deal',
      category: 'Actions',
      icon: Plus,
      action: () => {
        onClose();
        if (onOpenAddDeal) onOpenAddDeal();
      },
    },
    {
      id: 'add-task',
      title: 'Schedule Follow-up Task',
      category: 'Actions',
      icon: Plus,
      action: () => {
        onClose();
        if (onOpenAddTask) onOpenAddTask();
      },
    },
    {
      id: 'import',
      title: 'Import CSV or Excel Ledger',
      category: 'Actions',
      icon: FileSpreadsheet,
      action: () => {
        onClose();
        if (onOpenUpload) onOpenUpload();
      },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scaleUp">
        <div className="p-3.5 border-b border-slate-100 dark:border-zinc-900 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or jump to..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-xs text-slate-900 dark:text-white outline-hidden"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded text-slate-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No matching commands found</div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors group text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{cmd.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{cmd.category}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
