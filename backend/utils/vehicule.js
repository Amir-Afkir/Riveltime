// backend/utils/vehicule.js
function recommanderVehicule({ poids_kg = 0, volume_m3 = 0, distance_km = 0 }) {
  const poids_facture = Math.max(poids_kg, volume_m3 * 250);

  if (poids_facture <= 2 && distance_km <= 5) return "velo";
  if (poids_facture <= 10 && distance_km <= 15) return "scooter";
  if (poids_facture <= 30) return "voiture"; 
  return "camionnette";
}

module.exports = { recommanderVehicule };