const express = require('express');
const router = express.Router();
const { getProduitsParBoutique } = require('../controllers/productController');

// 🌐 Route publique (pas protégée par JWT)
router.get('/boutique/:id', getProduitsParBoutique);

module.exports = router;