import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Access token is required'
      },
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        },
        timestamp: new Date().toISOString()
      });
    }
    req.user = user;
    next();
  });
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
      authenticateToken(req, res, async () => {
        try {
          await handler(req, res);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}