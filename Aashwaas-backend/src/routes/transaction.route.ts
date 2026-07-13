import { Router, Request, Response } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticateJWT } from '../middlewares/authentication.middleware';
import { requireTransactionParticipant } from '../middlewares/ownership.middleware';
import { generalLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();
const transactionController = new TransactionController();

router.get('/order/:orderId', authenticateJWT, requireTransactionParticipant, (req: Request, res: Response) =>
  transactionController.getTransactionByOrderId(req, res)
);

router.put(
  '/:transactionId/confirm-delivery',
  generalLimiter,
  authenticateJWT,
  requireTransactionParticipant,
  (req: Request, res: Response) => transactionController.confirmDelivery(req, res)
);

router.put(
  '/:transactionId/confirm-handover',
  generalLimiter,
  authenticateJWT,
  requireTransactionParticipant,
  (req: Request, res: Response) => transactionController.confirmHandover(req, res)
);

export default router;
