

const Order = require('../models/Order');
const Product = require('../models/Product');
const Boutique = require('../models/Boutique');
const groupCartByBoutique = require('../utils/groupCartByBoutique');
const { recommanderVehicule } = require('../utils/vehicule');
const { calculateDeliveryFee, calculateParticipation } = require('../utils/deliveryUtils');

exports.processOrderCreation = async (data, user) => {
  const { produits, infosClient, livraison, totalProduits } = data;

  const products = await Product.find({ _id: { $in: produits.map(p => p.product) } });
  const groupedCart = groupCartByBoutique(produits);

  const ordersParBoutique = [];

  for (const boutiqueId of Object.keys(groupedCart)) {
    const boutique = await Boutique.findById(boutiqueId);
    if (!boutique) throw new Error("Boutique introuvable");

    const items = groupedCart[boutiqueId];
    let poidsKg = 0, volumeM3 = 0, produitTotal = 0;

    for (const item of items) {
      const prod = products.find(p => p._id.toString() === item.product);
      if (!prod || prod.prix !== item.prix) throw new Error("Produit invalide ou modifié");

      poidsKg += prod.poids_kg * item.quantite;
      volumeM3 += prod.volume_m3 * item.quantite;
      produitTotal += prod.prix * item.quantite;
    }

    const vehicule = recommanderVehicule({
      poids_kg: poidsKg,
      volume_m3: volumeM3,
      distance_km: livraison.distance
    });

    const deliveryFee = calculateDeliveryFee({
      poidsKg,
      volumeM3,
      distanceKm: livraison.distance,
      horaire: livraison.horaire,
      vehicule
    });

    let participation = 0;
    let finalDeliveryFee = deliveryFee;

    if (boutique.activerParticipation) {
      const participationPourcent = boutique.participationPourcent ?? 50;
      const contributionLivraisonPourcent = boutique.contributionLivraisonPourcent ?? 20;

      participation = calculateParticipation(deliveryFee, produitTotal, participationPourcent, contributionLivraisonPourcent);
      finalDeliveryFee = deliveryFee - participation;
    }

    ordersParBoutique.push({
      boutique: boutique._id,
      produits: items,
      vehicule,
      fraisLivraison: finalDeliveryFee,
      participation,
      statut: "en_attente"
    });
  }

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

exports.getUserOrders = async (userId) => {
  return await Order.find({ client: userId }).populate('ordersParBoutique.boutique').sort({ createdAt: -1 });
};

exports.updateOrderStatusLogic = async (orderId, status, userId) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, 'ordersParBoutique._id': orderId },
    { $set: { 'ordersParBoutique.$.statut': status } },
    { new: true }
  );
  if (!order) throw new Error('Commande ou sous-commande non trouvée');
  return order;
};

exports.assignDelivererToOrder = async (orderId, livreurId) => {
  const order = await Order.findOneAndUpdate(
    { 'ordersParBoutique._id': orderId },
    { $set: { 'ordersParBoutique.$.livreur': livreurId, 'ordersParBoutique.$.statut': 'en_cours' } },
    { new: true }
  );
  if (!order) throw new Error('Commande non trouvée ou déjà assignée');
  return order;
};