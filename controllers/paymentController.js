const stripe = require('../config/stripe');

exports.createSubscription = async (req, res) => {
  try {
    const { email, payment_method, priceId, userId, productId } = req.body;

    // Create customer
    const customer = await stripe.customers.create({
      email,
      payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId || '',
        productId: productId || ''
      }
    });

    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, userId, productId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'usd',
      metadata: {
        userId: userId || '',
        productId: productId || ''
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const deletedSubscription = await stripe.subscriptions.del(subscriptionId);
    res.json({ success: true, subscription: deletedSubscription });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};