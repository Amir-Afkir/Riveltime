const express = require('express');
const router = express.Router();
const multer = require('multer');
const sellerController = require('../controllers/sellerController');

const { jwtCheck, injectUser, createUserIfNotExists } = require('../middleware/auth');
const { validateSellerData, requireVendeurRole, multerErrorHandler } = require('../middleware/sellerMiddleware');
// Configuration multer pour upload image en mémoire, avec filtre sur les images
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  }
});

// Routes publiques
router.get('/', sellerController.getAllSellers);
router.get('/me', (req, res) => {
  res.json(req.dbUser);
});
router.get('/:id', sellerController.getSellerById);

// Routes sécurisées pour le vendeur connecté
// IMPORTANT : la route /me doit être déclarée avant /:id pour éviter conflit d'URL
router.post(
  '/me',
  jwtCheck,
  injectUser,
  requireVendeurRole,
  upload.single('coverImage'),
  multerErrorHandler,
  validateSellerData,
  sellerController.createOrUpdateSeller
);

router.delete('/me', jwtCheck, injectUser, requireVendeurRole, sellerController.deleteMySeller);

module.exports = router;