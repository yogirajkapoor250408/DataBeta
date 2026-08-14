import React, { useState, useEffect } from 'react';
import { Navbar, CoreTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CRMView } from './components/CRMView';
import { FinanceView } from './components/FinanceView';
import { InsightsView } from './components/InsightsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { DemoBanner } from './components/DemoBanner';
import { FileUploadModal } from './components/FileUploadModal';
import { AuthModal } from './components/AuthModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import {
  Deal,
  Contact,
  Task,
  Invoice,
  NormalizedRecord,
  CurrencyCode,
  User,
  Dataset,
  DealStage,
} from './types';
import {
  DEMO_DEALS,
  DEMO_CONTACTS,
  DEMO_TASKS,
  DEMO_INVOICES,
  DEMO_TRANSACTIONS,
} from './utils/demoData';
import { authService } from './services/authService';
import { businessService, Business, BusinessMembership } from './services/businessService';
import { crmService } from './services/crmService';
import { auditService } from './services/auditService';
import { toggleThemeWithRipple } from './utils/themeRipple';
import { X, Plus, Calendar, DollarSign, Users, Receipt } from 'lucide-react';

const THEME_KEY = 'databeta_theme';
const ACTIVE_BIZ_KEY = 'databeta_active_biz_id';

export const DashboardApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<CoreTab>('overview');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true); // Defaults to safe labeled demo mode until user signs in/switches

  // Workspace Data State
  const [deals, setDeals] = useState<Deal[]>(DEMO_DEALS);
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [records, setRecords] = useState<NormalizedRecord[]>(DEMO_TRANSACTIONS);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Business Multi-Tenancy
  const [memberships, setMemberships] = useState<BusinessMembership[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Quick Creation Modals State
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealCompany, setDealCompany] = useState('');
  const [dealContact, setDealContact] = useState('');
  const [dealAmount, setDealAmount] = useState('15000');
  const [dealStage, setDealStage] = useState<DealStage>('lead');
  const [dealCloseDate, setDealCloseDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dealNextStep, setDealNextStep] = useState('');

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskContact, setTaskContact] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<'urgent' | 'high' | 'normal'>('high');

  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-4)}`);
  const [invoiceCustomer, setInvoiceCustomer] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('12000');
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Initial Theme & Session
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

    authService.getCurrentSessionUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoMode(false);
        loadUserWorkspace(user);
      }
    });

    const sub = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      if (user) {
        setIsDemoMode(false);
        loadUserWorkspace(user);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
    };
  }, []);

  const loadUserWorkspace = async (user: User) => {
    const bizs = await businessService.getUserBusinesses(user.id);
    setMemberships(bizs);
    if (bizs.length > 0) {
      setActiveBusiness(bizs[0].business);
      setCurrency(bizs[0].business.currency);
      // Load user's live deals and tasks
      const loadedDeals = await crmService.getDeals(bizs[0].business.id);
      const loadedContacts = await crmService.getContacts(bizs[0].business.id);
      const loadedTasks = await crmService.getTasks(bizs[0].business.id);
      setDeals(loadedDeals);
      setContacts(loadedContacts);
      setTasks(loadedTasks);
    } else {
      // Empty workspace
      setDeals([]);
      setContacts([]);
      setTasks([]);
      setInvoices([]);
      setRecords([]);
    }
  };

  const handleSwitchToDemo = () => {
    setIsDemoMode(true);
    setDeals(DEMO_DEALS);
    setContacts(DEMO_CONTACTS);
    setTasks(DEMO_TASKS);
    setInvoices(DEMO_INVOICES);
    setRecords(DEMO_TRANSACTIONS);
  };

  const handleSwitchToReal = () => {
    if (!currentUser) {
      setAuthMode('signup');
      setIsAuthOpen(true);
      return;
    }
    setIsDemoMode(false);
    loadUserWorkspace(currentUser);
  };

  // Create Deal Handler
  const handleCreateDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim()) return;

    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      workspaceId: isDemoMode ? 'demo-ws' : activeBusiness?.id || 'main-ws',
      title: dealTitle.trim(),
      companyName: dealCompany.trim() || dealTitle.trim(),
      contactName: dealContact.trim() || undefined,
      stage: dealStage,
      amount: Number(dealAmount) || 0,
      currency,
      expectedCloseDate: dealCloseDate,
      probabilityPct: dealStage === 'won' ? 100 : dealStage === 'negotiation' ? 85 : dealStage === 'proposal_sent' ? 70 : 30,
      nextStep: dealNextStep.trim() || undefined,
      tags: ['Active Deal'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    const updated = [newDeal, ...deals];
    setDeals(updated);
    if (!isDemoMode && activeBusiness) {
      await crmService.createDeal(activeBusiness.id, newDeal);
    }

    setShowAddDealModal(false);
    setDealTitle('');
    setDealCompany('');
    setDealContact('');
    setDealNextStep('');
  };

  // Create Task Handler
  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      workspaceId: isDemoMode ? 'demo-ws' : activeBusiness?.id || 'main-ws',
      title: taskTitle.trim(),
      contactName: taskContact.trim() || undefined,
      dueDate: taskDueDate,
      priority: taskPriority,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    if (!isDemoMode && activeBusiness) {
      await crmService.saveTasks(activeBusiness.id, updated);
    }

    setShowAddTaskModal(false);
    setTaskTitle('');
    setTaskContact('');
  };

  // Create Invoice Handler
  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceCustomer.trim()) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      workspaceId: isDemoMode ? 'demo-ws' : activeBusiness?.id || 'main-ws',
      invoiceNumber: invoiceNumber.trim(),
      customerName: invoiceCustomer.trim(),
      status: 'due_soon',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invoiceDueDate,
      amount: Number(invoiceAmount) || 0,
      currency,
      amountPaid: 0,
      balanceDue: Number(invoiceAmount) || 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
    setShowAddInvoiceModal(false);
    setInvoiceCustomer('');
  };

  // Complete Task Handler
  const handleCompleteTask = async (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: 'completed' as Task['status'] } : t));
    setTasks(updated);
    if (!isDemoMode && activeBusiness) {
      await crmService.saveTasks(activeBusiness.id, updated);
    }
  };

  // Snooze Task Handler
  const handleSnoozeTask = async (taskId: string) => {
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, dueDate: tomorrowStr } : t));
    setTasks(updated);
    if (!isDemoMode && activeBusiness) {
      await crmService.saveTasks(activeBusiness.id, updated);
    }
  };

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setRecords(newDataset.records);
    setIsUploadOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Explicit Labeled Demo Mode Banner */}
      {isDemoMode && (
        <DemoBanner
          onSwitchToReal={handleSwitchToReal}
          onResetDemo={() => {
            setDeals(DEMO_DEALS);
            setContacts(DEMO_CONTACTS);
            setTasks(DEMO_TASKS);
            setInvoices(DEMO_INVOICES);
            setRecords(DEMO_TRANSACTIONS);
          }}
        />
      )}

      {/* Main Navbar & Sidebar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetMeta={null}
        currency={currency}
        onCurrencyChange={setCurrency}
        theme={theme}
        onToggleTheme={(e) => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          toggleThemeWithRipple(e, () => {
            if (next === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            localStorage.setItem(THEME_KEY, next);
          });
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onClearData={() => {
          setRecords([]);
          setDeals([]);
          setContacts([]);
          setInvoices([]);
        }}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onLogout={() => authService.signOut().then(() => setCurrentUser(null))}
        businessMemberships={memberships}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAddDeal={() => setShowAddDealModal(true)}
        onOpenAddTask={() => setShowAddTaskModal(true)}
        onOpenAddInvoice={() => setShowAddInvoiceModal(true)}
      />

      {/* Main View Port Container (pb-28 on mobile for bottom navigation clearance) */}
      <main className="flex-1 pl-0 md:pl-14 pt-3 sm:pt-4 pb-28 md:pb-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all">
        {activeTab === 'overview' && (
          <DashboardView
            deals={deals}
            contacts={contacts}
            tasks={tasks}
            invoices={invoices}
            records={records}
            currency={currency}
            isDemo={isDemoMode}
            onNavigateTab={setActiveTab}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenAddDeal={() => setShowAddDealModal(true)}
            onOpenAddTask={() => setShowAddTaskModal(true)}
            onOpenAddInvoice={() => setShowAddInvoiceModal(true)}
            onCompleteTask={handleCompleteTask}
            onSnoozeTask={handleSnoozeTask}
            onSwitchToDemo={handleSwitchToDemo}
          />
        )}

        {activeTab === 'crm' && (
          <CRMView
            deals={deals}
            contacts={contacts}
            tasks={tasks}
            currency={currency}
            workspaceId={activeBusiness?.id || 'ws-main'}
            onDealsChange={setDeals}
            onContactsChange={setContacts}
            onTasksChange={setTasks}
            onOpenAddDeal={() => setShowAddDealModal(true)}
            onOpenAddTask={() => setShowAddTaskModal(true)}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            invoices={invoices}
            deals={deals}
            records={records}
            currency={currency}
            workspaceId={activeBusiness?.id || 'ws-main'}
            onInvoicesChange={setInvoices}
            onOpenAddInvoice={() => setShowAddInvoiceModal(true)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            records={records}
            deals={deals}
            invoices={invoices}
            currency={currency}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            deals={deals}
            invoices={invoices}
            records={records}
            currency={currency}
            workspaceName={activeBusiness?.name || (isDemoMode ? 'Apex Technical Solutions (Demo)' : 'My Workspace')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            records={records}
            currency={currency}
            onCurrencyChange={setCurrency}
            onClearData={() => {
              setRecords([]);
              setDeals([]);
              setContacts([]);
              setInvoices([]);
            }}
            activeBusiness={activeBusiness}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="pl-0 md:pl-14 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800/80 py-4 text-center text-xs text-slate-500 dark:text-zinc-500 no-print">
        <p>DataBeta Technologies — Sales & Cash Operating System</p>
      </footer>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => setIsAuthOpen(false)}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onOpenUpload={() => {
          setIsCommandPaletteOpen(false);
          setIsUploadOpen(true);
        }}
        onOpenAddDeal={() => {
          setIsCommandPaletteOpen(false);
          setShowAddDealModal(true);
        }}
        onOpenAddTask={() => {
          setIsCommandPaletteOpen(false);
          setShowAddTaskModal(true);
        }}
        onToggleTheme={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          if (next === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }}
      />

      {/* Add Deal Modal */}
      {showAddDealModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-950 border-t sm:border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Create Sales Deal</h3>
              </div>
              <button onClick={() => setShowAddDealModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme — Enterprise Cloud License"
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={dealCompany}
                    onChange={(e) => setDealCompany(e.target.value)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={dealContact}
                    onChange={(e) => setDealContact(e.target.value)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Deal Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={dealAmount}
                    onChange={(e) => setDealAmount(e.target.value)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Pipeline Stage</label>
                  <select
                    value={dealStage}
                    onChange={(e) => setDealStage(e.target.value as DealStage)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-bold"
                  >
                    <option value="lead">New Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="discovery">Discovery</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Closed Won</option>
                    <option value="lost">Closed Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Expected Close Date</label>
                <input
                  type="date"
                  value={dealCloseDate}
                  onChange={(e) => setDealCloseDate(e.target.value)}
                  className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Next Scheduled Step</label>
                <input
                  type="text"
                  placeholder="e.g. Send technical scope document by Tuesday"
                  value={dealNextStep}
                  onChange={(e) => setDealNextStep(e.target.value)}
                  className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 pb-safe">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs min-h-[44px]"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-950 border-t sm:border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Schedule Follow-up Task</h3>
              </div>
              <button onClick={() => setShowAddTaskModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Task Action *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call Marcus Brody regarding revised SLA"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Linked Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Brody"
                  value={taskContact}
                  onChange={(e) => setTaskContact(e.target.value)}
                  className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-bold"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 pb-safe">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs min-h-[44px]"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-950 border-t sm:border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Create Customer Invoice</h3>
              </div>
              <button onClick={() => setShowAddInvoiceModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cobalt BioTech"
                    value={invoiceCustomer}
                    onChange={(e) => setInvoiceCustomer(e.target.value)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Invoice Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    className="w-full p-3 sm:p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm sm:text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 pb-safe">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs min-h-[44px]"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
