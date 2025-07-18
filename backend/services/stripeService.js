const Stripe = require('stripe');
const groupCartByBoutique = require('../utils/groupCartByBoutique');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

const createPaymentIntent = async (cart, user) => {
  const customerEmail = user.email;
  let montantTotalProduits = 0;
  let livraisonTotal = 0;
  let participationTotale = 0;
  const boutiqueGroups = groupCartByBoutique(cart);
  const boutiques = Object.keys(boutiqueGroups);

  for (const items of Object.values(boutiqueGroups)) {
    let produitTotal = 0;

    items.forEach(({ product, quantity }) => {
      if (!product || typeof product !== 'object') return;
      produitTotal += product.price * quantity;
    });

    livraisonTotal += items[0]?.livraison || 0;
    participationTotale += items[0]?.participation || 0;

    montantTotalProduits += produitTotal;
  }

  const montantTotal = montantTotalProduits + livraisonTotal - participationTotale;
  const metadata = {
    userId: user.sub || user._id || 'anonymous',
    boutiques: boutiques.join(','),
    productTotal: montantTotalProduits.toFixed(2),
    livraisonTotal: livraisonTotal.toFixed(2),
    participationTotale: participationTotale.toFixed(2),
    items: JSON.stringify(cart.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
    }))),
    deliveryAddress: user.deliveryAddress || 'Adresse non spécifiée',
    deliveryLocation: JSON.stringify(user.deliveryLocation || { lat: 0, lng: 0 }),
    vehiculeRecommande: user.vehiculeRecommande || 'non défini',
  };

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(montantTotal * 100),
    currency: 'eur',
    capture_method: 'manual',
    payment_method_types: ['card'],
    metadata,
    transfer_group: `order_${Date.now()}`,
    customer_email: customerEmail,
  });

  return paymentIntent.client_secret;
};

const Order = require('../models/Order');
const User = require('../models/User');
const Boutique = require('../models/Boutique');

const createTransfersAfterCapture = async (paymentIntentId) => {
  const COMMISSION_POURCENT = 8;
  const platformAccountId = process.env.STRIPE_PLATFORM_ACCOUNT_ID;

  const orders = await Order.find({ paymentIntentId });

  if (!orders || orders.length === 0) {
    console.warn('⚠️ Aucun Order trouvé pour le PaymentIntent :', paymentIntentId);
    return;
  }

  for (const order of orders) {
    for (const sousCommande of order.ordersParBoutique) {
      const {
        boutique,
        produitsTotal,
        fraisLivraison,
        participation,
        vendeurStripeId,
        livreurStripeId,
        transferGroup
      } = sousCommande;

      // Transfert vendeur
      if (vendeurStripeId) {
        const commission = (produitsTotal * COMMISSION_POURCENT) / 100;
        const montantPourVendeur = produitsTotal - participation - commission;

        await stripe.transfers.create({
          amount: Math.round(montantPourVendeur * 100),
          currency: 'eur',
          destination: vendeurStripeId,
          transfer_group: transferGroup,
        });
        console.log(`✅ Transfert vendeur : ${montantPourVendeur} €`);

        // Transfert de la commission à Riveltime
        if (platformAccountId) {
          await stripe.transfers.create({
            amount: Math.round(commission * 100),
            currency: 'eur',
            destination: platformAccountId,
            transfer_group: transferGroup,
          });
          console.log(`💰 Commission Riveltime : ${commission} €`);
        }
      }

      // Transfert livreur
      if (livreurStripeId) {
        const montantPourLivreur = fraisLivraison;
        await stripe.transfers.create({
          amount: Math.round(montantPourLivreur * 100),
          currency: 'eur',
          destination: livreurStripeId,
          transfer_group: transferGroup,
        });
        console.log(`🚚 Transfert livreur : ${montantPourLivreur} €`);
      } else {
        console.warn(`📦 Aucun livreur défini pour ${transferGroup}`);
      }
    }
  }
};

module.exports = { createPaymentIntent, createTransfersAfterCapture };
