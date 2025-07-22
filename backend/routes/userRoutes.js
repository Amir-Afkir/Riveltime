// backend/routes/userRoutes.js
import express from 'express';
import upload from '../middleware/multerConfig.js';
import cloudinaryUpload from '../middleware/cloudinaryUpload.js';

import { getMyProfile, updateMyProfile, uploadAvatar, deleteAvatar } from '../controllers/userController.js';
import { jwtCheck, injectUser } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

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

export default router;