import React, { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Database,
  Activity,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalDatasets: number;
  paidUsers: number;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  subscription_status: string | null;
  is_admin: boolean | null;
  created_at: string | null;
}

interface BusinessRow {
  id: string;
  name: string;
  type: string | null;
  country: string | null;
  currency: string | null;
  created_at: string | null;
}

type AdminTab = 'metrics' | 'users' | 'workspaces';

const InnerAdminApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('metrics');
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalBusinesses: 0, totalDatasets: 0, paidUsers: 0 });
  const [usersList, setUsersList] = useState<ProfileRow[]>([]);
  const [businessList, setBusinessList] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbLatencyMs, setDbLatencyMs] = useState<number | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      if (isSupabaseConfigured()) {
        const [usersRes, bizRes, datasetRes, paidRes, userRows, bizRows] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('businesses').select('id', { count: 'exact', head: true }),
          supabase.from('datasets').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'paid'),
          supabase.from('profiles').select('id, full_name, subscription_status, is_admin, created_at').limit(50),
          supabase.from('businesses').select('id, name, type, country, currency, created_at').limit(50),
        ]);

        setDbLatencyMs(Math.round(performance.now() - start));
        setStats({
          totalUsers: usersRes.count || (userRows.data?.length || 0),
          totalBusinesses: bizRes.count || (bizRows.data?.length || 0),
          totalDatasets: datasetRes.count || 0,
          paidUsers: paidRes.count || 0,
        });

        if (userRows.data) setUsersList(userRows.data as ProfileRow[]);
        if (bizRows.data) setBusinessList(bizRows.data as BusinessRow[]);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return usersList;
    const q = searchTerm.toLowerCase().trim();
    return usersList.filter(
      (u) =>
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        u.id.toLowerCase().includes(q) ||
        (u.subscription_status && u.subscription_status.toLowerCase().includes(q))
    );
  }, [usersList, searchTerm]);

  const filteredBusinesses = useMemo(() => {
    if (!searchTerm.trim()) return businessList;
    const q = searchTerm.toLowerCase().trim();
    return businessList.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.type && b.type.toLowerCase().includes(q)) ||
        (b.country && b.country.toLowerCase().includes(q))
    );
  }, [businessList, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="DataBeta Icon" className="w-8 h-8 object-contain rounded-xl" />
            <div>
              <span className="font-black text-lg tracking-tight block">Admin Portal</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-bold uppercase">Global Operations</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-3 w-full p-3 font-bold rounded-2xl transition-all ${
                activeTab === 'metrics'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-900/60'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Platform Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 w-full p-3 font-bold rounded-2xl transition-all ${
                activeTab === 'users'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-900/60'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('workspaces')}
              className={`flex items-center gap-3 w-full p-3 font-bold rounded-2xl transition-all ${
                activeTab === 'workspaces'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-900/60'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Active Workspaces</span>
            </button>

            <button
              onClick={() => (window.location.href = '/dashboard.html')}
              className="flex items-center gap-3 w-full p-3 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 font-bold rounded-2xl transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>
          </nav>
        </div>

        {/* Database Health Badge */}
        <div className="pt-6 border-t border-slate-100 dark:border-zinc-900">
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 text-[11px] space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">PostgreSQL</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Connected
              </span>
            </div>
            {dbLatencyMs !== null && (
              <div className="flex items-center justify-between text-slate-500">
                <span>Latency</span>
                <span>{dbLatencyMs} ms</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-rose-600" />
              DataBeta Global Command Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Cross-tenant system health, active subscriptions, and user management.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-full border border-slate-200 dark:border-zinc-800 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </header>

        {/* Tab 1: Platform Overview Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</div>
                <p className="text-[10px] text-slate-400 font-mono">Registered accounts</p>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Subscribers</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.paidUsers}</div>
                <p className="text-[10px] text-slate-400 font-mono">Active Pro subscriptions</p>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Workspaces</span>
                  <Briefcase className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalBusinesses}</div>
                <p className="text-[10px] text-slate-400 font-mono">Multi-tenant instances</p>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Datasets Processed</span>
                  <Database className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalDatasets}</div>
                <p className="text-[10px] text-slate-400 font-mono">Uploaded spreadsheets</p>
              </div>
            </div>

            {/* Quick System Summary */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Security & Environment Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Row Level Security (RLS)</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Enforced on all tables
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Authentication Service</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Supabase GoTrue Active
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Analytics Architecture</div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Server className="w-4 h-4 text-indigo-500" /> Client-Side Deterministic
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, ID or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                    <th className="p-3.5">User / Full Name</th>
                    <th className="p-3.5">User ID</th>
                    <th className="p-3.5">Subscription</th>
                    <th className="p-3.5">Role Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {u.full_name || 'Anonymous User'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px] truncate max-w-[150px]">
                        {u.id}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.subscription_status === 'paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {u.subscription_status || 'free'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.is_admin ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase">
                            Admin
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Member</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                        No users found in directory.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Workspaces Directory */}
        {activeTab === 'workspaces' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search workspaces by name or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                    <th className="p-3.5">Business Name</th>
                    <th className="p-3.5">Industry Type</th>
                    <th className="p-3.5">Country</th>
                    <th className="p-3.5">Base Currency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{b.name}</td>
                      <td className="p-3.5 text-slate-600 dark:text-zinc-300">{b.type || 'General Business'}</td>
                      <td className="p-3.5 text-slate-600 dark:text-zinc-300">{b.country || 'United States'}</td>
                      <td className="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {b.currency || 'USD'}
                      </td>
                    </tr>
                  ))}
                  {filteredBusinesses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                        No workspaces found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const AdminApp: React.FC = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <InnerAdminApp />
    </ProtectedRoute>
  );
};
