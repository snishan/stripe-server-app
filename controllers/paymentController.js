const stripe = require('../config/stripe');

exports.createSubscription = async (req, res) => {
  try {
    const { email, name, priceId } = req.body;

    // Create a Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          name: name || '',
          isSubscription: 'true'
        },
      },
      metadata: {
        isSubscription: 'true'
      },
      success_url: process.env.CHECKOUT_SUCCESS_URL || 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CHECKOUT_CANCEL_URL || 'http://localhost:3000/cancel',
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { email, name, priceId, isSubscription } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: isSubscription ? 'subscription' : 'payment',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      ...(isSubscription && {
        subscription_data: {
          metadata: {
            name: name || '',
            isSubscription: 'true'
          },
        },
      }),
      metadata: {
        isSubscription: isSubscription ? 'true' : 'false'
      },
      success_url: process.env.CHECKOUT_SUCCESS_URL || 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CHECKOUT_CANCEL_URL || 'http://localhost:3000/cancel',
    });

    res.json({ sessionId: session.id });
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
        productId: productId || '',
        isSubscription: 'false'
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