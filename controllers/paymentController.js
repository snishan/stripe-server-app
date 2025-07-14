const stripe = require('../config/stripe');

exports.createSubscription = async (req, res) => {
  try {
    const { email, name, priceId, paymentMethodId } = req.body;

    // 1. Find or create customer by email
    let customers = await stripe.customers.list({ email, limit: 1 });
    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email, name });
    }

    // 2. Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });

    // 3. Set payment method as default
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    // 4. Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent']
    });

    // 5. Return clientSecret for payment confirmation
    const paymentIntent = subscription.latest_invoice && subscription.latest_invoice.payment_intent;
    if (paymentIntent && paymentIntent.client_secret) {
      res.json({
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id
      });
    } else {
      res.json({
        clientSecret: null,
        subscriptionId: subscription.id,
        message: 'No payment is required at this time or payment_intent is not available.'
      });
    }
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