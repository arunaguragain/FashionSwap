import { sendEmail } from '../config/email';

export const sendOrderPlacedEmail = async (sellerEmail: string, orderDetails: any) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Great news! You have a new order.</h2>
        <p>Hi there,</p>
        <p>Someone just bought your item: <strong>${orderDetails.listingTitle}</strong>.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li>Price: Rs. ${orderDetails.price}</li>
          <li>Delivery Method: ${orderDetails.deliveryMethod}</li>
          <li>Delivery Address: ${orderDetails.deliveryAddress || 'N/A'}</li>
        </ul>
        <p>Please log in to your FashionSwap dashboard to accept the order and arrange delivery.</p>
        <p>Best,<br>The FashionSwap Team</p>
      </div>
    `;

    await sendEmail(sellerEmail, `New Order for ${orderDetails.listingTitle}!`, html);
    console.log('Order placed email sent to seller:', sellerEmail);
  } catch (error) {
    console.error('Error sending order placed email:', error);
  }
};

export const sendOrderApprovedEmail = async (buyerEmail: string, orderDetails: any) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your order was approved!</h2>
        <p>Hi there,</p>
        <p>The seller has accepted your order for: <strong>${orderDetails.listingTitle}</strong>.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li>Price: Rs. ${orderDetails.price}</li>
          <li>Delivery Method: ${orderDetails.deliveryMethod}</li>
          <li>Delivery Address: ${orderDetails.deliveryAddress || 'N/A'}</li>
        </ul>
        <p>Please log in to your FashionSwap dashboard to view more details.</p>
        <p>Best,<br>The FashionSwap Team</p>
      </div>
    `;

    await sendEmail(buyerEmail, `Order Approved: ${orderDetails.listingTitle}`, html);
    console.log('Order approved email sent to buyer:', buyerEmail);
  } catch (error) {
    console.error('Error sending order approved email:', error);
  }
};
