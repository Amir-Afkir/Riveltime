// ✅ routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

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
  multerErrorHandler,
  validateProductData,
} = require('../middleware/productMiddleware');

// 📦 Multer pour upload image produit
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  },
});

// 🔒 Routes privées (vendeur connecté)
router.get(
  '/mine',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  getMyProducts
);

router.post(
  '/',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  upload.single('image'),
  multerErrorHandler,
  validateProductData,
  createProduct
);

router.put(
  '/:id',
  jwtCheck,
  injectUser,
  createUserIfNotExists,
  requireVendeurRole,
  upload.single('image'),
  multerErrorHandler,
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