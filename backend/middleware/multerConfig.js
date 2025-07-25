// /middleware/multerConfig.js
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 Mo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  },
});

export default upload;