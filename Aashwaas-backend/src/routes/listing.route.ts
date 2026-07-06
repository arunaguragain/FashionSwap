import { Router, Request, Response } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authenticateJWT } from '../middlewares/authentication.middleware';
import { validateSchema } from '../middlewares/validation.middleware';
import { requireSeller } from '../middlewares/rbac.middleware';
import { requireListingOwner } from '../middlewares/ownership.middleware';
import { CreateListingDTO, UpdateListingDTO } from '../dtos/listing.dto';

const router = Router();
const listingController = new ListingController();

// PUBLIC ROUTES
router.get('/search/query', (req: Request, res: Response) => listingController.searchListings(req, res));
router.get('/', (req: Request, res: Response) => listingController.getAllListings(req, res));
router.get('/:listingId', (req: Request, res: Response) => listingController.getListingById(req, res));

// PROTECTED ROUTES
router.get('/user/my-listings', authenticateJWT, (req: Request, res: Response) => listingController.getMyListings(req, res));
router.post(
  '/',
  authenticateJWT,
  requireSeller,
  validateSchema(CreateListingDTO),
  (req: Request, res: Response) => listingController.createListing(req, res)
);
router.put(
  '/:listingId',
  authenticateJWT,
  requireListingOwner,
  validateSchema(UpdateListingDTO),
  (req: Request, res: Response) => listingController.updateListing(req, res)
);
router.put(
  '/:listingId/sold',
  authenticateJWT,
  requireListingOwner,
  (req: Request, res: Response) => listingController.markAsSold(req, res)
);
router.delete(
  '/:listingId',
  authenticateJWT,
  requireListingOwner,
  (req: Request, res: Response) => listingController.deleteListing(req, res)
);

export default router;
