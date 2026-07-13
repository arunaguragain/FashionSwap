import { Router, Request, Response } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticateJWT } from '../middlewares/authentication.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { UpdateProfileDTO } from '../dtos/profile.dto';
import { generalLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();
const profileController = new ProfileController();

router.get('/user/:userId', (req: Request, res: Response) => profileController.getUserProfile(req, res));
router.get('/seller/:userId/stats', (req: Request, res: Response) => profileController.getSellerStats(req, res));
router.get('/me', authenticateJWT, (req: Request, res: Response) => profileController.getMyProfile(req, res));
router.put('/me', generalLimiter, authenticateJWT, validateSchema(UpdateProfileDTO), (req: Request, res: Response) => profileController.updateMyProfile(req, res));
router.get('/me/export', authenticateJWT, (req: Request, res: Response) => profileController.exportMyData(req, res));

export default router;
