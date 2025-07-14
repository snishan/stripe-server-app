const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/cancel-subscription', paymentController.cancelSubscription);
router.post('/pay/subscription', paymentController.createSubscription);
router.post('/pay/one-time', paymentController.createOneTimePayment);


module.exports = router;