import React, { useState } from 'react';
import { CRMContact, CRMStage, CurrencyCode, NormalizedRecord } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculatePipelineSummary } from '../utils/crmEngine';
import { crmService } from '../services/crmService';
import { Users, Plus, Search, Filter, Trash2, Mail, Phone, MapPin, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface CRMViewProps {
  contacts: CRMContact[];
  onContactsChange: (contacts: CRMContact[]) => void;
  currency: CurrencyCode;
  records: NormalizedRecord[];
  activeBusinessId?: string;
}

export const KANBAN_STAGES: { key: CRMStage; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'bg-zinc-800 text-zinc-300' },
  { key: 'qualified', label: 'Qualified', color: 'bg-blue-950 text-blue-400 border-blue-900' },
  { key: 'proposal', label: 'Proposal', color: 'bg-purple-950 text-purple-400 border-purple-900' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-amber-950 text-amber-400 border-amber-900' },
  { key: 'closed_won', label: 'Won', color: 'bg-emerald-950 text-emerald-400 border-emerald-900' },
  { key: 'closed_lost', label: 'Lost', color: 'bg-rose-950 text-rose-400 border-rose-900' },
];

export const CRMView: React.FC<CRMViewProps> = ({
  contacts,
  onContactsChange,
  currency,
  records,
  activeBusinessId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newCompany, setNewCompany] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStage, setNewStage] = useState<CRMStage>('lead');
  const [newDealValue, setNewDealValue] = useState<number | ''>(10000);
  const [newTag, setNewTag] = useState('Priority');
  const [newNotes, setNewNotes] = useState('');

  const pipelineSummary = calculatePipelineSummary(contacts);

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.company.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStageChange = async (contactId: string, stage: CRMStage) => {
    const updated = contacts.map((c) => (c.id === contactId ? { ...c, stage } : c));
    onContactsChange(updated);
    if (activeBusinessId) {
      await crmService.updateDealStage(activeBusinessId, contactId, stage);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    const updated = contacts.filter((c) => c.id !== contactId);
    onContactsChange(updated);
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
    }
    if (activeBusinessId) {
      await crmService.deleteDeal(activeBusinessId, contactId);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;

    const val = Number(newDealValue) || 10000;

    const newDealPayload = {
      company: newCompany,
      name: newName || `${newCompany} Opportunity`,
      email: newEmail,
      phone: newPhone,
      stage: newStage,
      dealValue: val,
      tags: [newTag],
      notes: newNotes,
    };

    if (activeBusinessId) {
      const { deal: created, error } = await crmService.createDeal(activeBusinessId, newDealPayload);
      if (created) {
        onContactsChange([created, ...contacts]);
      }
    } else {
      const localDeal: CRMContact = {
        ...newDealPayload,
        id: `crm-${Date.now()}`,
        lastContactDate: 'Today',
        createdAt: new Date().toISOString().split('T')[0],
        totalSpent: val,
        orderCount: 1,
      };
      onContactsChange([localDeal, ...contacts]);
    }

    setNewCompany('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewDealValue(10000);
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
            CRM Pipeline & Deal Management
          </div>
          <h2 className="text-2xl font-black tracking-tight">Active Sales Pipeline</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Track deal stages, manage customer opportunities, and monitor conversion velocity.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-lg shadow-rose-600/30 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Opportunity</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center shadow-xs transition-colors duration-200">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Pipeline Value</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-500 mt-1">
            {formatCurrency(pipelineSummary.totalPipelineValue, currency)}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center shadow-xs transition-colors duration-200">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Total Opportunities</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{pipelineSummary.totalDeals}</div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center shadow-xs transition-colors duration-200">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Win Rate</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {pipelineSummary.winRatePct.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center shadow-xs transition-colors duration-200">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Avg Deal Size</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(pipelineSummary.avgDealSize, currency)}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4 transition-colors duration-200">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deals by company or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* 6-Stage Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {KANBAN_STAGES.map((col) => {
          const stageDeals = filteredContacts.filter((c) => {
            if (col.key === 'lead') return c.stage === 'lead' || c.stage === 'in_touch';
            if (col.key === 'qualified') return c.stage === 'qualified' || c.stage === 'offer_sent';
            if (col.key === 'proposal') return c.stage === 'proposal' || c.stage === 'discussion';
            return c.stage === col.key;
          });

          return (
            <div key={col.key} className="space-y-3 min-w-[200px]">
              {/* Column Header */}
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">{col.label}</span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  {stageDeals.length}
                </span>
              </div>

              {/* Stage Cards */}
              <div className="space-y-3 min-h-[300px]">
                {stageDeals.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-150 space-y-3 shadow-xs group active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-600/30">
                        {c.tags[0] || 'Opportunity'}
                      </span>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{c.company}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">{c.name}</p>
                    </div>

                    <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                      {formatCurrency(c.dealValue, currency)}
                    </div>

                    {/* Move Stage Selector */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-900">
                      <select
                        value={c.stage}
                        onChange={(e) => handleStageChange(c.id, e.target.value as CRMStage)}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300 font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        {KANBAN_STAGES.map((s) => (
                          <option key={s.key} value={s.key} className="bg-white dark:bg-black text-slate-900 dark:text-white">{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="p-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-[11px] text-slate-400 dark:text-zinc-600 font-medium">
                    Empty Stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 max-w-md w-full space-y-4 animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-black">Add New CRM Deal</h3>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Deal Value ($)</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={newDealValue}
                  onChange={(e) => setNewDealValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Initial Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as CRMStage)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {KANBAN_STAGES.map((s) => (
                    <option key={s.key} value={s.key} className="bg-white dark:bg-black text-slate-900 dark:text-white">{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-md shadow-rose-600/30 active:scale-95 transition-all"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
