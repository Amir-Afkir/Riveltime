import stripe from '../utils/stripeClient.js';
import { createExpressAccount, generateOnboardingLink } from '../services/stripeAccounts.js';
import Product from '../models/Product.js';
import Boutique from '../models/Boutique.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// ======================= Handlers Stripe Express ========================= //

const getStripeStatusHandler = async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user || (user.role !== 'vendeur' && user.role !== 'livreur')) {
      return res.status(403).json({ message: 'Accès réservé aux vendeurs ou livreurs.' });
    }

    const stripeAccountId = user.role === 'vendeur'
      ? user.infosVendeur?.stripeAccountId
      : user.role === 'livreur'
        ? user.infosLivreur?.stripeAccountId
        : null;

    console.log("💳 Stripe Account ID:", stripeAccountId);

    if (!stripeAccountId) {
      return res.status(404).json({ message: 'Compte Stripe non trouvé.' });
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);
    console.log("💳 Stripe Account status:", {
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted
    });

    res.json({
      enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
    });
  } catch (error) {
    console.error('Erreur récupération status Stripe :', error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createStripeAccountHandler = async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user || (user.role !== 'vendeur' && user.role !== 'livreur')) {
      return res.status(403).json({ error: "Accès réservé aux vendeurs ou livreurs" });
    }

    // Appelle la fonction normalisée qui gère l'existence et la création
    const { account, alreadyExists } = await createExpressAccount(user);

    // Pas besoin de resauvegarder user ici, c'est fait dans la fonction

    res.status(alreadyExists ? 200 : 201).json({
      message: alreadyExists ? "Compte Stripe déjà existant" : "Compte Stripe créé",
      stripeAccountId: account.id,
    });
  } catch (err) {
    console.error("❌ Erreur création Stripe :", err);
    res.status(500).json({ error: "Erreur lors de la création du compte Stripe" });
  }
};

const onboardStripeAccountHandler = async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user || (user.role !== 'vendeur' && user.role !== 'livreur')) {
      return res.status(403).json({ error: "Accès réservé aux vendeurs ou livreurs" });
    }

    const stripeAccountId = user.role === 'vendeur'
      ? user.infosVendeur?.stripeAccountId
      : user.role === 'livreur'
        ? user.infosLivreur?.stripeAccountId
        : null;

    if (!stripeAccountId) return res.status(400).json({ error: 'Aucun compte Stripe trouvé pour cet utilisateur.' });

    const origin = req.headers.origin;
    const link = await generateOnboardingLink(stripeAccountId, origin, user.role);

    res.json({ url: link.url });
  } catch (err) {
    console.error('❌ Erreur onboarding Stripe :', err);
    res.status(500).json({ error: "Erreur Stripe lors de l'onboarding" });
  }
};

const manageStripeAccountHandler = async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé.' });

  const stripeAccountId = user.role === 'vendeur'
    ? user.infosVendeur?.stripeAccountId
    : user.role === 'livreur'
      ? user.infosLivreur?.stripeAccountId
      : null;

  if (!stripeAccountId) return res.status(400).json({ error: 'Aucun compte Stripe trouvé.' });

  const link = await stripe.accounts.createLoginLink(stripeAccountId);
  res.json({ url: link.url });
};

// ======================= Payment Intents ========================= //

import { buildEstimationInput, processEstimate } from '../utils/estimationPipeline.js';

const createMultiPaymentIntentsHandler = async (req, res) => {
  try {
    const { cart } = req.body;
    const user = req.dbUser;

    // Vérification des entrées minimales
    if (!cart?.length || !user?.infosClient?.latitude || !user?.infosClient?.longitude) {
      return res.status(400).json({ message: "Panier ou coordonnées invalides." });
    }

    // Préparation des données groupées par boutique
    const groupedEstimations = await buildEstimationInput({ cart, user });
    const multiIntentSessionId = `multi_${Date.now()}_${user._id}`;
    const createdIntents = [];

    for (const input of groupedEstimations) {
      const estimation = await processEstimate(input);

      function formatDelay(minutes) {
        if (minutes < 60) return `${minutes} min`;
        if (minutes < 1440) {
          const h = Math.floor(minutes / 60);
          const m = minutes % 60;
          return m === 0 ? `${h}h` : `${h}h ${m}min`;
        }
        const d = Math.floor(minutes / 1440);
        const h = Math.floor((minutes % 1440) / 60);
        return h === 0 ? `${d}j` : `${d}j ${h}h`;
      }

      const {
        boutiqueId, 
        vendeurStripeId,
        totalProduits,
        items
      } = input;

      const {
        deliveryFee: livraison,
        participation
      } = estimation;

      const total = totalProduits + livraison;
      const transferGroup = `order_${Date.now()}_${boutiqueId}`;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'eur',
        capture_method: 'manual',
        confirm: false,
        metadata: {
          clientId: user._id.toString(),
          multiIntentSessionId,
          boutiqueId,
          produitsTotal: totalProduits.toFixed(2),
          livraison: livraison.toFixed(2),
          participation: participation.toFixed(2),
          deliveryLocation: JSON.stringify({
            lat: user.infosClient.latitude,
            lng: user.infosClient.longitude
          }),
          produits: JSON.stringify(items.map(p => ({
            productId: p.product.toString(),
            quantity: p.quantity
          }))),
          vehiculeRecommande: estimation.vehiculeRecommande || 'N/A',
          transferGroup,
          poidsFacture: estimation.poidsFacture.toFixed(2),
          poidsKg: estimation.poidsKg.toFixed(2),
          volumeM3: estimation.volumeM3.toFixed(3),
          distanceKm: estimation.distanceKm.toFixed(1),
          estimatedDelay: estimation.estimatedDelay.toString(),
          estimatedDelayFormatted: formatDelay(estimation.estimatedDelay),
        },
        transfer_group: transferGroup,
        application_fee_amount: 0, //Math.round(totalProduits * 0.08 * 100), // 8% commission
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        }
      });

      createdIntents.push({
        boutiqueId,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        produitsTotal: totalProduits,
        fraisLivraison: livraison,
        participation,
        transferGroup,
        vendeurStripeId,
        produits: items
      });
    }

    return res.status(200).json({
    paymentIntents: createdIntents.map(intent => ({
        paymentIntentId: intent.paymentIntentId,
        clientSecret: intent.clientSecret,
        boutiqueId: intent.boutiqueId  
    }))
    });

  } catch (err) {
    console.error("❌ Erreur multi-intents :", err);
    return res.status(500).json({ message: "Erreur lors de la création des paiements." });
  }
};



