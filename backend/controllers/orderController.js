const { validateEstimateInput, validateOrderInput, validateStatus } = require('../utils/validation');
const { processEstimate } = require('../services/livraison');
const { processOrderCreation } = require('../services/orderService');
const { getUserOrders, updateOrderStatusLogic, assignDelivererToOrder } = require('../services/orderService');

exports.estimateDelivery = async (req, res) => {
  try {
    const validationError = validateEstimateInput(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const result = await processEstimate(req.body);
    res.json(result);
  } catch (err) {
    console.error('❌ Erreur estimation livraison :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const validationError = validateOrderInput(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const result = await processOrderCreation(req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Erreur création de commande :', err);
    res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const orders = await getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const isValid = validateStatus(status);
    if (!isValid) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }

    const updatedOrder = await updateOrderStatusLogic(id, status, req.user?.id);
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignLivreurToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await assignDelivererToOrder(id, req.user?.id);
    res.json(updatedOrder);
  } catch (err) {
    console.error('❌ Erreur assignation livreur :', err);
    res.status(500).json({ error: 'Erreur serveur lors de l’assignation du livreur.' });
  }
}; 