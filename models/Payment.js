const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  amount: Number,
  currency: String,
  paymentIntentId: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema); 