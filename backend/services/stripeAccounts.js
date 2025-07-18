// controllers/stripeAccounts.js

const stripe = require('../utils/stripeClient');
const User = require('../models/User');

/**
 * Crée un compte Stripe Express pour un vendeur
 */
const createStripeAccountHandler = async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user || user.role !== 'vendeur') {
      return res.status(403).json({ error: "Accès réservé aux vendeurs." });
    }

    if (user.infosVendeur?.stripeAccountId) {
      return res.status(200).json({
        message: "Compte Stripe déjà existant.",
        stripeAccountId: user.infosVendeur.stripeAccountId,
      });
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

    user.infosVendeur = {
      ...user.infosVendeur,
      stripeAccountId: account.id,
    };
    await user.save();

    res.status(201).json({
      message: "Compte Stripe créé.",
      stripeAccountId: account.id,
    });
  } catch (error) {
    console.error("❌ Erreur création Stripe :", error);
    res.status(500).json({ error: "Erreur lors de la création du compte Stripe." });
  }
};

/**
 * Génére un lien d'onboarding Stripe pour compléter la configuration du compte
 */
const onboardStripeAccountHandler = async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user || user.role !== 'vendeur') {
      return res.status(403).json({ error: "Accès réservé aux vendeurs." });
    }

    const stripeAccountId = user.infosVendeur?.stripeAccountId;
    if (!stripeAccountId) {
      return res.status(400).json({ error: "Aucun compte Stripe trouvé pour cet utilisateur." });
    }

    const frontendUrl = req.headers.origin;
    const redirectUrl = `${frontendUrl}/${user.role}/profil`;

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${redirectUrl}?onboarding=cancel`,
      return_url: `${redirectUrl}?onboarding=success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("❌ Erreur onboarding Stripe :", error);
    res.status(500).json({ error: "Erreur lors de l'onboarding Stripe." });
  }
};

module.exports = {
  createStripeAccountHandler,
  onboardStripeAccountHandler,
};