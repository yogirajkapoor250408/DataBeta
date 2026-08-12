import React, { useState } from 'react';
import { User, LoginSessionLog, AdminSystemStats } from '../types';
import { getStoredLogs, getAdminStats } from '../utils/authEngine';
import {
  ShieldCheck,
  Users,
  Activity,
  HardDrive,
  Bot,
  Clock,
  Globe,
  Database,
  CheckCircle2,
  Lock,
  UserCheck,
  Search,
  Filter,
} from 'lucide-react';

interface AdminConsoleViewProps {
  currentUser: User;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<LoginSessionLog[]>(getStoredLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const stats: AdminSystemStats = getAdminStats();

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-zinc-950 text-white p-7 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">
              Website Owner & Admin Monitoring Console
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">System Auditing & Platform Usage</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Monitor active user accounts, login session logs, local spreadsheet parses, and system performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-xs font-bold text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{stats.systemUptimePct}% Operational Uptime</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalUsers}</div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Platform user accounts</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Logins</span>
            <Activity className="w-4 h-4 text-slate-900 dark:text-white" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalLogins}</div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Google, Apple & Email sessions</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Datasets Uploaded</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalDatasetsUploaded}</div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">CSV & Excel files parsed</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Queries Executed</span>
            <Bot className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalAIQueriesExecuted}</div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Local AI Engine advisories</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">CRM Deals</span>
            <UserCheck className="w-4 h-4 text-slate-900 dark:text-white" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalCRMDealsCreated}</div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Active customer deals</p>
        </div>
      </div>

      {/* Live User Login Sessions Audit Table */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Live User Login Session Logs</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Real-time audit log of authenticated logins</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 dark:border-zinc-800 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-200 font-semibold border-b border-slate-200 dark:border-zinc-800 uppercase tracking-wider">
                <th className="p-3">User Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Auth Provider</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Session IP / Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {l.userName.charAt(0)}
                    </div>
                    <span>{l.userName}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-zinc-400 font-medium">{l.userEmail}</td>
                  <td className="p-3">
                    <span
                      className={`font-extrabold px-3 py-0.5 rounded-full text-[10px] uppercase ${
                        l.provider === 'google'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                          : l.provider === 'apple'
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                      }`}
                    >
                      {l.provider}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{l.timestamp}</td>
                  <td className="p-3 text-slate-500 font-mono">{l.ipLocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
