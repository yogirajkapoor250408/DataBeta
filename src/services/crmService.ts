import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CRMContact, CRMActivity } from '../types';

export const crmService = {
  async getDeals(businessId: string): Promise<CRMContact[]> {
    if (!isSupabaseConfigured()) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      name: d.company_name,
      company: d.company_name,
      email: d.contact_email || '',
      phone: d.contact_phone || '',
      stage: d.stage,
      dealValue: Number(d.deal_value || 0),
      tags: d.tags || [],
      notes: d.notes || '',
      lastContactDate: new Date(d.updated_at || d.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      createdAt: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      totalSpent: Number(d.deal_value || 0),
      orderCount: 1,
    }));
  },

  async createDeal(businessId: string, deal: Omit<CRMContact, 'id' | 'createdAt' | 'lastContactDate' | 'totalSpent' | 'orderCount'>): Promise<{ deal: CRMContact | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { deal: null, error: new Error('Supabase is not configured. Connect a database to create deals.') };
    }

    const { data, error } = await supabase
      .from('crm_deals')
      .insert({
        business_id: businessId,
        title: deal.name || deal.company,
        company_name: deal.company,
        contact_email: deal.email,
        contact_phone: deal.phone,
        stage: deal.stage,
        deal_value: deal.dealValue,
        tags: deal.tags,
        notes: deal.notes,
      })
      .select()
      .single();

    if (error || !data) return { deal: null, error: error || new Error('Failed to create CRM deal') };

    const newDeal: CRMContact = {
      id: data.id,
      name: data.company_name,
      company: data.company_name,
      email: data.contact_email || '',
      phone: data.contact_phone || '',
      stage: data.stage,
      dealValue: Number(data.deal_value),
      tags: data.tags || [],
      notes: data.notes || '',
      lastContactDate: 'Today',
      createdAt: data.created_at.split('T')[0],
      totalSpent: Number(data.deal_value),
      orderCount: 1,
    };

    return { deal: newDeal, error: null };
  },

  async updateDealStage(businessId: string, dealId: string, newStage: CRMContact['stage']): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase is not configured.') };

    const { error } = await supabase
      .from('crm_deals')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .eq('business_id', businessId);

    return { error };
  },

  async deleteDeal(businessId: string, dealId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase is not configured.') };

    const { error } = await supabase
      .from('crm_deals')
      .delete()
      .eq('id', dealId)
      .eq('business_id', businessId);

    return { error };
  },
};
