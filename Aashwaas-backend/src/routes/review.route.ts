import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { generalLimiter } from "../middlewares/rateLimit.middleware";

let reviewController = new ReviewController();

const router = Router();

router.use(authorizedMiddleware);

router.post('/', generalLimiter, reviewController.createReview);
router.get('/', reviewController.getAllReviews);
router.get('/my', reviewController.getMyReviews);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', generalLimiter, reviewController.updateReview);
router.delete('/:id', generalLimiter, reviewController.deleteReview);

export default router;
