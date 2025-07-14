const stripe = require('../config/stripe');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const Payment = require('../models/Payment');

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
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const sessionId = session.id;

        const sessionWithDetails = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items.data.price.product'],
        });
    
        const lineItems = sessionWithDetails.line_items.data;
        const lineItem = lineItems[0];
        
        await Payment.create({
          productId: lineItem.id,
          amount: lineItem.amount_subtotal / 100,
          currency: session.currency,
          paymentIntentId: session.payment_intent,
          status: session.status,
          type: session.mode,
          subscriptionId: session.subscription,
          currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : null,
          lastPaymentDate: new Date(session.created * 1000),
          email: session.customer_details.email
        });
        break;
      }
      default:
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Error handling webhook:", err.message);
    res.status(500).json({ error: 'Webhook handler error', details: err.message });
  }
};
