// Regroupe les articles du panier par boutique
module.exports = function groupCartByBoutique(items) {
  return items.reduce((acc, item) => {
    const boutiqueId = String(item.product.boutique || item.boutiqueId);
    if (!acc[boutiqueId]) acc[boutiqueId] = [];
    acc[boutiqueId].push(item);
    return acc;
  }, {});
};