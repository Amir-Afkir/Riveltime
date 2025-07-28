import stripe from '../utils/stripeClient.js';
import { createExpressAccount, generateOnboardingLink } from '../services/stripeAccounts.js';

import crypto from 'crypto';
import Stripe from 'stripe';
const stripeLib = new Stripe(process.env.STRIPE_SECRET_KEY);

import { buildEstimationInput, processEstimate, calculerMontantsCommande } from '../utils/estimationPipeline.js';

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


// Handler pour créer plusieurs PaymentIntents (un par boutique)
const createMultiPaymentIntentsHandler = async (req, res) => {
  try {
    const { cart } = req.body;
    const user = req.dbUser;

    if (!cart?.length || !user?.infosClient?.latitude || !user?.infosClient?.longitude) {
      return res.status(400).json({ message: "Panier ou coordonnées invalides." });
    }

    const groupedEstimations = await buildEstimationInput({ cart, user });
    const createdIntents = [];

    for (const input of groupedEstimations) {
      const estimation = await processEstimate(input);
      const {
        boutiqueId,
        totalProduits,
        items,
        vendeurStripeId
      } = input;

      const boutique = await Boutique.findById(boutiqueId).populate('owner');
      if (!boutique || !vendeurStripeId) {
        return res.status(400).json({ message: "Boutique ou compte vendeur introuvable." });
      }

      // ❗ À remplacer par un vrai assignateur de livreur
      const livreur = await User.findOne({ role: 'livreur' }).sort({ createdAt: -1 });
      const livreurStripeId = livreur?.infosLivreur?.stripeAccountId || null;

      const livraison = estimation.deliveryFee;
      const participation = estimation.participation;

      const {
        commissionGlobale,
        commissionVendeur,
        commissionLivreur,
        montantVendeur,
        montantLivreur
      } = calculerMontantsCommande({
        produitsTotal: totalProduits,
        livraison,
        participation
      });

      // Sécurité : vérification des montants
      if ([montantVendeur, montantLivreur, commissionVendeur, commissionLivreur].some(x => typeof x !== 'number' || isNaN(x))) {
        console.error("❌ Montant invalide détecté :", {
          montantVendeur, montantLivreur, commissionVendeur, commissionLivreur
        });
        return res.status(500).json({ message: "Montant invalide détecté." });
      }

      const transferGroup = `order_${Date.now()}_${boutiqueId}`;
      const totalAmount = montantVendeur + montantLivreur + commissionVendeur + commissionLivreur;

      const formatDelay = (minutes) =>
        minutes < 60 ? `${minutes} min`
        : minutes < 1440 ? `${Math.floor(minutes / 60)}h ${minutes % 60 || ''}min`
        : `${Math.floor(minutes / 1440)}j ${Math.floor((minutes % 1440) / 60)}h`;

      // ✅ Création du PaymentIntent dans le compte plateforme
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount), // déjà en centimes
        currency: 'eur',
        capture_method: 'manual',
        confirm: false,
        transfer_group: transferGroup,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        metadata: {
          boutiqueId,
          clientId: user._id.toString(),
          vendeurStripeId,
          livreurStripeId: livreurStripeId || 'pending',
          montantVendeur: montantVendeur.toString(),
          montantLivreur: montantLivreur.toString(),
          commissionVendeur: commissionVendeur.toString(),
          commissionLivreur: commissionLivreur.toString(),
          produits: JSON.stringify(items.map(item => ({
            productId: item.productId || item.product.toString(),
            quantity: item.quantity
          }))),
          produitsTotal: totalProduits.toFixed(2),
          livraison: estimation.deliveryFee.toFixed(2),
          participation: estimation.participation.toFixed(2),
          deliveryLocation: JSON.stringify({
            lat: user.infosClient.latitude,
            lng: user.infosClient.longitude
          }),
          vehiculeRecommande: estimation.vehiculeRecommande || 'N/A',
          poidsFacture: estimation.poidsFacture.toFixed(2),
          poidsKg: estimation.poidsKg.toFixed(2),
          volumeM3: estimation.volumeM3.toFixed(3),
          distanceKm: estimation.distanceKm.toFixed(1),
          estimatedDelay: estimation.estimatedDelay.toString(),
          estimatedDelayFormatted: formatDelay(estimation.estimatedDelay),
          transferGroup
        }, 
      });

      createdIntents.push({
        boutiqueId,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        vendeurStripeId,
        livreurStripeId,
        transferGroup,
        montantVendeur,
        montantLivreur
      });
    }

    return res.status(200).json({ paymentIntents: createdIntents });
  } catch (error) {
    console.error("❌ Erreur dans createMultiPaymentIntentsHandler :", error);
    return res.status(500).json({ message: "Erreur lors de la création des paiements." });
  }
};

