import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, UserRole } from '../types';

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName?: string;
}

import { getOAuthCallbackUrl, cleanAuthTokensFromUrl, sanitizeErrorMessage } from '../utils/urlSanitizer';

export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') };
    }

    const redirectUrl = getOAuthCallbackUrl();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) return { user: null, error: new Error(sanitizeErrorMessage(error)) };
    if (!data.user) return { user: null, error: new Error('Registration failed.') };

    // Create profile
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
    });

    const appUser: User = {
      id: data.user.id,
      name: fullName || email.split('@')[0],
      email: data.user.email || email,
      role: 'owner',
      authProvider: 'email',
      createdAt: data.user.created_at || new Date().toISOString(),
      lastLogin: new Date().toLocaleString(),
      isFirstTimeUser: true,
      isAdmin: false,
      subscriptionStatus: 'free',
    };

    return { user: appUser, error: null };
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: new Error('Supabase credentials missing. Please set VITE_SUPABASE_URL in your environment.') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: new Error(sanitizeErrorMessage(error)) };
    if (!data.user) return { user: null, error: new Error('Login failed.') };

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, is_admin, subscription_status')
      .eq('id', data.user.id)
      .maybeSingle();

    const appUser: User = {
      id: data.user.id,
      name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
      email: data.user.email || email,
      role: 'user',
      authProvider: 'email',
      createdAt: data.user.created_at || new Date().toISOString(),
      lastLogin: new Date().toLocaleString(),
      isFirstTimeUser: false,
      isAdmin: profile?.is_admin || false,
      subscriptionStatus: profile?.subscription_status || 'free',
    };

    return { user: appUser, error: null };
  },

  /**
   * Supabase PKCE Google OAuth Sign-in.
   * Redirects strictly to the dedicated callback route.
   */
  async signInWithGoogle(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured. Please set environment variables.') };
    }
    const redirectUrl = getOAuthCallbackUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error: error ? new Error(sanitizeErrorMessage(error)) : null };
  },

  /**
   * Dedicated OAuth Callback Exchange Handler.
   * Exchanges authorization code for session and immediately removes all callback tokens from the URL.
   */
  async handleAuthCallback(): Promise<{ success: boolean; user: User | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, user: null, error: new Error('Supabase is not configured.') };
    }

    try {
      if (typeof window === 'undefined') {
        return { success: false, user: null, error: new Error('Window is undefined.') };
      }

      const href = window.location.href;
      const url = new URL(href);
      const code = url.searchParams.get('code');
      const errorParam = url.searchParams.get('error') || (url.hash && url.hash.includes('error='));

      if (errorParam) {
        const desc = url.searchParams.get('error_description') || 'Authentication was denied or cancelled.';
        cleanAuthTokensFromUrl('/dashboard.html?mode=live');
        return { success: false, user: null, error: new Error(sanitizeErrorMessage(desc)) };
      }

      // Step 1: Check if an active session was already established (e.g. via automatic URL detection)
      let { data: { session } } = await supabase.auth.getSession();

      // Step 2: If no session yet and code is present, attempt explicit code exchange
      if (!session && code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(href);
          if (data?.session) {
            session = data.session;
          }
        } catch {
          // If code-verifier was already consumed by background detectSessionInUrl, recheck session
          const recheck = await supabase.auth.getSession();
          if (recheck.data?.session) {
            session = recheck.data.session;
          }
        }
      }

      // Step 3: If still no session, wait briefly for auth state subscription (up to 2s)
      if (!session) {
        session = await new Promise((resolve) => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            if (s?.user) {
              subscription.unsubscribe();
              resolve(s);
            }
          });
          setTimeout(async () => {
            subscription.unsubscribe();
            const finalCheck = await supabase.auth.getSession();
            resolve(finalCheck.data?.session || null);
          }, 1500);
        });
      }

      if (!session?.user) {
        cleanAuthTokensFromUrl('/dashboard.html?mode=live');
        return { success: false, user: null, error: new Error('Session verification failed. Please try signing in again.') };
      }

      // Immediately remove callback parameters from browser history
      cleanAuthTokensFromUrl('/dashboard.html?mode=live');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, is_admin, subscription_status')
        .eq('id', session.user.id)
        .maybeSingle();

      const appUser: User = {
        id: session.user.id,
        name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: 'user',
        authProvider: 'google',
        createdAt: session.user.created_at || new Date().toISOString(),
        lastLogin: new Date().toLocaleString(),
        isFirstTimeUser: false,
        isAdmin: profile?.is_admin || false,
        subscriptionStatus: profile?.subscription_status || 'free',
      };

      return { success: true, user: appUser, error: null };
    } catch (err: any) {
      cleanAuthTokensFromUrl('/dashboard.html?mode=live');
      return { success: false, user: null, error: new Error(sanitizeErrorMessage(err)) };
    }
  },

  /**
   * Global Sign Out.
   * Revokes global session, purges local credentials, and redirects cleanly.
   */
  async signOut(): Promise<{ error: Error | null }> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {}
    }

    // Clean up local session & cache storage while preserving general UI theme
    try {
      sessionStorage.clear();
      const theme = localStorage.getItem('databeta_theme');
      // Clear all databeta keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('databeta_') || k.startsWith('sb-') || k.includes('auth'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      if (theme) localStorage.setItem('databeta_theme', theme);
    } catch {}

    return { error: null };
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured.') };
    }
    const redirectUrl = getOAuthCallbackUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error ? new Error(sanitizeErrorMessage(error)) : null };
  },

  async getCurrentSessionUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, is_admin, subscription_status')
      .eq('id', session.user.id)
      .maybeSingle();

    return {
      id: session.user.id,
      name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || '',
      role: 'user',
      authProvider: 'email',
      createdAt: session.user.created_at || new Date().toISOString(),
      lastLogin: new Date().toLocaleString(),
      isFirstTimeUser: false,
      isAdmin: profile?.is_admin || false,
      subscriptionStatus: profile?.subscription_status || 'free',
    };
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, is_admin, subscription_status')
          .eq('id', session.user.id)
          .maybeSingle();

        callback({
          id: session.user.id,
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'user',
          authProvider: 'email',
          createdAt: session.user.created_at || new Date().toISOString(),
          lastLogin: new Date().toLocaleString(),
          isFirstTimeUser: false,
          isAdmin: profile?.is_admin || false,
          subscriptionStatus: profile?.subscription_status || 'free',
        });
      } else {
        callback(null);
      }
    });

    return subscription;
  },
};
