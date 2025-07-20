const Order = require('../models/Order');
const Product = require('../models/Product');
const Boutique = require('../models/Boutique');
const groupCartByBoutique = require('../utils/groupCartByBoutique');

const {
  computeDeliveryForBoutique
} = require('../utils/logistique');

/**
 * Crée une nouvelle commande à partir des données client et produit
 * @param {Object} data - Données de la commande
 * @param {Object} user - Utilisateur connecté
 * @returns {Promise<Object>} commande créée
 */
exports.processOrderCreation = async (data, user) => {
  const { produits } = data;

  if (!produits?.length) {
    throw new Error("Panier vide ou invalide.");
  }

  const infosClient = user?.infosClient;
  const livraison = {
    latitude: infosClient?.latitude,
    longitude: infosClient?.longitude
  };

  const productIds = produits.map(p => p.product);
  const products = await Product.find({ _id: { $in: productIds } });
  console.log("📄 Produits en base:", products.map(p => ({ id: p._id, name: p.name, price: p.price })));

  const groupedCart = groupCartByBoutique(produits);
  console.log("🛒 Produits reçus:", produits);
  console.log("📦 Produits groupés par boutique:", groupedCart);

  const ordersParBoutique = [];

  for (const boutiqueId of Object.keys(groupedCart)) {
    const boutique = await Boutique.findById(boutiqueId);
    console.log("🏪 Boutique trouvée:", boutique?.name || boutiqueId);
    const items = groupedCart[boutiqueId];
    console.log("🧾 Items de cette boutique:", items);

    const result = computeDeliveryForBoutique({
      items,
      products,
      boutique,
      livraison
    });
    console.log("🚚 Détails de livraison pour", boutique.name, ":", result);

    ordersParBoutique.push({
      boutique: boutique._id,
      produitsTotal: result.produitTotal,
      fraisLivraison: result.finalDeliveryFee,
      participation: result.participation,
      items: items.map(i => ({ product: i.product, quantity: i.quantite })),
      vendeurStripeId: boutique.stripeId || 'demo_seller',
      transferGroup: `order-${Date.now()}`
    });
  }

  const totalProduits = produits.reduce((sum, p) => {
    const produit = products.find(pr => pr._id.toString() === p.product);
    return sum + (produit?.price || 0) * p.quantite;
  }, 0);

  const totalLivraison = ordersParBoutique.reduce((sum, o) => sum + o.fraisLivraison, 0);

  const newOrder = new Order({
    client: user.id,
    deliveryAddress: infosClient?.adresse || 'Adresse non spécifiée',
    deliveryLocation: {
      lat: livraison.latitude,
      lng: livraison.longitude
    },
    totalPrice: totalProduits + totalLivraison,
    deliveryFee: totalLivraison,
    items: produits.map(p => ({ product: p.product, quantity: p.quantite })),
    ordersParBoutique
  });

  console.log("✅ Nouvelle commande créée:", newOrder._id);
  await newOrder.save();
  return newOrder;
};
/**
 * Récupère les commandes d'un utilisateur donné
 * @param {String} userId
 * @returns {Promise<Array>}
 */
exports.getUserOrders = async (userId) => {
  const orders = await Order.find({ client: userId }).sort({ createdAt: -1 }).lean();

  for (const order of orders) {
    for (const ob of order.ordersParBoutique) {
      // Charger la boutique
      const boutique = await Boutique.findById(ob.boutique).lean();
      ob.nomBoutique = boutique?.name || "Boutique inconnue";

      // Charger les produits
      const produitsDetails = await Promise.all(
        ob.items.map(async (item) => {
          const produit = await Product.findById(item.product).lean();
          return {
            productId: item.product.toString(),
            nomProduit: produit?.name || "Produit inconnu",
            quantite: item.quantity,
            prixUnitaire: produit?.price || 0
          };
        })
      );

      ob.produits = produitsDetails;

      // Calculs
      ob.totalBoutique = produitsDetails.reduce(
        (acc, p) => acc + (p.prixUnitaire * p.quantite),
        0
      ) + (ob.fraisLivraison || 0);

      ob.participationBoutique = ob.participation || 0;
    }

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
 * Met à jour le statut d'une sous-commande
 * @param {String} orderId - ID de la commande
 * @param {String} status - Nouveau statut
 * @param {String} userId - Utilisateur à l'origine du changement
 * @returns {Promise<Object>} commande mise à jour
 */
exports.updateOrderStatusLogic = async (orderId, status, userId) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, 'ordersParBoutique._id': orderId },
    { $set: { 'ordersParBoutique.$.statut': status } },
    { new: true }
  );

  if (!order) throw new Error('Commande ou sous-commande non trouvée');
  return order;
};

/**
 * Assigne un livreur à une sous-commande
 * @param {String} orderId
 * @param {String} livreurId
 * @returns {Promise<Object>}
 */
exports.assignDelivererToOrder = async (orderId, livreurId) => {
  const order = await Order.findOneAndUpdate(
    { 'ordersParBoutique._id': orderId },
    {
      $set: {
        'ordersParBoutique.$.livreur': livreurId,
        'ordersParBoutique.$.statut': 'en_cours'
      }
    },
    { new: true }
  );

  if (!order) throw new Error('Commande non trouvée ou déjà assignée');
  return order;
};