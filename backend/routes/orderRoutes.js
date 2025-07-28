import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/orderController.js';

// --------------------Client-----------------------------
// Récupérer les commandes de l'utilisateur
router.get('/me', orderController.getOrdersByUser);
// Estimer la distances et le temps de livraison
router.post('/estimation-simple', orderController.simpleDistanceEstimate);
// Estimer les frais de livraison
router.post('/estimate', orderController.estimateDelivery);

// --------------------Livreur-----------------------------
// Rendre visible les commandes pour chaque livreur
router.get('/livreur/pending', orderController.getPendingOrdersForLivreur);
// Assigner un livreur à une commande
router.post('/:id/accept-delivery', orderController.acceptDelivery);
// Rendre visible au livreur une commande assignée 
router.get('/livreur/assigned', orderController.getAssignedOrdersForLivreur);
// Marquer une commande comme on-the-way 
router.put('/:id/mark-on-the-way', orderController.markOrderOnTheWay);
// Marquer une commande comme livrée (avec code de vérification)
router.put('/:id/mark-delivered', orderController.markOrderAsDelivered);

// --------------------Vendeur-----------------------------
// Rendre visible les commandes accepter pour chaque vendeur
//router.get('/boutique/accepted', orderController.getAcceptedOrdersForBoutique);
router.get('/boutique/statut', orderController.getStatutOrdersForBoutique);
// Annuler une commandes accepter par un vendeur
router.put('/:id/preparing', orderController.getPreparingOrdersHandler);
// Annuler une commandes accepter par un vendeur
router.put('/:id/cancel', orderController.cancelOrderHandler);


export default router;