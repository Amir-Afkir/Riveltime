const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Estimer les frais de livraison
router.post('/estimate', orderController.estimateDelivery);

// Créer une commande
router.post('/', orderController.createOrder);

// Récupérer les commandes de l'utilisateur
router.get('/', orderController.getOrdersByUser);

// Mettre à jour le statut d'une commande
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;