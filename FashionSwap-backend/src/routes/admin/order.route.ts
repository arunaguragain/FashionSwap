import { Router } from "express";
import { AdminOrderController } from "../../controllers/admin/order.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorization.middleware";
import { generalLimiter } from "../../middlewares/rateLimit.middleware";

const adminOrderController = new AdminOrderController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", generalLimiter, adminOrderController.getAllOrdersAdmin);
router.delete("/:id", generalLimiter, adminOrderController.deleteOrderAdmin);

export default router;
