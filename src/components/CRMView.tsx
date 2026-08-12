import React, { useState } from 'react';
import { CRMContact, CRMStage, CurrencyCode, NormalizedRecord } from '../types';
import { calculatePipelineSummary, saveCRMContacts } from '../utils/crmEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  Users,
  Plus,
  ArrowUpRight,
  MessageSquare,
  Paperclip,
  Calendar,
  Mail,
  MapPin,
  CheckCircle2,
  Trash2,
  X,
  Phone,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface CRMViewProps {
  contacts: CRMContact[];
  onContactsChange: (updated: CRMContact[]) => void;
  currency: CurrencyCode;
  records: NormalizedRecord[];
}

const STAGES: { key: CRMStage; label: string }[] = [
  { key: 'in_touch', label: 'In Touch' },
  { key: 'offer_sent', label: 'Offer Sent' },
  { key: 'discussion', label: 'Discussion' },
  { key: 'closed_won', label: 'Closed Won' },
  { key: 'closed_lost', label: 'Closed Lost' },
];

export const CRMView: React.FC<CRMViewProps> = ({
  contacts,
  onContactsChange,
  currency,
  records,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Lead Form State
  const [newCompany, setNewCompany] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDealValue, setNewDealValue] = useState(15000);
  const [newStage, setNewStage] = useState<CRMStage>('in_touch');
  const [newTag, setNewTag] = useState('New');
  const [newNotes, setNewNotes] = useState('');

  const summary = calculatePipelineSummary(contacts);

  const filteredContacts = contacts.filter((c) => {
    if (selectedTag !== 'all' && !c.tags.includes(selectedTag)) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        c.company.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStageChange = (contactId: string, newStage: CRMStage) => {
    const updated = contacts.map((c) => (c.id === contactId ? { ...c, stage: newStage } : c));
    onContactsChange(updated);
    saveCRMContacts(updated);
  };

  const handleDeleteContact = (contactId: string) => {
    const updated = contacts.filter((c) => c.id !== contactId);
    onContactsChange(updated);
    saveCRMContacts(updated);
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;

    const newLead: CRMContact = {
      id: `crm-${Date.now()}`,
      company: newCompany,
      name: newName || `${newCompany} Lead`,
      email: newEmail || `contact@${newCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: newPhone,
      location: newLocation || 'Remote',
      stage: newStage,
      dealValue: Number(newDealValue) || 10000,
      tags: [newTag],
      notes: newNotes || 'New deal lead added via DataBeta CRM Suite.',
      managerName: 'Helena Mcneil',
      lastContactDate: 'Today',
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      orderCount: 0,
      commentsCount: 1,
      attachmentsCount: 0,
    };

    const updated = [newLead, ...contacts];
    onContactsChange(updated);
    saveCRMContacts(updated);

    // Reset Form
    setNewCompany('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewLocation('');
    setNewDealValue(15000);
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">
            DataBeta CRM Suite
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Customer Pipeline & Account Management</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Track deal stages, customer Lifetime Value (LTV), auto-linked sales transactions, and client activities.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-md shadow-rose-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Lead / Deal</span>
        </button>
      </div>

      {/* Pipeline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalPipelineValue, currency)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Across all active deal stages</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
            <Users className="w-4 h-4 text-slate-900 dark:text-white" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {summary.totalDeals} Accounts
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Pipeline deal records</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Win Rate %</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary.winRatePct.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Closed Won deal ratio</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Deal Size</span>
            <DollarSign className="w-4 h-4 text-slate-900 dark:text-white" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(summary.avgDealSize, currency)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Average value per deal</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deals or company names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">Tag:</span>
          {['all', 'New', 'Priority', 'Repeat', 'High Value'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedTag === t
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              {t === 'all' ? 'All Tags' : t}
            </button>
          ))}
        </div>
      </div>

      {/* KANBAN BOARD PIPELINE (Exact Reference Screenshot Design) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stg) => {
          const stageDeals = filteredContacts.filter((c) => c.stage === stg.key);

          return (
            <div key={stg.key} className="space-y-3 min-w-[240px]">
              {/* Column Header */}
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                <span>{stg.label}</span>
                <span className="text-slate-400 dark:text-zinc-500 font-mono">/{stageDeals.length}</span>
              </div>

              {/* Deal Cards Container */}
              <div className="space-y-3">
                {stageDeals.length > 0 ? (
                  stageDeals.map((c) => {
                    const isDarkCard = c.tags.includes('Priority') || c.tags.includes('High Value');

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedContact(c)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] shadow-sm space-y-3 ${
                          isDarkCard
                            ? 'bg-zinc-950 text-white border-zinc-800 shadow-lg'
                            : 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white border-slate-200/80 dark:border-zinc-800'
                        }`}
                      >
                        {/* Status Pills */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {c.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`font-extrabold px-3 py-0.5 rounded-full text-[10px] ${
                                  tag === 'Repeat'
                                    ? 'bg-rose-600 text-white'
                                    : tag === 'Priority'
                                    ? isDarkCard
                                      ? 'border border-zinc-700 bg-zinc-900 text-zinc-200'
                                      : 'border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'
                                    : 'bg-zinc-950 text-white dark:bg-white dark:text-black'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-black text-emerald-500">
                            {formatCurrency(c.dealValue, currency)}
                          </span>
                        </div>

                        {/* Title & Notes */}
                        <div>
                          <h4 className="font-bold text-sm tracking-tight">{c.company}</h4>
                          <p className={`text-[11px] mt-0.5 leading-tight ${isDarkCard ? 'text-zinc-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                            {c.notes || c.name}
                          </p>
                        </div>

                        {/* Additional Info for Highlight Card */}
                        {isDarkCard && (
                          <div className="space-y-1 text-[11px] text-zinc-300 pt-1 border-t border-zinc-800">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <Mail className="w-3 h-3" />
                              <span>{c.email}</span>
                            </div>
                            {c.location && (
                              <div className="flex items-center gap-1.5 text-zinc-400">
                                <MapPin className="w-3 h-3" />
                                <span>{c.location}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Manager Avatar & Quick Stage Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-900">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                              {(c.managerName || 'HM').split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className={`text-[11px] font-semibold ${isDarkCard ? 'text-zinc-300' : 'text-slate-600 dark:text-zinc-400'}`}>
                              {c.managerName || 'Manager'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{c.lastContactDate}</span>
                          </div>
                        </div>

                        {/* Stage Selector Dropdown */}
                        <div className="pt-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={c.stage}
                            onChange={(e) => handleStageChange(c.id, e.target.value as CRMStage)}
                            className="bg-slate-100 dark:bg-zinc-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s.key} value={s.key} className="bg-white dark:bg-black text-slate-900 dark:text-white">
                                Move to: {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400 dark:text-zinc-600">
                    No deals in {stg.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Lead */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 max-w-lg w-full p-6 relative my-8 space-y-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Add New Business Lead / Deal</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Create a new customer deal record in your local CRM pipeline.</p>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Estimated Deal Value ($)</label>
                  <input
                    type="number"
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="jane@acme.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Pipeline Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as CRMStage)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key} className="bg-white dark:bg-black text-slate-900 dark:text-white">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Status Tag</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Priority">Priority</option>
                    <option value="Repeat">Repeat</option>
                    <option value="High Value">High Value</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Deal notes or requirements..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-500 dark:text-zinc-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-md shadow-rose-600/30"
                >
                  Create Deal Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer: Contact Detail */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md h-full p-6 shadow-2xl overflow-y-auto space-y-6 border-l border-slate-200 dark:border-zinc-800 relative">
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-5 right-5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-rose-600 text-white font-extrabold px-3 py-0.5 rounded-full text-[10px]">
                  {selectedContact.stage.replace('_', ' ').toUpperCase()}
                </span>
                {selectedContact.tags.map((t) => (
                  <span key={t} className="bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold px-3 py-0.5 rounded-full text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedContact.company}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{selectedContact.name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Deal Value:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedContact.dealValue, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Lifetime Revenue (LTV):</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(selectedContact.totalSpent, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Total Completed Orders:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedContact.orderCount}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Contact Info</h4>
              <div className="space-y-1.5 text-slate-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedContact.email}</span>
                </div>
                {selectedContact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedContact.phone}</span>
                  </div>
                )}
                {selectedContact.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedContact.location}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedContact.notes && (
              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Account Notes</h4>
                <p className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 leading-relaxed italic">
                  "{selectedContact.notes}"
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-between items-center">
              <button
                onClick={() => handleDeleteContact(selectedContact.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold hover:bg-rose-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
