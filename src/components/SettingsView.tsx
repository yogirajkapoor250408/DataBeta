import React, { useState, useEffect } from 'react';
import { DatasetMeta, NormalizedRecord, CurrencyCode, CURRENCIES } from '../types';
import { Business } from '../services/businessService';
import {
  FileText,
  Database,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Trash2,
  Lock,
  Cloud,
  Building2,
  Save,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { calculateMetrics } from '../utils/metricsCalculator';

interface SettingsViewProps {
  meta: DatasetMeta | null;
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  onClearData: () => void;
  activeBusiness?: Business | null;
  onUpdateBusiness?: (updates: Partial<{ name: string; currency: CurrencyCode; country: string; logoUrl: string }>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  meta,
  records,
  currency,
  onCurrencyChange,
  onClearData,
  activeBusiness,
  onUpdateBusiness,
}) => {
  const metrics = calculateMetrics(records);

  // Business Profile Form State
  const [bizName, setBizName] = useState(activeBusiness?.name || '');
  const [bizCountry, setBizCountry] = useState(activeBusiness?.country || 'United States');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeBusiness) {
      setBizName(activeBusiness.name || '');
      setBizCountry(activeBusiness.country || 'United States');
    }
  }, [activeBusiness]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateBusiness || !bizName.trim()) return;
    setIsSaving(true);
    setSaveSuccess(false);
    await onUpdateBusiness({
      name: bizName.trim(),
      country: bizCountry,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Full Database Backup Download (JSON)
  const handleDownloadBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      business: activeBusiness || { name: 'DataBeta Business' },
      metadata: meta,
      recordCount: records.length,
      records: records,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `databeta-backup-${(activeBusiness?.name || 'business').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Business Settings</h2>
        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
          Manage your business tenant profile, configure base currency, download backups, and inspect cloud data isolation.
        </p>
      </div>

      {/* Business Tenant Profile Form */}
      {activeBusiness && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Business Tenant Profile</h3>
            </div>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Changes saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Company / Store Name</label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Operating Country</label>
              <select
                value={bizCountry}
                onChange={(e) => setBizCountry(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Australia">Australia</option>
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-md shadow-rose-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Currency Preferences */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Primary Reporting Currency</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      {/* Active Dataset Summary & Backup */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Dataset & Backup</h3>
          </div>
          {records.length > 0 && (
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-full border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Download JSON Backup</span>
            </button>
          )}
        </div>

        {meta && records.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-slate-400 font-medium block">Dataset Name</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">{meta.fileName}</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-slate-400 font-medium block">Total Transactions</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{records.length.toLocaleString()} records</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-slate-400 font-medium block">Total Ingested Revenue</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5 font-mono">
                {metrics.totalRevenue !== null ? metrics.totalRevenue.toLocaleString() : 'N/A'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-slate-400 font-medium block">Last Imported Date</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                {new Date(meta.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-zinc-400 italic p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl">
            No active dataset currently loaded. Import a spreadsheet to begin.
          </div>
        )}

        {records.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">Purge Data</div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Permanently delete all transaction rows for this business.</p>
            </div>

            <button
              onClick={() => {
                if (window.confirm('⚠️ WARNING: This will permanently delete all transaction records for this business. Continue?')) {
                  onClearData();
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-extrabold text-xs rounded-full border border-rose-200 dark:border-rose-900 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Transactions</span>
            </button>
          </div>
        )}
      </div>

      {/* Data Security & Multi-Tenant Model */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Enterprise Multi-Tenant Security Model</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            <Cloud className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <span>
              Your operational data is stored in an encrypted PostgreSQL cloud database instance, protected by HTTPS/TLS and AES-256 storage encryption.
            </span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            <Lock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              Row Level Security (RLS) is enforced at the database layer. Cross-tenant reads are prevented cryptographically; only authorized users in your business membership can access transactions.
            </span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            <FileText className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <span>
              All strategic calculations and analytics execute deterministically client-side in your browser memory for maximum speed and zero raw data leakage.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
