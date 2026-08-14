import React, { useState, useEffect } from 'react';
import {
  CurrencyCode,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  AuditLogEntry,
  User,
  NormalizedRecord,
} from '../types';
import { auditService } from '../services/auditService';
import {
  Building2,
  Users,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Download,
  Trash2,
  Plus,
  CheckCircle2,
  Globe,
  Clock,
  Key,
  Database,
  Lock,
  Mail,
  X,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onCurrencyChange: (newCurrency: CurrencyCode) => void;
  onClearData: () => void;
  activeBusiness?: any;
  onUpdateBusiness?: (name: string, currency: string) => void;
  currentUser?: User | null;
}

type SettingsSubtab = 'business' | 'team' | 'security_data' | 'audit_log';

export const SettingsView: React.FC<SettingsViewProps> = ({
  records,
  currency,
  onCurrencyChange,
  onClearData,
  activeBusiness,
  onUpdateBusiness,
  currentUser,
}) => {
  const [subtab, setSubtab] = useState<SettingsSubtab>('business');
  const [workspaceName, setWorkspaceName] = useState(activeBusiness?.name || 'Apex Technical Solutions');
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(currency || 'USD');
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>(currency || 'USD');
  const [fiscalStartMonth, setFiscalStartMonth] = useState('1'); // January
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Team Members State
  const [members, setMembers] = useState<WorkspaceMember[]>([
    {
      id: 'mem-1',
      workspaceId: 'ws-main',
      userId: 'usr-1',
      userEmail: currentUser?.email || 'owner@databeta.app',
      userName: currentUser?.fullName || 'Owner / Administrator',
      role: 'owner',
    },
    {
      id: 'mem-2',
      workspaceId: 'ws-main',
      userId: 'usr-2',
      userEmail: 'alex.rivera@databeta.app',
      userName: 'Alex Rivera',
      role: 'salesperson',
    },
    {
      id: 'mem-3',
      workspaceId: 'ws-main',
      userId: 'usr-3',
      userEmail: 'finance@databeta.app',
      userName: 'Elena Rostova',
      role: 'finance_viewer',
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'salesperson' | 'finance_viewer'>('salesperson');
  const currentWsId = activeBusiness?.id || 'ws-main';

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    auditService.getLogs(currentWsId).then(setAuditLogs);
  }, [currentWsId]);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateBusiness) {
      onUpdateBusiness(workspaceName, baseCurrency);
    }
    if (baseCurrency !== currency) {
      onCurrencyChange(baseCurrency);
      await auditService.logEvent(
        currentWsId,
        currentUser?.email || 'owner@databeta.app',
        'base_currency_changed',
        'workspace',
        currentWsId,
        { previousCurrency: currency, newCurrency: baseCurrency }
      );
    } else {
      await auditService.logEvent(
        currentWsId,
        currentUser?.email || 'owner@databeta.app',
        'workspace_settings_updated',
        'workspace',
        currentWsId,
        { workspaceName, baseCurrency, fiscalStartMonth }
      );
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    const logs = await auditService.getLogs(currentWsId);
    setAuditLogs(logs);
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: WorkspaceMember = {
      id: `mem-${Date.now()}`,
      workspaceId: currentWsId,
      userId: `usr-${Date.now()}`,
      userEmail: inviteEmail.trim(),
      userName: inviteEmail.split('@')[0],
      role: inviteRole,
      invitedAt: new Date().toISOString(),
    };

    setMembers([...members, newMember]);
    setShowInviteModal(false);
    setInviteEmail('');

    await auditService.logEvent(
      currentWsId,
      currentUser?.email || 'owner@databeta.app',
      'member_invited',
      'workspace_member',
      newMember.id,
      { email: newMember.userEmail, role: newMember.role }
    );
    const logs = await auditService.getLogs(currentWsId);
    setAuditLogs(logs);
  };

  const handleExportWorkspace = async () => {
    const data = {
      exportedAt: new Date().toISOString(),
      workspaceId: currentWsId,
      workspaceName,
      baseCurrency,
      members,
      recordsCount: records.length,
      records,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `databeta_export_${workspaceName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    await auditService.logEvent(
      currentWsId,
      currentUser?.email || 'owner@databeta.app',
      'data_exported',
      'workspace',
      currentWsId,
      { recordsCount: records.length }
    );
    const logs = await auditService.getLogs(currentWsId);
    setAuditLogs(logs);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-950 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-0.5 rounded-full">
              Workspace Governance
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              • RBAC • Audit Log • Strict Tenant Isolation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Settings & Team Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Configure base and display currencies, invite sales reps, review immutable audit logs, and export workspace data.
          </p>
        </div>
      </div>

      {/* Subtab Bar */}
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar bg-white dark:bg-zinc-950 p-2.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
        <button
          onClick={() => setSubtab('business')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            subtab === 'business'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Workspace Profile</span>
        </button>

        <button
          onClick={() => setSubtab('team')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            subtab === 'team'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team & Roles ({members.length})</span>
        </button>

        <button
          onClick={() => setSubtab('security_data')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            subtab === 'security_data'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Data Architecture</span>
        </button>

        <button
          onClick={() => setSubtab('audit_log')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            subtab === 'audit_log'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* Subtab 1: Business Profile */}
      {subtab === 'business' && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace Configuration</h2>
            <p className="text-xs text-slate-400">Configure base accounting currency and company details.</p>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Workspace settings updated and recorded in audit log.</span>
            </div>
          )}

          <form onSubmit={handleSaveBusiness} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Company / Workspace Name</label>
              <input
                type="text"
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Base Workspace Currency
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value as CurrencyCode)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                >
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="CAD">CAD — Canadian Dollar ($)</option>
                  <option value="AUD">AUD — Australian Dollar ($)</option>
                  <option value="SGD">SGD — Singapore Dollar ($)</option>
                  <option value="AED">AED — UAE Dirham (د.إ)</option>
                  <option value="JPY">JPY — Japanese Yen (¥)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Changes are permission-gated and audited.</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Fiscal Year Start Month
                </label>
                <select
                  value={fiscalStartMonth}
                  onChange={(e) => setFiscalStartMonth(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="1">January (Calendar Year)</option>
                  <option value="4">April (UK / India standard)</option>
                  <option value="7">July (Australia / Mid-Year)</option>
                  <option value="10">October (US Federal standard)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs transition-all"
              >
                Save Workspace Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subtab 2: Team Members & RBAC */}
      {subtab === 'team' && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace Members & Access Roles</h2>
              <p className="text-xs text-slate-400">Row-level security enforcement for frontline sales and finance viewers.</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/80 dark:border-zinc-800">
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {members.map((mem) => (
                  <tr key={mem.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{mem.userName}</td>
                    <td className="p-3.5 font-mono text-slate-500">{mem.userEmail}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 font-bold uppercase text-[10px] text-slate-700 dark:text-zinc-300">
                        {mem.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-emerald-600 font-bold text-[11px]">Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Security & Data Architecture */}
      {subtab === 'security_data' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Security, Storage & Privacy Architecture</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Database className="w-4 h-4 text-rose-600" />
                  <span>Database & Isolation</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  PostgreSQL database hosted on Supabase Cloud. Strict Row Level Security (RLS) policies isolate each workspace's records.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Encryption & Transmission</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  All communications encrypted via TLS 1.3 in transit and AES-256 at rest. Zero service keys exposed to browser clients.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>Zero Data Selling</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Your customer data, margins, and pipeline entries are never sold, scraped for public AI training, or shared with third parties.
                </p>
              </div>
            </div>

            {/* Data Export & Danger Zone */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Download Complete Workspace Export</span>
                <span className="text-[11px] text-slate-400">Export all deals, contacts, invoices, and ledger records as a single JSON file.</span>
              </div>
              <button
                type="button"
                onClick={handleExportWorkspace}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Dump</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Audit Log */}
      {subtab === 'audit_log' && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Immutable Audit Log</h2>
            <p className="text-xs text-slate-400">Timestamped record of administrative and sensitive workspace operations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/80 dark:border-zinc-800">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-zinc-300 font-semibold">{log.userEmail}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 font-bold uppercase text-[10px] text-slate-700 dark:text-zinc-300">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{log.entityType}</td>
                    <td className="p-3.5 text-slate-600 dark:text-zinc-400 font-mono text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="salesperson">Salesperson (Manages assigned deals & follow-ups)</option>
                  <option value="sales_manager">Sales Manager (Views team pipeline & conversions)</option>
                  <option value="finance_viewer">Finance Viewer (Receivables & Ledger read-only)</option>
                  <option value="admin">Administrator (Full workspace controls)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
