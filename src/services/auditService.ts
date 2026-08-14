import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLogEntry } from '../types';

export const auditService = {
  async logEvent(
    workspaceId: string,
    userEmail: string,
    action: AuditLogEntry['action'],
    entityType: string,
    entityId?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      workspaceId,
      userId: 'usr-active',
      userEmail: userEmail || 'owner@databeta.app',
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };

    try {
      const local = localStorage.getItem(`databeta_audit_${workspaceId}`);
      const list: AuditLogEntry[] = local ? JSON.parse(local) : [];
      localStorage.setItem(`databeta_audit_${workspaceId}`, JSON.stringify([entry, ...list].slice(0, 100)));
    } catch {}

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('audit_logs').insert({
          business_id: workspaceId,
          action,
          metadata: { entityType, entityId, details, userEmail },
        });
      } catch {}
    }
  },

  async getLogs(workspaceId: string): Promise<AuditLogEntry[]> {
    try {
      const local = localStorage.getItem(`databeta_audit_${workspaceId}`);
      if (local) return JSON.parse(local);
    } catch {}

    if (!isSupabaseConfigured()) {
      // Return default seed audit entries for demo/first-run
      return [
        {
          id: 'audit-seed-1',
          workspaceId,
          userId: 'usr-admin',
          userEmail: 'admin@databeta.app',
          action: 'workspace_created',
          entityType: 'workspace',
          details: { name: 'DataBeta Primary Workspace' },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('business_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      workspaceId: item.business_id,
      userId: item.user_id || 'usr-anon',
      userEmail: item.metadata?.userEmail || 'admin@databeta.app',
      action: item.action,
      entityType: item.metadata?.entityType || 'system',
      entityId: item.metadata?.entityId,
      details: item.metadata?.details || {},
      createdAt: item.created_at,
    }));
  },
};
