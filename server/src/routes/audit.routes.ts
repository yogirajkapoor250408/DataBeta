import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';
import { AuditLog } from '../models/AuditLog';

const router = Router();
router.use(requireAuth);
router.use(requireWorkspace);

// ----------------------------------------------------------------------------
// GET /api/audit
// ----------------------------------------------------------------------------
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.find({ workspaceId: req.workspaceId })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(
      logs.map((l) => ({
        id: l._id.toString(),
        workspaceId: req.workspaceId,
        actorEmail: l.actorEmail,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.metadata,
        timestamp: l.createdAt.toISOString(),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// ----------------------------------------------------------------------------
// POST /api/audit
// ----------------------------------------------------------------------------
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { action, entityType, entityId, metadata } = req.body;

    const log = new AuditLog({
      workspaceId: req.workspaceId,
      actorEmail: req.user?.email || 'user@databeta.app',
      action,
      entityType,
      entityId,
      metadata,
    });
    await log.save();

    res.status(201).json({
      id: log._id.toString(),
      workspaceId: req.workspaceId,
      actorEmail: log.actorEmail,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: log.metadata,
      timestamp: log.createdAt.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record audit log.' });
  }
});

export default router;
