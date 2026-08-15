import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'databeta-secret-key-production-change-in-env';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
  workspaceId?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User session expired or invalid.' });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export function generateToken(user: IUser): string {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}
