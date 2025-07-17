const Product = require('../models/Product');
const Boutique = require('../models/Boutique');
const { recommanderVehicule } = require('../utils/vehicule');
const { calculerPoidsFacture, calculateDeliveryFee, calculateParticipation } = require('../utils/deliveryUtils');

const estimateDelay = (distanceKm, vehicule = "velo") => {
  const vitesses = {
    velo: 15,
    scooter: 30,
    voiture: 40,
    camionnette: 30,
  };
  const vitesse = vitesses[vehicule] || 15;
  const tempsEnMinutes = (distanceKm / vitesse) * 60 + 15; // 15 min de marge (prépa, attente)
  return Math.ceil(tempsEnMinutes);
};

exports.processEstimate = async (data) => {
  const {
    items,
    deliveryLocation,
    boutiqueLocation,
    horaire = [],
    vehicule = 'velo',
    boutiqueId
  } = data;

  const productIds = items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  const productTotal = items.reduce((sum, item) => {
    const prod = products.find(p => p._id.toString() === item.product);
    return prod ? sum + prod.price * item.quantity : sum;
  }, 0);

  let poidsKg = 0, volumeM3 = 0;
  for (const item of items) {
    const prod = products.find(p => p._id.toString() === item.product);
    if (prod) {
      poidsKg += prod.poids_kg * item.quantity;
      volumeM3 += prod.volume_m3 * item.quantity;
    }
  }

  const toRad = deg => deg * Math.PI / 180;
  const R = 6371; // km
  const dLat = toRad(deliveryLocation.lat - boutiqueLocation.lat);
  const dLon = toRad(deliveryLocation.lng - boutiqueLocation.lng);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(boutiqueLocation.lat)) * Math.cos(toRad(deliveryLocation.lat)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;

  const vehiculeRecommande = recommanderVehicule({
    poids_kg: poidsKg,
    volume_m3: volumeM3,
    distance_km: distanceKm
  });

  const deliveryFee = calculateDeliveryFee({ poidsKg, volumeM3, distanceKm, horaire, vehicule: vehiculeRecommande });

  const boutiqueDoc = await Boutique.findById(boutiqueId);
  let finalDeliveryFee = deliveryFee;
  let participation = 0;

  if (boutiqueDoc?.activerParticipation) {
    const participationPourcent = boutiqueDoc.participationPourcent ?? 50;
    const contributionLivraisonPourcent = boutiqueDoc.contributionLivraisonPourcent ?? 20;
    participation = calculateParticipation(deliveryFee, productTotal, participationPourcent, contributionLivraisonPourcent);
    finalDeliveryFee = deliveryFee - participation;
  }

  const estimatedDelay = estimateDelay(distanceKm, vehiculeRecommande);

  return {
    deliveryFee: finalDeliveryFee,
    participation,
    poidsKg,
    volumeM3,
    poidsFacture: calculerPoidsFacture(poidsKg, volumeM3),
    distanceKm,
    vehiculeRecommande,
    estimatedDelay
  };
};
