const stripe = require('../config/stripe');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { userId, productId } = paymentIntent.metadata || {};
        await Payment.create({
          userId,
          productId,
          amount: paymentIntent.amount_received / 100,
          currency: paymentIntent.currency,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status
        });
        console.log('PaymentIntent was successful!', paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentFailed = event.data.object;
        console.log('Payment failed', paymentFailed.id);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const { userId, productId } = invoice.metadata || {};
        await Subscription.create({
          userId,
          productId,
          subscriptionId,
          status: invoice.status,
          currentPeriodEnd: invoice.lines && invoice.lines.data[0] ? new Date(invoice.lines.data[0].period.end * 1000) : null,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency
        });
        console.log('Subscription payment succeeded', invoice.id);
        break;
      }
      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object;
        console.log('Subscription payment failed', failedInvoice.id);
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription status:', subscription.status);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (dbErr) {
    console.error('Database error:', dbErr, 'Event:', event);
    return res.status(500).json({ error: 'Database error', details: dbErr.message });
  }

  res.json({ received: true });
};