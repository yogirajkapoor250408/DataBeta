import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';
import { authService } from '../services/authService';
import { cleanAuthTokensFromUrl, generateSupportReferenceId, sanitizeErrorMessage } from '../utils/urlSanitizer';
import { ShieldCheck, AlertCircle, RotateCcw, Home, LogIn } from 'lucide-react';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  referenceId: string;
  signOut: () => Promise<void>;
  retryAuth: () => void;
  openSignIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string>('');

  const initializeAuth = async () => {
    setIsLoading(true);
    setAuthError(null);
    setReferenceId(generateSupportReferenceId());

    try {
      // 1. Immediately scrub any stray tokens from legacy URL hash/params
      cleanAuthTokensFromUrl();

      if (!isSupabaseConfigured()) {
        // Offline / demo environment without Supabase credentials
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      // 2. Fetch current validated session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        throw new Error(sanitizeErrorMessage(error));
      }

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, is_admin, subscription_status')
          .eq('id', session.user.id)
          .maybeSingle();

        const user: User = {
          id: session.user.id,
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'user',
          authProvider: session.user.app_metadata?.provider || 'email',
          createdAt: session.user.created_at || new Date().toISOString(),
          lastLogin: new Date().toLocaleString(),
          isFirstTimeUser: false,
          isAdmin: profile?.is_admin || false,
          subscriptionStatus: profile?.subscription_status || 'free',
        };

        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (err: any) {
      console.error('DataBeta Auth Bootstrap Error:', sanitizeErrorMessage(err));
      setAuthError(sanitizeErrorMessage(err?.message || 'Failed to initialize authentication.'));
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    if (!isSupabaseConfigured()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, is_admin, subscription_status')
          .eq('id', session.user.id)
          .maybeSingle();

        setCurrentUser({
          id: session.user.id,
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'user',
          authProvider: session.user.app_metadata?.provider || 'email',
          createdAt: session.user.created_at || new Date().toISOString(),
          lastLogin: new Date().toLocaleString(),
          isFirstTimeUser: false,
          isAdmin: profile?.is_admin || false,
          subscriptionStatus: profile?.subscription_status || 'free',
        });
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    window.location.href = '/';
  };

  const handleOpenSignIn = () => {
    window.location.href = '/?auth=signin';
  };

  // If a fatal auth initialization error occurred, render recoverable error screen
  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6 animate-scaleUp">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Authentication Gate Notice
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
              We couldn’t complete sign-in. Your account is safe. Please try again.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl text-left border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 font-mono break-all max-h-24 overflow-y-auto">
            {authError}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Reference ID: <strong className="text-slate-700 dark:text-zinc-300">{referenceId}</strong>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={initializeAuth}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Session</span>
            </button>

            <button
              onClick={handleOpenSignIn}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Branded Loading / Auth-Check Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-3 border-rose-500/20 border-t-rose-600 animate-spin" />
            <ShieldCheck className="w-6 h-6 text-rose-600 absolute" />
          </div>
          <div className="space-y-1">
            <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              DataBeta
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Verifying encrypted workspace session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: Boolean(currentUser),
        authError,
        referenceId,
        signOut: handleSignOut,
        retryAuth: initializeAuth,
        openSignIn: handleOpenSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
