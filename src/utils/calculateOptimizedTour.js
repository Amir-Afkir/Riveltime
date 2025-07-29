import haversine from "haversine-distance";

/**
 * Calcule une tournée optimisée en fonction de la position actuelle du livreur.
 *
 * @param {Array} commandes - Liste des commandes avec infos de localisation.
 * @param {Array} startingPoint - Coordonnées [lng, lat] de départ du livreur.
 * @returns {Array} Étapes triées : pickup et delivery selon proximité.
 */
function calculerTourneeOptimisee(commandes, startingPoint) {
  const étapes = [];

  for (const commande of commandes) {
    const status = commande.status;
    const boutiqueLoc = commande.boutiqueLocation;
    const deliveryLoc = commande.deliveryLocation;

    if (
      (status === "accepted" || status === "preparing" || status === "on_the_way") &&
      boutiqueLoc?.lat && boutiqueLoc?.lng &&
      deliveryLoc?.lat && deliveryLoc?.lng
    ) {
      if (status === "accepted" || status === "preparing") {
        étapes.push({
          type: "pickup",
          commande,
          lat: boutiqueLoc.lat,
          lon: boutiqueLoc.lng,
        });
      }

      if (status === "on_the_way") {
        étapes.push({
          type: "delivery",
          commande,
          lat: deliveryLoc.lat,
          lon: deliveryLoc.lng,
        });
      }
    }
  }

  if (!startingPoint) return étapes;

  const ordered = [];
  const commandesRecuperees = new Set();
  let currentLat = startingPoint[1];
  let currentLon = startingPoint[0];
  let remaining = étapes.slice();

  while (remaining.length > 0) {
    let closestStep = null;
    let minDistance = Infinity;

    for (const step of remaining) {
      if (step.type === "delivery") {
        const statut = step.commande.status;
        if (statut !== "on_the_way" && !commandesRecuperees.has(step.commande._id)) {
          continue;
        }
      }

      const dist = haversine(
        { lat: currentLat, lon: currentLon },
        { lat: step.lat, lon: step.lon }
      );

      if (dist < minDistance) {
        minDistance = dist;
        closestStep = step;
      }
    }

    if (!closestStep) break;

    ordered.push(closestStep);
    currentLat = closestStep.lat;
    currentLon = closestStep.lon;

    if (closestStep.type === "pickup") {
      commandesRecuperees.add(closestStep.commande._id);
    }

    // Supprime l'étape sélectionnée sans muter l’objet
    remaining = remaining.filter(step => step !== closestStep);
  }

  return ordered;
}

export { calculerTourneeOptimisee };