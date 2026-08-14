import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Deal, Contact, Company, Task, Activity, DealStage } from '../types';

export const crmService = {
  // --------------------------------------------------------------------------
  // DEALS
  // --------------------------------------------------------------------------
  async getDeals(workspaceId: string): Promise<Deal[]> {
    if (!isSupabaseConfigured()) {
      try {
        const local = localStorage.getItem(`databeta_deals_${workspaceId}`);
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }

    const { data, error } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('business_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      workspaceId: d.business_id,
      title: d.title || d.company_name,
      companyName: d.company_name,
      contactName: d.contact_name,
      contactEmail: d.contact_email || '',
      contactPhone: d.contact_phone || '',
      stage: d.stage,
      amount: Number(d.deal_value || 0),
      currency: d.currency || 'USD',
      expectedCloseDate: d.expected_close_date || new Date().toISOString().split('T')[0],
      probabilityPct: Number(d.probability_pct || 50),
      source: d.source || 'Direct',
      ownerName: d.owner_name || 'Account Executive',
      nextStep: d.next_step || '',
      lastActivityAt: d.updated_at ? d.updated_at.split('T')[0] : 'Recent',
      tags: d.tags || [],
      notes: d.notes || '',
      createdAt: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      updatedAt: d.updated_at || new Date().toISOString(),
    }));
  },

  async createDeal(workspaceId: string, deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ deal: Deal | null; error: Error | null }> {
    const newId = `deal-${Date.now()}`;
    const newDeal: Deal = {
      ...deal,
      id: newId,
      workspaceId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      try {
        const local = localStorage.getItem(`databeta_deals_${workspaceId}`);
        const list: Deal[] = local ? JSON.parse(local) : [];
        localStorage.setItem(`databeta_deals_${workspaceId}`, JSON.stringify([newDeal, ...list]));
        return { deal: newDeal, error: null };
      } catch (err: any) {
        return { deal: newDeal, error: err };
      }
    }

    const { data, error } = await supabase
      .from('crm_deals')
      .insert({
        business_id: workspaceId,
        title: deal.title,
        company_name: deal.companyName,
        contact_email: deal.contactEmail,
        contact_phone: deal.contactPhone,
        stage: deal.stage,
        deal_value: deal.amount,
        tags: deal.tags,
        notes: deal.notes,
      })
      .select()
      .single();

    if (error || !data) return { deal: null, error: error || new Error('Failed to create deal') };

    return {
      deal: {
        ...newDeal,
        id: data.id,
      },
      error: null,
    };
  },

  async updateDealStage(workspaceId: string, dealId: string, newStage: DealStage): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      try {
        const local = localStorage.getItem(`databeta_deals_${workspaceId}`);
        if (local) {
          const list: Deal[] = JSON.parse(local);
          const updated = list.map((d) => (d.id === dealId ? { ...d, stage: newStage, updatedAt: new Date().toISOString() } : d));
          localStorage.setItem(`databeta_deals_${workspaceId}`, JSON.stringify(updated));
        }
      } catch {}
      return { error: null };
    }

    const { error } = await supabase
      .from('crm_deals')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .eq('business_id', workspaceId);

    return { error };
  },

  async deleteDeal(workspaceId: string, dealId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      try {
        const local = localStorage.getItem(`databeta_deals_${workspaceId}`);
        if (local) {
          const list: Deal[] = JSON.parse(local);
          const updated = list.filter((d) => d.id !== dealId);
          localStorage.setItem(`databeta_deals_${workspaceId}`, JSON.stringify(updated));
        }
      } catch {}
      return { error: null };
    }

    const { error } = await supabase
      .from('crm_deals')
      .delete()
      .eq('id', dealId)
      .eq('business_id', workspaceId);

    return { error };
  },

  // --------------------------------------------------------------------------
  // CONTACTS
  // --------------------------------------------------------------------------
  async getContacts(workspaceId: string): Promise<Contact[]> {
    try {
      const local = localStorage.getItem(`databeta_contacts_${workspaceId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  async saveContacts(workspaceId: string, contacts: Contact[]): Promise<void> {
    try {
      localStorage.setItem(`databeta_contacts_${workspaceId}`, JSON.stringify(contacts));
    } catch {}
  },

  // --------------------------------------------------------------------------
  // TASKS
  // --------------------------------------------------------------------------
  async getTasks(workspaceId: string): Promise<Task[]> {
    try {
      const local = localStorage.getItem(`databeta_tasks_${workspaceId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  async saveTasks(workspaceId: string, tasks: Task[]): Promise<void> {
    try {
      localStorage.setItem(`databeta_tasks_${workspaceId}`, JSON.stringify(tasks));
    } catch {}
  },

  // --------------------------------------------------------------------------
  // ACTIVITIES (Timeline Log)
  // --------------------------------------------------------------------------
  async getActivities(workspaceId: string): Promise<Activity[]> {
    try {
      const local = localStorage.getItem(`databeta_activities_${workspaceId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  async logActivity(workspaceId: string, activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
      workspaceId,
      timestamp: new Date().toISOString(),
    };

    try {
      const local = localStorage.getItem(`databeta_activities_${workspaceId}`);
      const list: Activity[] = local ? JSON.parse(local) : [];
      localStorage.setItem(`databeta_activities_${workspaceId}`, JSON.stringify([newActivity, ...list]));
    } catch {}

    return newActivity;
  },
};
