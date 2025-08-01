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
    const now = new Date();
    const locale = 'fr-FR';
    const jour = now.toLocaleDateString(locale, { weekday: 'long' }).toLowerCase();
    const heureActuelle = now.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const boutiques = await Boutique.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'boutique',
          as: 'products'
        }
      },
      {
        $addFields: {
          horairesJour: { $ifNull: [`$horaires.${jour}`, null] }
        }
      },
      {
        $match: {
          $or: [
            { activerHoraires: false },
            {
              $and: [
                { "horairesJour.ouvert": true },
                { "horairesJour.debut": { $lte: heureActuelle } },
                { "horairesJour.fin": { $gte: heureActuelle } }
              ]
            }
          ],
          $or: [
            { fermetureExceptionnelle: false },
            { fermetureExceptionnelle: { $exists: false } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          location: 1,
          category: 1,
          coverImageUrl: 1,
          activerParticipation: 1,
          participationPourcent: 1,
          contributionLivraisonPourcent: 1,
          products: { $slice: ["$products", 5] }
        }
      }
    ]);

    res.json(boutiques);
  } catch (err) {
    console.error('Erreur récupération boutiques:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;