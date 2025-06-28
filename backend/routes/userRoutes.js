// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const { getMyProfile, updateMyProfile, uploadAvatar, deleteAvatar } = require('../controllers/userController');
const { jwtCheck, injectUser } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

// ✅ Middleware global : vérifie le token et injecte l'utilisateur MongoDB
router.use(jwtCheck, injectUser);

// ✅ Middleware d'autorisation commun : seuls les rôles valides ont accès à ces routes
router.use(requireRole(['client', 'vendeur', 'livreur']));

// ✅ Routes protégées
router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.put('/me/avatar', upload.single("avatar"), uploadAvatar);
router.delete('/me/avatar', deleteAvatar);

module.exports = router;