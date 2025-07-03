const express = require('express');
const router = express.Router();
const multer = require('multer');
const boutiqueController = require('../controllers/boutiqueController');

const { jwtCheck, injectUser, createUserIfNotExists } = require('../middleware/auth');
const { validateBoutiqueData, requireVendeurRole, multerErrorHandler } = require('../middleware/boutiqueMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  }
});

// Routes publiques
router.get('/', boutiqueController.getAllBoutiques);
router.get('/me', jwtCheck, injectUser, createUserIfNotExists, requireVendeurRole, boutiqueController.getMyBoutique);
router.get('/:id', boutiqueController.getBoutiqueById);

// Routes sécurisées pour le vendeur connecté
router.post(
  '/me',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  upload.single('coverImage'),
  multerErrorHandler,
  validateBoutiqueData,
  boutiqueController.createOrUpdateBoutique
);

router.delete('/me', jwtCheck, injectUser, createUserIfNotExists, requireVendeurRole, boutiqueController.deleteMyBoutique);

module.exports = router;