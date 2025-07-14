const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  subscriptionId: String,
  status: String,
  currentPeriodEnd: Date,
  amount: Number,
  currency: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', subscriptionSchema); 