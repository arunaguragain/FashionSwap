import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sanitizeObject } from '../utils/sanitize';

export const validateSchema = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        const formattedErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: formattedErrors,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  };
};

export const sanitizeRequestBody = (fieldsToSanitize: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, fieldsToSanitize);
    }
    next();
  };
};

export function validateInputLength(fieldName: string, value: string, max: number): boolean {
  return typeof value === 'string' && value.length <= max;
}

export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneFormat(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
  return phoneRegex.test(phone);
}

export function validateURLFormat(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateNumberRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}
