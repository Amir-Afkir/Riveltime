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

const { serverError } = require('../utils/responseHelpers');

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
exports.estimateDelivery = async (req, res) => {
  try {
    if (!handleValidation(validateEstimateInput, req.body, res)) return;

    const result = await processEstimate(req.body);
    res.json(result);
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