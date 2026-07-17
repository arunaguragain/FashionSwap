import { OrderController } from '../../../controllers/order.controller';
import { sendOrderApprovedEmail } from '../../../utils/email';
import { recordAuditEvent } from '../../../services/audit.service';
import Order from '../../../models/order.model';
import Listing from '../../../models/listing.model';
import User from '../../../models/user.model';

jest.mock('../../../utils/email', () => ({
  sendOrderPlacedEmail: jest.fn(),
  sendOrderApprovedEmail: jest.fn(),
}));

jest.mock('../../../services/audit.service', () => ({
  recordAuditEvent: jest.fn(),
}));

jest.mock('../../../models/order.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('../../../models/listing.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('../../../models/user.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

describe('OrderController.acceptOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks the listing as sold and notifies the buyer when an order is accepted', async () => {
    const listing = {
      _id: 'listing-1',
      title: 'Vintage Jacket',
      status: 'available',
      save: jest.fn().mockResolvedValue(true),
    };

    const order = {
      _id: 'order-1',
      sellerId: { toString: () => 'seller-1' },
      buyerId: { toString: () => 'buyer-1' },
      listingId: 'listing-1',
      price: 1200,
      deliveryMethod: 'cash_on_delivery',
      deliveryAddress: '123 Main Street',
      status: 'created',
      acceptedAt: undefined,
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockReturnThis(),
    };

    const populate = jest.fn().mockReturnValue(order);
    (Order.findById as jest.Mock).mockReturnValue({ populate });
    (Listing.findById as jest.Mock).mockResolvedValue(listing);
    (User.findById as jest.Mock).mockResolvedValue({ email: 'buyer@example.com' });

    const controller = new OrderController();
    const req: any = {
      params: { orderId: 'order-1' },
      user: { _id: 'seller-1' },
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.acceptOrder(req, res);

    expect(listing.status).toBe('sold');
    expect(listing.save).toHaveBeenCalled();
    expect(sendOrderApprovedEmail).toHaveBeenCalledWith('buyer@example.com', expect.objectContaining({ listingTitle: 'Vintage Jacket' }));
    expect(recordAuditEvent).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
