const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  amount: Number,
  currency: String,
  paymentIntentId: String,
  status: String,
  // Subscription-related fields
  type: { type: String, enum: ['onetime', 'subscription'], required: true },
  subscriptionId: String,
  currentPeriodEnd: Date,
  lastPaymentDate: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema); 