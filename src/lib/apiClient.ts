/**
 * Centralized API Client for DataBeta MongoDB Backend
 * Automatically handles JWT Bearer tokens, active workspace headers, and JSON serialization.
 */

const TOKEN_KEY = 'databeta_jwt_token';
const ACTIVE_BIZ_KEY = 'databeta_active_biz_id';

export const apiClient = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  },

  getActiveWorkspaceId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_BIZ_KEY);
    } catch {
      return null;
    }
  },

  setActiveWorkspaceId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(ACTIVE_BIZ_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_BIZ_KEY);
      }
    } catch {}
  },

  async request<T = any>(
    endpoint: string,
    options: RequestInit & { workspaceId?: string } = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    const token = this.getToken();
    const wsId = options.workspaceId || this.getActiveWorkspaceId();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (wsId) {
      headers['x-workspace-id'] = wsId;
    }

    try {
      const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = json?.error || `HTTP ${res.status}: ${res.statusText}`;
        if (res.status === 401) {
          // Token expired or invalid
          this.setToken(null);
        }
        return { data: null, error: new Error(errorMsg) };
      }

      return { data: json as T, error: null };
    } catch (err: any) {
      return { data: null, error: new Error(err?.message || 'Network error occurred.') };
    }
  },

  get<T = any>(endpoint: string, workspaceId?: string) {
    return this.request<T>(endpoint, { method: 'GET', workspaceId });
  },

  post<T = any>(endpoint: string, body?: any, workspaceId?: string) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      workspaceId,
    });
  },

  put<T = any>(endpoint: string, body?: any, workspaceId?: string) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      workspaceId,
    });
  },

  delete<T = any>(endpoint: string, workspaceId?: string) {
    return this.request<T>(endpoint, { method: 'DELETE', workspaceId });
  },
};
