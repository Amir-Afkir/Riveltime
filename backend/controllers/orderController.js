// orderController.js
import { buildEstimationInput, processEstimate, processSimpleEstimate } from '../utils/estimationPipeline.js';
import { serverError } from '../utils/responseHelpers.js';
import Order from '../models/Order.js';
import { getUserOrders, assignDelivererToOrder } from '../services/orderService.js';
import haversine from 'haversine-distance';
import fetch from 'node-fetch';

/**
 * Estimer la distances et le temps de livraison
 */
async function simpleDistanceEstimate(req, res) {
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
}

/**
 * Devis commande
 */
async function estimateDelivery(req, res) {
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
}

/**
 * Récupérer les commandes d’un utilisateur
 */
async function getOrdersByUser(req, res) {
  try {
    const userId = req.dbUser?._id; // 👈 c’est bien ça qu’il faut

    const orders = await getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    serverError(res, 'Erreur récupération commandes utilisateur', err);
  }
}

/**
 * Rendre visible les commandes pour chaque livreur
 */

import { geocodeAdresse } from '../utils/geocodeAdresse.js';

async function getPendingOrdersForLivreur(req, res) {
  try {
    const { autour, rayon } = req.query;
    const rayonKm = parseFloat(rayon);
    let autourCoords;

    if (autour && autour.length >= 3) {
      try {
        const geo = await geocodeAdresse(autour);
        autourCoords = { latitude: geo.lat, longitude: geo.lon };
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }
    } else if (autour) {
      return res.status(400).json({ message: "Adresse invalide : trop courte" });
    }

    const allOrders = await Order.find({ status: 'pending', deliverer: null })
      .populate('client boutique');

    if (!autourCoords || isNaN(rayonKm)) {
      return res.json(allOrders);
    }

    const ordersFiltrees = allOrders.filter(order => {
      const boutiqueCoords = {
        latitude: order.boutiqueLocation.coordinates[1],
        longitude: order.boutiqueLocation.coordinates[0],
      };
      const clientCoords = {
        latitude: order.deliveryLocation.coordinates[1],
        longitude: order.deliveryLocation.coordinates[0],
      };

      const distBoutique = haversine(autourCoords, boutiqueCoords) / 1000;
      const distClient = haversine(autourCoords, clientCoords) / 1000;

      return distBoutique <= rayonKm || distClient <= rayonKm;
    });

    res.json(ordersFiltrees);
  } catch (err) {
    console.error("Erreur dans /orders/livreur/pending :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
}
/**
 * Assigner un livreur à une commande
 */
async function assignLivreurToOrder(req, res) {
  try {
    const { id } = req.params;
    const updatedOrder = await assignDelivererToOrder(id, req.user?.id);
    res.json(updatedOrder);
  } catch (err) {
    serverError(res, 'Erreur assignation livreur', err);
  }
};

export {
  simpleDistanceEstimate,
  estimateDelivery,
  getOrdersByUser,
  getPendingOrdersForLivreur,
  assignLivreurToOrder
};