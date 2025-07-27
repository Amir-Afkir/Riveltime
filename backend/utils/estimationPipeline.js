// estimationPipeline.js
// Fusion logique de buildEstimationInput, processEstimate, logistique

import Product from '../models/Product.js';
import Boutique from '../models/Boutique.js';

// --- UTILS LOGISTIQUE ---
const calculerPoidsFacture = (poidsKg, volumeM3) => Math.max(poidsKg, volumeM3 * 250);

const recommanderVehicule = ({ poidsKg = 0, volumeM3 = 0, distanceKm = 0 }) => {
  const poidsFacture = calculerPoidsFacture(poidsKg, volumeM3);
  if (poidsFacture <= 2 && distanceKm <= 5) return "velo";
  if (poidsFacture <= 10 && distanceKm <= 15) return "scooter";
  if (poidsFacture <= 30) return "voiture";
  return "camionnette";
};

const calculerFraisLivraison = ({ poidsKg, volumeM3, distanceKm, horaire = [], vehicule }) => {
  const PRIX_MINIMUM = 4.5;
  const BASE_FIXE = 2;
  const TARIF_PAR_KG = 0.25;
  const TARIF_PAR_KM = 0.5;
  const MAJORATION_HORAIRE = { pointe: 1, nuit: 2, weekend: 1 };
  const MAJORATION_VEHICULE = { velo: 0, scooter: 0, voiture: 1, camionnette: 2 };

  const poidsFacture = calculerPoidsFacture(poidsKg, volumeM3);
  const majHoraire = horaire.reduce((acc, type) => acc + (MAJORATION_HORAIRE[type] || 0), 0);
  const majVehicule = MAJORATION_VEHICULE[vehicule] || 0;

  const brut = BASE_FIXE + poidsFacture * TARIF_PAR_KG + distanceKm * TARIF_PAR_KM + majHoraire + majVehicule;
  return Math.max(PRIX_MINIMUM, brut);
};

const calculerParticipation = (fraisLivraison, totalProduits, pourcent = 50, maxPourcent = 20) => {
  const max = (maxPourcent / 100) * totalProduits;
  return Math.min(fraisLivraison * (pourcent / 100), max);
};

const processSimpleEstimate = async ({ boutiqueLocation, deliveryLocation, vehicule = 'velo' }) => {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371;

  const dLat = toRad(deliveryLocation.lat - boutiqueLocation.lat);
  const dLon = toRad(deliveryLocation.lng - boutiqueLocation.lng);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(boutiqueLocation.lat)) * Math.cos(toRad(deliveryLocation.lat)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  return {
    distanceKm,
    estimatedDelay: estimateDelay(distanceKm, vehicule)
  };
};

const estimateDelay = (distanceKm, vehicule = "velo") => {
  const vitesses = { velo: 15, scooter: 30, voiture: 40, camionnette: 30 };
  const vitesse = vitesses[vehicule] || 15;
  const tempsEnMinutes = (distanceKm / vitesse) * 60 + 15;
  return Math.ceil(tempsEnMinutes);
};

