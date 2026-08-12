import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Table,
  FileText,
  Settings,
  Upload,
  Sparkles,
  Globe,
  Receipt,
  Sun,
  Moon,
  Search,
  Bell,
  LogOut,
  Home,
  Users,
  Bot,
  ShieldCheck,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { DatasetMeta, CurrencyCode, CURRENCIES, User } from '../types';
import { BusinessSelector } from './BusinessSelector';
import { BusinessMembership, Business } from '../services/businessService';

interface NavbarProps {
  activeTab: 'landing' | 'dashboard' | 'analytics' | 'crm' | 'tax' | 'data' | 'reports' | 'settings' | 'admin';
  setActiveTab: (tab: 'landing' | 'dashboard' | 'analytics' | 'crm' | 'tax' | 'data' | 'reports' | 'settings' | 'admin') => void;
  datasetMeta: DatasetMeta | null;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  onClearData: () => void;
  onOpenAICopilot: () => void;
  crmDealCount?: number;
  currentUser: User | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onLogout: () => void;
  businessMemberships?: BusinessMembership[];
  activeBusiness?: Business | null;
  onSelectBusiness?: (business: Business) => void;
  onOpenCreateBusiness?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  datasetMeta,
  currency,
  onCurrencyChange,
  theme,
  onToggleTheme,
  onOpenUpload,
  onLoadDemo,
  onClearData,
  onOpenAICopilot,
  crmDealCount = 5,
  currentUser,
  onOpenAuth,
  onLogout,
  businessMemberships = [],
  activeBusiness = null,
  onSelectBusiness,
  onOpenCreateBusiness,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const tabTitles: Record<string, string> = {
    landing: 'Company Overview',
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    crm: 'CRM & Pipeline',
    tax: 'Tax & Deductions',
    data: 'Dataset Studio',
    reports: 'Reports',
    settings: 'Settings',
    admin: 'Admin Monitoring Console',
  };

  if (activeTab === 'landing') return null; // Landing page uses its own header

  return (
    <>
      {/* Left Slim Vertical Icon Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-16 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between items-center py-6 z-40 no-print shadow-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Logo Icon */}
          <div
            onClick={() => setActiveTab('landing')}
            className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-md shadow-rose-600/30 hover:scale-105 transition-transform"
            title="DataBeta Home"
          >
            <Home className="w-5 h-5 fill-current" />
          </div>

          {/* Vertical Icon Nav Links */}
          <nav className="flex flex-col items-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              title="Dashboard"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              title="Analytics"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'analytics'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              title="CRM Pipeline"
              className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all ${
                activeTab === 'crm'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Users className="w-5 h-5" />
              {crmDealCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-600 absolute top-2 right-2" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('tax')}
              title="Tax & Deductions"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'tax'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Receipt className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('data')}
              title="Dataset Studio"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'data'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Table className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              title="Reports"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'reports'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <FileText className="w-5 h-5" />
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                title="Admin Console"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === 'admin'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              title="Settings"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Controls */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {datasetMeta && (
            <button
              onClick={onClearData}
              title="Reset Dataset"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Top Header Bar */}
      <header className="pl-16 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800 sticky top-0 z-30 no-print">


        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left Title & Business Selector */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {tabTitles[activeTab]}
            </h1>
            {currentUser && onSelectBusiness && onOpenCreateBusiness && (
              <BusinessSelector
                memberships={businessMemberships || []}
                activeBusiness={activeBusiness || null}
                onSelectBusiness={onSelectBusiness}
                onOpenCreateNew={onOpenCreateBusiness}
              />
            )}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* AI Advisor Launcher Button */}
            <button
              onClick={onOpenAICopilot}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-extrabold text-xs shadow-md hover:scale-[1.02] transition-all relative"
            >
              <Bot className="w-4 h-4 text-rose-500" />
              <span>AI Advisor</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-3 py-1.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-transparent text-slate-900 dark:text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-black text-slate-900 dark:text-white">
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile / Auth Status Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-2 pr-3 py-1 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-extrabold text-[11px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-slate-200/80 dark:border-zinc-800 p-2 text-xs z-50 space-y-1">
                    <div className="p-3 border-b border-slate-100 dark:border-zinc-900">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">{currentUser.email}</div>
                      <span className="inline-block mt-1 bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {currentUser.role} • {currentUser.authProvider}
                      </span>
                    </div>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { setActiveTab('admin'); setIsUserMenuOpen(false); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-bold flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-4 py-1.5 text-xs font-extrabold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-1.5 text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-md shadow-rose-600/30 transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Data</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
