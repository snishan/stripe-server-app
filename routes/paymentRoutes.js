const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/cancel-subscription', paymentController.cancelSubscription);

module.exports = router;