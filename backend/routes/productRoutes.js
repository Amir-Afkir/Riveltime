import express from 'express';
import upload from '../middleware/multerConfig.js';
import cloudinaryUpload from '../middleware/cloudinaryUpload.js';
import {
  createProduct,
  getMyProducts,
  deleteProduct,
  updateProduct,
  getProduitsParBoutique,
} from '../controllers/productController.js';
import {
  jwtCheck,
  injectUser,
  createUserIfNotExists,
} from '../middleware/auth.js';
import {
  requireVendeurRole,
  validateProductData,
} from '../middleware/validationMiddleware.js';
import multerErrorHandler from '../middleware/multerErrorHandler.js';

const router = express.Router();


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

export default router;