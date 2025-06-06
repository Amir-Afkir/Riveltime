const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createProduct, getMyProducts, deleteProduct, updateProduct } = require('../controllers/productController');


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image sont autorisés.'), false);
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
});


const injectUserFromToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.decode(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erreur décodage token :', err);
    return res.status(401).json({ error: 'Token invalide' });
  }
};

router.post('/', injectUserFromToken, upload.single('image'), createProduct);
router.get('/mine', injectUserFromToken, getMyProducts);
router.delete('/:id', injectUserFromToken, deleteProduct);
router.put('/:id', injectUserFromToken, upload.single('image'), updateProduct);

module.exports = router;