// ======================= Commande après confirmation ========================= //


// Version optimisée de createOrderAfterConfirmation
const createOrderAfterConfirmation = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const user = req.dbUser;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'paymentIntentId requis.' });
    }

    // Récupérer le PaymentIntent Stripe
    const pi = await stripeLib.paymentIntents.retrieve(paymentIntentId);
    console.log("🔍 Tentative création commande pour PaymentIntent :", paymentIntentId);
    if (!pi) {
      return res.status(404).json({ message: "PaymentIntent introuvable." });
    }
    if (pi.status !== 'requires_capture') {
      return res.status(400).json({ message: `Le paiement n'est pas confirmé (statut = ${pi.status})` });
    }
    if (pi.metadata.clientId !== user._id.toString()) {
      console.warn("⚠️ Mismatch user/paymentIntent :",
        "\npi.metadata.clientId =", pi.metadata.clientId,
        "\nuser._id =", user._id.toString()
      );
      return res.status(403).json({ message: 'Tentative de fraude détectée.' });
    }

    // Extraction et parsing robustes des metadata
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

    // Vérification existence boutique & vendeur
    const boutique = await Boutique.findById(boutiqueId).lean();
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    const vendeur = await User.findById(boutique.owner).lean();
    if (!vendeur) return res.status(404).json({ message: 'Vendeur introuvable.' });

    // Parsing JSON robuste des produits et de la localisation
    const parsedProduits = tryParseJSON(produits);
    if (!Array.isArray(parsedProduits) || !parsedProduits.length) {
      return res.status(400).json({ message: "Produits invalides dans metadata Stripe." });
    }
    const parsedLocation = tryParseJSON(deliveryLocation);
    if (!parsedLocation || typeof parsedLocation.lat !== "number" || typeof parsedLocation.lng !== "number") {
      return res.status(400).json({ message: "Coordonnées de livraison invalides." });
    }

    // Validation existence produits
    const produitsExist = await validateAllProductsExist(parsedProduits);
    if (!produitsExist.ok) {
      return res.status(400).json({ message: produitsExist.message });
    }

    // Format items pour la commande
    const items = parsedProduits.map(({ productId, quantity }) => ({
      product: productId,
      quantity
    }));

    // Calculs des montants et commissions
    const poidsTotalKg = parseFloat(poidsKg);
    const volumeTotalM3 = parseFloat(volumeM3);
    const poidsFactureVal = parseFloat(poidsFacture);
    const distanceKmVal = parseFloat(distanceKm);
    const estimatedDelayMinutes = parseInt(estimatedDelay, 10);
    const estimatedDelayFormatted = formatDelay(estimatedDelayMinutes);
    const shortId = crypto.randomUUID().slice(0, 6).toUpperCase();
    const orderNumber = `CMD-${shortId}`;
    const clientAvatarUrl = user.avatarUrl || null;
    const {
      totalPrice,
      totalLivraison,
      commissionGlobale,
      commissionVendeur,
      commissionLivreur,
      montantVendeur,
      montantLivreur,
    } = calculerMontantsCommande({
      produitsTotal: parseFloat(produitsTotal),
      livraison: parseFloat(livraison),
      participation: parseFloat(participation),
    });

    // Création de la commande
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
      commissionGlobale,
      commissionVendeur,
      commissionLivreur,
      montantVendeur,
      montantLivreur,
      stripeAuthorizedAmount: pi.amount,
      stripeCreatedAt: new Date(pi.created * 1000),
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
      boutiqueCoverUrl: boutique.coverImageUrl || null,
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

// Helpers
function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

async function validateAllProductsExist(produits) {
  if (!Array.isArray(produits) || !produits.length) {
    return { ok: false, message: "Liste de produits vide." };
  }
  const ids = produits.map(p => p.productId);
  const found = await Product.find({ _id: { $in: ids } }).lean();
  if (found.length !== ids.length) {
    // Trouver l'id manquant
    const foundIds = found.map(p => p._id.toString());
    const missing = ids.find(id => !foundIds.includes(id));
    return { ok: false, message: `Produit introuvable : ${missing}` };
  }
  return { ok: true };
}

function formatDelay(minutes) {
  if (typeof minutes !== "number" || isNaN(minutes)) return "";
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

// ======================= Export ========================= //

export {
  getStripeStatusHandler,
  createStripeAccountHandler,
  onboardStripeAccountHandler,
  manageStripeAccountHandler,
  createMultiPaymentIntentsHandler,
  createOrderAfterConfirmation
};