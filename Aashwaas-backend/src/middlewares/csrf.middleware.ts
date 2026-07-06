import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'x-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    const token = generateCSRFToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });
  }
  next();
};

export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
      code: 'CSRF_INVALID',
    });
  }

  next();
};

export function validateCSRFTokenManual(cookieToken: string, headerToken: string): boolean {
  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}
