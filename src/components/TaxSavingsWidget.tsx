import React, { useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateTaxOptimization } from '../intelligence/taxIntelligence';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';

interface TaxSavingsWidgetProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onNavigateTab: (tab: 'overview' | 'transactions' | 'customers' | 'pipeline' | 'insights') => void;
}

export const TaxSavingsWidget: React.FC<TaxSavingsWidgetProps> = ({
  records,
  currency,
  onNavigateTab,
}) => {
  const taxData = useMemo(() => calculateTaxOptimization(records, currency), [records, currency]);

  if (!records || records.length === 0 || taxData.estimatedTaxSavings === 0) {
    return null; // Don't show if there are no savings to report
  }

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-3xl shadow-sm text-white flex flex-col justify-between h-full min-h-[220px] transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-100 font-bold text-[10px] uppercase tracking-wider mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>Tax Intelligence</span>
          </div>
          <h3 className="text-sm font-semibold text-emerald-50">Est. Schedule C Deductions</h3>
        </div>
      </div>

      <div className="relative z-10 my-4">
        <div className="text-3xl font-black tracking-tight drop-shadow-sm">
          {formatCurrency(taxData.estimatedTaxSavings, currency)}
        </div>
        <div className="text-xs font-medium text-emerald-100 mt-1 flex items-center gap-1">
           <TrendingUp className="w-3 h-3" /> Potential Tax Savings
        </div>
      </div>

      <div className="relative z-10 pt-4 border-t border-emerald-400/30 flex items-center justify-between">
        <div className="text-[10px] font-medium text-emerald-100 max-w-[140px] leading-tight">
          Based on {taxData.categories.length} deductible business expense categories.
        </div>
        <button
          onClick={() => onNavigateTab('insights')}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-md"
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
