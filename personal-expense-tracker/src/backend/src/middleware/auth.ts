import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

export const JWT_SECRET = process.env.JWT_SECRET || 'pockit_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  user?: any;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let userId: number | undefined;

    // 1. Check Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        userId = decoded.userId;
      } catch (tokenErr) {
        // Token invalid, will fallback to header if provided
      }
    }

    // 2. Fallback to x-user-id header (for demo profile switching & testing)
    if (!userId && req.headers['x-user-id']) {
      const headerId = parseInt(req.headers['x-user-id'] as string, 10);
      if (!isNaN(headerId)) {
        userId = headerId;
      }
    }

    // 3. Fallback to first existing user if neither is provided (ensures app never breaks on initial load)
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        userId = defaultUser.id;
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required. No user found.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, currency: true, avatar: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User does not exist.' });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Authentication error' });
  }
}
