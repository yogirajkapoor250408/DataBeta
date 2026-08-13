import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ShieldCheck, Users, Briefcase, Database, Activity } from 'lucide-react';
import { supabase } from './lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalDatasets: number;
  paidUsers: number;
}

const InnerAdminApp: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalBusinesses: 0, totalDatasets: 0, paidUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, bizRes, datasetRes, paidRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('businesses').select('id', { count: 'exact', head: true }),
          supabase.from('datasets').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'paid')
        ]);

        setStats({
          totalUsers: usersRes.count || 0,
          totalBusinesses: bizRes.count || 0,
          totalDatasets: datasetRes.count || 0,
          paidUsers: paidRes.count || 0,
        });
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <img src="/icon.png" alt="DataBeta Icon" className="w-8 h-8 object-contain" />
            <span className="font-black text-lg tracking-tight">Admin Portal</span>
          </div>

          <nav className="space-y-2">
            <button className="flex items-center gap-3 w-full p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-500 font-bold rounded-xl text-sm transition-all">
              <Activity className="w-4 h-4" />
              <span>Platform Metrics</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 font-bold rounded-xl text-sm transition-all">
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard.html'}
              className="flex items-center gap-3 w-full p-3 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 font-bold rounded-xl text-sm transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-600" />
            DataBeta Global Command Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            System overview and cross-tenant data metrics.
          </p>
        </header>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold text-slate-400">Total Users</span>
              </div>
              <div className="text-3xl font-black">{stats.totalUsers}</div>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-400">Paid Subscribers</span>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.paidUsers}</div>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Briefcase className="w-5 h-5 text-purple-500" />
                <span className="text-xs font-bold text-slate-400">Active Workspaces</span>
              </div>
              <div className="text-3xl font-black">{stats.totalBusinesses}</div>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Database className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-bold text-slate-400">Datasets Processed</span>
              </div>
              <div className="text-3xl font-black">{stats.totalDatasets}</div>
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
