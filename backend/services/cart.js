

/**
 * Regroupe les produits du panier par boutique
 * @param {Array} produits - Liste des produits avec boutiqueId, product, quantite, prix
 * @returns {Object} Objet dont les clés sont les boutiqueId et les valeurs des tableaux de produits
 */
function groupCartByBoutique(produits) {
  const grouped = {};

  for (const item of produits) {
    if (!grouped[item.boutiqueId]) {
      grouped[item.boutiqueId] = [];
    }
    grouped[item.boutiqueId].push({
      product: item.product,
      quantite: item.quantite,
      prix: item.prix,
    });
  }

  return grouped;
}

module.exports = groupCartByBoutique;