const Seller = require('../models/Seller');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Fonction utilitaire pour upload image Cloudinary depuis buffer
async function uploadCoverImage(userId, fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `riveltime/${userId}/boutique` },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}

// Récupérer une boutique par son ID (publique)
exports.getSellerById = async (req, res) => {
  try {
    const sellerId = req.params.id;
    if (!sellerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID de boutique invalide.' });
    }
    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ error: 'Boutique non trouvée.' });
    res.json({ seller });
  } catch (err) {
    console.error('Erreur récupération boutique par ID:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Récupérer toutes les boutiques (publique)
exports.getAllSellers = async (_req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    console.error('Erreur récupération toutes les boutiques :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Créer ou mettre à jour la boutique du vendeur connecté
exports.createOrUpdateSeller = async (req, res) => {
  try {
    if (!req.dbUser || !req.dbUser._id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
    const userId = req.dbUser._id;
    let { name, category, description, address, location } = req.body;

    // Validation minimale (tu peux externaliser en middleware)
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Nom requis et doit être une chaîne non vide.' });
    }
    if (typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ error: 'Catégorie requise et doit être une chaîne non vide.' });
    }
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description doit être une chaîne.' });
    }
    if (address && typeof address !== 'string') {
      return res.status(400).json({ error: 'Adresse doit être une chaîne.' });
    }

    if (location) {
      if (
        typeof location === 'object' &&
        typeof location.lat === 'number' &&
        typeof location.lng === 'number'
      ) {
        location = {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        };
      } else {
        return res.status(400).json({ error: 'Location doit être un objet avec lat et lng numériques.' });
      }
    }

    let seller = await Seller.findOne({ owner: userId });

    // Upload image (si présente)
    let coverImageUrl = null;
    let coverImagePublicId = null;

    if (req.file?.buffer) {
      // Supprimer ancienne image si existante
      if (seller?.coverImagePublicId) {
        try {
          await cloudinary.uploader.destroy(seller.coverImagePublicId);
        } catch (err) {
          console.warn('Erreur suppression ancienne image Cloudinary :', err);
        }
      }

      const result = await uploadCoverImage(userId, req.file.buffer);
      coverImageUrl = result.secure_url;
      coverImagePublicId = result.public_id;
    }

    if (!seller) {
      seller = new Seller({
        owner: userId,
        name,
        category,
        description,
        address,
        location,
        coverImageUrl,
        coverImagePublicId,
      });
    } else {
      // Mise à jour plus concise
      seller.name = name;
      seller.category = category;
      if (description !== undefined) seller.description = description;
      if (address !== undefined) seller.address = address;
      if (location !== undefined) seller.location = location;
      if (coverImageUrl) {
        seller.coverImageUrl = coverImageUrl;
        seller.coverImagePublicId = coverImagePublicId;
      }
    }

    await seller.save();
    res.status(200).json({ seller });
  } catch (err) {
    console.error('Erreur gestion boutique vendeur:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Récupérer la boutique du vendeur connecté
exports.getMySeller = async (req, res) => {
  try {
    if (!req.dbUser || !req.dbUser._id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
    const userId = req.dbUser._id;
    const seller = await Seller.findOne({ owner: userId });
    if (!seller) return res.status(404).json({ error: 'Boutique non trouvée.' });
    res.json({ seller });
  } catch (err) {
    console.error('Erreur récupération boutique vendeur:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Supprimer la boutique du vendeur connecté (optionnel)
exports.deleteMySeller = async (req, res) => {
  try {
    if (!req.dbUser || !req.dbUser._id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
    const userId = req.dbUser._id;
    const seller = await Seller.findOneAndDelete({ owner: userId });
    if (!seller) return res.status(404).json({ error: 'Boutique non trouvée.' });

    if (seller.coverImagePublicId) {
      try {
        await cloudinary.uploader.destroy(seller.coverImagePublicId);
      } catch (err) {
        console.warn('Erreur suppression image Cloudinary lors suppression boutique :', err);
      }
    }

    res.json({ message: 'Boutique supprimée.' });
  } catch (err) {
    console.error('Erreur suppression boutique:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};