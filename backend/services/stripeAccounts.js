import stripe from '../utils/stripeClient.js';

/**
 * Crée un compte Stripe Express pour un utilisateur vendeur
 * @param {Object} user - L'utilisateur connecté
 * @returns {Promise<Object>} - Le compte Stripe Express créé
 */
const createExpressAccount = async (user) => {
  if (!user || user.role !== 'vendeur') {
    throw new Error("Accès réservé aux vendeurs.");
  }

  if (user.infosVendeur?.stripeAccountId) {
    return { alreadyExists: true, accountId: user.infosVendeur.stripeAccountId };
  }

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'FR',
    email: user.email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
  });

  return { alreadyExists: false, account };
};

/**
 * Génère un lien d'onboarding Stripe pour un compte Express
 * @param {string} stripeAccountId - L'identifiant du compte Stripe
 * @param {string} frontendUrl - L'URL du frontend (origine)
 * @param {string} role - Le rôle de l'utilisateur (client, vendeur...)
 * @returns {Promise<Object>} - Lien de redirection onboarding
 */
const generateOnboardingLink = async (stripeAccountId, frontendUrl, role) => {
  const redirectUrl = `${frontendUrl}/${role}/profil`;

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${redirectUrl}?onboarding=cancel`,
    return_url: `${redirectUrl}?onboarding=success`,
    type: 'account_onboarding',
  });

  return accountLink;
};

export {
  createExpressAccount,
  generateOnboardingLink,
};