import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/orderController.js';

// Récupérer les commandes de l'utilisateur
router.get('/me', orderController.getOrdersByUser);

// Rendre visible les commandes pour chaque livreur
router.get('/livreur/pending', orderController.getPendingOrdersForLivreur);

// Estimer la distances et le temps de livraison
router.post('/estimation-simple', orderController.simpleDistanceEstimate);

// Estimer les frais de livraison
router.post('/estimate', orderController.estimateDelivery);

// Assigner un livreur à une commande
router.post('/:id/accept-delivery', orderController.acceptDelivery);

export default router;