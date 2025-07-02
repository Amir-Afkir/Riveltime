const Order = require('../models/Order');

const VALID_STATUSES = ['en attente', 'en préparation', 'expédiée', 'livrée', 'annulée'];

exports.createOrder = async (req, res) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) return res.status(401).json({ error: 'Utilisateur non authentifié.' });

    const { items, boutique, deliverer, totalPrice } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Les articles sont requis.' });
    }
    if (!boutique) return res.status(400).json({ error: 'Boutique requise.' });

    const order = new Order({
      client: clientId,
      boutique,
      deliverer,
      items,
      totalPrice,
      status: 'en attente',
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const orders = await Order.find({ client: userId })
      .populate('boutique deliverer items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Statut invalide. Doit être l’un de : ${VALID_STATUSES.join(', ')}` });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' });

    const userId = req.user?.id;
    // Autorisé si propriétaire boutique ou livreur
    if (
      order.boutique?.toString() !== userId &&
      order.deliverer?.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Non autorisé à modifier cette commande.' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};