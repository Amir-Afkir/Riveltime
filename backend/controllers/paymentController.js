// controllers/paymentController.js
const stripe = require('../utils/stripeClient'); // centralisation de l'init Stripe
const { createExpressAccount, generateOnboardingLink } = require('../services/stripeAccounts');
const { processEstimate } = require('../services/livraison');
const Product = require('../models/Product');
const Boutique = require('../models/Boutique');
const Order = require('../models/Order');
const User = require('../models/User'); // Added User model import


// Création d'une session de paiement Stripe Checkout avec redirection
const createPaymentIntentHandler = async (req, res) => {
  console.log("🧾 Reçu :", req.body);
  try {
    const { cart } = req.body;
    const user = req.dbUser; // Sécurité renforcée : données user backend uniquement

    if (typeof user?.infosClient?.latitude !== 'number' || typeof user?.infosClient?.longitude !== 'number') {
      return res.status(400).json({ message: "Coordonnées de livraison manquantes. Veuillez compléter votre adresse." });
    }

    if (!cart?.length) {
      return res.status(400).json({ message: 'Panier vide ou invalide.' });
    }

    // Remplacement de la boucle de regroupement par le nouveau code
    const populatedItems = await Promise.all(cart.map(async ({ productId, quantity }) => {
      const product = await Product.findById(productId).lean();
      if (!product) return null;

      const boutique = await Boutique.findById(product.boutique).lean();
      const vendeur = await User.findById(boutique.owner).lean();

      return {
        product,
        quantity,
        boutique,
        vendeurStripeId: vendeur?.infosVendeur?.stripeAccountId || null,
      };
    }));

    const groupedByBoutique = {};

    for (const item of populatedItems.filter(Boolean)) {
      const boutiqueId = item.boutique._id.toString();

      if (!groupedByBoutique[boutiqueId]) {
        groupedByBoutique[boutiqueId] = {
          boutique: item.boutique,
          vendeurStripeId: item.vendeurStripeId,
          produits: [],
        };
      }

      groupedByBoutique[boutiqueId].produits.push({
        productId: item.product._id,
        nom: item.product.name,
        prix: item.product.price,
        quantity: item.quantity,
        poids_kg: item.product.poids_kg,
        volume_m3: item.product.volume_m3
      });

      groupedByBoutique[boutiqueId].totalProduits = (groupedByBoutique[boutiqueId].totalProduits || 0) + (item.product.price * item.quantity);
    }

    // Calcul estimation livraison
    for (const [_, data] of Object.entries(groupedByBoutique)) {
      const items = data.produits.map(p => ({
        product: p.productId,
        quantity: p.quantity,
        poids_kg: p.poids_kg,
        volume_m3: p.volume_m3,
      }));

      const totalProduits = data.totalProduits || 0;
      console.log("💰 totalProduits pour boutique", data.boutique._id.toString(), ":", totalProduits);

      const coords = data.boutique.location?.coordinates;
      const boutiqueLocation = (Array.isArray(coords) && coords.length === 2)
        ? { lat: coords[1], lng: coords[0] }
        : { lat: 0, lng: 0 };

      const {
        activerParticipation,
        participationPourcent,
        contributionLivraisonPourcent
      } = data.boutique;

      console.log("🛠️ Paramètres reçus dans processEstimate :", {
        activerParticipation,
        participationPourcent,
        contributionLivraisonPourcent,
        totalProduits,
      });
      const estimation = await processEstimate({
        items,
        boutiqueId: data.boutique._id,
        deliveryLocation: {
          lat: user.infosClient.latitude,
          lng: user.infosClient.longitude,
        },
        boutiqueLocation,
        horaire: (() => {
          const now = new Date();
          const hour = now.getHours();
          const day = now.getDay(); // 0 = dimanche
          const horaire = [];
          if (hour >= 18 && hour <= 20) horaire.push("pointe");
          if (hour >= 22 || hour < 6) horaire.push("nuit");
          if (day === 0 || day === 6) horaire.push("weekend");
          return horaire;
        })(),
        vehicule: 'velo',
        totalProduits,
        activerParticipation,
        participationPourcent,
        contributionLivraisonPourcent
      });

      console.log("🎯 Estimation reçue :", estimation);

      data.livraison = estimation.deliveryFee;
      data.participation = estimation.participation;
    }

    console.log("📦 Estimation par boutique :", Object.fromEntries(
      Object.entries(groupedByBoutique).map(([k, v]) => [k, {
        boutique: {
          participationPourcent: v.boutique.participationPourcent,
          contributionLivraisonPourcent: v.boutique.contributionLivraisonPourcent,
          activerParticipation: v.boutique.activerParticipation,
        },
        livraison: v.livraison,
        participation: v.participation
      }])
    ));

    // Calcul des totaux globaux
    const totalGlobalProduits = Object.values(groupedByBoutique).reduce(
      (acc, data) => acc + (data.totalProduits || 0),
      0
    );

    const totalLivraison = Object.values(groupedByBoutique).reduce(
      (acc, data) => acc + (data.livraison || 0),
      0
    );

    const metadata = {
      userId: user._id.toString(),
      address: user.infosClient?.adresse,
      lat: user.infosClient?.latitude?.toString() || "",
      lng: user.infosClient?.longitude?.toString() || "",
      deliveryLocation: JSON.stringify({
        lat: user.infosClient.latitude,
        lng: user.infosClient.longitude
      }),
      deliveryAddress: user.infosClient?.adresse,
      productTotal: totalGlobalProduits.toFixed(2),
      livraisonTotal: totalLivraison.toFixed(2),
      cart: JSON.stringify(cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))),
        groupedByBoutique: JSON.stringify(Object.entries(groupedByBoutique).map(([boutiqueId, data]) => ({
        boutiqueId,
        vendeurStripeId: data.vendeurStripeId,
        transferGroup: `order_${Date.now()}_${boutiqueId}`,
        livraison: data.livraison,
        participation: data.participation
        })))
    };

    // Construire les line_items Stripe
    const line_items = [];

    for (const [_, data] of Object.entries(groupedByBoutique)) {
      const boutiqueNom = data.boutique.name || 'Boutique';

      data.produits.forEach(prod => {
        if (prod.prix > 0 && prod.quantity >= 1) {
          line_items.push({
            price_data: {
              currency: "eur",
              unit_amount: Math.round(prod.prix * 100),
              product_data: {
                name: prod.nom,
                description: `chez ${boutiqueNom}`,
                metadata,
              },
            },
            quantity: prod.quantity,
          });
        }
      });

      const livraisonCents = Math.round(data.livraison * 100);
      if (livraisonCents >= 1) {
        line_items.push({
          price_data: {
            currency: "eur",
            unit_amount: livraisonCents,
            product_data: {
              name: `Livraison ${boutiqueNom}`,
              description: "Frais de livraison",
              metadata,
            },
          },
          quantity: 1,
        });
      }
    }

    console.log("🧾 line_items envoyés à Stripe :", line_items);

    // Ajout des logs demandés
    console.log("🛒 Cart:", JSON.stringify(cart, null, 2));
    console.log("📍 User location:", user.infosClient?.latitude, user.infosClient?.longitude);
    console.log("🧠 Metadata envoyées :", metadata);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/client/commandes?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/client/commandes?canceled=true`,
      metadata, // déplacer ici
      payment_intent_data: {
        capture_method: 'manual',
        transfer_group: `order_${Date.now()}`
      },
      expand: ['payment_intent']
    });
    console.log("📤 Requête envoyée à Stripe pour la session Checkout");

    console.log("✅ Session Stripe créée :", JSON.stringify(session, null, 2));

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Erreur Stripe :", err);
    console.error("Erreur création session Stripe :", err);
    res.status(500).json({ message: "Erreur lors de la création de la session de paiement." });
  }
};

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

module.exports = {
  getStripeStatusHandler,
  createStripeAccountHandler,
  manageStripeAccountHandler,
  onboardStripeAccountHandler,
  createPaymentIntentHandler,
};