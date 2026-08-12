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
  onToggleTheme: () => void;
  onOpenUpload: () => void;
  onClearData: () => void;
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
  onClearData,
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
    overview: 'Executive Overview',
    transactions: 'Transactions Studio',
    customers: 'Customer Accounts & 360',
    pipeline: 'Sales Pipeline CRM',
    insights: 'Real-Data Business Insights',
  };

  if (activeTab === 'landing') return null;

  return (
    <>
      {/* Left Slim Vertical Icon Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-16 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between items-center py-6 z-40 no-print shadow-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Home Icon */}
          <div
            onClick={() => setActiveTab('landing')}
            className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-md shadow-rose-600/30 hover:scale-105 transition-transform"
            title="DataBeta Home"
          >
            <Home className="w-5 h-5 fill-current" />
          </div>

          {/* 5 Core Navigation Icons */}
          <nav className="flex flex-col items-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('overview')}
              title="Overview"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              title="Transactions"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'transactions'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Table className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              title="Customers"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'customers'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              title="Pipeline CRM"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <GitPullRequest className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              title="Insights"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'insights'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Zap className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Controls */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-900 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-300" />}
          </button>

          {datasetMeta && (
            <button
              onClick={onClearData}
              title="Reset Dataset"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-950/40 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Top Header Bar */}
      <header className="pl-16 bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left Title & Tenant Business Selector */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-white tracking-tight">
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
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-black text-white">
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
                  className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full pl-2 pr-3 py-1 text-xs font-bold text-white hover:bg-zinc-800 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-extrabold text-[11px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-950 rounded-2xl shadow-xl border border-zinc-800 p-2 text-xs z-50 space-y-1">
                    <div className="p-3 border-b border-zinc-900">
                      <div className="font-bold text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
                      <span className="inline-block mt-1 bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-zinc-900 text-zinc-300 font-bold flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-zinc-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-4 py-1.5 text-xs font-extrabold text-zinc-200 hover:text-white"
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
              <span>Import Data</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
