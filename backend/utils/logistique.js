/**
 * Calcule le poids facturé en fonction du poids réel et du volume
 * @param {number} poidsKg
 * @param {number} volumeM3
 * @returns {number}
 */
const calculerPoidsFacture = (poidsKg, volumeM3) =>
  Math.max(poidsKg, volumeM3 * 250);

/**
 * Recommande un type de véhicule en fonction du poids facturé et de la distance
 * @param {{
 *   poidsKg: number,
 *   volumeM3: number,
 *   distanceKm: number
 * }} params
 * @returns {"velo" | "scooter" | "voiture" | "camionnette"}
 */
const recommanderVehicule = ({ poidsKg = 0, volumeM3 = 0, distanceKm = 0 }) => {
  const poidsFacture = calculerPoidsFacture(poidsKg, volumeM3);

  if (poidsFacture <= 2 && distanceKm <= 5) return "velo";
  if (poidsFacture <= 10 && distanceKm <= 15) return "scooter";
  if (poidsFacture <= 30) return "voiture";
  return "camionnette";
};

/**
 * Calcule les frais de livraison en fonction du poids, volume, distance, horaire, et type de véhicule
 * @param {{
 *   poidsKg: number,
 *   volumeM3: number,
 *   distanceKm: number,
 *   horaire: string[],
 *   vehicule: string
 * }} params
 * @returns {number}
 */
const calculerFraisLivraison = ({
  poidsKg,
  volumeM3,
  distanceKm,
  horaire = [],
  vehicule
}) => {
  const PRIX_MINIMUM = 4.5;
  const BASE_FIXE = 2;
  const TARIF_PAR_KG = 0.25;
  const TARIF_PAR_KM = 0.5;

  const MAJORATION_HORAIRE = {
    pointe: 1,
    nuit: 2,
    weekend: 1,
  };

  const MAJORATION_VEHICULE = {
    velo: 0,
    scooter: 0,
    voiture: 1,
    camionnette: 2,
  };

  const poidsFacture = calculerPoidsFacture(poidsKg, volumeM3);

  const majHoraire = horaire.reduce(
    (acc, type) => acc + (MAJORATION_HORAIRE[type] || 0),
    0
  );

  const majVehicule = MAJORATION_VEHICULE[vehicule] || 0;

  const brut =
    BASE_FIXE +
    poidsFacture * TARIF_PAR_KG +
    distanceKm * TARIF_PAR_KM +
    majHoraire +
    majVehicule;

  return Math.max(PRIX_MINIMUM, brut);
};

/**
 * Calcule la participation de la boutique aux frais de livraison
 * @param {number} fraisLivraison - frais initiaux
 * @param {number} totalProduits - valeur du panier
 * @param {number} pourcent - pourcentage pris en charge
 * @param {number} maxPourcent - plafond en % du panier
 * @returns {number}
 */
const calculerParticipation = (
  fraisLivraison,
  totalProduits,
  pourcent = 50,
  maxPourcent = 20
) => {
  const max = (maxPourcent / 100) * totalProduits;
  return Math.min(fraisLivraison * (pourcent / 100), max);
};

module.exports = {
  calculerPoidsFacture,
  calculerFraisLivraison,
  calculerParticipation,
  recommanderVehicule,
};