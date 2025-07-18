// utils/stripeClient.js

const Stripe = require('stripe');

/**
 * Client Stripe initialisé avec la clé secrète et version API
 * @type {Stripe}
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

module.exports = stripe;