import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuditLogItem {
  id: string;
  businessId?: string;
  userId?: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export const auditService = {
  async logEvent(businessId: string | undefined, userId: string | undefined, action: string, metadata?: Record<string, any>): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('audit_logs').insert({
        business_id: businessId || null,
        user_id: userId || null,
        action,
        metadata: metadata || null,
      });
    } catch {}
  },

  async getLogs(businessId: string): Promise<AuditLogItem[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      businessId: item.business_id,
      userId: item.user_id,
      action: item.action,
      metadata: item.metadata,
      createdAt: item.created_at,
    }));
  },
};
