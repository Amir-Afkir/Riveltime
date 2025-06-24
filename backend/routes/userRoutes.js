// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile } = require('../controllers/userController');

// ✅ Route protégée pour récupérer son profil
router.get('/me', getMyProfile);

// ✅ Route protégée pour mettre à jour son profil
router.put('/me', updateMyProfile);

module.exports = router;