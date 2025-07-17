const express = require('express');
const router = express.Router();

const boutiqueController = require('../controllers/boutiqueController');
const productController = require('../controllers/productController');

const {
  jwtCheck,
  injectUser,
  createUserIfNotExists,
} = require('../middleware/auth');

const {
  validateBoutiqueData,
  requireVendeurRole,
} = require('../middleware/validationMiddleware');

const cloudinaryUpload = require('../middleware/cloudinaryUpload');
const multerErrorHandler = require('../middleware/multerErrorHandler');
const upload = require('../middleware/multerConfig');

// 🌐 Routes publiques
router.get('/', boutiqueController.getAllBoutiques);

router.get(
  '/mine',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  boutiqueController.getMyBoutiques
);

router.get('/:id', boutiqueController.getBoutiqueById);
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
  // Champs personnalisés supportés : activerParticipation, participationPourcent, contributionLivraisonPourcent
  boutiqueController.createBoutique
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
  // Prise en compte des champs : activerParticipation, participationPourcent, contributionLivraisonPourcent
  boutiqueController.updateBoutique
);

router.delete(
  '/:id',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  boutiqueController.deleteBoutiqueById
);

module.exports = router;