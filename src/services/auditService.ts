import { apiClient } from '../lib/apiClient';
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

    try {
      await apiClient.post(
        '/audit',
        {
          action,
          entityType,
          entityId,
          metadata: { ...details, userEmail, beforeSummary, afterSummary },
        },
        workspaceId
      );
    } catch {}

    return entry;
  },

  async getLogs(workspaceId: string): Promise<AuditLogEntry[]> {
    const res = await apiClient.get<any[]>('/audit', workspaceId);
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((l) => ({
        id: l.id,
        eventId: l.id,
        workspaceId,
        userId: 'usr-active',
        actorId: 'usr-active',
        userEmail: l.actorEmail,
        actorEmail: l.actorEmail,
        action: l.action as AuditAction,
        entityType: l.entityType,
        entityId: l.entityId,
        requestId: `req-${l.id}`,
        source: 'mongodb',
        details: l.metadata || {},
        metadata: l.metadata || {},
        createdAt: l.timestamp,
        timestamp: l.timestamp,
      }));
    }

    try {
      const local = localStorage.getItem(`databeta_audit_${workspaceId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  exportLogsAsJson(logs: AuditLogEntry[]): string {
    return JSON.stringify(logs, null, 2);
  },
};
