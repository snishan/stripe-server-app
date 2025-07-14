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
        console.log("invoice", invoice);

        // Safely extract metadata
        const { userId, productId } = invoice.metadata || {};
        const amount = invoice.amount_paid != null ? invoice.amount_paid / 100 : null;
        const currency = invoice.currency || null;
        const paymentIntentId = invoice.payment_intent || null;
        const subscriptionId = invoice.subscription || null;

        // Period end logic
        let currentPeriodEnd = null;
        const periodEndUnix = invoice.lines?.data?.[0]?.period?.end;
        if (periodEndUnix) {
          currentPeriodEnd = new Date(periodEndUnix * 1000);
        }

        console.log("Extracted fields:", {
          userId,
          productId,
          amount,
          currency,
          paymentIntentId,
          subscriptionId,
          currentPeriodEnd
        });

        await Payment.create({
          userId,
          productId,
          amount,
          currency,
          paymentIntentId,
          status: 'succeeded',
          type: 'subscription',
          subscriptionId,
          currentPeriodEnd,
          lastPaymentDate: new Date(invoice.created * 1000)
        });
        console.log("💳 Subscription payment recorded");
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const { userId, productId } = subscription.metadata || {};
        const status = subscription.status || null;
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;

        console.log("Extracted subscription fields:", {
          userId,
          productId,
          subscriptionId,
          status,
          currentPeriodEnd
        });

        await Payment.create({
          userId,
          productId,
          amount: null,
          currency: null,
          paymentIntentId: null,
          status,
          type: 'subscription',
          subscriptionId,
          currentPeriodEnd,
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
