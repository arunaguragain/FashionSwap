import { Router, Request, Response } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticateJWT } from '../middlewares/authentication.middleware';

const router = Router();
const transactionController = new TransactionController();

router.get('/order/:orderId', authenticateJWT, (req: Request, res: Response) =>
  transactionController.getTransactionByOrderId(req, res)
);

router.put(
  '/:transactionId/confirm-delivery',
  authenticateJWT,
  (req: Request, res: Response) => transactionController.confirmDelivery(req, res)
);

router.put(
  '/:transactionId/confirm-handover',
  authenticateJWT,
  (req: Request, res: Response) => transactionController.confirmHandover(req, res)
);

export default router;
