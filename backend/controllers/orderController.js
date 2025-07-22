// orderController.js
const { buildEstimationInput, processEstimate, processSimpleEstimate } = require('../utils/estimationPipeline');
const { serverError } = require('../utils/responseHelpers');
const Order = require('../models/Order');

const {
  getUserOrders, 
  assignDelivererToOrder
} = require('../services/orderService');

/**
 * Estimer la distances et le temps de livraison
 */
exports.simpleDistanceEstimate = async (req, res) => {
  try {
    const user = req.dbUser;
    const { boutiqueLocation, deliveryLocation } = req.body;

    if (!boutiqueLocation || !deliveryLocation) {
      return res.status(400).json({ message: "Coordonnées manquantes." });
    }

    const estimation = await processSimpleEstimate({
      boutiqueLocation,
      deliveryLocation
    });

    return res.json(estimation);
  } catch (err) {
    serverError(res, "Erreur estimation simple distance", err);
  }
};

/**
 * Devis commande
 */
exports.estimateDelivery = async (req, res) => {
  try {
    const user = req.dbUser;
    const { cart } = req.body;

    if (!cart?.length || typeof user?.infosClient?.latitude !== 'number' || typeof user?.infosClient?.longitude !== 'number') {
      return res.status(400).json({ message: 'Panier ou coordonnées invalides.' });
    }

    const estimationInputs = await buildEstimationInput({ cart, user });

    const results = await Promise.all(estimationInputs.map(async input => {
      const estimation = await processEstimate(input);
      return {
        boutiqueId: input.boutiqueId,
        boutique: input.boutique,
        livraison: estimation.deliveryFee,
        participation: estimation.participation,
        vehicule: estimation.vehiculeRecommande,
        distanceKm: estimation.distanceKm,
        estimatedDelay: estimation.estimatedDelay,
        totalProduits: input.totalProduits
      };
    }));

    const participationsParBoutique = {};
    const fraisParBoutique = {};
    const vehiculesRecommandes = {};
    const distancesParBoutique = {};
    const delaisParBoutique = {};
    const totalParBoutique = {};

    for (const r of results) {
      participationsParBoutique[r.boutiqueId] = r.participation;
      fraisParBoutique[r.boutiqueId] = r.livraison;
      vehiculesRecommandes[r.boutiqueId] = r.vehicule;
      distancesParBoutique[r.boutiqueId] = r.distanceKm;
      delaisParBoutique[r.boutiqueId] = r.estimatedDelay;
      totalParBoutique[r.boutiqueId] = Number((r.totalProduits + r.livraison).toFixed(2));
    }

    const totalFinal = Object.values(totalParBoutique).reduce((sum, val) => sum + val, 0);

    res.json({
      participationsParBoutique,
      fraisParBoutique,
      vehiculesRecommandes,
      distancesParBoutique,
      delaisParBoutique,
      totalParBoutique,
      totalFinal: Number(totalFinal.toFixed(2))
    });

  } catch (err) {
    console.error("❌ Erreur estimation livraison :", err);
    res.status(500).json({ message: "Erreur lors de l'estimation de livraison." });
  }
};

/**
 * Récupérer les commandes d’un utilisateur
 */
exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.dbUser?._id; // 👈 c’est bien ça qu’il faut

    const orders = await getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    serverError(res, 'Erreur récupération commandes utilisateur', err);
  }
};

/**
 * Rendre visible les commandes pour chaque livreur
 */
exports.getPendingOrdersForLivreur = async (req, res) => {
  try {
    const commandes = await Order.find({
      status: 'pending',
      deliverer: null
    }).populate('client boutique');

    res.json(commandes);
  } catch (err) {
    console.error("Erreur dans /orders/livreur/pending :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

/**
 * Assigner un livreur à une commande
 */
exports.assignLivreurToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await assignDelivererToOrder(id, req.user?.id);
    res.json(updatedOrder);
  } catch (err) {
    serverError(res, 'Erreur assignation livreur', err);
  }
};