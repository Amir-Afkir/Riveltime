const express = require('express');
const {
  getStripeStatusHandler,
  createStripeAccountHandler,
  onboardStripeAccountHandler,
  manageStripeAccountHandler,
  createPaymentIntentHandler,
} = require('../controllers/paymentController');

const router = express.Router();

// Vérifi état du compte Stripe
router.get('/status', getStripeStatusHandler); 

// Crée le compte Stripe pour le vendeur connecté
router.post('/create-account', createStripeAccountHandler);

// Route pour onboarding Stripe Connect
router.post('/onboard', onboardStripeAccountHandler);

// Lien pour gérer son compte Stripe
router.get('/manage', manageStripeAccountHandler);

// Démarre un paiement
router.post('/checkout', createPaymentIntentHandler);

module.exports = router;