import { Router, Request, Response } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authenticateJWT } from '../middlewares/authentication.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { requireListingOwner } from '../middlewares/ownership.middleware';
import { CreateListingDTO, UpdateListingDTO } from '../dtos/listing.dto';
import { generalLimiter } from '../middlewares/rateLimit.middleware';
import { uploads } from '../middlewares/upload.middleware';

const router = Router();
const listingController = new ListingController();

// PUBLIC ROUTES
router.get('/search/query', (req: Request, res: Response) => listingController.searchListings(req, res));
router.get('/', (req: Request, res: Response) => listingController.getAllListings(req, res));
router.get('/:listingId', (req: Request, res: Response) => listingController.getListingById(req, res));

// PROTECTED ROUTES
router.post(
  '/upload',
  generalLimiter,
  authenticateJWT,
  uploads.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5050';
    const url = `${baseUrl}/item_photos/${req.file.filename}`;
    res.status(200).json({ success: true, url });
  }
);
router.get('/user/my-listings', authenticateJWT, (req: Request, res: Response) => listingController.getMyListings(req, res));
router.post(
  '/',
  generalLimiter,
  authenticateJWT,
  validateSchema(CreateListingDTO),
  (req: Request, res: Response) => listingController.createListing(req, res)
);
router.put(
  '/:listingId',
  generalLimiter,
  authenticateJWT,
  requireListingOwner,
  validateSchema(UpdateListingDTO),
  (req: Request, res: Response) => listingController.updateListing(req, res)
);
router.put(
  '/:listingId/sold',
  generalLimiter,
  authenticateJWT,
  requireListingOwner,
  (req: Request, res: Response) => listingController.markAsSold(req, res)
);
router.delete(
  '/:listingId',
  generalLimiter,
  authenticateJWT,
  requireListingOwner,
  (req: Request, res: Response) => listingController.deleteListing(req, res)
);

export default router;
