import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Table,
  FileText,
  Settings,
  Upload,
  Sparkles,
  Database,
  Globe,
  Receipt,
} from 'lucide-react';
import { DatasetMeta, CurrencyCode, CURRENCIES } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'analytics' | 'tax' | 'data' | 'reports' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'tax' | 'data' | 'reports' | 'settings') => void;
  datasetMeta: DatasetMeta | null;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  onClearData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  datasetMeta,
  currency,
  onCurrencyChange,
  onOpenUpload,
  onLoadDemo,
  onClearData,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 no-print shadow-xl">
      {/* Top Banner for Demo Mode */}
      {datasetMeta?.isDemo && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 px-4 py-1.5 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
              Demo Data Mode
            </span>
            <span className="hidden sm:inline">You are viewing sample data. Your real business data remains untouched.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="text-amber-300 hover:text-white font-semibold underline underline-offset-2 transition-colors"
            >
              Upload Your Data
            </button>
            <span className="text-amber-500/40">|</span>
            <button onClick={onClearData} className="text-amber-400/80 hover:text-amber-200 transition-colors">
              Clear Demo
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/40 border border-indigo-400/30">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  DataBeta
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Small Business Financial Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('tax')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'tax'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Tax & Deductions</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'data'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Data</span>
              {datasetMeta && (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                  {datasetMeta.rowCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Settings</span>
            </button>
          </nav>

          {/* Currency Switcher & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {!datasetMeta && (
              <button
                onClick={onLoadDemo}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Demo Data</span>
              </button>
            )}

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">{datasetMeta ? 'Upload New File' : 'Upload Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
