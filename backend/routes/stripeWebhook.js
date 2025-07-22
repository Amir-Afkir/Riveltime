const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const Order = require('../models/Order.js');

const HANDLED_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.canceled',
];

async function updateOrderStatus(paymentIntent, status, captureStatus, eventLabel) {
  const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
  if (!order) {
    console.warn(`ℹ️ Aucune commande trouvée pour ${paymentIntent.id} — aucune mise à jour effectuée.`);
    return;
  }

  order.status = status;
  order.captureStatus = captureStatus;
  order.stripeStatusHistory.push({
    status: paymentIntent.status,
    event: eventLabel,
  });

  await order.save();
  console.log(`✅ Commande ${status} : ${order._id}`);
}

async function handlePaymentIntentSucceeded(event) {
  try {
    await updateOrderStatus(event.data.object, 'delivered', 'succeeded', 'payment_intent.succeeded');
  } catch (err) {
    console.error("❌ Erreur dans handlePaymentIntentSucceeded :", err);
  }
}

async function handlePaymentIntentCanceled(event) {
  try {
    await updateOrderStatus(event.data.object, 'cancelled', 'canceled', 'payment_intent.canceled');
  } catch (err) {
    console.error('❌ Erreur dans handlePaymentIntentCanceled :', err);
  }
}

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

router.post(
  '/',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Erreur vérification Stripe webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (!HANDLED_EVENTS.includes(event.type)) {
      return res.status(200).json({ received: true });
    }

    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentIntentSucceeded(event);
    } else if (event.type === 'payment_intent.canceled') {
      await handlePaymentIntentCanceled(event);
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
