import helmet from 'helmet';
import { NextFunction, Request, Response } from 'express';

export const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    noSniff: true,
    frameguard: {
      action: 'deny',
    },
  });
};

export const verifyCspHeaders = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (data: any) {
    if (process.env.DEBUG_CSP) {
      console.log('CSP Headers:', {
        'Content-Security-Policy': res.getHeader('Content-Security-Policy'),
        'X-Frame-Options': res.getHeader('X-Frame-Options'),
        'X-Content-Type-Options': res.getHeader('X-Content-Type-Options'),
        'X-XSS-Protection': res.getHeader('X-XSS-Protection'),
      });
    }
    return originalJson.call(this, data);
  };
  next();
};
