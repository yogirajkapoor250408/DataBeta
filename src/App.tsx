import React, { useState, useEffect } from 'react';
import { Navbar, CoreTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { DataTableView } from './components/DataTableView';
import { CustomersView } from './components/CustomersView';
import { CRMView } from './components/CRMView';
import { InsightsView } from './components/InsightsView';
import { EmptyState } from './components/EmptyState';
import { FileUploadModal } from './components/FileUploadModal';
import { AuthModal } from './components/AuthModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Dataset, CurrencyCode, CRMContact, User, NormalizedRecord } from './types';
import { authService } from './services/authService';
import { businessService, Business, BusinessMembership } from './services/businessService';
import { transactionService } from './services/transactionService';
import { crmService } from './services/crmService';
import { auditService } from './services/auditService';

const THEME_KEY = 'databeta_theme';
const ACTIVE_BIZ_KEY = 'databeta_active_biz_id';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<CoreTab>('landing');

  // Business & Multi-Tenant State
  const [memberships, setMemberships] = useState<BusinessMembership[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Data State for Active Business
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isTourOpen, setIsTourOpen] = useState(false);

  // 1. Theme & Initial Session Restoration
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        if (storedTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    } catch {}

    // Subscribe to Auth State
    const sub = authService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        if (activeTab === 'landing') setActiveTab('overview');
        await loadUserBusinesses(user.id);
      } else {
        setMemberships([]);
        setActiveBusiness(null);
        setDataset(null);
        setCrmContacts([]);
      }
    });

    return () => {
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
    };
  }, []);

  // 2. Load User Businesses
  const loadUserBusinesses = async (userId: string) => {
    const userBizs = await businessService.getUserBusinesses(userId);
    setMemberships(userBizs);

    if (userBizs.length > 0) {
      const lastActiveId = localStorage.getItem(ACTIVE_BIZ_KEY);
      const matched = userBizs.find((m) => m.business.id === lastActiveId) || userBizs[0];
      handleSwitchBusiness(matched.business);
    } else {
      setIsOnboardingOpen(true);
    }
  };

  // 3. Switch Business Tenant Context
  const handleSwitchBusiness = async (business: Business) => {
    setActiveBusiness(business);
    setCurrency(business.currency);
    localStorage.setItem(ACTIVE_BIZ_KEY, business.id);

    // Fetch transactions & CRM for this business
    const txs = await transactionService.getBusinessTransactions(business.id);
    const deals = await crmService.getDeals(business.id);

    if (txs.length > 0) {
      setDataset({
        meta: {
          fileName: `${business.name} Dataset`,
          fileSize: 1024,
          rowCount: txs.length,
          headers: ['Date', 'Revenue', 'Expense', 'Category', 'Product', 'Customer'],
          uploadedAt: new Date(),
          mapping: { date: 'Date', revenue: 'Revenue', expense: 'Expense', profit: 'Profit', category: 'Category', product: 'Product', customer: 'Customer', quantity: null },
        },
        records: txs,
      });
    } else {
      setDataset(null);
    }

    setCrmContacts(deals);
    auditService.logEvent(business.id, currentUser?.id, 'business_switched', { businessName: business.name });
  };

  // 4. Handle Onboarding Completion
  const handleOnboardingComplete = async (newBiz: Business) => {
    setIsOnboardingOpen(false);
    if (currentUser) {
      const updatedBizs = await businessService.getUserBusinesses(currentUser.id);
      setMemberships(updatedBizs);
      await handleSwitchBusiness(newBiz);
      if (currentUser.isFirstTimeUser) {
        setIsTourOpen(true);
      }
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    if (nextTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    if (activeBusiness) {
      businessService.updateBusinessSettings(activeBusiness.id, { currency: code });
      setActiveBusiness({ ...activeBusiness, currency: code });
    }
  };

  const handleDatasetLoaded = async (newDataset: Dataset) => {
    if (!activeBusiness) {
      setIsOnboardingOpen(true);
      return;
    }

    setDataset(newDataset);
    await transactionService.importDataset(activeBusiness.id, newDataset.meta, newDataset.records);
    const refreshedTxs = await transactionService.getBusinessTransactions(activeBusiness.id);

    setDataset({
      meta: newDataset.meta,
      records: refreshedTxs,
    });

    auditService.logEvent(activeBusiness.id, currentUser?.id, 'dataset_imported', {
      rowCount: newDataset.records.length,
      fileName: newDataset.meta.fileName,
    });
  };

  const handleAddManualRecord = async (newRec: NormalizedRecord) => {
    if (!activeBusiness) return;

    await transactionService.addSingleTransaction(activeBusiness.id, newRec);
    const updatedRecords = [newRec, ...(dataset?.records || [])];

    setDataset({
      meta: dataset?.meta || {
        fileName: 'Manual Log',
        fileSize: 1024,
        rowCount: updatedRecords.length,
        headers: ['Date', 'Revenue', 'Expense', 'Category', 'Product', 'Customer'],
        uploadedAt: new Date(),
        mapping: { date: 'Date', revenue: 'Revenue', expense: 'Expense', profit: 'Profit', category: 'Category', product: 'Product', customer: 'Customer', quantity: null },
      },
      records: updatedRecords,
    });

    auditService.logEvent(activeBusiness.id, currentUser?.id, 'manual_transaction_added', { product: newRec.product });
  };

  const handleClearData = async () => {
    if (activeBusiness) {
      await transactionService.clearBusinessTransactions(activeBusiness.id);
    }
    setDataset(null);
    setActiveTab('overview');
  };

  const handleContactsChange = (updated: CRMContact[]) => {
    setCrmContacts(updated);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    setActiveTab('overview');
    await loadUserBusinesses(user.id);
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setMemberships([]);
    setActiveBusiness(null);
    setDataset(null);
    setCrmContacts([]);
    setActiveTab('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 selection:bg-rose-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetMeta={dataset?.meta || null}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenUpload={() => setIsUploadOpen(true)}
        onClearData={handleClearData}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        businessMemberships={memberships}
        activeBusiness={activeBusiness}
        onSelectBusiness={handleSwitchBusiness}
        onOpenCreateBusiness={() => setIsOnboardingOpen(true)}
      />

      {activeTab === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onExploreDemo={() => setActiveTab('overview')}
        />
      ) : (
        <main className="pl-0 md:pl-16 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {!dataset && activeTab === 'overview' ? (
            <EmptyState onOpenUpload={() => setIsUploadOpen(true)} />
          ) : (
            <>
              {activeTab === 'overview' && (
                <DashboardView
                  records={dataset?.records || []}
                  currency={currency}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  crmContacts={crmContacts}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onAddManualRecord={handleAddManualRecord}
                />
              )}

              {activeTab === 'transactions' && (
                <DataTableView
                  records={dataset?.records || []}
                  currency={currency}
                  onAddManualRecord={handleAddManualRecord}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView
                  records={dataset?.records || []}
                  crmDeals={crmContacts}
                  currency={currency}
                />
              )}

              {activeTab === 'pipeline' && (
                <CRMView
                  contacts={crmContacts}
                  onContactsChange={handleContactsChange}
                  currency={currency}
                  records={dataset?.records || []}
                  activeBusinessId={activeBusiness?.id}
                />
              )}

              {activeTab === 'insights' && (
                <InsightsView
                  records={dataset?.records || []}
                  crmDeals={crmContacts}
                  currency={currency}
                />
              )}
            </>
          )}
        </main>
      )}

      {activeTab !== 'landing' && (
        <footer className="pl-0 md:pl-16 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800/80 py-4 text-center text-xs text-slate-500 dark:text-zinc-500 no-print pb-24 md:pb-4">
          <p>DataBeta — High-Performance Business Intelligence & CRM MVP</p>
        </footer>
      )}

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          userId={currentUser.id}
          onComplete={handleOnboardingComplete}
          onClose={() => setIsOnboardingOpen(false)}
        />
      )}

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
