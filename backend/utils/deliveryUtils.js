// utils/deliveryUtils.js

const calculerPoidsFacture = (poidsKg, volumeM3) => Math.max(poidsKg, volumeM3 * 250);

const calculateDeliveryFee = ({ poidsKg, volumeM3, distanceKm, horaire, vehicule }) => {
  const PRIX_MIN = 4.5;
  const BASE = 2;
  const TARIF_PAR_KG = 0.25;
  const TARIF_PAR_KM = 0.5;
  const MAJ_HORAIRE = { pointe: 1, nuit: 2, weekend: 1 };   
  const MAJ_VEHICULE = { velo: 0, scooter: 0, voiture: 1, camionnette: 2 };

  const poidsFacture = calculerPoidsFacture(poidsKg, volumeM3);
  const majHoraire = horaire.reduce((sum, type) => sum + (MAJ_HORAIRE[type] || 0), 0);
  const majVehicule = MAJ_VEHICULE[vehicule] || 0;

  const brut = BASE + (poidsFacture * TARIF_PAR_KG) + (distanceKm * TARIF_PAR_KM) + majHoraire + majVehicule;
  return Math.max(PRIX_MIN, brut);
};

const calculateParticipation = (deliveryFee, productTotal, pourcent = 50, maxPourcent = 20) => {
  const max = (maxPourcent / 100) * productTotal;
  return Math.min(deliveryFee * (pourcent / 100), max);
};

module.exports = {
  calculateDeliveryFee,
  calculateParticipation,
  calculerPoidsFacture
};