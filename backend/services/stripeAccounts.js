import stripe from '../utils/stripeClient.js';

/**
 * Crée un compte Stripe Express pour un utilisateur vendeur ou livreur
 * @param {Object} user - L'utilisateur connecté
 * @returns {Promise<Object>} - Le compte Stripe Express créé ou existant
 */
const createExpressAccount = async (user) => {
  if (!user || (user.role !== 'vendeur' && user.role !== 'livreur')) {
    throw new Error("Accès réservé aux vendeurs ou livreurs.");
  }

  // Pour vendeur
  if (user.role === 'vendeur') {
    if (user.infosVendeur?.stripeAccountId) {
      console.log(`Compte Stripe existant trouvé pour vendeur avec ID: ${user.infosVendeur.stripeAccountId}`);
      // Retourner un objet avec account simulé pour homogénéité
      return { alreadyExists: true, account: { id: user.infosVendeur.stripeAccountId } };
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
    console.log(`Compte Stripe créé pour vendeur avec ID: ${account.id}`);
    if (!user.infosVendeur) user.infosVendeur = {};
    user.infosVendeur.stripeAccountId = account.id;
    if (typeof user.save === 'function') {
      await user.save();
      console.log(`Utilisateur vendeur mis à jour avec stripeAccountId: ${account.id}`);
    }
    return { alreadyExists: false, account };
  }

  // Pour livreur
  if (user.role === 'livreur') {
    if (user.infosLivreur?.stripeAccountId) {
      console.log(`Compte Stripe existant trouvé pour livreur avec ID: ${user.infosLivreur.stripeAccountId}`);
      return { alreadyExists: true, account: { id: user.infosLivreur.stripeAccountId } };
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
    console.log(`Compte Stripe créé pour livreur avec ID: ${account.id}`);
    if (!user.infosLivreur) user.infosLivreur = {};
    user.infosLivreur.stripeAccountId = account.id;
    if (typeof user.save === 'function') {
      await user.save();
      console.log(`Utilisateur livreur mis à jour avec stripeAccountId: ${account.id}`);
    }
    return { alreadyExists: false, account };
  }
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