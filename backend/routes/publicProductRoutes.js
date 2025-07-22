import express from 'express';
const router = express.Router();
import { getProduitsParBoutique } from '../controllers/productController.js';

// 🌐 Route publique (pas protégée par JWT)
router.get('/boutique/:id', getProduitsParBoutique);

export default router;