const confirmMultipleIntentsHandler = async (req, res) => {
  try {
    // Nouveau bloc pour récupérer automatiquement le paymentMethodId si non fourni
    const { paymentMethodId: clientProvidedId, intents } = req.body;
    let paymentMethodId = clientProvidedId;

    if (!paymentMethodId) {
      const firstPI = await stripe.paymentIntents.retrieve(intents[0].paymentIntentId);
      paymentMethodId = firstPI.payment_method;

      if (!paymentMethodId) {
        return res.status(400).json({ message: "Aucun paymentMethodId trouvé dans les PaymentIntents." });
      }

      console.log("✅ paymentMethodId récupéré automatiquement :", paymentMethodId);
    }

    // validation
    if (!Array.isArray(intents) || intents.length === 0) {
      return res.status(400).json({ message: "Requête invalide." });
    }

    for (const { paymentIntentId, boutiqueId } of intents) {
      if (!paymentIntentId || !boutiqueId) {
        console.warn("⏭️ Données manquantes, saut :", { paymentIntentId, boutiqueId });
        continue;
      }

      const piBefore = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log(`🔎 Statut actuel de ${paymentIntentId} : ${piBefore.status}`);

      if (piBefore.status === 'requires_capture') {
        console.log(`⏭️ PaymentIntent déjà confirmé : ${paymentIntentId}`);
        continue;
      }

      // Remplacement de la validation du paymentMethodId par une vérification du statut
      if (piBefore.status === 'requires_payment_method') {
        console.warn(`❌ Ce PaymentIntent (${paymentIntentId}) nécessite un paymentMethod mais aucun n'a été fourni.`);
        continue;
      }

      const confirmParams = paymentMethodId
        ? { payment_method: paymentMethodId, off_session: true }
        : {};

      try {
        const pi = await stripe.paymentIntents.confirm(paymentIntentId, confirmParams);
        console.log(`✅ Confirmé : ${paymentIntentId} → statut = ${pi.status}`);
      } catch (err) {
        console.error(`❌ Échec confirmation ${paymentIntentId} :`, err.message);
      }
    }

    res.status(200).json({ message: "Tous les PaymentIntents ont été traités." });
  } catch (err) {
    console.error("❌ Erreur dans confirmMultipleIntentsHandler :", err);
    res.status(500).json({ message: "Erreur serveur lors de la confirmation multiple." });
  }
};

// ======================= Commande après confirmation ========================= //

import crypto from 'crypto';
import Stripe from 'stripe';
const stripeLib = new Stripe(process.env.STRIPE_SECRET_KEY);

