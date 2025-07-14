const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-subscription', paymentController.createSubscription);
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/cancel-subscription', paymentController.cancelSubscription);

module.exports = router;