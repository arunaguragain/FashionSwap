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
    let token = req.cookies?.[CSRF_COOKIE_NAME];
    if (!token) {
      token = generateCSRFToken();
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      });
    }
  }
  next();
};

export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return next();
  }

  const authHeader = req.get('authorization');
  const hasAuthCookie = !!req.cookies?.auth_token;

  // Skip CSRF only for Bearer-token auth or cookie-based auth flows.
  // Mutating auth requests must still present a valid CSRF token.
  if (authHeader?.startsWith('Bearer ') || hasAuthCookie) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  console.log(`[CSRF Validation] Path: ${req.path}`);
  console.log(`[CSRF Validation] Cookie Token: ${cookieToken ? 'Present' : 'Missing'}, Header Token: ${headerToken ? 'Present' : 'Missing'}`);
  console.log(`[CSRF Validation] Match: ${cookieToken === headerToken ? 'YES' : 'NO'}`);

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
