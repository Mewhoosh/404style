const { Order, OrderItem, Product } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailService = require('../services/emailService');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Przygotuj line items dla Stripe
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productName,
          images: item.product?.images?.[0]?.imageUrl 
            ? [`${process.env.CLIENT_URL}${item.product.images[0].imageUrl}`]
            : []
        },
        unit_amount: Math.round(parseFloat(item.price) * 100)
      },
      quantity: item.quantity
    }));

    // Stwórz Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/orders/${orderId}?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/orders/${orderId}?payment=cancelled`,
      metadata: {
        orderId: orderId.toString()
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    // Zaktualizuj status zamówienia
    await Order.update(
      {
        paymentStatus: 'paid',
        status: 'processing'
      },
      { where: { id: orderId } }
    );

    // Wyślij email o płatności
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    if (order) {
      await emailService.sendPaymentConfirmation(order);
    }

    console.log(`Order ${orderId} paid successfully`);
  }

  res.json({ received: true });
};