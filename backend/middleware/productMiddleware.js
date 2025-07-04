// backend/middleware/productMiddleware.js

// Middleware de validation simple
function validateProductData(req, res, next) {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Nom et prix requis.' });
    }
    next();
  }
  
  // Gestion des erreurs Multer
  function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image trop lourde (max 5 Mo).' });
      }
      return res.status(400).json({ error: 'Erreur d’upload.' });
    }
    next(err);
  }
  
  // Middleware de rôle (si besoin d’un backup)
  function requireVendeurRole(req, res, next) {
    if (req.dbUser.role !== 'vendeur') {
      return res.status(403).json({ error: 'Accès réservé aux vendeurs.' });
    }
    next();
  }
  
  module.exports = {
    validateProductData,
    multerErrorHandler,
    requireVendeurRole,
  };