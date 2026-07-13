import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { uploads } from "../../middlewares/upload.middleware";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorization.middleware";
import { generalLimiter } from "../../middlewares/rateLimit.middleware";
let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware); 
router.use(adminMiddleware); 

router.post("/", generalLimiter, uploads.single("image"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", generalLimiter, uploads.single("image"), adminUserController.updateUser);
router.delete("/:id", generalLimiter, adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);

export default router;