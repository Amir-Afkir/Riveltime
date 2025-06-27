// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { jwtCheck, injectUser, createUserIfNotExists } = require('../middleware/auth');
const { getMyProfile, updateMyProfile, uploadAvatar, deleteAvatar } = require('../controllers/userController');

// ✅ Route protégée pour récupérer son profil
router.get('/me', jwtCheck, injectUser, createUserIfNotExists, getMyProfile);

// ✅ Route protégée pour mettre à jour son profil
router.put('/me', jwtCheck, injectUser, createUserIfNotExists, updateMyProfile);

// ✅ Route protégée pour uploader un avatar
router.put('/me/avatar', jwtCheck, injectUser, createUserIfNotExists, upload.single("avatar"), uploadAvatar);

// ✅ Route protégée pour supprimer un avatar
router.delete('/me/avatar', jwtCheck, injectUser, createUserIfNotExists, deleteAvatar);

module.exports = router;