const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  productId: String,
  amount: Number,
  currency: String,
  paymentIntentId: String,
  status: String,
  type: { type: String, enum: ['payment', 'subscription'], required: true },
  subscriptionId: String,
  lastPaymentDate: Date,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema); 