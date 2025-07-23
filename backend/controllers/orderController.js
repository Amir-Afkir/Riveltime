// orderController.js
import haversine from 'haversine-distance'; 

import Order from '../models/Order.js';
import { getUserOrders, assignDelivererToOrder } from '../services/orderService.js';
import { buildEstimationInput, processEstimate, processSimpleEstimate } from '../utils/estimationPipeline.js';
import { serverError } from '../utils/responseHelpers.js';
import { isPointOnSegment, isDirectionConsistent } from '../utils/geoUtils.js';
import { geocodeAdresse } from '../utils/geocodeAdresse.js';

async function simpleDistanceEstimate(req, res) {
  try {
    const { boutiqueLocation, deliveryLocation } = req.body;

    if (!boutiqueLocation || !deliveryLocation) {
      return res.status(400).json({ message: "Coordonnées manquantes." });
    }

    const estimation = await processSimpleEstimate({ boutiqueLocation, deliveryLocation });

    return res.json(estimation);
  } catch (err) {
    serverError(res, "Erreur estimation simple distance", err);
  }
}

async function estimateDelivery(req, res) {
  try {
    const user = req.dbUser;
    const { cart } = req.body;

    if (!cart?.length || typeof user?.infosClient?.latitude !== 'number' || typeof user?.infosClient?.longitude !== 'number') {
      return res.status(400).json({ message: 'Panier ou coordonnées invalides.' });
    }

    const estimationInputs = await buildEstimationInput({ cart, user });

    const createResult = (input, estimation) => ({
      boutiqueId: input.boutiqueId,
      boutique: input.boutique,
      livraison: estimation.deliveryFee,
      participation: estimation.participation,
      vehicule: estimation.vehiculeRecommande,
      distanceKm: estimation.distanceKm,
      estimatedDelay: estimation.estimatedDelay,
      totalProduits: input.totalProduits
    });

    const results = await Promise.all(estimationInputs.map(async input => {
      const estimation = await processEstimate(input);
      return createResult(input, estimation);
    }));

    const participationsParBoutique = {};
    const fraisParBoutique = {};
    const vehiculesRecommandes = {};
    const distancesParBoutique = {};
    const delaisParBoutique = {};
    const totalParBoutique = {};

    results.forEach(r => {
      participationsParBoutique[r.boutiqueId] = r.participation;
      fraisParBoutique[r.boutiqueId] = r.livraison;
      vehiculesRecommandes[r.boutiqueId] = r.vehicule;
      distancesParBoutique[r.boutiqueId] = r.distanceKm;
      delaisParBoutique[r.boutiqueId] = r.estimatedDelay;
      totalParBoutique[r.boutiqueId] = Number((r.totalProduits + r.livraison).toFixed(2));
    });

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

async function getOrdersByUser(req, res) {
  try {
    const userId = req.dbUser?._id;
    const orders = await getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    serverError(res, 'Erreur récupération commandes utilisateur', err);
  }
}

/**
 * Récupérer les commandes en attente visibles par livreurs,
 * avec filtres géographiques "autour" ou "itinéraire".
 * Filtre itinéraire :
 * - boutique sur segment départ→arrivée (tolérance rayonKm)
 * - direction boutique→client cohérente avec départ→arrivée (angle max 45°)
 */

function isCoordValid(coord) {
  return coord && typeof coord.latitude === 'number' && typeof coord.longitude === 'number';
}
async function getPendingOrdersForLivreur(req, res) {
  try {
    const {
      filterType,
      rayon,
      lat, lon,
      latDepart, lonDepart,
      latArrivee, lonArrivee
    } = req.query;

    const rayonKm = rayon !== undefined ? parseFloat(rayon) : null;
    if (rayon !== undefined && (isNaN(rayonKm) || rayonKm <= 0)) {
      return res.status(400).json({ message: "Rayon invalide" });
    }

    const parseCoord = v => v !== undefined ? parseFloat(v) : null;
    const autourCoords = { latitude: parseCoord(lat), longitude: parseCoord(lon) };
    const departCoords = { latitude: parseCoord(latDepart), longitude: parseCoord(lonDepart) };
    const arriveeCoords = { latitude: parseCoord(latArrivee), longitude: parseCoord(lonArrivee) };

    const allOrders = await Order.find({ status: 'pending', deliverer: null }).populate('client boutique');

    if (
      (filterType === 'autour' && !isCoordValid(autourCoords)) ||
      (filterType === 'itineraire' && (!isCoordValid(departCoords) || !isCoordValid(arriveeCoords))) ||
      !filterType
    ) {
      return res.json(allOrders);
    }

    const ordersFiltrees = allOrders.filter(order => {
      if (!order.boutiqueLocation || !order.deliveryLocation) return false;

      const boutiqueCoords = { latitude: order.boutiqueLocation.lat, longitude: order.boutiqueLocation.lng };
      const clientCoords = { latitude: order.deliveryLocation.lat, longitude: order.deliveryLocation.lng };

      if (filterType === 'autour') {
        const distBoutique = haversine(autourCoords, boutiqueCoords) / 1000;
        const distClient = haversine(autourCoords, clientCoords) / 1000;
        return distBoutique <= rayonKm && distClient <= rayonKm;
      } else if (filterType === 'itineraire') {
        // Boutique sur segment départ→arrivée (tolérance rayonKm)
        if (!isPointOnSegment(boutiqueCoords, departCoords, arriveeCoords, rayonKm)) return false;

        // Trajet boutique→client cohérent avec départ→arrivée (angle max 45°)
        if (!isDirectionConsistent(boutiqueCoords, clientCoords, departCoords, arriveeCoords)) return false;

        return true;
      }

      return true;
    });

    res.json(ordersFiltrees);
  } catch (err) {
    console.error("Erreur dans /orders/livreur/pending :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
}

async function acceptDelivery(req, res) {
  try {
    const user = req.dbUser;
    if (user.role !== 'livreur') 
      return res.status(403).json({ error: 'Accès réservé aux livreurs' });

    // Utilise 'id' ici car c'est ce qui est défini dans la route
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) 
      return res.status(404).json({ error: 'Commande introuvable' });

    if (order.status !== 'pending') 
      return res.status(400).json({ error: 'Commande déjà prise' });

    // Assignation du livreur et mise à jour du statut
    order.status = 'accepted';
    order.livreurId = user._id;                   
    order.livreurStripeId = user.infosLivreur?.stripeAccountId || null;
    order.deliveryStatusHistory.push({ status: 'accepted', date: new Date() });

    await order.save();

    res.json({ message: 'Commande acceptée par le livreur.', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export {
  simpleDistanceEstimate,
  estimateDelivery,
  getOrdersByUser,
  getPendingOrdersForLivreur,
  acceptDelivery
};