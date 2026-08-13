import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import { BusinessMembership, Business } from '../services/businessService';

interface BusinessSelectorProps {
  memberships: BusinessMembership[];
  activeBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
  onOpenCreateNew: () => void;
}

export const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  memberships,
  activeBusiness,
  onSelectBusiness,
  onOpenCreateNew,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 dark:bg-zinc-900/80 hover:bg-slate-200/70 dark:hover:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-800/80 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors"
      >
        <span className="max-w-[130px] truncate">{activeBusiness ? activeBusiness.name : 'Select Business'}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-60 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 z-50 animate-fadeIn space-y-0.5 text-xs">
          <div className="px-2 py-1 font-mono text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Workspaces ({memberships.length})
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
            {memberships.map((m) => {
              const isSelected = activeBusiness?.id === m.business.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectBusiness(m.business);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold'
                      : 'hover:bg-slate-100/80 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-medium'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate text-xs font-semibold">{m.business.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{m.role} • {m.business.currency}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-1 mt-1 border-t border-slate-100 dark:border-zinc-900">
            <button
              onClick={() => {
                onOpenCreateNew();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-zinc-900 transition-colors font-medium text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
