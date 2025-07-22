const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Récupérer les commandes de l'utilisateur
router.get('/me', orderController.getOrdersByUser);

// Rendre visible les commandes pour chaque livreur
router.get('/livreur/pending', orderController.getPendingOrdersForLivreur);

// Estimer la distances et le temps de livraison
router.post('/estimation-simple', orderController.simpleDistanceEstimate);

// Estimer les frais de livraison
router.post('/estimate', orderController.estimateDelivery);

// Assigner un livreur à une commande
router.post('/:id/assign-livreur', orderController.assignLivreurToOrder);

module.exports = router;