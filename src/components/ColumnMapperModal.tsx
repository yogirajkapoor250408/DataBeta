import React, { useState } from 'react';
import { ColumnMapping } from '../types';
import { validateMapping } from '../utils/columnMatcher';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ColumnMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  initialMapping: ColumnMapping;
  fileName: string;
  onApplyMapping: (mapping: ColumnMapping) => void;
}

export const ColumnMapperModal: React.FC<ColumnMapperModalProps> = ({
  isOpen,
  onClose,
  headers,
  initialMapping,
  fileName,
  onApplyMapping,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  if (!isOpen) return null;

  const validation = validateMapping(mapping);

  const handleSelectChange = (field: keyof ColumnMapping, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value === 'none' ? null : value,
    }));
  };

  const handleConfirm = () => {
    if (validation.isValid) {
      onApplyMapping(mapping);
    }
  };

  const renderSelect = (field: keyof ColumnMapping, label: string, isRequired: boolean, helpText: string) => {
    const selectedVal = mapping[field] || 'none';

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
            <span>{label}</span>
            {isRequired && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {mapping[field] && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Mapped
            </span>
          )}
        </div>
        <select
          value={selectedVal}
          onChange={(e) => handleSelectChange(field, e.target.value)}
          className={`w-full bg-slate-50 dark:bg-zinc-900 border rounded-full px-4 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer ${
            mapping[field] ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-zinc-800'
          }`}
        >
          <option value="none">-- Not Mapped --</option>
          {headers.map((h) => (
            <option key={h} value={h} className="bg-white dark:bg-black text-slate-900 dark:text-white">
              {h}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-400 dark:text-zinc-500">{helpText}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 max-w-xl w-full p-6 relative my-8 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Spreadsheet Columns</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Source file: <span className="font-bold text-slate-700 dark:text-zinc-300">{fileName}</span>
          </p>
        </div>

        {!validation.isValid && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 rounded-2xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Action Required: </span>
              {validation.missingFields.join(' & ')} could not be auto-detected. Please select them manually below.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 max-h-[60vh] overflow-y-auto pr-1">
          {renderSelect('date', 'Transaction Date', true, 'Column containing order/tx dates')}
          {renderSelect('revenue', 'Revenue / Sales Amount', true, 'Column for sales income ($)')}
          {renderSelect('expense', 'Expense / Operational Cost', false, 'Column for costs or expenses ($)')}
          {renderSelect('category', 'Category / Department', false, 'Grouping for revenue or expense categories')}
          {renderSelect('product', 'Product / Item Name', false, 'Product description or SKU title')}
          {renderSelect('customer', 'Customer / Account Name', false, 'Client name or customer email')}
          {renderSelect('quantity', 'Quantity Sold', false, 'Unit quantity count')}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>

          <button
            disabled={!validation.isValid}
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-rose-600/30 transition-all"
          >
            Confirm & Process Dataset
          </button>
        </div>
      </div>
    </div>
  );
};
