import React from 'react';
import { DatasetMeta, NormalizedRecord, CurrencyCode, CURRENCIES } from '../types';
import { Download, Trash2, ShieldCheck, HardDrive, Globe } from 'lucide-react';
import Papa from 'papaparse';

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
  const handleExportCSV = () => {
    if (!records || records.length === 0) return;

    const exportRows = records.map((r) => ({
      Date: r.dateString,
      Category: r.category || '',
      Product_Service: r.product || '',
      Customer: r.customer || '',
      Revenue: r.revenue !== null ? r.revenue : '',
      Expense: r.expense !== null ? r.expense : '',
      Profit: r.profit !== null ? r.profit : '',
      Quantity: r.quantity !== undefined ? r.quantity : '',
    }));

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `databeta_processed_${meta?.fileName || 'dataset'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Active Dataset Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Dataset Status</h2>
            <p className="text-xs text-slate-500">Overview of currently loaded transaction data</p>
          </div>
        </div>

        {meta ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Source File</div>
              <div className="text-sm font-bold text-slate-900 truncate mt-0.5">{meta.fileName}</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Record Count</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{records.length} transactions</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Data Origin</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {meta.isDemo ? (
                  <span className="text-amber-600 font-semibold">Demo Sample Mode</span>
                ) : (
                  <span className="text-indigo-600 font-semibold">User Uploaded</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No active dataset is currently loaded.</p>
        )}

        {meta && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Processed Dataset (CSV)</span>
            </button>

            <button
              onClick={onClearData}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Data & Reset State</span>
            </button>
          </div>
        )}
      </div>

      {/* Currency Preference Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Regional Currency Preferences</h2>
            <p className="text-xs text-slate-500">Select reporting currency for formatting and charts</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {Object.values(CURRENCIES).map((c) => (
            <button
              key={c.code}
              onClick={() => onCurrencyChange(c.code)}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                currency === c.code
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-sm font-extrabold">{c.symbol} {c.code}</div>
              <div className="text-[11px] opacity-80 font-normal mt-0.5">{c.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Privacy & Data Governance</h2>
            <p className="text-xs text-slate-500">Guarantees for small business financial security</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed pt-2">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">100% In-Browser Execution:</span> DataBeta processes
              all CSV and Excel files entirely inside your browser memory using local JavaScript. Your financial
              data is never uploaded to external cloud servers or third-party databases.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
