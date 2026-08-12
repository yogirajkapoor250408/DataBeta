import React from 'react';
import { DatasetMeta, NormalizedRecord, CurrencyCode, CURRENCIES } from '../types';
import { FileText, Database, Layers, CheckCircle2, ShieldCheck, Globe, Trash2 } from 'lucide-react';
import { calculateMetrics } from '../utils/metricsCalculator';

interface SettingsViewProps {
  meta: DatasetMeta | null;
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  meta,
  records,
  currency,
  onCurrencyChange,
  onClearData,
}) => {
  const metrics = calculateMetrics(records);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Application Settings & Data Control</h2>
        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
          Configure currency defaults, inspect active dataset metadata, and manage local storage.
        </p>
      </div>

      {/* Currency Preferences */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Default Currency Display</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.values(CURRENCIES).map((c) => (
            <button
              key={c.code}
              onClick={() => onCurrencyChange(c.code)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                currency === c.code
                  ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/20 text-slate-900 dark:text-white font-extrabold'
                  : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="text-xs">{c.label}</div>
                <div className="text-lg font-black text-rose-600 mt-0.5">{c.symbol}</div>
              </div>
              {currency === c.code && <CheckCircle2 className="w-5 h-5 text-rose-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Active Dataset Meta */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Dataset Metadata</h3>
        </div>

        {meta ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-slate-400 font-medium block">File Name</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{meta.fileName}</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-slate-400 font-medium block">Total Ingested Rows</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{records.length} records</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-slate-400 font-medium block">Data Origin</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">User Spreadsheet Ingestion</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-slate-400 font-medium block">Parsed Date</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                {new Date(meta.uploadedAt).toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-zinc-400 italic">No active dataset currently loaded.</div>
        )}
      </div>

      {/* Security & Storage */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Privacy & Local Storage Control</h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
          DataBeta operates 100% locally in your browser memory using HTML5 LocalStorage. Your financial figures are never transmitted to external cloud servers.
        </p>

        <div className="pt-2">
          <button
            onClick={onClearData}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-extrabold text-xs rounded-full border border-rose-200 dark:border-rose-900 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Purge Active Dataset from Local Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
