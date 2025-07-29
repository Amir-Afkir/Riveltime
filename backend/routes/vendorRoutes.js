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

// Route publique pour récupérer toutes les boutiques ouvertes
router.get('/boutiques', async (req, res) => {
  try {
    const boutiques = await Boutique.find().select('-__v').lean();

    const now = new Date();
    const options = { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false };
    const locale = 'fr-FR';
    const jour = now.toLocaleDateString(locale, { weekday: 'long' }).toLowerCase();
    const heureActuelle = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });

    const ouvertes = boutiques.filter((b) => {
      if (b.fermetureExceptionnelle) return false;

      if (!b.activerHoraires) return true;

      const h = b.horaires?.[jour];
      if (!h || !h.ouvert || !h.debut || !h.fin) return false;

      return h.debut <= heureActuelle && heureActuelle <= h.fin;
    });

    res.json(ouvertes);
  } catch (err) {
    console.error('Erreur récupération boutiques:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;