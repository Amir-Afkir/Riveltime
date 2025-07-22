import multer from 'multer';

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fichier trop volumineux (max 2 Mo).' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Fichier invalide. Seules les images sont acceptées.' });
    }
  }
  next(err);
}

export default multerErrorHandler;