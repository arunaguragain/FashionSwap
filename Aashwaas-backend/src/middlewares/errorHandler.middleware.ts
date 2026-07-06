import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  constructor(public statusCode: number, public message: string, public code?: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  const responseMessage = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An error occurred processing your request'
    : message;

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    code,
    ...(process.env.NODE_ENV !== 'production' && { debug: err.message }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
};
