import express from 'express';
import {
  getStripeStatusHandler,
  createStripeAccountHandler,
  onboardStripeAccountHandler,
  manageStripeAccountHandler,
  createMultiPaymentIntentsHandler,
  //confirmMultipleIntentsHandler,
  createOrderAfterConfirmation,
} from '../controllers/paymentController.js';

const router = express.Router();

// Vérifi état du compte Stripe
router.get('/status', getStripeStatusHandler); 

// Crée le compte Stripe pour le vendeur connecté
router.post('/create-account', createStripeAccountHandler);

// Stripe confirme chaque PaymentIntent avec le même paymentMethodId
//router.post('/confirm-many', confirmMultipleIntentsHandler);

// Route pour onboarding Stripe Connect
router.post('/onboard', onboardStripeAccountHandler);

// Lien pour gérer son compte Stripe
router.get('/manage', manageStripeAccountHandler);

// Démarre un paiement multiple
router.post('/multi-payment-intents', createMultiPaymentIntentsHandler); 
router.post('/create', createOrderAfterConfirmation);

export default router; 