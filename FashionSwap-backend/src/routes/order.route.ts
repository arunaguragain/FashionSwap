import { Router, Request, Response } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateJWT } from '../middlewares/authentication.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { requireBuyer } from '../middlewares/rbac.middleware';
import { requireOrderParticipant } from '../middlewares/ownership.middleware';
import { CreateOrderDTO } from '../dtos/order.dto';
import { generalLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();
const orderController = new OrderController();

router.post(
  '/',
  generalLimiter,
  authenticateJWT,
  requireBuyer,
  validateSchema(CreateOrderDTO),
  (req: Request, res: Response) => orderController.createOrder(req, res)
);

router.get('/', authenticateJWT, (req: Request, res: Response) => orderController.getMyOrders(req, res));
router.get('/:orderId', authenticateJWT, requireOrderParticipant, (req: Request, res: Response) => orderController.getOrderById(req, res));

router.put('/:orderId/accept', generalLimiter, authenticateJWT, requireOrderParticipant, (req: Request, res: Response) => orderController.acceptOrder(req, res));
router.put('/:orderId/decline', generalLimiter, authenticateJWT, requireOrderParticipant, (req: Request, res: Response) => orderController.declineOrder(req, res));
router.put('/:orderId/complete', generalLimiter, authenticateJWT, requireOrderParticipant, (req: Request, res: Response) => orderController.completeOrder(req, res));

export default router;
