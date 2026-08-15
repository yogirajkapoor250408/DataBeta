import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { Workspace } from '../models/Workspace';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { User } from '../models/User';

const router = Router();

// ----------------------------------------------------------------------------
// GET /api/workspaces
// ----------------------------------------------------------------------------
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const memberships = await WorkspaceMember.find({ userId: req.userId }).populate('workspaceId');

    const result = memberships
      .filter((m) => m.workspaceId)
      .map((m: any) => ({
        id: m.workspaceId._id.toString(),
        name: m.workspaceId.name,
        type: m.workspaceId.type,
        country: m.workspaceId.country,
        currency: m.workspaceId.currency,
        isDemo: m.workspaceId.isDemo || false,
        role: m.role,
        createdAt: m.workspaceId.createdAt,
      }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch workspaces.' });
  }
});

// ----------------------------------------------------------------------------
// POST /api/workspaces
// ----------------------------------------------------------------------------
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, type, country, currency } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Workspace name is required.' });
      return;
    }

    const workspace = new Workspace({
      name,
      type: type || 'General',
      country: country || 'United States',
      currency: currency || 'USD',
      ownerId: req.userId,
    });
    await workspace.save();

    const membership = new WorkspaceMember({
      workspaceId: workspace._id,
      userId: req.userId,
      role: 'owner',
    });
    await membership.save();

    res.status(201).json({
      id: workspace._id.toString(),
      name: workspace.name,
      type: workspace.type,
      country: workspace.country,
      currency: workspace.currency,
      isDemo: false,
      role: 'owner',
      createdAt: workspace.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create workspace.' });
  }
});

// ----------------------------------------------------------------------------
// GET /api/workspaces/:workspaceId/members
// ----------------------------------------------------------------------------
router.get('/:workspaceId/members', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    const members = await WorkspaceMember.find({ workspaceId }).populate('userId', 'email fullName');

    const result = members
      .filter((m) => m.userId)
      .map((m: any) => ({
        id: m._id.toString(),
        workspaceId,
        userId: m.userId._id.toString(),
        userEmail: m.userId.email,
        userName: m.userId.fullName,
        role: m.role,
        invitedAt: m.invitedAt,
      }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch workspace members.' });
  }
});

// ----------------------------------------------------------------------------
// POST /api/workspaces/:workspaceId/members
// ----------------------------------------------------------------------------
router.post('/:workspaceId/members', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Invitee email is required.' });
      return;
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Create pending user record
      user = new User({
        email: email.toLowerCase(),
        fullName: email.split('@')[0],
        role: 'user',
      });
      await user.save();
    }

    const existingMember = await WorkspaceMember.findOne({ workspaceId, userId: user._id });
    if (existingMember) {
      res.status(400).json({ error: 'User is already a member of this workspace.' });
      return;
    }

    const membership = new WorkspaceMember({
      workspaceId,
      userId: user._id,
      role: role || 'salesperson',
    });
    await membership.save();

    res.status(201).json({
      id: membership._id.toString(),
      workspaceId,
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.fullName,
      role: membership.role,
      invitedAt: membership.invitedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to invite member.' });
  }
});

export default router;
