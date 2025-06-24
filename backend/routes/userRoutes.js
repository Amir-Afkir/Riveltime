// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile } = require('../controllers/userController');

// ✅ Middlewares d'authentification
const { jwtCheck, injectUser, createUserIfNotExists } = require('../middleware/auth');

// ✅ Route protégée pour récupérer son profil
// - jwtCheck : vérifie le token JWT
// - injectUser : extrait l'utilisateur depuis le token
// - createUserIfNotExists : crée un utilisateur en base s'il n'existe pas encore
router.get('/me', jwtCheck, injectUser, createUserIfNotExists, getMyProfile);

// ✅ Route protégée pour mettre à jour son profil
router.put('/me', jwtCheck, injectUser, createUserIfNotExists, updateMyProfile);

module.exports = router;
