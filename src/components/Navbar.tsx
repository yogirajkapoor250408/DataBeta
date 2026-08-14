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
  Plus,
  Menu,
  X,
  Sparkles,
  Receipt,
  CheckSquare,
  Briefcase,
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
  onOpenAddDeal?: () => void;
  onOpenAddTask?: () => void;
  onOpenAddInvoice?: () => void;
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
  onOpenAddDeal,
  onOpenAddTask,
  onOpenAddInvoice,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isMobileQuickAddOpen, setIsMobileQuickAddOpen] = useState(false);

  const tabTitles: Record<CoreTab, string> = {
    overview: "Today's Command Center",
    crm: 'Sales CRM & Pipeline',
    finance: 'Cash & Collections',
    insights: 'Profitability & Health',
    reports: 'Executive Reports',
    settings: 'Workspace Settings',
  };

  const navItems: { tab: CoreTab; label: string; shortLabel: string; icon: LucideIcon }[] = [
    { tab: 'overview', label: "Today's Command Center", shortLabel: 'Today', icon: LayoutDashboard },
    { tab: 'crm', label: 'Sales CRM & Pipeline', shortLabel: 'Deals', icon: Users },
    { tab: 'finance', label: 'Cash & Collections', shortLabel: 'Cash', icon: DollarSign },
    { tab: 'insights', label: 'Profitability & Health', shortLabel: 'Insights', icon: Zap },
  ];

  return (
    <>
      {/* Desktop Vertical Icon Sidebar (56px width, High-End CRM aesthetic) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-14 bg-white dark:bg-zinc-950 border-r border-slate-200/70 dark:border-zinc-800/70 flex-col justify-between items-center py-4 z-40 no-print transition-colors duration-200">
        {/* Top: Brand Logo + Primary Nav Items */}
        <div className="flex flex-col items-center gap-5 w-full px-2">
          {/* Brand Icon */}
          <button
            onClick={() => (window.location.href = '/')}
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

            {/* Reports Link for Desktop */}
            <button
              onClick={() => setActiveTab('reports')}
              title="Executive Reports"
              className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-95 group ${
                activeTab === 'reports'
                  ? 'bg-slate-100 dark:bg-zinc-900 text-slate-950 dark:text-white font-semibold shadow-2xs'
                  : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-900/60'
              }`}
            >
              {activeTab === 'reports' && (
                <span className="absolute -left-2 top-2 bottom-2 w-[2.5px] rounded-r bg-rose-600 dark:bg-rose-500" />
              )}
              <FileText className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </button>
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
      <header className="pl-0 md:pl-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200/70 dark:border-zinc-800/70 sticky top-0 z-30 no-print transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left Title & Integrated Workspace Controls */}
          <div className="flex items-center gap-2 sm:gap-3 truncate min-w-0">
            {/* Mobile Brand Icon */}
            <button
              onClick={() => (window.location.href = '/')}
              className="md:hidden w-7 h-7 rounded-lg bg-slate-900 dark:bg-zinc-900 border border-slate-800 p-0.5 shrink-0"
              title="DataBeta Home"
            >
              <img src="/icon.png" alt="DataBeta" className="w-full h-full object-contain rounded" />
            </button>

            <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {tabTitles[activeTab]}
            </h1>

            {currentUser && onSelectBusiness && onOpenCreateBusiness && (
              <div className="shrink-0 hidden sm:block">
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
              <kbd className="font-mono text-[9px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1 py-0.2 rounded text-slate-500 dark:text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Fiscal Year Pill */}
            <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-100/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-zinc-800/60 rounded-md px-2 py-0.5">
              <Calendar className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" strokeWidth={1.8} />
              <span>FY{format(new Date(), 'yyyy')}</span>
            </div>
          </div>

          {/* Right Action Controls: Search, Currency, Profile & Import Data */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenCommandPalette}
              title="Search"
              className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 active:scale-95 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Theme Toggle */}
            <button
              onClick={(e) => onToggleTheme(e)}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 active:scale-95 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Compact Currency Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800/80 rounded-xl px-2 py-1 text-xs">
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
                  className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-900/80 hover:bg-slate-200/70 dark:hover:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-800/80 rounded-xl pl-1.5 pr-2 py-1 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors"
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
                      onClick={() => {
                        setActiveTab('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reports</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Import Data</span>
              <span className="sm:hidden text-[11px]">Import</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-Zone Ergonomic Navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-lg no-print">
        {/* Today Tab */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] ${
            activeTab === 'overview'
              ? 'text-rose-600 dark:text-rose-400 font-extrabold scale-105'
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'overview' ? 2.3 : 1.8} />
          <span className="text-[10px] tracking-tight">Today</span>
        </button>

        {/* Pipeline Tab */}
        <button
          onClick={() => setActiveTab('crm')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] ${
            activeTab === 'crm'
              ? 'text-rose-600 dark:text-rose-400 font-extrabold scale-105'
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'crm' ? 2.3 : 1.8} />
          <span className="text-[10px] tracking-tight">Deals</span>
        </button>

        {/* Central Floating Quick Add Action Button */}
        <button
          onClick={() => setIsMobileQuickAddOpen(true)}
          className="w-11 h-11 -mt-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 active:scale-90 transition-transform cursor-pointer"
          title="Quick Add"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Cash Tab */}
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] ${
            activeTab === 'finance'
              ? 'text-rose-600 dark:text-rose-400 font-extrabold scale-105'
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" strokeWidth={activeTab === 'finance' ? 2.3 : 1.8} />
          <span className="text-[10px] tracking-tight">Cash</span>
        </button>

        {/* Insights / More Tab */}
        <button
          onClick={() => setIsMobileMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] ${
            activeTab === 'insights' || activeTab === 'reports' || activeTab === 'settings'
              ? 'text-rose-600 dark:text-rose-400 font-extrabold scale-105'
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" strokeWidth={1.8} />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </div>

      {/* MOBILE QUICK ADD BOTTOM SHEET */}
      {isMobileQuickAddOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fadeIn">
          <div
            className="w-full bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Quick Actions</h3>
              </div>
              <button
                onClick={() => setIsMobileQuickAddOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setIsMobileQuickAddOpen(false);
                  if (onOpenAddDeal) onOpenAddDeal();
                }}
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 text-left space-y-1 active:scale-98 transition-transform"
              >
                <Briefcase className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">New Sales Deal</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">Add to sales pipeline</div>
              </button>

              <button
                onClick={() => {
                  setIsMobileQuickAddOpen(false);
                  if (onOpenAddTask) onOpenAddTask();
                }}
                className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-left space-y-1 active:scale-98 transition-transform"
              >
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">New Task</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">Schedule follow-up</div>
              </button>

              <button
                onClick={() => {
                  setIsMobileQuickAddOpen(false);
                  if (onOpenAddInvoice) onOpenAddInvoice();
                }}
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 text-left space-y-1 active:scale-98 transition-transform"
              >
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">New Invoice</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">Track receivables</div>
              </button>

              <button
                onClick={() => {
                  setIsMobileQuickAddOpen(false);
                  onOpenUpload();
                }}
                className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60 text-left space-y-1 active:scale-98 transition-transform"
              >
                <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Import CSV</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">Batch data upload</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MORE MENU BOTTOM SHEET */}
      {isMobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fadeIn">
          <div
            className="w-full bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white"></span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Workspace Menu</h3>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('insights');
                  setIsMobileMoreOpen(false);
                }}
                className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-colors ${
                  activeTab === 'insights'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Profitability & Health</div>
                    <div className="text-[10px] text-slate-400">Margins, unit economics & provenance</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('reports');
                  setIsMobileMoreOpen(false);
                }}
                className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Executive Reports</div>
                    <div className="text-[10px] text-slate-400">Preflight validation, PDF & CSV exports</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsMobileMoreOpen(false);
                }}
                className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Workspace Settings</div>
                    <div className="text-[10px] text-slate-400">Currencies, RBAC team roles & audit log</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
              </button>
            </div>

            {/* Quick Currency and Theme Row */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Currency:</span>
                <select
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="bg-white dark:bg-zinc-800 text-xs font-bold border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={(e) => onToggleTheme(e)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-zinc-200"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* Account & Logout */}
            {currentUser ? (
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.fullName || currentUser.email}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMoreOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-900">
                <button
                  onClick={() => {
                    setIsMobileMoreOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-white text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsMobileMoreOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="py-2.5 rounded-xl bg-slate-900 dark:bg-white text-xs font-bold text-white dark:text-slate-900 text-center"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

