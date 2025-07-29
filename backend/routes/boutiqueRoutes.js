import express from 'express';
import {
  getMyBoutiques,
  getBoutiqueById,
  createBoutique,
  updateBoutique,
  deleteBoutiqueById,
} from '../controllers/boutiqueController.js';
import * as productController from '../controllers/productController.js';

import {
  jwtCheck,
  injectUser,
  createUserIfNotExists,
} from '../middleware/auth.js';

import {
  validateBoutiqueData,
  requireVendeurRole,
} from '../middleware/validationMiddleware.js';

import cloudinaryUpload from '../middleware/cloudinaryUpload.js';
import multerErrorHandler from '../middleware/multerErrorHandler.js';
import upload from '../middleware/multerConfig.js';

const router = express.Router();


router.get(
  '/mine',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  getMyBoutiques
);

router.get('/:id', getBoutiqueById);
router.get('/:id/produits', productController.getProduitsParBoutique);


// 🔒 Routes protégées

router.post(
  '/',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  upload.single('coverImage'),
  multerErrorHandler,
  async (req, res, next) => {
    req.deferCloudinaryUpload = true;
    next();
  },
  validateBoutiqueData,
  createBoutique
);

router.put(
  '/:id',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  upload.single('coverImage'),
  multerErrorHandler,
  cloudinaryUpload((req) => `riveltime/${req.dbUser.auth0Id}/boutiques/${req.params.id}`),
  validateBoutiqueData,
  updateBoutique
);

router.delete(
  '/:id',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  deleteBoutiqueById
);

export default router;