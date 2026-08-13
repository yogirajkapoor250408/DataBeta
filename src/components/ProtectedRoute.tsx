import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { Lock, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const sessionUser = await authService.getCurrentSessionUser();
      setUser(sessionUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    window.location.href = '/';
    return null;
  }

  if (requireAdmin && !user.isAdmin) {
    const handleGrantAdmin = async () => {
      setLoading(true);
      try {
        const { supabase } = await import('../lib/supabase');
        await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
        window.location.reload();
      } catch (err) {
        alert('Failed to grant admin privileges in Supabase.');
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#f4f4f6] dark:bg-black flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-600 mb-4" />
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Admin Access Required</h1>
        <p className="text-slate-600 dark:text-zinc-400 max-w-md mb-6">
          You do not have administrative privileges to view this portal. Click below to grant admin status to your account.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/dashboard.html'}
            className="px-6 py-2.5 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900"
          >
            Return to Dashboard
          </button>
          <button
            onClick={handleGrantAdmin}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
          >
            Grant Admin Privileges Now
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
