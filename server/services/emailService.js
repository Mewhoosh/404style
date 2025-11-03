const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOrderConfirmation = async (order) => {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.productName}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${parseFloat(item.price).toFixed(2)}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
        $${(parseFloat(item.price) * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: order.shippingEmail,
    subject: `Order Confirmation #${order.id} - 404Style`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a0e27; color: #93cf08; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 2px solid #eee; }
          .footer { background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total { font-size: 20px; font-weight: bold; color: #93cf08; }
          .button { display: inline-block; padding: 12px 30px; background: #93cf08; color: #0a0e27; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0;">Order #${order.id}</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your order!</h2>
            <p>Hi ${order.shippingFirstName},</p>
            <p>We've received your order and will send you a shipping confirmation email as soon as your order is on its way.</p>
            
            <h3>Order Details:</h3>
            <table>
              <thead>
                <tr style="background: #f7f7f7;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div style="text-align: right; padding: 20px 0; border-top: 2px solid #eee;">
              <p class="total">Total: $${parseFloat(order.totalPrice).toFixed(2)}</p>
            </div>
            
            <h3>Shipping Address:</h3>
            <p>
              ${order.shippingFirstName} ${order.shippingLastName}<br>
              ${order.shippingAddress}<br>
              ${order.shippingCity}, ${order.shippingPostalCode}<br>
              ${order.shippingCountry}<br>
              Phone: ${order.shippingPhone}
            </p>
            
            <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">View Order Details</a>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666;">404Style - Your Fashion Destination</p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">If you have any questions, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.shippingEmail}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

const sendPaymentConfirmation = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: order.shippingEmail,
    subject: `Payment Received - Order #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a0e27; color: #93cf08; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 2px solid #eee; }
          .footer { background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #93cf08; color: #0a0e27; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Payment Received!</h1>
            <p style="margin: 10px 0 0 0;">Order #${order.id}</p>
          </div>
          
          <div class="content">
            <div class="success">
              <h2 style="margin: 0 0 10px 0; color: #28a745;">Payment Successful</h2>
              <p style="margin: 0;">Your payment of <strong>$${parseFloat(order.totalPrice).toFixed(2)}</strong> has been received.</p>
            </div>
            
            <p>Hi ${order.shippingFirstName},</p>
            <p>Great news! We've received your payment and your order is now being processed.</p>
            <p>We'll send you another email once your order has been shipped.</p>
            
            <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">Track Your Order</a>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666;">404Style - Your Fashion Destination</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Payment confirmation email sent to ${order.shippingEmail}`);
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
  }
};

const sendShippingNotification = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: order.shippingEmail,
    subject: `Your Order Has Been Shipped! - Order #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a0e27; color: #93cf08; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 2px solid #eee; }
          .footer { background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .shipped { background: #cfe2ff; border: 2px solid #0d6efd; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #93cf08; color: #0a0e27; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Order Shipped!</h1>
            <p style="margin: 10px 0 0 0;">Order #${order.id}</p>
          </div>
          
          <div class="content">
            <div class="shipped">
              <h2 style="margin: 0 0 10px 0; color: #0d6efd;">On Its Way!</h2>
              <p style="margin: 0;">Your order is on its way to you!</p>
            </div>
            
            <p>Hi ${order.shippingFirstName},</p>
            <p>Exciting news! Your order has been shipped and is on its way to:</p>
            
            <div style="background: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>${order.shippingFirstName} ${order.shippingLastName}</strong><br>
              ${order.shippingAddress}<br>
              ${order.shippingCity}, ${order.shippingPostalCode}<br>
              ${order.shippingCountry}
            </div>
            
            <p>You should receive your order within 3-5 business days.</p>
            
            <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">Track Your Order</a>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666;">404Style - Your Fashion Destination</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Shipping notification sent to ${order.shippingEmail}`);
  } catch (error) {
    console.error('Failed to send shipping notification:', error);
  }
};

const sendDeliveryConfirmation = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: order.shippingEmail,
    subject: `Order Delivered - Order #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a0e27; color: #93cf08; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 2px solid #eee; }
          .footer { background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .delivered { background: #d1e7dd; border: 2px solid #198754; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #93cf08; color: #0a0e27; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Delivered!</h1>
            <p style="margin: 10px 0 0 0;">Order #${order.id}</p>
          </div>
          
          <div class="content">
            <div class="delivered">
              <h2 style="margin: 0 0 10px 0; color: #198754;">Your Order Has Been Delivered!</h2>
              <p style="margin: 0;">We hope you love your purchase!</p>
            </div>
            
            <p>Hi ${order.shippingFirstName},</p>
            <p>Your order has been successfully delivered. We hope you're enjoying your new items!</p>
            <p>If you have any issues with your order, please don't hesitate to contact us.</p>
            
            <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">View Order</a>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666;">Thank you for shopping with 404Style!</p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">We appreciate your business.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Delivery confirmation sent to ${order.shippingEmail}`);
  } catch (error) {
    console.error('Failed to send delivery confirmation:', error);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendShippingNotification,
  sendDeliveryConfirmation
};