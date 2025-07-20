// Liste des événements Stripe gérés par ce webhook
const HANDLED_EVENTS = [
  'payment_intent.completed',
  'payment_intent.succeeded',
  'payment_intent.canceled',
  'checkout.session.completed',
];

// Gestion de checkout.session.completed
async function handleCheckoutSessionCompleted(event) {
  try {
    const session = event.data.object;
    const metadata = session?.payment_intent?.metadata || session.metadata;
    const groupedByBoutique = JSON.parse(metadata.groupedByBoutique || "[]");
    const paymentIntentId = session.payment_intent;
    const sessionId = session.id;

    const Order = require('../models/Order.js');
    const User = require('../models/User.js');
    const Product = require('../models/Product.js');
    const groupCartByBoutique = require('../utils/groupCartByBoutique');

    // Si la commande existe déjà (créée via succeeded), on ne fait rien
    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) {
      existingOrder.checkoutSessionId = sessionId;
      existingOrder.stripeStatusHistory.push({
        status: session.status,
        event: 'checkout.session.completed',
      });
      await existingOrder.save();
      console.log(`🔁 Commande déjà existante mise à jour via checkout.session.completed : ${existingOrder._id}`);
      return;
    }
    console.log("🔍 Aucune commande existante trouvée, création en cours...");

    if (!metadata?.userId || !metadata?.cart || !metadata?.productTotal || !metadata?.livraisonTotal || !metadata?.deliveryLocation) {
      console.warn('❌ Métadonnées incomplètes, commande ignorée');
      return;
    }

    const user = await User.findById(metadata.userId);
    if (!user) throw new Error("Utilisateur introuvable");

    const parsedItems = JSON.parse(metadata.cart);

    const populatedItems = await Promise.all(parsedItems.map(async ({ productId, quantity }) => {
      const product = await Product.findById(productId).lean();
      return product ? { product, quantity } : null;
    }));

    const validItems = populatedItems.filter(Boolean);
    const grouped = groupCartByBoutique(validItems.map(({ product, quantity }) => ({
      product,
      quantity,
      boutique: product.boutique,
      vendeurStripeId: product.vendeurStripeId,
      livraison: product.livraison || 0,
      participation: product.participation || 0,
    })));

    const ordersParBoutique = Object.entries(grouped).map(([boutiqueId, items]) => {
      const metadataEntry = groupedByBoutique.find(entry => entry.boutiqueId === boutiqueId) || {};
      return {
        boutique: boutiqueId,
        produitsTotal: items.reduce((acc, { product, quantity }) => acc + product.price * quantity, 0),
        fraisLivraison: metadataEntry.livraison || 0,
        participation: metadataEntry.participation || 0,
        items: items.map(({ product, quantity }) => ({
          product: product._id,
          quantity,
        })),
        vendeurStripeId: metadataEntry.vendeurStripeId || null,
        transferGroup: metadataEntry.transferGroup || null,
      };
    });

    const newOrder = new Order({
      client: user._id,
      items: validItems.map(({ product, quantity }) => ({ product: product._id, quantity })),
      totalPrice: parseFloat(metadata.productTotal),
      deliveryFee: parseFloat(metadata.livraisonTotal),
      deliveryAddress: metadata.deliveryAddress || metadata.address || user.infosClient?.adresseComplete || "Adresse inconnue",
      deliveryLocation: JSON.parse(metadata.deliveryLocation),
      paymentIntentId,
      checkoutSessionId: sessionId,
      captureStatus: 'authorized',
      status: 'pending',
      stripeStatusHistory: [
        {
          status: session.status,
          event: 'checkout.session.completed',
        },
      ],
      ordersParBoutique,
    });

    await newOrder.save();
    const savedOrder = await Order.findById(newOrder._id);
    console.log("🧾 Commande MongoDB sauvegardée :", savedOrder);
    console.log(`✅ Commande créée via checkout.session.completed : ${newOrder._id}`);
  } catch (err) {
    console.error('❌ Erreur création commande dans checkout.session.completed :', err);
  }
}

// Gestion de payment_intent.succeeded
async function handlePaymentIntentSucceeded(event) {
  try {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const metadata = paymentIntent.metadata;

    const Order = require('../models/Order.js');
    const User = require('../models/User.js');
    const Product = require('../models/Product.js');
    const groupCartByBoutique = require('../utils/groupCartByBoutique');

    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) {
      existingOrder.status = 'delivered';
      existingOrder.stripeStatusHistory.push({
        status: paymentIntent.status,
        event: 'payment_intent.succeeded',
      });
      await existingOrder.save();
      console.log(`🔁 Commande existante mise à jour après autorisation Stripe : ${existingOrder._id}`);
      return;
    }

    // Suppression de la création de commande si elle n'existe pas encore
  } catch (err) {
    console.error('❌ Erreur création commande dans payment_intent.succeeded :', err);
  }
}

// Gestion de payment_intent.canceled
async function handlePaymentIntentCanceled(event) {
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
}
const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

// Middleware brut nécessaire pour vérifier la signature du webhook
router.post(
  '/',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    console.log('⚡️ Webhook Stripe reçu :', req.body.toString());
    console.log('📬 Signature Stripe reçue :', sig);

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Erreur vérification Stripe webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Vérifie si l'événement est pris en charge
    console.log('📣 Type d\'événement Stripe :', event.type);
    if (!HANDLED_EVENTS.includes(event.type)) {
      // Ignore les événements non gérés
      return res.status(200).json({ received: true });
    }

    // Appelle la fonction de gestion appropriée
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentIntentSucceeded(event);
    } else if (event.type === 'payment_intent.canceled') {
      await handlePaymentIntentCanceled(event);
    } else if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(event);
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router; 
