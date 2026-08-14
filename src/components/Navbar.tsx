import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Zap,
  FileText,
  Settings,
  Sun,
  Moon,
  Upload,
  LogOut,
  ChevronDown,
  Search,
  Calendar,
  Globe,
  LucideIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { DatasetMeta, CurrencyCode, CURRENCIES, User } from '../types';
import { BusinessSelector } from './BusinessSelector';
import { BusinessMembership, Business } from '../services/businessService';

export type CoreTab = 'overview' | 'crm' | 'finance' | 'insights' | 'reports' | 'settings';

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
  currency,
  onCurrencyChange,
  theme,
  onToggleTheme,
  onOpenUpload,
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

  const tabTitles: Record<CoreTab, string> = {
    overview: "Today's Command Center",
    crm: 'Sales CRM & Pipeline',
    finance: 'Cash & Collections',
    insights: 'Profitability & Health',
    reports: 'Executive Reports',
    settings: 'Workspace Settings',
  };

  const navItems: { tab: CoreTab; label: string; icon: LucideIcon }[] = [
    { tab: 'overview', label: "Today's Command Center", icon: LayoutDashboard },
    { tab: 'crm', label: 'Sales CRM & Pipeline', icon: Users },
    { tab: 'finance', label: 'Cash & Collections', icon: DollarSign },
    { tab: 'insights', label: 'Profitability & Health', icon: Zap },
    { tab: 'reports', label: 'Executive Reports', icon: FileText },
  ];

  return (
    <>
      {/* Desktop Vertical Icon Sidebar (56px width, High-End CRM aesthetic) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-14 bg-white dark:bg-zinc-950 border-r border-slate-200/70 dark:border-zinc-800/70 flex-col justify-between items-center py-4 z-40 no-print transition-colors duration-200">
        {/* Top: Brand Logo + Primary Nav Items */}
        <div className="flex flex-col items-center gap-5 w-full px-2">
          {/* Brand Icon */}
          <button
            onClick={() => window.location.href = '/'}
            className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-zinc-900 border border-slate-800 dark:border-zinc-800 p-1 flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-95 group"
            title="DataBeta Home"
          >
            <img src="/icon.png" alt="DataBeta" className="w-full h-full object-contain rounded" />
          </button>

          {/* Core Navigation Items */}
          <nav className="flex flex-col items-center gap-1.5 w-full">
            {navItems.map(({ tab, label, icon: Icon }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  title={label}
                  className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-95 group ${
                    isActive
                      ? 'bg-slate-100 dark:bg-zinc-900 text-slate-950 dark:text-white font-semibold shadow-2xs'
                      : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  {/* Subtle Red Accent Active Indicator (Left Bar) */}
                  {isActive && (
                    <span className="absolute -left-2 top-2 bottom-2 w-[2.5px] rounded-r bg-rose-600 dark:bg-rose-500" />
                  )}
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Controls (Settings + Theme Toggle) */}
        <div className="flex flex-col items-center gap-1.5 w-full px-2 pt-3 border-t border-slate-100 dark:border-zinc-900">
          <button
            onClick={() => setActiveTab('settings')}
            title="Business Settings"
            className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-95 ${
              activeTab === 'settings'
                ? 'bg-slate-100 dark:bg-zinc-900 text-slate-950 dark:text-white font-semibold'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-900/60'
            }`}
          >
            {activeTab === 'settings' && (
              <span className="absolute -left-2 top-2 bottom-2 w-[2.5px] rounded-r bg-rose-600 dark:bg-rose-500" />
            )}
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>

          <button
            onClick={(e) => onToggleTheme(e)}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-900/60 active:scale-95 transition-all duration-150"
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px] text-amber-400" strokeWidth={1.8} />
            ) : (
              <Moon className="w-[18px] h-[18px] text-slate-600" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </aside>

      {/* Top Header Bar (Clean, Lightweight & Unobtrusive) */}
      <header className="pl-0 md:pl-14 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200/70 dark:border-zinc-800/70 sticky top-0 z-30 no-print transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Left Title & Integrated Workspace Controls */}
          <div className="flex items-center gap-3 truncate min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {tabTitles[activeTab]}
            </h1>

            {currentUser && onSelectBusiness && onOpenCreateBusiness && (
              <div className="shrink-0">
                <BusinessSelector
                  memberships={businessMemberships}
                  activeBusiness={activeBusiness}
                  onSelectBusiness={onSelectBusiness}
                  onOpenCreateNew={onOpenCreateBusiness}
                />
              </div>
            )}

            {/* Compact Search Trigger */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-2 bg-slate-100/70 dark:bg-zinc-900/70 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-lg px-2.5 py-1 text-xs text-slate-400 dark:text-zinc-500 transition-colors w-44 justify-between"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Search className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                <span className="text-[11px] font-medium truncate">Search...</span>
              </div>
              <kbd className="font-mono text-[9px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1 py-0.2 rounded text-slate-500 dark:text-zinc-400">⌘K</kbd>
            </button>

            {/* Fiscal Year Pill */}
            <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-100/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-zinc-800/60 rounded-md px-2 py-0.5">
              <Calendar className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" strokeWidth={1.8} />
              <span>FY{format(new Date(), 'yyyy')}</span>
            </div>
          </div>

          {/* Right Action Controls: Currency, Profile & Import Data */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Theme Toggle */}
            <button
              onClick={(e) => onToggleTheme(e)}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="md:hidden p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 active:scale-95 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Compact Currency Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800/80 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" strokeWidth={1.8} />
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-transparent text-slate-800 dark:text-zinc-200 font-semibold text-[11px] focus:outline-none cursor-pointer"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* User Session Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-900/80 hover:bg-slate-200/70 dark:hover:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-800/80 rounded-lg pl-1.5 pr-2 py-1 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors"
                >
                  <div className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {(currentUser.fullName || currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate hidden sm:inline text-xs">
                    {currentUser.fullName || currentUser.name || currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-slate-200/80 dark:border-zinc-800 p-1.5 text-xs z-50 space-y-0.5 animate-fadeIn">
                    <div className="p-2 border-b border-slate-100 dark:border-zinc-900">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.fullName || currentUser.name || currentUser.email.split('@')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{currentUser.email}</div>
                    </div>

                    <button
                      onClick={() => { setActiveTab('settings'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('reports'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reports</span>
                    </button>

                    <button
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 py-1 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Primary Action Button (DataBeta Red Accent) */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Import Data</span>
              <span className="sm:hidden">Import</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
