const upload = require('../middleware/multerConfig');
// ✅ routes/productRoutes.js
const express = require('express');
const router = express.Router();
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

const {
  createProduct,
  getMyProducts,
  deleteProduct,
  updateProduct,
} = require('../controllers/productController');

const {
  jwtCheck,
  injectUser,
  createUserIfNotExists,
} = require('../middleware/auth');

const {
  requireVendeurRole,
  validateProductData,
} = require('../middleware/validationMiddleware');

const multerErrorHandler = require('../middleware/multerErrorHandler');


// 🔒 Routes privées (vendeur connecté)
router.get(
  '/mine',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  getMyProducts
);

// Utilise un dossier Cloudinary basé sur le nom de la boutique (slugifié) pour une meilleure lisibilité
router.post(
  '/',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  upload.single('image'),
  multerErrorHandler,
  cloudinaryUpload((req) => {
    return `riveltime/${req.dbUser.auth0Id}/boutiques/${req.body.boutiqueId}/vitrine`;
  }),
  validateProductData,
  createProduct
);

// Utilise un dossier Cloudinary basé sur le nom de la boutique (slugifié) pour une meilleure lisibilité
router.put(
  '/:id',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  upload.single('image'),
  multerErrorHandler,
  cloudinaryUpload((req) => {
    return `riveltime/${req.dbUser.auth0Id}/boutiques/${req.body.boutiqueId}/vitrine`;
  }),
  validateProductData,
  updateProduct
);

router.delete(
  '/:id',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  deleteProduct
);

module.exports = router;