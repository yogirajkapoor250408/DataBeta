import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLogEntry, AuditAction } from '../types';

export const auditService = {
  async logEvent(
    workspaceId: string,
    userEmail: string,
    action: AuditAction,
    entityType: string,
    entityId?: string,
    details: Record<string, any> = {},
    beforeSummary?: string,
    afterSummary?: string
  ): Promise<AuditLogEntry> {
    const timestamp = new Date().toISOString();
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const entry: AuditLogEntry = {
      id: eventId,
      eventId,
      workspaceId,
      userId: 'usr-active',
      actorId: 'usr-active',
      userEmail: userEmail || 'owner@databeta.app',
      actorEmail: userEmail || 'owner@databeta.app',
      action,
      entityType,
      entityId,
      requestId: `req-${Date.now()}`,
      source: 'web_client',
      beforeSummary,
      afterSummary,
      details,
      metadata: details,
      createdAt: timestamp,
      timestamp,
    };

    try {
      const local = localStorage.getItem(`databeta_audit_${workspaceId}`);
      const list: AuditLogEntry[] = local ? JSON.parse(local) : [];
      localStorage.setItem(`databeta_audit_${workspaceId}`, JSON.stringify([entry, ...list].slice(0, 200)));
    } catch {}

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('audit_logs').insert({
          business_id: workspaceId,
          action,
          metadata: {
            eventId,
            entityType,
            entityId,
            details,
            userEmail,
            beforeSummary,
            afterSummary,
          },
        });
      } catch {}
    }

    return entry;
  },

  async getLogs(workspaceId: string): Promise<AuditLogEntry[]> {
    try {
      const local = localStorage.getItem(`databeta_audit_${workspaceId}`);
      if (local) return JSON.parse(local);
    } catch {}

    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('business_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      eventId: item.metadata?.eventId || item.id,
      workspaceId: item.business_id,
      userId: item.user_id || 'usr-anon',
      actorId: item.user_id || 'usr-anon',
      userEmail: item.metadata?.userEmail || 'owner@databeta.app',
      actorEmail: item.metadata?.userEmail || 'owner@databeta.app',
      action: item.action as AuditAction,
      entityType: item.metadata?.entityType || 'system',
      entityId: item.metadata?.entityId,
      source: item.metadata?.source || 'system',
      beforeSummary: item.metadata?.beforeSummary,
      afterSummary: item.metadata?.afterSummary,
      details: item.metadata?.details || {},
      metadata: item.metadata || {},
      createdAt: item.created_at,
      timestamp: item.created_at,
    }));
  },
};
