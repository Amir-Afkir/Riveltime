const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
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
      .populate('seller deliverer items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};