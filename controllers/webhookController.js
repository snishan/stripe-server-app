const stripe = require('../config/stripe');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const Payment = require('../models/Payment');
// Removed Subscription import

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("🔔 Webhook received:", event.type);

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log("invoice",invoice);
        
        const { userId, productId } = invoice.metadata || {};
        if (!userId || !productId) {
          console.warn('⚠️ Missing metadata in invoice.payment_succeeded');
        }
        // const periodEndUnix = invoice.lines?.data?.[0]?.period?.end;
        // const currentPeriodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : null;
        await Payment.create({
          userId,
          productId,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          paymentIntentId: invoice.payment_intent,
          status: 'succeeded',
          type: 'subscription',
          subscriptionId: invoice.subscription,
          lastPaymentDate: new Date(invoice.created)
        });
        console.log("💳 Subscription payment recorded");
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const { userId, productId } = subscription.metadata || {};
        if (!userId || !productId) {
          console.warn('⚠️ Missing metadata in subscription');
        }
        await Payment.create({
          userId,
          productId,
          amount: null,
          currency: null,
          paymentIntentId: null,
          status: subscription.status,
          type: 'subscription',
          subscriptionId,
          lastPaymentDate: null
        });
        console.log("📦 Subscription created (recorded in Payment)");
        break;
      }
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Error handling webhook:", err.message);
    res.status(500).json({ error: 'Webhook handler error', details: err.message });
  }
};
