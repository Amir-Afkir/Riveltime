const express = require('express');
const router = express.Router();
const multer = require('multer');

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
  multerErrorHandler,
} = require('../middleware/boutiqueMiddleware');

// 📦 Multer config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  },
});

// 🌐 Routes publiques
router.get('/', boutiqueController.getAllBoutiques);
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
  validateBoutiqueData,
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
  validateBoutiqueData,
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