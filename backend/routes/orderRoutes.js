const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');


// Estimer la distances et le temps de livraison
router.post('/estimation-simple', orderController.simpleDistanceEstimate);

// Estimer les frais de livraison
router.post('/estimate', orderController.estimateDelivery);

// Créer une commande
router.post('/', orderController.createOrder);

// Récupérer les commandes de l'utilisateur
router.get('/me', orderController.getOrdersByUser);

// Mettre à jour le statut d'une commande
router.patch('/:id/status', orderController.updateOrderStatus);

// Assigner un livreur à une commande
router.post('/:id/assign-livreur', orderController.assignLivreurToOrder);

module.exports = router;