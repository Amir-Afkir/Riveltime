const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { jwtCheck, injectUser } = require('../middleware/auth');
const Boutique = require('../models/Boutique');

// ✅ Récupérer toutes les boutiques de l'utilisateur connecté
router.get('/me', jwtCheck, injectUser, async (req, res) => {
  try {
    const userId = req.dbUser?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    const boutiques = await Boutique.find({ owner: userId });
    res.json(boutiques);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des boutiques :', err);
    res.status(500).json({ error: 'Erreur serveur lors du chargement des boutiques.' });
  }
});

// ✅ Créer une nouvelle boutique
router.post('/', jwtCheck, injectUser, async (req, res) => {
  try {
    const { nom, description, adresse, latitude, longitude } = req.body;
    const userId = req.dbUser?._id;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la boutique est requis.' });
    }

    const nouvelleBoutique = new Boutique({
      nom,
      description,
      adresse,
      latitude,
      longitude,
      owner: userId,
    });

    await nouvelleBoutique.save();
    res.status(201).json(nouvelleBoutique);
  } catch (err) {
    console.error('❌ Erreur lors de la création de la boutique :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la boutique.' });
  }
});

// ✅ Supprimer une boutique par ID
router.delete('/:id', jwtCheck, injectUser, async (req, res) => {
  try {
    const boutiqueId = req.params.id;
    const userId = req.dbUser?._id;

    if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
      return res.status(400).json({ error: 'ID de boutique invalide.' });
    }

    const boutique = await Boutique.findOne({ _id: boutiqueId, owner: userId });
    if (!boutique) {
      return res.status(404).json({ error: 'Boutique non trouvée ou non autorisée.' });
    }

    await Boutique.deleteOne({ _id: boutiqueId });
    res.json({ message: 'Boutique supprimée avec succès.' });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression de la boutique :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de la boutique.' });
  }
});

module.exports = router;