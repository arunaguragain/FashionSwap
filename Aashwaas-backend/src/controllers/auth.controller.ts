import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model';
import { UserService } from '../services/user.service';
import { mfaService } from '../services/mfa.service';
import { recordFailedLoginAttempt, resetFailedLoginAttempts } from '../middlewares/rateLimit.middleware';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { JWT_SECRET } from '../config';

const userService = new UserService();
/* istanbul ignore next */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');
/* istanbul ignore next */
const GOOGLE_AUDIENCES = (process.env.GOOGLE_CLIENT_ID || '')
  .split(',')
  .map((s) => s.trim().replace(/^['\"]|['\"]$/g, ''))
  .filter(Boolean);

interface AuthRequest extends Request {
  user?: any;
}

export class AuthController {
  async registerUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, location } = req.body;
      const existingUser = await userService.getUserByEmail(email);

      if (existingUser) {
        res.status(403).json({ success: false, message: 'Email already registered' });
        return;
      }

      const newUser = await userService.registerUser({
        email: email.toLowerCase(),
        password,
        confirmPassword: password,
        firstName,
        lastName,
        location,
        role: 'buyer',
      } as any);

      const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
      newUser.verificationOTP = verificationOTP;
      newUser.verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await newUser.save();

      await sendVerificationEmail(email, verificationOTP);

      res.status(201).json({
        success: true,
        message: 'User Registered',
        data: {
          userId: newUser._id,
          email: newUser.email,
          requiresVerification: true,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Error registering user' });
    }
  }

  async verifyEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (user.verificationOTP !== otp) {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
        return;
      }

      if (!user.verificationOTPExpiry || new Date() > user.verificationOTPExpiry) {
        res.status(400).json({ success: false, message: 'OTP expired' });
        return;
      }

      user.isVerified = true;
      user.verificationOTP = undefined;
      user.verificationOTPExpiry = undefined;
      await user.save();

      res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error: any) {
      console.error('Email verification error:', error);
      res.status(500).json({ success: false, message: 'Error verifying email' });
    }
  }

  async googleSignIn(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken, action } = req.body as any;
      if (!idToken) {
        res.status(400).json({ success: false, message: 'idToken is required' });
        return;
      }

      const audience = GOOGLE_AUDIENCES.length > 0 ? GOOGLE_AUDIENCES[0] : undefined;
      const ticket = await googleClient.verifyIdToken({ idToken, audience });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        res.status(400).json({ success: false, message: 'Invalid Google token' });
        return;
      }

      if (payload.email_verified === false) {
        res.status(400).json({ success: false, message: 'Google email not verified' });
        return;
      }

      let user = await userService.getUserByEmail(payload.email);
      if (action === 'register' && user) {
        res.status(400).json({ success: false, message: 'Email already registered' });
        return;
      }

      if ((action === 'login' || !action) && !user) {
        res.status(400).json({ success: false, message: 'Email not registered' });
        return;
      }

      if (!user) {
        user = await userService.findOrCreateFromGoogle({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        });
      }

      const { accessToken, refreshToken } = this.generateTokens(user._id.toString());
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Google login successful',
        token: accessToken,
        data: { accessToken, user },
      });
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      res.status(500).json({ success: false, message: 'Error during Google sign-in' });
    }
  }

  async whoami(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      res.status(200).json({ success: true, data: req.user, message: 'Authenticated user info' });
    } catch (error: any) {
      console.error('Whoami error:', error);
      res.status(500).json({ success: false, message: 'Error retrieving user info' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const updateData = req.body;
      const updatedUser = await userService.updateUser(userId, updateData as any);

      res.status(200).json({ success: true, message: 'Profile updated', data: updatedUser });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Error updating profile' });
    }
  }

  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
      res.status(200).json({ success: true, data: user, message: 'Single user retrieved' });
    } catch (error: any) {
      console.error('Get user by id error:', error);
      res.status(500).json({ success: false, message: 'Error retrieving user' });
    }
  }

  async exists(req: AuthRequest, res: Response): Promise<void> {
    try {
      const email = (req.query.email || req.body.email) as string;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
      }

      const user = await userService.getUserByEmail(email.toLowerCase());
      res.status(200).json({ success: true, exists: Boolean(user) });
    } catch (error: any) {
      console.error('Exists error:', error);
      res.status(500).json({ success: false, message: 'Error checking user existence' });
    }
  }

  async loginUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        await recordFailedLoginAttempt(email);
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        res.status(429).json({ success: false, message: 'Account locked due to too many failed attempts' });
        return;
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await recordFailedLoginAttempt(email);
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      await resetFailedLoginAttempts(email);

      if (user.mfaEnabled && user.totpSecret) {
        const sessionToken = jwt.sign(
          { userId: user._id.toString(), mfaPending: true },
          process.env.JWT_SECRET || JWT_SECRET,
          { expiresIn: '5m' }
        );

        res.status(200).json({
          success: true,
          message: 'MFA required. Please enter OTP from your authenticator app.',
          data: {
            sessionToken,
            mfaRequired: true,
          },
        });
        return;
      }

      const { accessToken, refreshToken } = this.generateTokens(user._id.toString());

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });

      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: accessToken,
        data: {
          accessToken,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Error during login' });
    }
  }

  async verifyMFALogin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionToken, otp } = req.body;
      if (!sessionToken || !otp) {
        res.status(400).json({ success: false, message: 'Session token and OTP required' });
        return;
      }

      let decoded: any;
      try {
        decoded = jwt.verify(sessionToken, process.env.JWT_SECRET || JWT_SECRET);
      } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired session token' });
        return;
      }

      if (!decoded.mfaPending) {
        res.status(400).json({ success: false, message: 'Invalid session token' });
        return;
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.totpSecret) {
        res.status(401).json({ success: false, message: 'MFA not enabled for this user' });
        return;
      }

      const decryptedSecret = mfaService.decryptTOTPSecret(user.totpSecret);
      const isValidOTP = mfaService.verifyTOTP(decryptedSecret, otp);

      if (!isValidOTP) {
        res.status(401).json({ success: false, message: 'Invalid OTP' });
        return;
      }

      const { accessToken, refreshToken } = this.generateTokens(user._id.toString());

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });

      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: 'MFA verified. Login successful.',
        data: {
          accessToken,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error: any) {
      console.error('MFA verification error:', error);
      res.status(500).json({ success: false, message: 'Error verifying MFA' });
    }
  }

  async setupMFA(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (user.mfaEnabled) {
        res.status(400).json({ success: false, message: 'MFA already enabled' });
        return;
      }

      const { secret, qrCode } = await mfaService.generateTOTPSecret(user.email);
      res.status(200).json({
        success: true,
        message: 'Scan QR code with your authenticator app',
        data: {
          qrCode,
          secret,
          setupMessage: 'Enter the 6-digit code from your authenticator to confirm',
        },
      });
    } catch (error: any) {
      console.error('MFA setup error:', error);
      res.status(500).json({ success: false, message: 'Error setting up MFA' });
    }
  }

  async confirmMFASetup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { secret, otp } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!secret || !otp) {
        res.status(400).json({ success: false, message: 'Secret and OTP required' });
        return;
      }

      const isValidOTP = mfaService.verifyTOTP(secret, otp);
      if (!isValidOTP) {
        res.status(401).json({ success: false, message: 'Invalid OTP. Please try again.' });
        return;
      }

      const encryptedSecret = await mfaService.enableMFA(secret);
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      user.mfaEnabled = true;
      user.totpSecret = encryptedSecret;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'MFA enabled successfully. Your account is now protected with two-factor authentication.',
        data: { mfaEnabled: true },
      });
    } catch (error: any) {
      console.error('MFA confirmation error:', error);
      res.status(500).json({ success: false, message: 'Error confirming MFA setup' });
    }
  }

  async disableMFA(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { password } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!password) {
        res.status(400).json({ success: false, message: 'Password required to disable MFA' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Invalid password' });
        return;
      }

      user.mfaEnabled = false;
      user.totpSecret = undefined;
      await user.save();

      res.status(200).json({ success: true, message: 'MFA disabled. Your account is no longer protected with two-factor authentication.' });
    } catch (error: any) {
      console.error('Disable MFA error:', error);
      res.status(500).json({ success: false, message: 'Error disabling MFA' });
    }
  }

  async refreshAccessToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Refresh token not found' });
        return;
      }

      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
      } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        return;
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const newAccessToken = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET || JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({ success: true, data: { accessToken: newAccessToken } });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(500).json({ success: false, message: 'Error refreshing token' });
    }
  }

  async logoutUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, message: 'Error during logout' });
    }
  }

  async requestPasswordReset(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const user = await userService.getUserByEmail(email);
      if (!user) {
        res.status(200).json({ success: true, message: 'If email exists, password reset OTP has been sent.' });
        return;
      }

      const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
      user.passwordResetOTP = resetOTP;
      user.passwordResetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendPasswordResetEmail(email, resetOTP);

      res.status(200).json({ success: true, message: 'Password reset OTP sent to email' });
    } catch (error: any) {
      console.error('Password reset request error:', error);
      res.status(500).json({ success: false, message: 'Error requesting password reset' });
    }
  }

  async resetPasswordWithOTP(req: AuthRequest, res: Response): Promise<void> {
    try {      if (req.params?.token) {
        const { newPassword } = req.body;
        await userService.resetPassword(req.params.token, newPassword);
        res.status(200).json({ success: true, message: 'Password reset successfully' });
        return;
      }
      const { email, otp, newPassword } = req.body;
      await userService.resetPasswordWithOTP(email, otp, newPassword);
      res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Password reset OTP error:', error);
      res.status(500).json({ success: false, message: error.message || 'Error resetting password' });
    }
  }

  async checkPasswordStrength(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { password } = req.body;
      if (!password) {
        res.status(400).json({ success: false, message: 'Password required' });
        return;
      }

      const strength = this.validatePasswordStrength(password);
      const feedback = this.getPasswordFeedback(password);

      res.status(200).json({ success: true, data: { isStrong: strength, feedback } });
    } catch (error: any) {
      console.error('Password strength error:', error);
      res.status(500).json({ success: false, message: 'Error checking password strength' });
    }
  }

  private validatePasswordStrength(password: string): boolean {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/\?]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  }

  private getPasswordFeedback(password: string): string[] {
    const feedback: string[] = [];
    if (password.length < 12) feedback.push('At least 12 characters required');
    if (!/[A-Z]/.test(password)) feedback.push('At least one uppercase letter required');
    if (!/[a-z]/.test(password)) feedback.push('At least one lowercase letter required');
    if (!/[0-9]/.test(password)) feedback.push('At least one number required');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/\?]/.test(password)) feedback.push('At least one special character required');
    return feedback;
  }

  private generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET || JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '15d' }
    );

    return { accessToken, refreshToken };
  }
}

export default AuthController;
