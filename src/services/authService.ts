import { apiClient } from '../lib/apiClient';
import { User } from '../types';
import { sanitizeErrorMessage, cleanAuthTokensFromUrl, getOAuthCallbackUrl } from '../utils/urlSanitizer';

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName?: string;
}

export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; error: Error | null }> {
    const res = await apiClient.post<{ token: string; user: any; workspaces: any[] }>('/auth/register', {
      email,
      password,
      fullName,
    });

    if (res.error || !res.data) {
      return { user: null, error: new Error(sanitizeErrorMessage(res.error?.message || 'Registration failed.')) };
    }

    apiClient.setToken(res.data.token);
    if (res.data.workspaces && res.data.workspaces.length > 0) {
      apiClient.setActiveWorkspaceId(res.data.workspaces[0].id);
    }

    const appUser: User = {
      id: res.data.user.id,
      name: res.data.user.name,
      email: res.data.user.email,
      role: res.data.user.role || 'owner',
      authProvider: 'email',
      createdAt: res.data.user.createdAt || new Date().toISOString(),
      lastLogin: new Date().toLocaleString(),
      isFirstTimeUser: true,
      isAdmin: res.data.user.isAdmin || false,
      subscriptionStatus: res.data.user.subscriptionStatus || 'free',
    };

    return { user: appUser, error: null };
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    const res = await apiClient.post<{ token: string; user: any; workspaces: any[] }>('/auth/login', {
      email,
      password,
    });

    if (res.error || !res.data) {
      return { user: null, error: new Error(sanitizeErrorMessage(res.error?.message || 'Login failed.')) };
    }

    apiClient.setToken(res.data.token);
    if (res.data.workspaces && res.data.workspaces.length > 0) {
      apiClient.setActiveWorkspaceId(res.data.workspaces[0].id);
    }

    const appUser: User = {
      id: res.data.user.id,
      name: res.data.user.name,
      email: res.data.user.email,
      role: res.data.user.role || 'owner',
      authProvider: 'email',
      createdAt: res.data.user.createdAt || new Date().toISOString(),
      lastLogin: new Date().toLocaleString(),
      isFirstTimeUser: false,
      isAdmin: res.data.user.isAdmin || false,
      subscriptionStatus: res.data.user.subscriptionStatus || 'free',
    };

    return { user: appUser, error: null };
  },

  async signInWithGoogle(idToken?: string): Promise<{ error: Error | null }> {
    const mockEmail = `user-${Date.now().toString().slice(-4)}@databeta.app`;
    const res = await apiClient.post<{ token: string; user: any; workspaces: any[] }>('/auth/google', {
      idToken,
      email: mockEmail,
      name: 'Google User',
    });

    if (res.error || !res.data) {
      return { error: new Error(sanitizeErrorMessage(res.error?.message || 'Google sign-in failed.')) };
    }

    apiClient.setToken(res.data.token);
    if (res.data.workspaces && res.data.workspaces.length > 0) {
      apiClient.setActiveWorkspaceId(res.data.workspaces[0].id);
    }

    return { error: null };
  },

  async handleAuthCallback(): Promise<{ success: boolean; user: User | null; error: Error | null }> {
    cleanAuthTokensFromUrl('/dashboard.html?mode=live');
    const res = await apiClient.get<{ user: any; workspaces: any[] }>('/auth/me');

    if (res.data && res.data.user) {
      const appUser: User = {
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role || 'owner',
        authProvider: 'google',
        createdAt: res.data.user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toLocaleString(),
        isFirstTimeUser: false,
        isAdmin: res.data.user.isAdmin || false,
        subscriptionStatus: res.data.user.subscriptionStatus || 'free',
      };
      return { success: true, user: appUser, error: null };
    }

    return { success: false, user: null, error: res.error };
  },

  async signOut(): Promise<{ error: Error | null }> {
    apiClient.setToken(null);
    apiClient.setActiveWorkspaceId(null);
    return { error: null };
  },

  async getCurrentSessionUser(): Promise<User | null> {
    const token = apiClient.getToken();
    if (!token) return null;

    const res = await apiClient.get<{ user: any; workspaces: any[] }>('/auth/me');
    if (res.data && res.data.user) {
      return {
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role || 'owner',
        authProvider: 'email',
        createdAt: res.data.user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toLocaleString(),
        isFirstTimeUser: false,
        isAdmin: res.data.user.isAdmin || false,
        subscriptionStatus: res.data.user.subscriptionStatus || 'free',
      };
    }
    return null;
  },
};
