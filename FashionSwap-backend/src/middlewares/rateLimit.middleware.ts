import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const isTestEnvironment = process.env.NODE_ENV === 'test' || Boolean(process.env.JEST_WORKER_ID);

const skipRateLimit = (req: Request) => isTestEnvironment || req.path === '/health' || req.path === '/api/health';

export const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
});

export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login/register attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: skipRateLimit,
});

export const passwordResetLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many password reset attempts, please try again in an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createAccountLockoutMiddleware = (maxAttempts: number = 15, lockoutDurationMinutes: number = 15) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) {
        return next();
      }

      const User = require('../models/user.model').default;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return next();
      }

      if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        const remainingMinutes = Math.ceil(
          (new Date(user.accountLockedUntil).getTime() - new Date().getTime()) / 60000
        );
        return res.status(429).json({
          success: false,
          message: `Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        });
      }

      if (user.accountLockedUntil && new Date(user.accountLockedUntil) <= new Date()) {
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = null;
        await user.save();
      }

      next();
    } catch (error) {
      console.error('Account lockout middleware error:', error);
      next();
    }
  };
};

export const recordFailedLoginAttempt = async (email: string) => {
  try {
    const User = require('../models/user.model').default;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return;

    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    const MAX_ATTEMPTS = 15;
    const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

    if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
      user.accountLockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }

    await user.save();
  } catch (error) {
    console.error('Error recording failed login attempt:', error);
  }
};

export const resetFailedLoginAttempts = async (email: string) => {
  try {
    const User = require('../models/user.model').default;
    await User.updateOne(
      { email: email.toLowerCase() },
      {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      }
    );
  } catch (error) {
    console.error('Error resetting failed login attempts:', error);
  }
};
