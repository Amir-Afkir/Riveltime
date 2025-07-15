const Product = require('../models/Product');
const { recommanderVehicule } = require('../utils/vehicule');

exports.estimateDelivery = async (req, res) => {
  try {
    const { items, deliveryLocation, boutiqueLocation, horaire = [], vehicule = 'velo' } = req.body;

    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Articles manquants.' });
    if (!deliveryLocation || !boutiqueLocation) return res.status(400).json({ error: 'Coordonnées manquantes.' });

    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    let poidsKg = 0, volumeM3 = 0;
    for (const item of items) {
      const prod = products.find(p => p._id.toString() === item.product);
      if (prod) {
        poidsKg += prod.poids_kg * item.quantity;
        volumeM3 += prod.volume_m3 * item.quantity;
      }
    }

    const poidsFacture = Math.max(poidsKg, volumeM3 * 250);

    const toRad = deg => deg * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(deliveryLocation.lat - boutiqueLocation.lat);
    const dLon = toRad(deliveryLocation.lng - boutiqueLocation.lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(boutiqueLocation.lat)) * Math.cos(toRad(deliveryLocation.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;

    const PRIX_MIN = 4.5;
    const BASE = 2;
    const TARIF_PAR_KG = 0.25;
    const TARIF_PAR_KM = 0.5;
    const MAJ_HORAIRE = {
      pointe: 2,
      nuit: 2.5,
      weekend: 1.5
    };
    const MAJ_VEHICULE = {
      velo: 0,
      scooter: 1.5,
      voiture: 2.5,
      camionnette: 5
    };

    let majHoraire = 0;
    horaire.forEach(type => majHoraire += MAJ_HORAIRE[type] || 0);

    const vehiculeRecommande = recommanderVehicule({
      poids_kg: poidsKg,
      volume_m3: volumeM3,
      distance_km: distanceKm
    });
    const majVehicule = MAJ_VEHICULE[vehiculeRecommande] || 0;

    const brut = BASE + (poidsFacture * TARIF_PAR_KG) + (distanceKm * TARIF_PAR_KM) + majHoraire + majVehicule;
    const deliveryFee = Math.max(PRIX_MIN, brut);

    res.json({ deliveryFee, poidsKg, volumeM3, poidsFacture, distanceKm, vehiculeRecommande });
  } catch (err) {
    console.error('❌ Erreur estimation livraison :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const Order = require('../models/Order');

const VALID_STATUSES = ['en attente', 'en préparation', 'expédiée', 'livrée', 'annulée'];

exports.createOrder = async (req, res) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) return res.status(401).json({ error: 'Utilisateur non authentifié.' });

    const { items, boutique, deliverer, deliveryAddress, deliveryLocation, horaire = [] } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Les articles sont requis.' });
    }
    if (!boutique || !deliveryAddress || !deliveryLocation) {
      return res.status(400).json({ error: 'Informations de livraison incomplètes.' });
    }

    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    let productTotal = 0;
    let poidsKg = 0, volumeM3 = 0;
    for (const item of items) {
      const prod = products.find(p => p._id.toString() === item.product);
      if (prod) {
        productTotal += prod.price * item.quantity;
        poidsKg += prod.poids_kg * item.quantity;
        volumeM3 += prod.volume_m3 * item.quantity;
      }
    }

    const poidsFacture = Math.max(poidsKg, volumeM3 * 250);

    const boutiqueDoc = await require('../models/Boutique').findById(boutique);
    const loc1 = boutiqueDoc.location?.coordinates;
    const loc2 = [deliveryLocation.lng, deliveryLocation.lat];
    const toRad = deg => deg * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(loc2[1] - loc1[1]);
    const dLon = toRad(loc2[0] - loc1[0]);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(loc1[1])) * Math.cos(toRad(loc2[1])) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;

    const PRIX_MIN = 4.5;
    const BASE = 2;
    const TARIF_PAR_KG = 0.25;
    const TARIF_PAR_KM = 0.5;
    const MAJ_HORAIRE = { pointe: 3, nuit: 5, weekend: 2 };
    const MAJ_VEHICULE = {
      velo: 0,
      scooter: 1.5,
      voiture: 2.5,
      camionnette: 5
    };

    let majHoraire = 0;
    horaire.forEach(type => majHoraire += MAJ_HORAIRE[type] || 0);

    const vehiculeRecommande = recommanderVehicule({
      poids_kg: poidsKg,
      volume_m3: volumeM3,
      distance_km: distanceKm
    });
    const majVehicule = MAJ_VEHICULE[vehiculeRecommande] || 0;

    const brut = BASE + (poidsFacture * TARIF_PAR_KG) + (distanceKm * TARIF_PAR_KM) + majHoraire + majVehicule;
    const deliveryFee = Math.max(PRIX_MIN, brut);
    const totalPrice = productTotal + deliveryFee;

    const order = new Order({
      client: clientId,
      boutique,
      deliverer,
      items,
      deliveryAddress,
      deliveryLocation,
      deliveryFee,
      totalPrice,
      status: 'en attente',
      vehiculeRecommande,
    });

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
      .populate('boutique deliverer items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Statut invalide. Doit être l’un de : ${VALID_STATUSES.join(', ')}` });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' });

    const userId = req.user?.id;
    // Autorisé si propriétaire boutique ou livreur
    if (
      order.boutique?.toString() !== userId &&
      order.deliverer?.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Non autorisé à modifier cette commande.' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};