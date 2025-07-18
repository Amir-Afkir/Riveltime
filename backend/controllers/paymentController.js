// controllers/paymentController.js
const stripe = require('../utils/stripeClient'); // centralisation de l'init Stripe
const { createPaymentIntent } = require('../services/stripeService');
const { createExpressAccount, generateOnboardingLink } = require('../services/stripeAccounts');
const { processEstimate } = require('../services/livraison');


// Statut du compte Stripe Express
const getStripeStatusHandler = async (req, res) => {
  try {
    const { dbUser } = req;
    const stripeAccountId = dbUser?.infosVendeur?.stripeAccountId;

    if (!stripeAccountId) {
      return res.status(404).json({ message: 'Compte Stripe non trouvé.' });
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);

    return res.json({
      enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
    });
  } catch (error) {
    console.error('Erreur récupération status Stripe :', error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

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

// Création d'une session de paiement Stripe Checkout avec redirection
const createPaymentIntentHandler = async (req, res) => {
  console.log("🧾 Reçu :", req.body);
  try {
    const { cart, user } = req.body;

    if (!cart?.length || !user) {
      return res.status(400).json({ message: 'Paramètres invalides.' });
    }

    const groupedByBoutique = {};
    for (const item of cart) {
      const boutiqueId = item.boutiqueId;
      if (!groupedByBoutique[boutiqueId]) {
        groupedByBoutique[boutiqueId] = {
          nom: item.merchant,
          boutiqueObjectId: boutiqueId,
          produits: [],
        };
      }

      groupedByBoutique[boutiqueId].produits.push({
        productId: item.productId,
        quantity: item.quantity,
        prix: item.prix,
        nom: item.nom,
      });
    }

    for (const [_, data] of Object.entries(groupedByBoutique)) {
      const items = data.produits.map(p => ({
        product: p.productId,
        quantity: p.quantity
      }));

      const boutiqueDoc = await require('../models/Boutique').findById(data.boutiqueObjectId);
      let boutiqueLocation = { lat: 0, lng: 0 };
      const coords = boutiqueDoc?.location?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        boutiqueLocation = { lat: coords[1], lng: coords[0] };
      } else {
        console.warn(`⚠️ Coordonnées boutique manquantes pour ${boutiqueDoc?.name || 'Inconnue'} (${data.boutiqueObjectId})`);
      }

      const estimation = await processEstimate({
        items,
        boutiqueId: data.boutiqueObjectId,
        deliveryLocation: user.deliveryLocation,
        boutiqueLocation,
        horaire: [],
        vehicule: 'velo'
      });
      console.log("📦 Estimation livraison :", estimation);

      data.livraison = estimation.deliveryFee;
      data.participation = estimation.participation;
    }

    // Créer les line_items complets pour Stripe
    const line_items = [];

    Object.entries(groupedByBoutique).forEach(([boutiqueId, data]) => {
      const boutiqueNom = data.nom || boutiqueId;
      data.produits.forEach(prod => {
        if (prod.prix > 0 && prod.quantity >= 1) {
          line_items.push({
            price_data: {
              currency: "eur",
              unit_amount: Math.round(Number(prod.prix) * 100), // ✅ forcer conversion nombre * 100
              product_data: {
                name: prod.nom,
                description: `chez ${boutiqueNom}`,
                metadata: {
                  productId: prod.productId,
                },
              },
            },
            quantity: Number(prod.quantity), // ✅ forcer conversion
          });
        }
      });

      const livraisonCents = Math.round(Number(data.livraison) * 100);
      if (livraisonCents >= 1) {
        line_items.push({
          price_data: {
            currency: "eur",
            unit_amount: livraisonCents,
            product_data: {
              name: `Livraison ${boutiqueNom}`,
              description: "Frais de livraison",
            },
          },
          quantity: 1,
        });
      }

      // La participation boutique est déjà déduite des frais de livraison,
      // elle ne doit pas être ajoutée dans les line_items Stripe
    });

    console.log("🧾 line_items envoyés à Stripe :", line_items);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/client/commandes?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/client/commandes?canceled=true`,
      metadata: {
        userId: user.sub,
        address: user.deliveryAddress || "",
        lat: user.deliveryLocation?.lat || "",
        lng: user.deliveryLocation?.lng || "",
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Erreur création session Stripe :", err);
    res.status(500).json({ message: "Erreur lors de la création de la session de paiement." });
  }
};


module.exports = {
  getStripeStatusHandler,
  createStripeAccountHandler,
  manageStripeAccountHandler,
  onboardStripeAccountHandler,
  createPaymentIntentHandler,
};