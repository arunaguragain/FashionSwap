import { Router, Request, Response } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateJWT } from '../middlewares/authentication.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { CreateOrderDTO } from '../dtos/order.dto';

const router = Router();
const orderController = new OrderController();

router.post(
  '/',
  authenticateJWT,
  validateSchema(CreateOrderDTO),
  (req: Request, res: Response) => orderController.createOrder(req, res)
);

router.get('/', authenticateJWT, (req: Request, res: Response) => orderController.getMyOrders(req, res));
router.get('/:orderId', authenticateJWT, (req: Request, res: Response) => orderController.getOrderById(req, res));

router.put('/:orderId/accept', authenticateJWT, (req: Request, res: Response) => orderController.acceptOrder(req, res));
router.put('/:orderId/decline', authenticateJWT, (req: Request, res: Response) => orderController.declineOrder(req, res));
router.put('/:orderId/complete', authenticateJWT, (req: Request, res: Response) => orderController.completeOrder(req, res));

export default router;
