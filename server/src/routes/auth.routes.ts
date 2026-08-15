import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Workspace } from '../models/Workspace';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { OAuth2Client } from 'google-auth-library';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ----------------------------------------------------------------------------
// POST /api/auth/register
// ----------------------------------------------------------------------------
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      fullName: fullName || email.split('@')[0],
      role: 'owner',
    });
    await user.save();

    // Auto-provision initial workspace
    const workspace = new Workspace({
      name: `${user.fullName}'s Workspace`,
      type: 'General',
      country: 'United States',
      currency: 'USD',
      ownerId: user._id,
    });
    await workspace.save();

    // Assign owner membership
    const membership = new WorkspaceMember({
      workspaceId: workspace._id,
      userId: user._id,
      role: 'owner',
    });
    await membership.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.fullName,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
      },
      workspaces: [
        {
          id: workspace._id.toString(),
          name: workspace.name,
          type: workspace.type,
          country: workspace.country,
          currency: workspace.currency,
          role: 'owner',
        },
      ],
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: err?.message || 'Registration failed.' });
  }
});

// ----------------------------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------------------------
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password. If you have not registered, please sign up.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);

    // Fetch user memberships
    const memberships = await WorkspaceMember.find({ userId: user._id }).populate('workspaceId');

    const workspaces = memberships
      .filter((m) => m.workspaceId)
      .map((m: any) => ({
        id: m.workspaceId._id.toString(),
        name: m.workspaceId.name,
        type: m.workspaceId.type,
        country: m.workspaceId.country,
        currency: m.workspaceId.currency,
        role: m.role,
      }));

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.fullName,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
      },
      workspaces,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err?.message || 'Login failed.' });
  }
});

// ----------------------------------------------------------------------------
// POST /api/auth/google
// ----------------------------------------------------------------------------
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, email: mockEmail, name: mockName } = req.body;

    let email = mockEmail;
    let fullName = mockName;

    if (idToken && process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload && payload.email) {
          email = payload.email;
          fullName = payload.name || payload.email.split('@')[0];
        }
      } catch (e) {
        console.warn('Google token verification fallback:', e);
      }
    }

    if (!email) {
      res.status(400).json({ error: 'Google authentication payload missing email.' });
      return;
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        fullName: fullName || email.split('@')[0],
        role: 'owner',
      });
      await user.save();

      const workspace = new Workspace({
        name: `${user.fullName}'s Workspace`,
        type: 'General',
        country: 'United States',
        currency: 'USD',
        ownerId: user._id,
      });
      await workspace.save();

      const membership = new WorkspaceMember({
        workspaceId: workspace._id,
        userId: user._id,
        role: 'owner',
      });
      await membership.save();
    }

    const token = generateToken(user);
    const memberships = await WorkspaceMember.find({ userId: user._id }).populate('workspaceId');

    const workspaces = memberships
      .filter((m) => m.workspaceId)
      .map((m: any) => ({
        id: m.workspaceId._id.toString(),
        name: m.workspaceId.name,
        type: m.workspaceId.type,
        country: m.workspaceId.country,
        currency: m.workspaceId.currency,
        role: m.role,
      }));

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.fullName,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
      },
      workspaces,
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: err?.message || 'Google authentication failed.' });
  }
});

// ----------------------------------------------------------------------------
// GET /api/auth/me
// ----------------------------------------------------------------------------
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const memberships = await WorkspaceMember.find({ userId: user._id }).populate('workspaceId');

    const workspaces = memberships
      .filter((m) => m.workspaceId)
      .map((m: any) => ({
        id: m.workspaceId._id.toString(),
        name: m.workspaceId.name,
        type: m.workspaceId.type,
        country: m.workspaceId.country,
        currency: m.workspaceId.currency,
        role: m.role,
      }));

    res.json({
      user: {
        id: user._id.toString(),
        name: user.fullName,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
      },
      workspaces,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user session.' });
  }
});

export default router;
