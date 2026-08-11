import React, { useState } from 'react';
import { FIELD_DEFINITIONS, ColumnMapping, StandardField } from '../types';
import { validateMapping } from '../utils/columnMatcher';
import { AlertTriangle, CheckCircle2, ArrowRight, X } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectChange = (fieldKey: StandardField, selectedHeader: string) => {
    const newHeaderValue = selectedHeader === '' ? null : selectedHeader;
    setMapping((prev) => ({
      ...prev,
      [fieldKey]: newHeaderValue,
    }));
    setErrorMsg(null);
  };

  const handleConfirm = () => {
    const { isValid, missingFields } = validateMapping(mapping);
    if (!isValid) {
      setErrorMsg(
        `Required column mapping missing: ${missingFields.join(', ')}. Please select a column from your file to map to these required fields.`
      );
      return;
    }
    onApplyMapping(mapping);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            Data Import Step 2
          </div>
          <h2 className="text-xl font-bold text-slate-900">Map File Columns</h2>
          <p className="text-sm text-slate-600 mt-1">
            We analyzed <span className="font-semibold text-slate-800">{fileName}</span>. Match your file's headers to DataBeta's standard fields.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3.5 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Mapping Attention Required</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {FIELD_DEFINITIONS.map((field) => {
            const currentSelected = mapping[field.key] || '';
            const isMapped = Boolean(currentSelected);

            return (
              <div
                key={field.key}
                className={`p-3.5 rounded-lg border transition-all ${
                  isMapped
                    ? 'border-slate-200 bg-slate-50/50'
                    : field.required
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 text-sm">{field.label}</span>
                      {field.required ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-1.5 py-0.5 rounded">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{field.description}</p>
                  </div>

                  <div className="flex items-center gap-2 sm:w-64">
                    <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
                    <select
                      value={currentSelected}
                      onChange={(e) => handleSelectChange(field.key, e.target.value)}
                      className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 font-medium"
                    >
                      <option value="">-- Unmapped / Ignore --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {Object.values(mapping).filter(Boolean).length} of {FIELD_DEFINITIONS.length} fields mapped
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Process Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
