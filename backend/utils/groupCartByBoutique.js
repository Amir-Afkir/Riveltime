// Regroupe les articles du panier par boutique
module.exports = function groupCartByBoutique(items) {
  const grouped = {};
  for (const item of items) {
    const boutiqueId = String(item.product.boutique);
    if (!grouped[boutiqueId]) grouped[boutiqueId] = [];
    grouped[boutiqueId].push(item);
  }
  return grouped;
};