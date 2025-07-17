const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

// Middleware brut nécessaire pour vérifier la signature du webhook
router.post(
  '/webhook',
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

    // Gestion des événements
    switch (event.type) {
      case 'payment_intent.succeeded':
        try {
          const paymentIntent = event.data.object;
          const paymentIntentId = paymentIntent.id;

          const Order = require('../models/Order.js');
          const order = await Order.findOne({ paymentIntentId });

          if (order) {
            order.status = 'pending';
            order.captureStatus = 'capture_effectuée';
            await order.save();
            console.log(`✅ Paiement capturé et commande ${order._id} mise à jour.`);
          } else {
            console.warn('⚠️ Aucune commande trouvée pour ce PaymentIntent.');
          }
        } catch (err) {
          console.error('❌ Erreur traitement payment_intent.succeeded :', err);
        }
        break;

      case 'payment_intent.canceled':
        try {
          const paymentIntent = event.data.object;
          const paymentIntentId = paymentIntent.id;

          const Order = require('../models/Order.js');
          const order = await Order.findOne({ paymentIntentId });

          if (order) {
            order.status = 'annulée_sans_livreur';
            order.captureStatus = 'capture_echouee';
            await order.save();
            console.log(`❌ Paiement annulé et commande ${order._id} mise à jour.`);
          } else {
            console.warn('⚠️ Aucune commande trouvée pour ce PaymentIntent annulé.');
          }
        } catch (err) {
          console.error('❌ Erreur traitement payment_intent.canceled :', err);
        }
        break;

      case 'payment_intent.payment_failed':
        console.error('❌ Paiement échoué :', event.data.object.id);
        // TODO : notifier l'utilisateur par email ou autre canal
        break;

      case 'checkout.session.async_payment_failed':
        console.log('❌ Paiement échoué :', event.data.object.id);
        // TODO: notifier l'utilisateur
        break;

      default:
        console.log(`Événement non géré : ${event.type}`);
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
