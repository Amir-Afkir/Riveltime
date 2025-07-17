exports.validateEstimateInput = (body) => {
  const { items, deliveryLocation, boutiqueLocation, boutiqueId } = body;
  if (!items || !Array.isArray(items) || items.length === 0) return 'Produits manquants ou invalides';
  if (!deliveryLocation || !deliveryLocation.lat || !deliveryLocation.lng) return 'Coordonnées de livraison manquantes';
  if (!boutiqueLocation || !boutiqueLocation.lat || !boutiqueLocation.lng) return 'Coordonnées de la boutique manquantes';
  if (!boutiqueId) return 'ID boutique manquant';
  return null;
};

exports.validateOrderInput = (body) => {
  const { produits, infosClient, livraison, totalProduits } = body;
  if (!produits || !Array.isArray(produits) || produits.length === 0) return 'Aucun produit sélectionné';
  if (!infosClient || !infosClient.nom || !infosClient.adresse) return 'Informations client manquantes';
  if (!livraison || !livraison.adresse || !livraison.distance) return 'Informations de livraison manquantes';
  if (typeof totalProduits !== 'number') return 'Total des produits invalide';
  return null;
};

exports.validateStatus = (status) => {
  const validStatus = ['en_attente', 'en_cours', 'livree', 'annulee'];
  return validStatus.includes(status);
};
