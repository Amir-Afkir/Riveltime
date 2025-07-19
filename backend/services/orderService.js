const Order = require('../models/Order');
const Product = require('../models/Product');
const Boutique = require('../models/Boutique');
const groupCartByBoutique = require('../utils/groupCartByBoutique');

const {
  calculerPoidsFacture,
  calculerFraisLivraison,
  calculerParticipation,
  recommanderVehicule,
} = require('../utils/logistique');

/**
 * Crée une nouvelle commande à partir des données client et produit
 * @param {Object} data - Données de la commande
 * @param {Object} user - Utilisateur connecté
 * @returns {Promise<Object>} commande créée
 */
exports.processOrderCreation = async (data, user) => {
  const { produits, infosClient, livraison, totalProduits } = data;

  // Étape 1 : récupérer les produits et regrouper par boutique
  const productIds = produits.map(p => p.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const groupedCart = groupCartByBoutique(produits);

  const ordersParBoutique = [];

  // Étape 2 : traiter chaque boutique séparément
  for (const boutiqueId of Object.keys(groupedCart)) {
    const boutique = await Boutique.findById(boutiqueId);
    if (!boutique) throw new Error("Boutique introuvable");

    const items = groupedCart[boutiqueId];

    // Calcul poids, volume et total produits
    let poidsKg = 0, volumeM3 = 0, produitTotal = 0;

    for (const item of items) {
      const prod = products.find(p => p._id.toString() === item.product);
      if (!prod || prod.prix !== item.prix) {
        throw new Error("Produit invalide ou modifié");
      }

      poidsKg += prod.poids_kg * item.quantite;
      volumeM3 += prod.volume_m3 * item.quantite;
      produitTotal += prod.prix * item.quantite;
    }

    // Estimation véhicule & frais de livraison
    const vehicule = recommanderVehicule({
      poids_kg: poidsKg,
      volume_m3: volumeM3,
      distance_km: livraison.distance
    });

    const deliveryFee = calculerFraisLivraison({
      poidsKg,
      volumeM3,
      distanceKm: livraison.distance,
      horaire: horaire,
      vehicule
    });

    // Calcul participation (si activée)
    let participation = 0;
    let finalDeliveryFee = deliveryFee;

    if (boutique.activerParticipation) {
      const participationPourcent = boutique.participationPourcent ?? 50;
      const contributionPourcent = boutique.contributionLivraisonPourcent ?? 20;

      participation = calculerParticipation(
        deliveryFee,
        produitTotal,
        participationPourcent,
        contributionPourcent
      );

      finalDeliveryFee = deliveryFee - participation;
    }

    // Ajouter la sous-commande
    ordersParBoutique.push({
      boutique: boutique._id,
      produits: items,
      vehicule,
      fraisLivraison: finalDeliveryFee,
      participation,
      statut: "en_attente"
    });
  }

  // Étape 3 : sauvegarder la commande complète
  const newOrder = new Order({
    client: user.id,
    infosClient,
    livraison,
    totalProduits,
    ordersParBoutique
  });

  await newOrder.save();
  return newOrder;
};

/**
 * Récupère les commandes d'un utilisateur donné
 * @param {String} userId
 * @returns {Promise<Array>}
 */
exports.getUserOrders = async (userId) => {
  return Order.find({ client: userId })
    .populate('ordersParBoutique.boutique')
    .sort({ createdAt: -1 });
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