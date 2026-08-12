import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, UserRole } from '../types';

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName?: string;
}

export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) return { user: null, error };
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

    if (error) return { user: null, error };
    if (!data.user) return { user: null, error: new Error('Login failed.') };

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
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
    };

    return { user: appUser, error: null };
  },

  async signInWithGoogle(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured. Please set environment variables.') };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    return { error };
  },

  async signOut(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured.') };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  async getCurrentSessionUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
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
    };
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
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
        });
      } else {
        callback(null);
      }
    });

    return subscription;
  },
};
