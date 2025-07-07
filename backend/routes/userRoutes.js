// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

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

// ✅ Avatar : upload vers Cloudinary dans /riveltime/<auth0Id>/profil/avatar.webp
router.put(
  '/me/avatar',
  upload.single("avatar"),
  cloudinaryUpload((req) => `riveltime/${req.dbUser.auth0Id}/profil`),
  uploadAvatar
);

router.delete('/me/avatar', deleteAvatar);

module.exports = router;