import { Router } from "express";
import { AdminListingController } from "../../controllers/admin/listing.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorization.middleware";
import { generalLimiter } from "../../middlewares/rateLimit.middleware";

const adminListingController = new AdminListingController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", generalLimiter, adminListingController.getAllListingsAdmin);
router.delete("/:id", generalLimiter, adminListingController.deleteListingAdmin);

export default router;
