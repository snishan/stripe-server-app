const stripe = require('../config/stripe');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handleWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      break;
    case 'payment_intent.payment_failed':
      const paymentFailed = event.data.object;
      console.log('Payment failed', paymentFailed.id);
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Subscription payment succeeded', invoice.id);
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Subscription payment failed', failedInvoice.id);
      break;
    case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
      const subscription = event.data.object;
      console.log('Subscription status:', subscription.status);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};