// backend/middleware/cloudinaryUpload.js
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Middleware de traitement Cloudinary
 * @param {function} getFolderPath - Fonction qui retourne le chemin de dossier dynamique
 */
function cloudinaryUpload(getFolderPath) {
  return (req, res, next) => {
    // 🛑 Si l'upload est différé (ex: pour le faire manuellement dans le contrôleur)
    if (req.deferCloudinaryUpload) return next();

    // 🛑 Aucun fichier reçu : on passe
    if (!req.file?.buffer) return next();

    const folderPath = getFolderPath(req); // ex: en fonction de l'userId ou boutiqueId

    const uploadOptions = {
      folder: folderPath,
      resource_type: 'image',
      format: 'webp',
      transformation: [{ quality: 'auto:eco' }],
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) {
        console.error('❌ Cloudinary upload error :', err);
        return res.status(500).json({ error: 'Erreur upload image.' });
      }

      req.imageData = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };

      next();
    });

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  };
}

module.exports = cloudinaryUpload;