import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import authRoutes from './routes/auth.route';
import adminUserRoutes from './routes/admin/user.route';
import adminNgoRoutes from './routes/admin/ngo.route';
import adminDonationRoutes from './routes/admin/donation.route';
import adminTaskRoutes from './routes/admin/task.route';
import listingRoutes from './routes/listing.route';
import orderRoutes from './routes/order.route';
import transactionRoutes from './routes/transaction.route';
import profileRoutes from './routes/profile.route';
import wishlistRoutes from './routes/wishlist.route';
import reviewRoutes from './routes/review.route';
import { configureHelmet, verifyCspHeaders } from './middlewares/helmet.middleware';
import { csrfTokenMiddleware, validateCSRFToken } from './middlewares/csrf.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { generalLimiter } from './middlewares/rateLimit.middleware';

dotenv.config();
console.log(process.env.PORT);

const app: Application = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3003', 'http://192.168.137.1:3000'],
  credentials: true,
};

app.use(configureHelmet());
app.use(generalLimiter);
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(csrfTokenMiddleware);
app.use(validateCSRFToken);

if (process.env.DEBUG_SECURITY) {
  app.use(verifyCspHeaders);
}

app.use('/item_photos', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({ success: 'true', message: 'Welcome to the api of FashionSwap' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/ngos', adminNgoRoutes);
app.use('/api/admin/donations', adminDonationRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
