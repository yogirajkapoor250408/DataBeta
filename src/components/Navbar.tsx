import React, { useState } from 'react';
import {
  LayoutDashboard,
  Table,
  Users,
  GitPullRequest,
  Zap,
  Home,
  Sun,
  Moon,
  Upload,
  LogOut,
  Globe,
  ChevronDown,
  Search,
  Calendar,
} from 'lucide-react';
import { DatasetMeta, CurrencyCode, CURRENCIES, User } from '../types';
import { BusinessSelector } from './BusinessSelector';
import { BusinessMembership, Business } from '../services/businessService';

export type CoreTab = 'landing' | 'overview' | 'transactions' | 'customers' | 'pipeline' | 'insights';

interface NavbarProps {
  activeTab: CoreTab;
  setActiveTab: (tab: CoreTab) => void;
  datasetMeta: DatasetMeta | null;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  theme: 'dark' | 'light';
  onToggleTheme: (e?: React.MouseEvent<any>) => void;
  onOpenUpload: () => void;
  onClearData: () => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onLogout: () => void;
  businessMemberships?: BusinessMembership[];
  activeBusiness?: Business | null;
  onSelectBusiness?: (business: Business) => void;
  onOpenCreateBusiness?: () => void;
  onOpenCommandPalette?: () => void;
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
  onClearData,
  currentUser,
  onOpenAuth,
  onLogout,
  businessMemberships = [],
  activeBusiness = null,
  onSelectBusiness,
  onOpenCreateBusiness,
  onOpenCommandPalette,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const tabTitles: Record<string, string> = {
    landing: 'Company Overview',
    overview: 'Executive Overview',
    transactions: 'Transactions Studio',
    customers: 'Customer Accounts & 360',
    pipeline: 'Sales Pipeline CRM',
    insights: 'Real-Data Business Insights',
  };

  if (activeTab === 'landing') return null;

  return (
    <>
      {/* Desktop Vertical Icon Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800/80 flex-col justify-between items-center py-6 z-40 no-print shadow-xs transition-colors duration-200">
        <div className="flex flex-col items-center gap-6">
          {/* Home Icon */}
          <div
            onClick={() => window.location.href = '/'}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 active:scale-95 transition-all duration-150"
            title="DataBeta Home"
          >
            <img src="/icon.png" alt="DataBeta Icon" className="w-full h-full object-contain rounded-xl" />
          </div>

          {/* 5 Core Navigation Icons */}
          <nav className="flex flex-col items-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('overview')}
              title="Overview"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              title="Transactions"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 ${
                activeTab === 'transactions'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              title="Customers"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 ${
                activeTab === 'customers'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              title="Pipeline CRM"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 ${
                activeTab === 'pipeline'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GitPullRequest className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              title="Insights"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 ${
                activeTab === 'insights'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Controls */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={(e) => onToggleTheme(e)}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 active:scale-95 transition-all duration-150"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {datasetMeta && (
            <button
              onClick={onClearData}
              title="Reset Dataset"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-all duration-150"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 flex items-center justify-around z-40 px-2 no-print shadow-lg transition-colors duration-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'overview'
              ? 'text-rose-600 dark:text-rose-500 font-bold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'transactions'
              ? 'text-rose-600 dark:text-rose-500 font-bold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Table className="w-5 h-5" />
          <span className="text-[10px]">Data</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'customers'
              ? 'text-rose-600 dark:text-rose-500 font-bold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Clients</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'pipeline'
              ? 'text-rose-600 dark:text-rose-500 font-bold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GitPullRequest className="w-5 h-5" />
          <span className="text-[10px]">CRM</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'insights'
              ? 'text-rose-600 dark:text-rose-500 font-bold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px]">Insights</span>
        </button>
      </div>

      {/* Top Header Bar */}
      <header className="pl-0 md:pl-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 sticky top-0 z-30 no-print transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          {/* Left Title & Tenant Business Selector */}
          <div className="flex items-center gap-2 sm:gap-4 truncate">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {tabTitles[activeTab]}
            </h1>
            {currentUser && onSelectBusiness && onOpenCreateBusiness && (
              <BusinessSelector
                memberships={businessMemberships}
                activeBusiness={activeBusiness}
                onSelectBusiness={onSelectBusiness}
                onOpenCreateNew={onOpenCreateBusiness}
              />
            )}

            {/* Minimalist Header Search Bar (Inspired by High-End Minimal Dashboards) */}
            <div
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-3 py-1.5 text-xs text-slate-400 dark:text-zinc-500 max-w-xs w-48 hover:border-rose-500/50 cursor-pointer transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">Search platform (⌘K)...</span>
            </div>

            {/* Persistent Fiscal Period Selector Pill */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-3 py-1.5 text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>FY2026–27</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans">| Apr Start</span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Theme Toggle Button on Mobile Header */}
            <button
              onClick={(e) => onToggleTheme(e)}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="md:hidden p-2 rounded-full text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 active:scale-95 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 sm:px-3 py-1.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
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

            {/* Auth Session / Profile Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-1.5 pr-2.5 sm:pr-3 py-1 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-extrabold text-[10px] sm:text-[11px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-2 text-xs z-50 space-y-1 animate-fadeIn">
                    <div className="p-3 border-b border-slate-100 dark:border-zinc-900">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{currentUser.email}</div>
                      <span className="inline-block mt-1 bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold flex items-center gap-2 active:scale-95 transition-all duration-150"
                    >
                      <LogOut className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-2.5 sm:px-4 py-1.5 text-xs font-extrabold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 sm:px-4 py-1.5 text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-md shadow-rose-600/30 active:scale-95 transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import Data</span>
              <span className="sm:hidden">Import</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
