import { apiClient } from '../lib/apiClient';
import { CurrencyCode } from '../types';

export interface Business {
  id: string;
  name: string;
  type: string;
  country: string;
  currency: CurrencyCode;
  logoUrl?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface BusinessMembership {
  id: string;
  businessId: string;
  userId: string;
  role: 'owner' | 'admin' | 'manager' | 'accountant' | 'member';
  business: Business;
}

export const DEMO_BUSINESS: Business = {
  id: 'demo-workspace-id',
  name: 'Acme Growth Labs (Demo)',
  type: 'B2B Software & Services',
  country: 'United States',
  currency: 'USD',
  isDemo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const businessService = {
  async createBusiness(
    userId: string,
    name: string,
    type: string,
    country: string,
    currency: CurrencyCode
  ): Promise<{ business: Business | null; error: Error | null }> {
    const res = await apiClient.post<any>('/workspaces', {
      name,
      type,
      country,
      currency,
    });

    if (res.data) {
      const biz: Business = {
        id: res.data.id,
        name: res.data.name,
        type: res.data.type,
        country: res.data.country,
        currency: res.data.currency,
        isDemo: false,
        createdAt: res.data.createdAt,
      };
      apiClient.setActiveWorkspaceId(biz.id);
      return { business: biz, error: null };
    }

    // Local fallback
    const newId = `biz-${Date.now()}`;
    const fallbackBiz: Business = {
      id: newId,
      name,
      type: type || 'General',
      country: country || 'United States',
      currency: currency || 'USD',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    return { business: fallbackBiz, error: null };
  },

  async getUserBusinesses(userId: string): Promise<BusinessMembership[]> {
    const res = await apiClient.get<any[]>('/workspaces');

    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((w: any) => ({
        id: `bm-${w.id}`,
        businessId: w.id,
        userId,
        role: w.role || 'owner',
        business: {
          id: w.id,
          name: w.name,
          type: w.type || 'General',
          country: w.country || 'United States',
          currency: w.currency || 'USD',
          isDemo: w.isDemo || false,
          createdAt: w.createdAt || new Date().toISOString(),
        },
      }));
    }

    // Local offline storage check
    try {
      const localKey = `databeta_user_businesses_${userId}`;
      const existingRaw = localStorage.getItem(localKey);
      if (existingRaw) return JSON.parse(existingRaw);
    } catch {}

    return [];
  },

  async updateBusiness(
    businessId: string,
    updates: Partial<Business>
  ): Promise<{ business: Business | null; error: Error | null }> {
    const res = await apiClient.put<any>(`/workspaces/${businessId}`, updates);
    if (res.data) {
      return {
        business: {
          id: res.data.id,
          name: res.data.name,
          type: res.data.type,
          country: res.data.country,
          currency: res.data.currency,
          isDemo: res.data.isDemo || false,
          createdAt: res.data.createdAt,
        },
        error: null,
      };
    }
    return { business: null, error: res.error };
  },
};
