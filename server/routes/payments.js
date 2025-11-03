const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

// Tworzenie sesji płatności Stripe
router.post('/create-checkout-session', authMiddleware, paymentController.createCheckoutSession);

// Webhook Stripe (bez auth - Stripe go wywołuje)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;