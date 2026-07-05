import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validateSchema = (schema: ZodTypeAny) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body = schema.parse(req.body);
    return next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request data',
      errors: error?.issues || [],
    });
  }
};
