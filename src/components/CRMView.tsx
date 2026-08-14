import React, { useState, useMemo } from 'react';
import {
  Deal,
  Contact,
  Company,
  Task,
  Activity,
  DealStage,
  CurrencyCode,
  CoreTab,
} from '../types';
import { calculateWeightedPipeline, calculateWinRate } from '../utils/provenanceEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { crmService } from '../services/crmService';
import {
  Users,
  Building2,
  GitPullRequest,
  CheckSquare,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  Phone,
  MessageSquare,
  Copy,
  Check,
  MoreVertical,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  AlertCircle,
  Tag,
  FileText,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

interface CRMViewProps {
  deals: Deal[];
  contacts: Contact[];
  tasks: Task[];
  currency: CurrencyCode;
  workspaceId?: string;
  onDealsChange: (deals: Deal[]) => void;
  onContactsChange: (contacts: Contact[]) => void;
  onTasksChange: (tasks: Task[]) => void;
  onOpenAddDeal: () => void;
  onOpenAddTask: () => void;
}

type CRMSubtab = 'deals' | 'contacts' | 'companies' | 'tasks';

const KANBAN_STAGES: { key: DealStage; label: string; probabilityPct: number; color: string }[] = [
  { key: 'lead', label: 'New Lead', probabilityPct: 10, color: 'border-slate-300 dark:border-zinc-700' },
  { key: 'qualified', label: 'Qualified', probabilityPct: 30, color: 'border-blue-400 dark:border-blue-700' },
  { key: 'discovery', label: 'Discovery', probabilityPct: 50, color: 'border-indigo-400 dark:border-indigo-700' },
  { key: 'proposal_sent', label: 'Proposal Sent', probabilityPct: 70, color: 'border-amber-400 dark:border-amber-700' },
  { key: 'negotiation', label: 'Negotiation', probabilityPct: 85, color: 'border-purple-400 dark:border-purple-700' },
  { key: 'won', label: 'Closed Won', probabilityPct: 100, color: 'border-emerald-500 dark:border-emerald-700' },
  { key: 'lost', label: 'Closed Lost', probabilityPct: 0, color: 'border-rose-400 dark:border-rose-800' },
];

export const CRMView: React.FC<CRMViewProps> = ({
  deals,
  contacts,
  tasks,
  currency,
  workspaceId = 'default-workspace',
  onDealsChange,
  onContactsChange,
  onTasksChange,
  onOpenAddDeal,
  onOpenAddTask,
}) => {
  const [subtab, setSubtab] = useState<CRMSubtab>('deals');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);

  // Quick Activity Log State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState<'call' | 'whatsapp' | 'meeting' | 'note'>('call');
  const [logNotes, setLogNotes] = useState('');

  // Quick Add Contact Modal State
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Metrics
  const weightedPipeline = useMemo(() => calculateWeightedPipeline(deals, currency), [deals, currency]);
  const winRateMetric = useMemo(() => calculateWinRate(deals), [deals]);

  // Derived Companies List from Contacts & Deals
  const companiesList: Company[] = useMemo(() => {
    const compMap: Record<string, Company> = {};

    contacts.forEach((c) => {
      const name = c.companyName || c.name;
      if (!compMap[name]) {
        compMap[name] = {
          id: `comp-${name.toLowerCase().replace(/\s+/g, '-')}`,
          workspaceId,
          name,
          domain: `${name.toLowerCase().replace(/\s+/g, '')}.com`,
          tier: 'SMB',
          totalWonRevenue: 0,
          openPipelineValue: 0,
          contactsCount: 0,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      }
      compMap[name].contactsCount = (compMap[name].contactsCount || 0) + 1;
    });

    deals.forEach((d) => {
      const name = d.companyName || d.title;
      if (!compMap[name]) {
        compMap[name] = {
          id: `comp-${name.toLowerCase().replace(/\s+/g, '-')}`,
          workspaceId,
          name,
          domain: `${name.toLowerCase().replace(/\s+/g, '')}.com`,
          tier: d.amount > 50000 ? 'Enterprise' : d.amount > 20000 ? 'Mid-Market' : 'SMB',
          totalWonRevenue: 0,
          openPipelineValue: 0,
          contactsCount: 1,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        };
      }

      if (d.stage === 'won') {
        compMap[name].totalWonRevenue = (compMap[name].totalWonRevenue || 0) + d.amount;
      } else if (d.stage !== 'lost') {
        compMap[name].openPipelineValue = (compMap[name].openPipelineValue || 0) + d.amount;
      }

      if (d.amount > 50000) compMap[name].tier = 'Enterprise';
      else if (d.amount > 20000 && compMap[name].tier !== 'Enterprise') compMap[name].tier = 'Mid-Market';
    });

    return Object.values(compMap);
  }, [contacts, deals, workspaceId]);

  // Stage Advancement Handler
  const handleAdvanceStage = async (dealId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const stageOrder: DealStage[] = ['lead', 'qualified', 'discovery', 'proposal_sent', 'negotiation', 'won'];
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const currentIndex = stageOrder.indexOf(deal.stage);
    if (currentIndex >= 0 && currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      const updated = deals.map((d) => (d.id === dealId ? { ...d, stage: nextStage, updatedAt: new Date().toISOString() } : d));
      onDealsChange(updated);
      await crmService.updateDealStage(workspaceId, dealId, nextStage);
    }
  };

  // Delete Deal
  const handleDeleteDeal = async (dealId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deal?')) return;
    const updated = deals.filter((d) => d.id !== dealId);
    onDealsChange(updated);
    if (selectedDeal?.id === dealId) setSelectedDeal(null);
    await crmService.deleteDeal(workspaceId, dealId);
  };

  // Create Contact Handler with Duplicate Detection
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    // Duplicate check
    const existing = contacts.find(
      (c) =>
        (newContactEmail && c.email.toLowerCase() === newContactEmail.trim().toLowerCase()) ||
        (newContactPhone && c.phone === newContactPhone.trim())
    );

    if (existing) {
      setDuplicateWarning(`A contact named "${existing.name}" already exists with this email/phone.`);
      return;
    }

    const newContact: Contact = {
      id: `cont-${Date.now()}`,
      workspaceId,
      name: newContactName.trim(),
      email: newContactEmail.trim() || `${newContactName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: newContactPhone.trim() || undefined,
      companyName: newContactCompany.trim() || undefined,
      roleTitle: newContactRole.trim() || 'Stakeholder',
      tags: ['New Contact'],
      lastActivityAt: 'Today',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    const updated = [newContact, ...contacts];
    onContactsChange(updated);
    await crmService.saveContacts(workspaceId, updated);

    setShowAddContactModal(false);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactCompany('');
    setNewContactRole('');
    setDuplicateWarning(null);
  };

  // Toggle Task Status
  const handleToggleTask = async (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: (t.status === 'pending' ? 'completed' : 'pending') as Task['status'] } : t
    );
    onTasksChange(updated);
    await crmService.saveTasks(workspaceId, updated);
  };

  // Copy WhatsApp Script
  const handleCopyWhatsApp = (name: string, title?: string) => {
    const text = `Hi ${name}, following up regarding our discussion${title ? ` on ${title}` : ''}. Let me know if you have 5 minutes for a quick update call today. Thanks!`;
    navigator.clipboard.writeText(text);
    setCopiedActionId(name);
    setTimeout(() => setCopiedActionId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-950 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full">
                Frontline Sales CRM
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                • {deals.length} deals • {contacts.length} contacts
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Pipeline & Customer Operations
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
              Track deals across 7 transparent stages, log calls, schedule follow-ups, and manage accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
            <button
              onClick={() => setShowAddContactModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-zinc-800 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
            <button
              onClick={onOpenAddDeal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Deal</span>
            </button>
          </div>
        </div>

        {/* CRM KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Weighted Pipeline</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {weightedPipeline.formattedValue}
            </div>
            <p className="text-[10px] text-slate-400">{weightedPipeline.coverage.records} active deals</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Win Rate Conversion</span>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {winRateMetric.formattedValue}
            </div>
            <p className="text-[10px] text-slate-400">{deals.filter((d) => d.stage === 'won').length} won opportunities</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Contacts</span>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {contacts.length} People
            </div>
            <p className="text-[10px] text-slate-400">Across {companiesList.length} companies</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pending Tasks</span>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
              {tasks.filter((t) => t.status === 'pending').length} Tasks
            </div>
            <p className="text-[10px] text-slate-400">{tasks.filter((t) => t.priority === 'urgent').length} marked urgent</p>
          </div>
        </div>
      </div>

      {/* Subtab Navigation + Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-2.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setSubtab('deals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subtab === 'deals'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Deals Pipeline ({deals.length})</span>
          </button>

          <button
            onClick={() => setSubtab('contacts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subtab === 'contacts'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Contacts ({contacts.length})</span>
          </button>

          <button
            onClick={() => setSubtab('companies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subtab === 'companies'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Companies ({companiesList.length})</span>
          </button>

          <button
            onClick={() => setSubtab('tasks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subtab === 'tasks'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks Queue ({tasks.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {subtab === 'deals' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  viewMode === 'kanban' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                Table List
              </button>
            </div>
          )}

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search CRM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Subtab 1: Deals Pipeline */}
      {subtab === 'deals' && (
        <div>
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3.5 overflow-x-auto pb-4 custom-scrollbar">
              {KANBAN_STAGES.map((stage) => {
                const stageDeals = deals.filter(
                  (d) =>
                    d.stage === stage.key &&
                    (searchQuery === '' ||
                      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
                );
                const stageTotal = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

                return (
                  <div
                    key={stage.key}
                    className="bg-slate-50/70 dark:bg-zinc-950/60 p-3 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 flex flex-col space-y-3 min-w-[220px]"
                  >
                    {/* Stage Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-800/60">
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="truncate">{stage.label}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-zinc-800 px-1.5 py-0.2 rounded-md border border-slate-200/60 dark:border-zinc-700">
                            {stageDeals.length}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
                          {formatCurrency(stageTotal, currency)}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 font-bold">{stage.probabilityPct}%</span>
                    </div>

                    {/* Stage Cards */}
                    <div className="space-y-2.5 flex-1">
                      {stageDeals.length === 0 ? (
                        <div className="p-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800/60 rounded-xl">
                          No deals
                        </div>
                      ) : (
                        stageDeals.map((deal) => (
                          <div
                            key={deal.id}
                            onClick={() => setSelectedDeal(deal)}
                            className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer space-y-2 group"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                                {deal.title}
                              </span>
                              <button
                                onClick={(e) => handleDeleteDeal(deal.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                                title="Delete deal"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono font-bold">
                              <span className="text-slate-900 dark:text-white">
                                {formatCurrency(deal.amount, currency)}
                              </span>
                              <span className="text-[10px] font-sans text-slate-400">
                                {deal.expectedCloseDate}
                              </span>
                            </div>

                            {deal.nextStep && (
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate bg-slate-50 dark:bg-zinc-950 p-1.5 rounded-md border border-slate-100 dark:border-zinc-800">
                                👉 {deal.nextStep}
                              </p>
                            )}

                            {/* Advance Stage Button */}
                            {stage.key !== 'won' && stage.key !== 'lost' && (
                              <button
                                onClick={(e) => handleAdvanceStage(deal.id, e)}
                                className="w-full mt-1 py-1 bg-slate-50 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-zinc-300 rounded-lg text-[10px] font-bold border border-slate-200/60 dark:border-zinc-700 transition-all flex items-center justify-center gap-1"
                              >
                                <span>Advance Stage</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Deals Table List View */
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/80 dark:border-zinc-800">
                      <th className="p-3.5">Deal / Company</th>
                      <th className="p-3.5">Stage</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Probability</th>
                      <th className="p-3.5">Target Close</th>
                      <th className="p-3.5">Next Step</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                    {deals.map((deal) => (
                      <tr
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-pointer"
                      >
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{deal.title}</div>
                          <div className="text-[11px] text-slate-400">{deal.companyName}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 font-bold uppercase text-[10px] text-slate-700 dark:text-zinc-300">
                            {deal.stage.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(deal.amount, currency)}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-zinc-400">{deal.probabilityPct}%</td>
                        <td className="p-3.5 font-mono text-slate-500">{deal.expectedCloseDate}</td>
                        <td className="p-3.5 text-slate-600 dark:text-zinc-400 truncate max-w-xs">{deal.nextStep || '—'}</td>
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleAdvanceStage(deal.id, e)}
                            className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg text-xs font-bold"
                          >
                            Advance →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Contacts Directory */}
      {subtab === 'contacts' && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Customer & Lead Directory</h2>
            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts
              .filter(
                (c) =>
                  searchQuery === '' ||
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 hover:border-rose-400 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{contact.name}</div>
                      <div className="text-xs text-slate-500">
                        {contact.roleTitle || 'Stakeholder'} {contact.companyName ? `• ${contact.companyName}` : ''}
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400">
                    <div className="truncate font-mono">{contact.email}</div>
                    {contact.phone && <div className="font-mono">{contact.phone}</div>}
                  </div>

                  {contact.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 p-2 rounded-lg border border-slate-100 dark:border-zinc-800 line-clamp-2">
                      {contact.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleCopyWhatsApp(contact.name)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:text-rose-600"
                      title="Click to copy drafted follow-up script to clipboard"
                    >
                      {copiedActionId === contact.name ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedActionId === contact.name ? 'Copied script!' : 'Copy WhatsApp msg'}</span>
                    </button>

                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-lg text-emerald-600"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Companies Directory */}
      {subtab === 'companies' && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Commercial Accounts & Tiers</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companiesList
              .filter((c) => searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((comp) => (
                <div
                  key={comp.id}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{comp.name}</div>
                      <div className="text-xs text-slate-400">{comp.industry || 'Commercial Client'}</div>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        comp.tier === 'Enterprise'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : comp.tier === 'Mid-Market'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {comp.tier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white dark:bg-zinc-950 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Realized Won</span>
                      <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(comp.totalWonRevenue || 0, currency)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Open Pipeline</span>
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatCurrency(comp.openPipelineValue || 0, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Subtab 4: Tasks Queue */}
      {subtab === 'tasks' && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Reconciled Sales Tasks</h2>
            <button
              onClick={onOpenAddTask}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-4 h-4 rounded-md accent-rose-600 cursor-pointer"
                  />
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        task.status === 'completed'
                          ? 'line-through text-slate-400 dark:text-zinc-600'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {task.contactName || task.dealTitle || 'Direct Task'} • Due: {task.dueDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      task.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Contact Modal with Duplicate Detection */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create CRM Contact</h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Industrial"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sarah@apex.com"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Role / Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Head of Procurement"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Create Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
