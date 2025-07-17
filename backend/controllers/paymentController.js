const Stripe = require('stripe');
const { createPaymentIntent } = require('../services/stripeService');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

const User = require('../models/User');

// Crée un compte Stripe
const createStripeAccountHandler = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    if (!dbUser || dbUser.role !== 'vendeur') {
      return res.status(403).json({ error: "Accès réservé aux vendeurs" });
    }

    if (dbUser.infosVendeur?.stripeAccountId) {
      return res.status(200).json({ message: "Compte Stripe déjà existant", stripeAccountId: dbUser.infosVendeur.stripeAccountId });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: dbUser.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });

    // Mise à jour de l’utilisateur
    dbUser.infosVendeur = {
      ...dbUser.infosVendeur,
      stripeAccountId: account.id,
    };
    await dbUser.save();

    res.status(201).json({ message: "Compte Stripe créé", stripeAccountId: account.id });
  } catch (err) {
    console.error("❌ Erreur création Stripe :", err);
    res.status(500).json({ error: "Erreur lors de la création du compte Stripe" });
  }
};

const onboardStripeAccountHandler = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    if (!dbUser || dbUser.role !== 'vendeur') {
      return res.status(403).json({ error: "Accès réservé aux vendeurs" });
    }

    const stripeAccountId = dbUser.infosVendeur?.stripeAccountId;
    if (!stripeAccountId) {
      return res.status(400).json({ error: 'Aucun compte Stripe trouvé pour cet utilisateur.' });
    }

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      return res.status(500).json({ error: "URL frontend manquante (FRONTEND_URL)" });
    }

    const role = dbUser.role;
    const returnUrl = `${frontendUrl}/${role}/profil`;

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${returnUrl}?onboarding=cancel`,
      return_url: `${returnUrl}?onboarding=success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error('❌ Erreur onboarding Stripe :', err);
    res.status(500).json({ error: "Erreur Stripe lors de l'onboarding" });
  }
};

// Crée une session de paiement Stripe
const createPaymentIntentHandler = async (req, res) => {
  try {
    const { cart, user } = req.body;

    if (!cart || !Array.isArray(cart) || !user) {
      return res.status(400).json({ message: 'Paramètres invalides.' });
    }

    // Vérifie que chaque produit contient bien boutiqueDetails.stripeAccountId, livreurStripeId, quantity, livraison, participation et merchant
    for (const item of cart) {
      const produitNom = item.product?.name || 'inconnu';

      if (!item.product?.boutiqueDetails?.stripeAccountId) {
        return res.status(400).json({
          message: `Produit "${produitNom}" manquant d'informations Stripe vendeur.`,
        });
      }
      if (!item.livreurStripeId) {
        return res.status(400).json({
          message: `Produit "${produitNom}" manquant d'informations Stripe livreur.`,
        });
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return res.status(400).json({
          message: `Quantité invalide pour "${produitNom}".`,
        });
      }
      if (typeof item.livraison !== 'number') {
        return res.status(400).json({
          message: `Frais de livraison manquant ou invalide pour "${produitNom}".`,
        });
      }
      if (typeof item.participation !== 'number') {
        return res.status(400).json({
          message: `Participation manquante ou invalide pour "${produitNom}".`,
        });
      }
      if (!item.merchant) {
        return res.status(400).json({
          message: `Nom du commerçant manquant pour "${produitNom}".`,
        });
      }
    }

    const clientSecret = await createPaymentIntent(cart, user);
    res.status(200).json({ clientSecret });
  } catch (err) {
    console.error('Erreur création session Stripe :', err);
    res.status(500).json({ message: "Erreur lors de la création de la session de paiement." });
  }
};

module.exports = {
  createStripeAccountHandler,
  onboardStripeAccountHandler,
  createPaymentIntentHandler,

};