const createOrderAfterConfirmation = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const user = req.dbUser;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'paymentIntentId requis.' });
    }

    const pi = await stripeLib.paymentIntents.retrieve(paymentIntentId);
    console.log("🔍 Tentative création commande pour PaymentIntent :", paymentIntentId);
    console.log("📦 Statut PaymentIntent :", pi.status);
    console.log("📦 Métadonnées :", pi.metadata);

    if (pi.status !== 'requires_capture') {
      return res.status(400).json({ message: `Le paiement n'est pas confirmé (statut = ${pi.status})` });
    }

    if (!pi || pi.metadata.clientId !== user._id.toString()) {
      console.warn("⚠️ Mismatch user/paymentIntent :",
        "\npi.metadata.clientId =", pi.metadata.clientId,
        "\nuser._id =", user._id.toString()
      );
      return res.status(403).json({ message: 'Tentative de fraude détectée.' });
    }

    const {
      boutiqueId,
      produits,
      produitsTotal,
      livraison,
      participation,
      deliveryLocation,
      transferGroup,
      poidsFacture,
      poidsKg,
      volumeM3,
      distanceKm,
      estimatedDelay,
      vehiculeRecommande
    } = pi.metadata;

    if (!boutiqueId || !produits || !produitsTotal || !livraison || !participation) {
      return res.status(400).json({ message: 'Metadata Stripe incomplète.' });
    }

    const boutique = await Boutique.findById(boutiqueId).lean();
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });

    const vendeur = await User.findById(boutique.owner).lean();
    if (!vendeur) return res.status(404).json({ message: 'Vendeur introuvable.' });

    const parsedProduits = JSON.parse(produits);
    const parsedLocation = JSON.parse(deliveryLocation);

    const items = parsedProduits.map(({ productId, quantity }) => ({
      product: productId,
      quantity
    }));

    const produitsDetails = await Promise.all(
      parsedProduits.map(async ({ productId }) => {
        const produit = await Product.findById(productId).lean();
        if (!produit) throw new Error(`Produit introuvable : ${productId}`);
        return produit;
      })
    );

    const poidsTotalKg = parseFloat(poidsKg);
    const volumeTotalM3 = parseFloat(volumeM3);
    const poidsFactureVal = parseFloat(poidsFacture);
    const distanceKmVal = parseFloat(distanceKm);
    const estimatedDelayMinutes = parseInt(estimatedDelay);
    const estimatedDelayFormatted = formatDelay(estimatedDelayMinutes);

    const totalPrice = parseFloat(produitsTotal) + parseFloat(livraison);
    const totalLivraison = +(parseFloat(livraison) + parseFloat(participation)).toFixed(2);

    const shortId = crypto.randomUUID().slice(0, 6).toUpperCase();
    const orderNumber = `CMD-${shortId}`;

    const clientAvatarUrl = user.avatarUrl || null;
    
    const order = new Order({
      client: user._id,
      orderNumber,
      boutique: boutique._id,
      items,
      produitsTotal: parseFloat(produitsTotal),
      fraisLivraison: parseFloat(livraison),
      participation: parseFloat(participation),
      deliveryFee: parseFloat(livraison),
      totalLivraison,
      totalPrice,

      deliveryAddress: user.infosClient?.adresseComplete || "Adresse inconnue",
      deliveryLocation: {
        lat: parsedLocation.lat,
        lng: parsedLocation.lng
      },
      boutiqueAddress: boutique.address || "Adresse boutique inconnue",
      boutiqueLocation: {
        lat: boutique.location?.coordinates?.[1] || 0,
        lng: boutique.location?.coordinates?.[0] || 0
      },

      boutiqueNom: boutique.name,
      boutiqueCoverUrl: boutique.coverImageUrl || null, // <-- ajouté ici
      boutiqueTelephone: vendeur.phone || "",
      clientNom: user.fullname || "",
      clientTelephone: user.phone || "",
      clientAvatarUrl: clientAvatarUrl,

      paymentIntentId,
      transferGroup,
      vendeurStripeId: vendeur.infosVendeur?.stripeAccountId || null,
      livreurStripeId: null,
      captureStatus: 'authorized',
      status: 'pending',
      deliveryStatusHistory: [{
        status: 'pending',
        date: new Date()
      }],
      stripeStatusHistory: [{
        status: pi.status,
        event: pi.status === 'requires_capture' ? 'payment_intent.confirmed' : 'payment_intent.invalid'
      }],

      poidsTotalKg,
      volumeTotalM3,
      poidsFacture: poidsFactureVal,
      distanceKm: distanceKmVal,
      estimatedDelayMinutes,
      estimatedDelayFormatted,
      estimatedDeliveryAt: new Date(Date.now() + estimatedDelayMinutes * 60 * 1000),
      vehiculeRecommande: vehiculeRecommande || 'N/A',

      codeVerificationClient: crypto.randomUUID().slice(0, 4).toUpperCase(),

      stripeAuthorizedAmount: pi.amount,
      stripeCreatedAt: new Date(pi.created * 1000),
    });

    console.log("✅ Commande prête à être sauvegardée :", {
      orderNumber,
      boutique: boutiqueId,
      produits: parsedProduits.length,
      totalPrice
    });
    await order.save();
    res.status(201).json({ orderId: order._id });

  } catch (err) {
    console.error('❌ Erreur création commande après confirmation :', err.message, err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ======================= Export ========================= //

export {
  getStripeStatusHandler,
  createStripeAccountHandler,
  onboardStripeAccountHandler,
  manageStripeAccountHandler,
  createMultiPaymentIntentsHandler,
  confirmMultipleIntentsHandler,
  createOrderAfterConfirmation
};

function formatDelay(minutes) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}min`;
  }
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  return h === 0 ? `${d}j` : `${d}j ${h}h`;
}