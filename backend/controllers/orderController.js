const { serverError } = require('../utils/responseHelpers');
const {
  validateEstimateInput,
  validateOrderInput,
  validateStatus
} = require('../utils/validation');

const { processEstimate } = require('../services/livraison');
const {
  processOrderCreation,
  getUserOrders,
  updateOrderStatusLogic,
  assignDelivererToOrder
} = require('../services/orderService');


/**
 * Utilitaire pour gérer les erreurs de validation
 */
function handleValidation(validationFn, reqBody, res) {
  const error = validationFn(reqBody);
  if (error) {
    res.status(400).json({ error });
    return false;
  }
  return true;
}

/**
 * Estimer les frais de livraison
 */
const Product = require('../models/Product');

exports.estimateDelivery = async (req, res) => {
  try {
    const user = req.dbUser;

    if (typeof user?.infosClient?.latitude !== 'number' || typeof user?.infosClient?.longitude !== 'number') {
      return res.status(400).json({ message: "Coordonnées de livraison manquantes. Veuillez compléter votre adresse." });
    }

    const { cart } = req.body;

    if (!cart?.length) {
      return res.status(400).json({ message: 'Panier vide ou invalide.' });
    }

    const productIds = cart.map(item => item.productId);
    const productsFromDb = await Product.find({ _id: { $in: productIds } }).populate('boutique');

    const groupedByBoutique = {};

    for (const item of cart) {
      const produitDb = productsFromDb.find(p => p._id.toString() === item.productId);
      if (!produitDb) {
        return res.status(400).json({ message: `Produit invalide : ${item.productId}` });
      }

      const boutique = produitDb.boutique;
      const boutiqueId = boutique._id.toString();

      if (!groupedByBoutique[boutiqueId]) {
        groupedByBoutique[boutiqueId] = {
          boutique,
          produits: [],
        };
      }

      groupedByBoutique[boutiqueId].produits.push({
        productId: produitDb._id,
        nom: produitDb.name,
        prix: produitDb.price,
        quantity: item.quantity,
        poids_kg: produitDb.poids_kg,
        volume_m3: produitDb.volume_m3
      });

      groupedByBoutique[boutiqueId].totalProduits = (groupedByBoutique[boutiqueId].totalProduits || 0) + (produitDb.price * item.quantity);
    }

    const participationsParBoutique = {};
    const fraisParBoutique = {};
    const vehiculesRecommandes = {};
    const distancesParBoutique = {};
    const delaisParBoutique = {};

    for (const [_, data] of Object.entries(groupedByBoutique)) {
      const items = data.produits.map(p => ({
        product: p.productId,
        quantity: p.quantity,
        poids_kg: p.poids_kg,
        volume_m3: p.volume_m3,
      }));

      const totalProduits = data.totalProduits || 0;
      const coords = data.boutique.location?.coordinates;
      const boutiqueLocation = (Array.isArray(coords) && coords.length === 2)
        ? { lat: coords[1], lng: coords[0] }
        : { lat: 0, lng: 0 };

      const {
        activerParticipation,
        participationPourcent,
        contributionLivraisonPourcent
      } = data.boutique;

      const horaire = (() => {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const slots = [];
        if (hour >= 18 && hour <= 20) slots.push("pointe");
        if (hour >= 22 || hour < 6) slots.push("nuit");
        if (day === 0 || day === 6) slots.push("weekend");
        return slots;
      })();

      const estimation = await processEstimate({
        items,
        boutiqueId: data.boutique._id,
        deliveryLocation: {
          lat: user.infosClient.latitude,
          lng: user.infosClient.longitude,
        },
        boutiqueLocation,
        horaire,
        vehicule: 'velo',
        totalProduits,
        activerParticipation,
        participationPourcent,
        contributionLivraisonPourcent
      });

      data.livraison = estimation.deliveryFee;
      data.participation = estimation.participation;

      participationsParBoutique[data.boutique._id.toString()] = estimation.participation;
      fraisParBoutique[data.boutique._id.toString()] = estimation.deliveryFee;
      vehiculesRecommandes[data.boutique._id.toString()] = estimation.vehiculeRecommande;
      distancesParBoutique[data.boutique._id.toString()] = estimation.distanceKm;
      delaisParBoutique[data.boutique._id.toString()] = estimation.estimatedDelay;
    }

    // Calcul du total payé par le client pour chaque boutique (livraison ajoutée une seule fois par boutique)
    const totalParBoutique = {};

    for (const [boutiqueId, data] of Object.entries(groupedByBoutique)) {
      const totalProduits = data.produits.reduce((acc, p) => acc + (p.prix * p.quantity), 0);
      totalParBoutique[boutiqueId] = Number((totalProduits + data.livraison).toFixed(2));
    }

    const totalFinal = Object.values(totalParBoutique).reduce((acc, val) => acc + val, 0);

    res.json({
      participationsParBoutique,
      fraisParBoutique,
      vehiculesRecommandes,
      distancesParBoutique, // 👈
      delaisParBoutique,    // 👈
      totalParBoutique,
      totalFinal: Number(totalFinal.toFixed(2)),
    });
  } catch (err) {
    serverError(res, 'Erreur estimation livraison', err);
  }
};

/**
 * Créer une commande
 */
exports.createOrder = async (req, res) => {
  try {
    if (!handleValidation(validateOrderInput, req.body, res)) return;

    const result = await processOrderCreation(req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    serverError(res, 'Erreur création de commande', err);
  }
};

/**
 * Récupérer les commandes d’un utilisateur
 */
exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const orders = await getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    serverError(res, 'Erreur récupération commandes utilisateur', err);
  }
};

/**
 * Mettre à jour le statut d’une commande
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validateStatus(status)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }

    const updatedOrder = await updateOrderStatusLogic(id, status, req.user?.id);
    res.json(updatedOrder);
  } catch (err) {
    serverError(res, 'Erreur mise à jour statut commande', err);
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