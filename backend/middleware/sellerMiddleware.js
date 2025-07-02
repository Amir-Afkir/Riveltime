// backend/middleware/sellerMiddleware.js

const multer = require('multer');

// Middleware pour valider les données reçues dans req.body pour la boutique vendeur
function validateSellerData(req, res, next) {
  const { name, category } = req.body;
  const allowedCategories = [
    'Alimentation',
    'Mobilité électrique',
    'Prêt-à-porter',
    'Informatique',
    'Restaurant',
    'Santé',
    'Bricolage',
    'Jardin'
  ];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nom de boutique invalide ou manquant (minimum 2 caractères).' });
  }
  if (!category || !allowedCategories.includes(category)) {
    return res.status(400).json({ error: `Catégorie invalide. Doit être une des suivantes : ${allowedCategories.join(', ')}` });
  }
  next();
}

// Middleware pour vérifier que l'utilisateur est vendeur
function requireVendeurRole(req, res, next) {
  if (req.dbUser?.role !== 'vendeur') {
    return res.status(403).json({ error: 'Accès réservé aux vendeurs.' });
  }
  next();
}

// Middleware pour gérer les erreurs multer et renvoyer une réponse claire
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Le fichier est trop volumineux (max 5 Mo).' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Fichier invalide. Seules les images sont acceptées.' });
    }
  }
  next(err);
}

module.exports = {
  validateSellerData,
  requireVendeurRole,
  multerErrorHandler
};