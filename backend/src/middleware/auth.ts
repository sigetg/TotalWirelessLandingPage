import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_EXPIRY = '24h';

export interface AuthRequest extends Request {
  userId?: string;
}

export function generateToken(payload: object = {}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): object | null {
  try {
    return jwt.verify(token, JWT_SECRET) as object;
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization token required' });
    return;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  next();
}
