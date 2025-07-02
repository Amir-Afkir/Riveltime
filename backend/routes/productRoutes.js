const { jwtCheck, injectUser } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createProduct, getMyProducts, deleteProduct, updateProduct } = require('../controllers/productController');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

router.post('/', jwtCheck, injectUser, upload.single('image'), createProduct);
router.get('/mine', jwtCheck, injectUser, getMyProducts);
router.delete('/:id', jwtCheck, injectUser, deleteProduct);
router.put('/:id', jwtCheck, injectUser, upload.single('image'), updateProduct);

module.exports = router;