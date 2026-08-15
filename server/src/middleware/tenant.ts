import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { Workspace } from '../models/Workspace';
import mongoose from 'mongoose';

export const requireWorkspace = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workspaceId =
      req.params.workspaceId ||
      req.body.workspaceId ||
      req.query.workspaceId ||
      (req.headers['x-workspace-id'] as string);

    if (!workspaceId) {
      res.status(400).json({ error: 'Workspace ID is required.' });
      return;
    }

    if (workspaceId === 'demo-workspace-id') {
      req.workspaceId = workspaceId;
      next();
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({ error: 'Invalid Workspace ID format.' });
      return;
    }

    // Verify membership
    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.userId,
    });

    if (!membership) {
      // Check if user is owner of the workspace
      const isOwner = await Workspace.findOne({ _id: workspaceId, ownerId: req.userId });
      if (!isOwner) {
        res.status(403).json({ error: 'Access denied. You are not a member of this workspace.' });
        return;
      }
    }

    req.workspaceId = workspaceId;
    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Workspace authorization error.' });
  }
};
