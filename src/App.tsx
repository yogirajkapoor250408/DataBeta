import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { CRMView } from './components/CRMView';
import { TaxView } from './components/TaxView';
import { DataTableView } from './components/DataTableView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { EmptyState } from './components/EmptyState';
import { FileUploadModal } from './components/FileUploadModal';
import { AICopilotModal } from './components/AICopilotModal';
import { AuthModal } from './components/AuthModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { Dataset, CurrencyCode, CRMContact, User, NormalizedRecord } from './types';
import { getStoredCRMContacts, syncContactsFromTransactions, saveCRMContacts } from './utils/crmEngine';
import { getStoredUser, logoutUser } from './utils/authEngine';

const LOCAL_STORAGE_KEY = 'databeta_active_dataset_v3';
const CURRENCY_KEY = 'databeta_active_currency_v3';
const THEME_KEY = 'databeta_theme';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [activeTab, setActiveTab] = useState<
    'landing' | 'dashboard' | 'analytics' | 'crm' | 'tax' | 'data' | 'reports' | 'settings' | 'admin'
  >(getStoredUser() ? 'dashboard' : 'landing');

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>(getStoredCRMContacts());
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Modals State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        if (storedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }

      const storedCurr = localStorage.getItem(CURRENCY_KEY);
      if (storedCurr) {
        setCurrency(storedCurr as CurrencyCode);
      }

      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: Dataset = JSON.parse(stored);
        parsed.meta.uploadedAt = new Date(parsed.meta.uploadedAt);
        parsed.records = parsed.records.map((r) => ({
          ...r,
          date: r.date ? new Date(r.date) : null,
        }));
        setDataset(parsed);

        const synced = syncContactsFromTransactions(parsed.records, crmContacts);
        setCrmContacts(synced);
      }
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    localStorage.setItem(CURRENCY_KEY, code);
  };

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newDataset));
    } catch {
      // LocalStorage fallback
    }

    const synced = syncContactsFromTransactions(newDataset.records, crmContacts);
    setCrmContacts(synced);
  };

  const handleAddManualRecord = (newRec: NormalizedRecord) => {
    const existingRecords = dataset?.records || [];
    const updatedRecords = [newRec, ...existingRecords];

    const updatedDataset: Dataset = {
      meta: dataset?.meta || {
        fileName: 'Manual Transactions Log',
        fileSize: 1024,
        rowCount: updatedRecords.length,
        headers: ['Date', 'Revenue', 'Expense', 'Category', 'Product', 'Customer'],
        uploadedAt: new Date(),
        mapping: { date: 'Date', revenue: 'Revenue', expense: 'Expense', profit: 'Profit', category: 'Category', product: 'Product', customer: 'Customer', quantity: null },
      },
      records: updatedRecords,
    };

    handleDatasetLoaded(updatedDataset);
  };

  const handleClearData = () => {
    setDataset(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setActiveTab('dashboard');
  };

  const handleContactsChange = (updated: CRMContact[]) => {
    setCrmContacts(updated);
    saveCRMContacts(updated);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    setActiveTab('dashboard');

    if (user.isFirstTimeUser) {
      setIsTourOpen(true);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveTab('landing');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetMeta={dataset?.meta || null}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadDemo={() => setIsUploadOpen(true)}
        onClearData={handleClearData}
        onOpenAICopilot={() => setIsAICopilotOpen(true)}
        crmDealCount={crmContacts.length}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {activeTab === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onExploreDemo={() => setActiveTab('dashboard')}
        />
      ) : (
        <main className="pl-16 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!dataset && activeTab !== 'admin' ? (
            <EmptyState onOpenUpload={() => setIsUploadOpen(true)} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  records={dataset?.records || []}
                  currency={currency}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  crmContacts={crmContacts}
                  onOpenAICopilot={() => setIsAICopilotOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onAddManualRecord={handleAddManualRecord}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView records={dataset?.records || []} currency={currency} />
              )}

              {activeTab === 'crm' && (
                <CRMView
                  contacts={crmContacts}
                  onContactsChange={handleContactsChange}
                  currency={currency}
                  records={dataset?.records || []}
                />
              )}

              {activeTab === 'tax' && (
                <TaxView records={dataset?.records || []} currency={currency} />
              )}

              {activeTab === 'data' && (
                <DataTableView records={dataset?.records || []} currency={currency} />
              )}

              {activeTab === 'reports' && (
                <ReportsView records={dataset?.records || []} meta={dataset?.meta || null} currency={currency} />
              )}

              {activeTab === 'admin' && currentUser?.role === 'admin' && (
                <AdminConsoleView currentUser={currentUser} />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  meta={dataset?.meta || null}
                  records={dataset?.records || []}
                  currency={currency}
                  onCurrencyChange={handleCurrencyChange}
                  onClearData={handleClearData}
                />
              )}
            </>
          )}
        </main>
      )}

      {activeTab !== 'landing' && (
        <footer className="pl-16 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 py-4 text-center text-xs text-slate-500 dark:text-zinc-400 no-print transition-colors">
          <p>DataBeta — Financial Intelligence Platform & Client-Side CRM for Online Businesses</p>
        </footer>
      )}

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      <AICopilotModal
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
        records={dataset?.records || []}
        currency={currency}
        contacts={crmContacts}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <GuidedTourModal
          isOpen={isTourOpen}
          user={currentUser}
          onClose={(updatedUser) => {
            setCurrentUser(updatedUser);
            setIsTourOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
