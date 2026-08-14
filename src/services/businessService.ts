import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
    const newId = `biz-${Date.now()}`;
    const createdBiz: Business = {
      id: newId,
      name,
      type: type || 'General',
      country: country || 'United States',
      currency: currency || 'USD',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      try {
        const localKey = `databeta_user_businesses_${userId}`;
        const existingRaw = localStorage.getItem(localKey);
        const existing: BusinessMembership[] = existingRaw ? JSON.parse(existingRaw) : [];
        const newMembership: BusinessMembership = {
          id: `bm-${Date.now()}`,
          businessId: newId,
          userId,
          role: 'owner',
          business: createdBiz,
        };
        localStorage.setItem(localKey, JSON.stringify([newMembership, ...existing]));
        return { business: createdBiz, error: null };
      } catch (err: any) {
        return { business: createdBiz, error: null };
      }
    }

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({
        name,
        type,
        country,
        currency,
      })
      .select()
      .single();

    if (bizError || !business) {
      return { business: null, error: bizError || new Error('Failed to create business') };
    }

    // Assign owner membership
    const { error: memberError } = await supabase.from('business_members').insert({
      business_id: business.id,
      user_id: userId,
      role: 'owner',
    });

    if (memberError) {
      return { business: null, error: memberError };
    }

    // Initialize business goals
    await supabase.from('business_goals').insert({
      business_id: business.id,
      target_revenue: 100000,
      target_profit_margin_pct: 25.0,
      max_expense_cap: 50000,
    });

    const supabaseBiz: Business = {
      id: business.id,
      name: business.name,
      type: business.type,
      country: business.country,
      currency: business.currency as CurrencyCode,
      createdAt: business.created_at,
    };

    return { business: supabaseBiz, error: null };
  },

  async getUserBusinesses(userId: string): Promise<BusinessMembership[]> {
    if (!isSupabaseConfigured()) {
      try {
        const localKey = `databeta_user_businesses_${userId}`;
        const existingRaw = localStorage.getItem(localKey);
        if (existingRaw) return JSON.parse(existingRaw);
      } catch {}
      return [];
    }

    const { data, error } = await supabase
      .from('business_members')
      .select('id, business_id, user_id, role, businesses (id, name, type, country, currency, logo_url, created_at)')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase query error in getUserBusinesses:', error.message);
      return [];
    }

    if (!data) return [];

    return data
      .filter((item: any) => item && item.businesses)
      .map((item: any) => ({
        id: item.id,
        businessId: item.business_id,
        userId: item.user_id,
        role: item.role,
        business: {
          id: item.businesses.id,
          name: item.businesses.name,
          type: item.businesses.type,
          country: item.businesses.country,
          currency: item.businesses.currency as CurrencyCode,
          logoUrl: item.businesses.logo_url,
          createdAt: item.businesses.created_at,
        },
      }));
  },

  async updateBusinessSettings(
    businessId: string,
    updates: Partial<{ name: string; currency: CurrencyCode; country: string; logoUrl: string }>
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase is not configured.') };

    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.currency) payload.currency = updates.currency;
    if (updates.country) payload.country = updates.country;
    if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;

    const { error } = await supabase.from('businesses').update(payload).eq('id', businessId);
    return { error };
  },
};