const calcDistanceKm = (from, to) => {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// --- PIPELINE PRINCIPAL ---
const buildEstimationInput = async ({ cart, user, vehicule = 'velo' }) => {
  if (!cart?.length) throw new Error("Panier vide");

  const productIds = cart.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).populate({
    path: 'boutique',
    populate: { path: 'owner' }
  });

  const grouped = {};
  for (const item of cart) {
    const prod = products.find(p => p._id.toString() === item.productId);
    if (!prod) throw new Error(`Produit introuvable : ${item.productId}`);
    const id = prod.boutique._id.toString();

    grouped[id] ||= { boutique: prod.boutique, items: [], totalProduits: 0 };
    grouped[id].items.push({ product: prod._id, quantity: item.quantity, poids_kg: prod.poids_kg, volume_m3: prod.volume_m3 });
    grouped[id].totalProduits += prod.price * item.quantity;
  }

  const horaire = (() => {
    const now = new Date(), h = now.getHours(), d = now.getDay(), slots = [];
    if (h >= 18 && h <= 20) slots.push("pointe");
    if (h >= 22 || h < 6) slots.push("nuit");
    if (d === 0 || d === 6) slots.push("weekend");
    return slots;
  })();

  return Object.entries(grouped).map(([boutiqueId, data]) => {
    const coords = data.boutique.location?.coordinates || [0, 0];
    console.log("🔎 Boutique:", data.boutique.name, "→ vendeurStripeId:", data.boutique.owner?.infosVendeur?.stripeAccountId);
    return {
      boutiqueId,
      boutiqueLocation: { lat: coords[1], lng: coords[0] },
      deliveryLocation: { lat: user.infosClient.latitude, lng: user.infosClient.longitude },
      totalProduits: data.totalProduits,
      items: data.items,
      horaire,
      vehicule,
      activerParticipation: data.boutique.activerParticipation,
      participationPourcent: data.boutique.participationPourcent,
      contributionLivraisonPourcent: data.boutique.contributionPourcent,
      vendeurStripeId: data.boutique.owner?.infosVendeur?.stripeAccountId,
      boutique: data.boutique
    };
  });
};

const processEstimate = async (input) => {
  const { items, deliveryLocation, boutiqueLocation, horaire, vehicule, totalProduits, boutiqueId } = input;
  const products = await Product.find({ _id: { $in: items.map(i => i.product) } });

  let poidsKg = 0, volumeM3 = 0;
  for (const item of items) {
    const prod = products.find(p => p._id.toString() === item.product.toString());
    if (prod) {
      poidsKg += prod.poids_kg * item.quantity;
      volumeM3 += prod.volume_m3 * item.quantity;
    }
  }

  const distanceKm = calcDistanceKm(boutiqueLocation, deliveryLocation);
  const vehiculeRecommande = recommanderVehicule({ poidsKg, volumeM3, distanceKm });
  const deliveryFee = calculerFraisLivraison({ poidsKg, volumeM3, distanceKm, horaire, vehicule: vehiculeRecommande });

  const boutiqueDoc = await Boutique.findById(boutiqueId);
  let finalDeliveryFee = deliveryFee;
  let participation = 0;
  if (boutiqueDoc?.activerParticipation) {
    const pp = boutiqueDoc.participationPourcent ?? 50;
    const cp = boutiqueDoc.contributionLivraisonPourcent ?? 20;
    participation = calculerParticipation(deliveryFee, totalProduits, pp, cp);
    finalDeliveryFee = deliveryFee - participation;
  }

  return {
    deliveryFee: finalDeliveryFee,
    participation,
    poidsKg,
    volumeM3,
    poidsFacture: calculerPoidsFacture(poidsKg, volumeM3),
    distanceKm,
    vehiculeRecommande,
    estimatedDelay: estimateDelay(distanceKm, vehiculeRecommande)
  };
};

//---
const calculerMontantsCommande = ({
  produitsTotal,
  livraison,
  participation,
  tauxCommission = 0.08,
}) => {
  const totalPrice = produitsTotal + livraison;
  const totalLivraison = livraison + participation;
  const netProduits = produitsTotal - participation;

  const commissionGlobale = Math.round(totalPrice * tauxCommission * 100);
  const commissionVendeur = Math.round(netProduits * tauxCommission * 100);
  const commissionLivreur = Math.round(totalLivraison * tauxCommission * 100);

  const montantVendeur = Math.round(netProduits * 100) - commissionVendeur;
  const montantLivreur = Math.round(totalLivraison * 100) - commissionLivreur;

  return {
    totalPrice,
    totalLivraison,
    commissionGlobale,
    commissionVendeur,
    commissionLivreur,
    montantVendeur,
    montantLivreur,
  };
}

export {
  calculerPoidsFacture,
  buildEstimationInput,
  processEstimate,
  processSimpleEstimate,
  calculerMontantsCommande
};
