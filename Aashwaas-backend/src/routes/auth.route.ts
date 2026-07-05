import { Router } from 'express';
import z from 'zod';
import AuthController from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/authentication.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { RegisterDTO, LoginDTO, MFASetupDTO, PasswordResetDTO } from '../dtos/auth.dto';
import { authLimiter, passwordResetLimiter, otpLimiter, createAccountLockoutMiddleware } from '../middlewares/rateLimit.middleware';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  authLimiter,
  validateSchema(RegisterDTO),
  (req, res) => authController.registerUser(req, res)
);

router.post(
  '/verify-email',
  otpLimiter,
  validateSchema(z.object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/) })),
  (req, res) => authController.verifyEmail(req, res)
);

router.post(
  '/login',
  authLimiter,
  createAccountLockoutMiddleware(15, 15),
  validateSchema(LoginDTO),
  (req, res) => authController.loginUser(req, res)
);

router.post(
  '/mfa/verify-login',
  otpLimiter,
  validateSchema(z.object({ sessionToken: z.string(), otp: z.string().regex(/^\d{6}$/) })),
  (req, res) => authController.verifyMFALogin(req, res)
);

router.post('/refresh-token', (req, res) => authController.refreshAccessToken(req, res));

router.post('/mfa/setup', authenticateJWT, (req, res) => authController.setupMFA(req, res));

router.post(
  '/mfa/confirm-setup',
  authenticateJWT,
  otpLimiter,
  validateSchema(MFASetupDTO),
  (req, res) => authController.confirmMFASetup(req, res)
);

router.post(
  '/mfa/disable',
  authenticateJWT,
  validateSchema(z.object({ password: z.string() })),
  (req, res) => authController.disableMFA(req, res)
);

router.post('/logout', authenticateJWT, (req, res) => authController.logoutUser(req, res));

router.post(
  '/password-reset/request',
  passwordResetLimiter,
  validateSchema(z.object({ email: z.string().email() })),
  (req, res) => authController.requestPasswordReset(req, res)
);

router.post(
  '/password-reset/confirm',
  otpLimiter,
  validateSchema(PasswordResetDTO),
  (req, res) => authController.resetPasswordWithOTP(req, res)
);

router.post(
  '/check-password-strength',
  validateSchema(z.object({ password: z.string() })),
  (req, res) => authController.checkPasswordStrength(req, res)
);

router.post('/google', (req, res) => authController.googleSignIn(req, res, () => {}));
router.get('/exists', (req, res) => authController.exists(req, res));
router.put('/:id', authenticateJWT, (req, res) => authController.updateProfile(req, res));
router.get('/whoami', authenticateJWT, (req, res) => authController.whoami(req, res));
router.get('/:id', authenticateJWT, (req, res) => authController.getUserById(req, res));

export default router;
