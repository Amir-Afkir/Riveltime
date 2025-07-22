import express from 'express';
import User from '../models/User.js';
import Boutique from '../models/Boutique.js';

const router = express.Router();

// Route publique pour récupérer tous les vendeurs
router.get('/vendeurs', async (req, res) => {
  try {
    const vendeurs = await User.find({ role: 'vendeur' }).select('-password -__v');
    res.json(vendeurs);
  } catch (err) {
    console.error('Erreur récupération vendeurs:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route publique pour récupérer toutes les boutiques
router.get('/boutiques', async (req, res) => {
  try {
    const boutiques = await Boutique.find().select('-__v');
    res.json(boutiques);
  } catch (err) {
    console.error('Erreur récupération boutiques:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;