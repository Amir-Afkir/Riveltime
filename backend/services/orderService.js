import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Boutique from '../models/Boutique.js';

/**
 * Crée une nouvelle commande à partir des données client et produit
 * @param {Object} data - Données de la commande
 * @param {Object} user - Utilisateur connecté
 * @returns {Promise<Object[]>} commandes créées
 */

/**
 * Récupère les commandes d'un utilisateur donné
 * @param {String} userId
 * @returns {Promise<Array>}
 */
export const getUserOrders = async (userId) => {
  const orders = await Order.find({ client: userId })
    .sort({ createdAt: -1 })
    .populate('items.product') // ⬅️ Peuple les produits
    .lean();

  for (const order of orders) {
    // Charger la boutique
    const boutique = await Boutique.findById(order.boutique).lean();
    order.nomBoutique = boutique?.name || "Boutique inconnue";

    // Charger les produits
    const produitsDetails = await Promise.all(
      order.items.map(async (item) => {
        const produit = await Product.findById(item.product).lean();
        return {
          productId: item.product.toString(),
          nomProduit: produit?.name || "Produit inconnu",
          quantite: item.quantity,
          prixUnitaire: produit?.price || 0
        };
      })
    );

    order.produits = produitsDetails;

    // Calculs
    order.totalBoutique = produitsDetails.reduce(
      (acc, p) => acc + (p.prixUnitaire * p.quantite),
      0
    ) + (order.deliveryFee || 0);

    order.participationBoutique = order.participation || 0;

    // 💡 Ici captureStatus est correctement évalué
    const capture = order.captureStatus;

    order.totalFinal = order.totalPrice || 0;
    order.statutPaiement = ['authorized', 'succeeded', 'canceled', 'failed'].includes(capture)
      ? capture
      : 'unknown';

    order.statutLivraison = 'en_attente'; // à adapter selon ton système
  }

  return orders;
};

/**
 * Assigne un livreur à une commande
 * @param {String} orderId
 * @param {String} livreurId
 * @returns {Promise<Object>}
 */
export const assignDelivererToOrder = async (orderId, livreurId) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId },
    {
      $set: {
        livreur: livreurId,
        statut: 'en_cours'
      }
    },
    { new: true }
  );

  if (!order) throw new Error('Commande non trouvée ou déjà assignée');
  return order;
};