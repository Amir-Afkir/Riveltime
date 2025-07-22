// backend/middleware/validationMiddleware.js

// ✅ Vérifie que l'utilisateur a le rôle vendeur
function requireVendeurRole(req, res, next) {
  if (req.dbUser?.role !== 'vendeur') {
    return res.status(403).json({ error: 'Accès réservé aux vendeurs.' });
  }
  next();
}

// ✅ Validation des données de boutique
function validateBoutiqueData(req, res, next) {
  const { name, category } = req.body;
  const allowedCategories = [
    'Alimentation',
    'Mobilité électrique',
    'Prêt-à-porter',
    'Informatique',
    'Restaurant',
    'Santé',
    'Bricolage',
    'Jardin',
  ];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nom de boutique invalide ou manquant (minimum 2 caractères).' });
  }
  if (!category || !allowedCategories.includes(category)) {
    return res.status(400).json({ error: `Catégorie invalide. Doit être une des suivantes : ${allowedCategories.join(', ')}` });
  }
  next();
}

// ✅ Validation des données de produit
function validateProductData(req, res, next) {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Nom et prix requis.' });
  }
  next();
}

export {
  requireVendeurRole,
  validateBoutiqueData,
  validateProductData,
};
