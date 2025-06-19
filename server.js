const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Configure Brevo (Sendinblue) API
const brevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevoClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@artiflare.hardeepijardar.com';
const senderName = process.env.BREVO_SENDER_NAME || 'Artiflare';

// Endpoint to send order emails
app.post('/api/send-order-emails', async (req, res) => {
  console.log('Received request to send order emails:', req.body);
  try {
    const { customer, artisan, order } = req.body;
    // customer: { email, name }
    // artisan: { email, name }
    // order: { id, products: [{ name, image, price, quantity }], total, date }

    // 1. Send email to customer (invoice-style)
    console.log('Attempting to send email to customer:', customer.email);
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background: #f8fafc; padding: 24px; text-align: center;">
          <img src='https://artiflare.hardeepijardar.com/logo.png' alt='Artiflare' style='height: 48px; margin-bottom: 12px;' />
          <h2 style="color: #d7263d; margin: 0;">Thank you for your order!</h2>
          <p style="color: #333;">Hi ${customer.name}, your order <b>#${order.id}</b> has been placed successfully.</p>
        </div>
        <div style="padding: 24px; background: #fff;">
          <h3 style="color: #222;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Product</th>
                <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Image</th>
                <th style="padding: 8px; border: 1px solid #eee; text-align: right;">Price</th>
                <th style="padding: 8px; border: 1px solid #eee; text-align: right;">Qty</th>
                <th style="padding: 8px; border: 1px solid #eee; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.products.map(p => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #eee;">${p.name}</td>
                  <td style="padding: 8px; border: 1px solid #eee;"><img src="${p.image}" alt="${p.name}" style="height: 40px; border-radius: 4px;" /></td>
                  <td style="padding: 8px; border: 1px solid #eee; text-align: right;">₹${p.price}</td>
                  <td style="padding: 8px; border: 1px solid #eee; text-align: right;">${p.quantity}</td>
                  <td style="padding: 8px; border: 1px solid #eee; text-align: right;">₹${p.price * p.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align: right; font-size: 1.1em; color: #222;">
            <b>Order Total: ₹${order.total}</b>
          </div>
          <p style="margin-top: 24px; color: #555;">Order Date: ${order.date}</p>
        </div>
        <div style="background: #f8fafc; padding: 16px; text-align: center; color: #888; font-size: 0.95em;">
          <p>Thank you for shopping with Artiflare!<br/>For support, contact us at <a href="mailto:support@artiflare.hardeepijardar.com">support@artiflare.hardeepijardar.com</a></p>
        </div>
      </div>
    `;

    // 2. Send email to artisan (notification)
    console.log('Attempting to send email to artisan:', artisan.email);
    const artisanHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background: #f8fafc; padding: 24px; text-align: center;">
          <img src='https://artiflare.hardeepijardar.com/logo.png' alt='Artiflare' style='height: 48px; margin-bottom: 12px;' />
          <h2 style="color: #d7263d; margin: 0;">New Order Received!</h2>
          <p style="color: #333;">Hi ${artisan.name}, you have received a new order <b>#${order.id}</b>.</p>
        </div>
        <div style="padding: 24px; background: #fff;">
          <h3 style="color: #222;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Product</th>
                <th style="padding: 8px; border: 1px solid #eee; text-align: right;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${order.products.map(p => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #eee;">
                    ${p.name}
                    ${p.customizations ? `<div style='font-size: 0.95em; color: #555; margin-top: 4px;'><b>Customizations:</b> ${Object.entries(p.customizations).map(([key, value]) => `${key}: ${value}`).join(', ')}</div>` : ''}
                  </td>
                  <td style="padding: 8px; border: 1px solid #eee; text-align: right;">${p.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align: right; font-size: 1.1em; color: #222;">
            <b>Order Total: ₹${order.total}</b>
          </div>
          <p style="margin-top: 24px; color: #555;">Order Date: ${order.date}</p>
        </div>
        <div style="background: #f8fafc; padding: 16px; text-align: center; color: #888; font-size: 0.95em;">
          <p>Login to your Artiflare dashboard to view and process this order.</p>
        </div>
      </div>
    `;

    // Send to customer
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const customerResult = await tranEmailApi.sendTransacEmail({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: customer.email, name: customer.name }],
      subject: `Your Artiflare Order Confirmation (#${order.id})`,
      htmlContent: customerHtml,
    });
    console.log('Customer email send result:', customerResult);

    // Send to artisan
    const artisanResult = await tranEmailApi.sendTransacEmail({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: artisan.email, name: artisan.name }],
      subject: `New Order Received (#${order.id})`,
      htmlContent: artisanHtml,
    });
    console.log('Artisan email send result:', artisanResult);

    res.status(200).json({ message: 'Emails sent successfully' });
    console.log('Emails sent successfully');
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Failed to send emails', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 