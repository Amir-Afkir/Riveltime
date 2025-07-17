// backend/utils/cancelUnassignedOrders.js
const mongoose = require('mongoose');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });
const Order = require('../models/Order');

async function cancelStaleOrders() {
  try {
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    const orders = await Order.find({
      status: 'pending',
      createdAt: { $lte: twentyMinutesAgo },
    });

    for (const order of orders) {
      try {
        // Annule le paiement Stripe
        await stripe.paymentIntents.cancel(order.paymentIntentId);

        // Met à jour la commande
        order.status = 'annulée_sans_livreur';
        order.captureStatus = 'capture_echouee';
        await order.save();

        console.log(`❌ Paiement annulé automatiquement pour la commande ${order._id}`);
      } catch (err) {
        console.error(`Erreur annulation commande ${order._id} :`, err);
      }
    }
  } catch (err) {
    console.error('❌ Erreur lors de la recherche des commandes à annuler :', err);
  }
}

module.exports = cancelStaleOrders;
