import React, { useState } from 'react';
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-full text-xs font-bold text-slate-900 dark:text-white transition-all shadow-xs"
      >
        <Building2 className="w-3.5 h-3.5 text-rose-600" />
        <span className="max-w-[120px] truncate">{activeBusiness ? activeBusiness.name : 'Select Business'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1 text-xs">
          <div className="px-3 py-1.5 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
            Your Businesses ({memberships.length})
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1">
            {memberships.map((m) => {
              const isSelected = activeBusiness?.id === m.business.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectBusiness(m.business);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-medium'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate font-bold">{m.business.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">{m.role} • {m.business.currency}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-900">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCreateNew();
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Business</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
