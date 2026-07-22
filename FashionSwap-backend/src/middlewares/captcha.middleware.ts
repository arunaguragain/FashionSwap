import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { HttpError } from './errorHandler.middleware';

export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { captchaToken } = req.body;
    
    // In test environment, skip captcha validation if not provided
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    if (!captchaToken) {
      throw new HttpError(400, 'Please complete the CAPTCHA to proceed');
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not defined in environment variables');
      throw new HttpError(500, 'CAPTCHA service is misconfigured. Please contact support.');
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    const response = await axios.post(verifyUrl);

    if (response.data && response.data.success) {
      next();
    } else {
      console.error('CAPTCHA verification failed:', response.data);
      throw new HttpError(400, 'CAPTCHA verification failed. Please try again.');
    }
  } catch (error) {
    next(error);
  }
};
