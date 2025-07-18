// controllers/paymentController.js
const stripe = require('../utils/stripeClient'); // centralisation de l'init Stripe
const { createPaymentIntent } = require('../services/stripeService');
const { createExpressAccount, generateOnboardingLink } = require('../services/stripeAccounts');

// Création de compte Stripe Express
const createStripeAccountHandler = async (req, res) => {
  try {
    const { dbUser } = req;
    if (!dbUser || dbUser.role !== 'vendeur') {
      return res.status(403).json({ error: "Accès réservé aux vendeurs" });
    }

    const existingId = dbUser.infosVendeur?.stripeAccountId;
    if (existingId) {
      return res.status(200).json({
        message: "Compte Stripe déjà existant",
        stripeAccountId: existingId,
      });
    }

    const { account } = await createExpressAccount(dbUser);
    dbUser.infosVendeur = { ...dbUser.infosVendeur, stripeAccountId: account.id };
    await dbUser.save();

    res.status(201).json({ message: "Compte Stripe créé", stripeAccountId: account.id });
  } catch (err) {
    console.error("❌ Erreur création Stripe :", err);
    res.status(500).json({ error: "Erreur lors de la création du compte Stripe" });
  }
};

// Génération du lien d'onboarding
const onboardStripeAccountHandler = async (req, res) => {
  try {
    const { dbUser } = req;
    if (!dbUser || dbUser.role !== 'vendeur') {
      return res.status(403).json({ error: "Accès réservé aux vendeurs" });
    }

    const stripeAccountId = dbUser.infosVendeur?.stripeAccountId;
    if (!stripeAccountId) {
      return res.status(400).json({ error: 'Aucun compte Stripe trouvé pour cet utilisateur.' });
    }

    const origin = req.headers.origin;
    const link = await generateOnboardingLink(stripeAccountId, origin, dbUser.role, stripe);

    res.json({ url: link.url });
  } catch (err) {
    console.error('❌ Erreur onboarding Stripe :', err);
    res.status(500).json({ error: "Erreur Stripe lors de l'onboarding" });
  }
};

// Gestion du compte Stripe 
const manageStripeAccountHandler = async (req, res) => {
  try {
    const { stripeAccountId } = req.dbUser.infosVendeur;
    if (!stripeAccountId) return res.status(400).json({ error: 'Aucun compte Stripe trouvé.' });

    const link = await stripe.accounts.createLoginLink(stripeAccountId);
    res.json({ url: link.url });
  } catch (err) {
    console.error('Erreur lien Stripe :', err);
    res.status(500).json({ error: "Impossible de générer le lien Stripe." });
  }
};

// Création d'une session de paiement
const createPaymentIntentHandler = async (req, res) => {
  try {
    const { cart, user } = req.body;

    if (!cart?.length || !user) {
      return res.status(400).json({ message: 'Paramètres invalides.' });
    }

    for (const item of cart) {
      const nom = item.product?.name || 'inconnu';

      if (!item.product?.boutiqueDetails?.stripeAccountId)
        return res.status(400).json({ message: `Produit \"${nom}\" sans Stripe vendeur.` });
      if (!item.livreurStripeId)
        return res.status(400).json({ message: `Produit \"${nom}\" sans Stripe livreur.` });
      if (!Number.isInteger(item.quantity) || item.quantity < 1)
        return res.status(400).json({ message: `Quantité invalide pour \"${nom}\".` });
      if (typeof item.livraison !== 'number')
        return res.status(400).json({ message: `Frais livraison manquants pour \"${nom}\".` });
      if (typeof item.participation !== 'number')
        return res.status(400).json({ message: `Participation manquante pour \"${nom}\".` });
      if (!item.merchant)
        return res.status(400).json({ message: `Commerçant manquant pour \"${nom}\".` });
    }

    const clientSecret = await createPaymentIntent(cart, user, stripe);
    res.status(200).json({ clientSecret });
  } catch (err) {
    console.error('Erreur création session Stripe :', err);
    res.status(500).json({ message: "Erreur lors de la création de la session de paiement." });
  }
};


module.exports = {
  createStripeAccountHandler,
  manageStripeAccountHandler,
  onboardStripeAccountHandler,
  createPaymentIntentHandler,
};