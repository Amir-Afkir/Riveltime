const express = require('express');
const {
  createStripeAccountHandler,
  onboardStripeAccountHandler,
  createPaymentIntentHandler,
} = require('../controllers/paymentController');

const router = express.Router();

// Nouvelle route : crée le compte Stripe pour le vendeur connecté
router.post('/create-account', createStripeAccountHandler);

// Route pour onboarding Stripe Connect
router.post('/onboard', onboardStripeAccountHandler);

// Route pour démarrer un paiement
router.post('/checkout', createPaymentIntentHandler);


module.exports = router;