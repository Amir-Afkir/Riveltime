// backend/controllers/boutiqueController.js
const Boutique = require('../models/Boutique');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');


function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function handleServerError(res, err, message = "Erreur serveur.") {
  console.error('❌', message, err);
  res.status(500).json({ error: message });
}

function isOwner(user, doc) {
  return doc.owner?.toString() === user._id.toString();
}

// 🌐 GET - Toutes les boutiques (public)
exports.getAllBoutiques = async (_req, res) => {
  try {
    const boutiques = await Boutique.find()
      .populate('owner', 'avatarUrl fullname')
      .lean();
    res.json(boutiques);
  } catch (err) {
    handleServerError(res, err, 'Erreur récupération boutiques');
  }
};

// 🔐 GET - Boutiques du vendeur connecté
exports.getMyBoutiques = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ owner: req.dbUser._id })
      .populate('owner', 'avatarUrl fullname')
      .lean();
    res.json(boutiques);
  } catch (err) {
    handleServerError(res, err, 'Erreur récupération boutiques');
  }
};


// 🌐 GET - Une boutique par ID (public)
exports.getBoutiqueById = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'ID de boutique invalide.' });
  try {
    const boutique = await Boutique.findById(id)
      .populate('owner', 'avatarUrl picture fullname')
      .lean();
    if (!boutique) return res.status(404).json({ error: 'Boutique non trouvée.' });
    res.json({ boutique });
  } catch (err) {
    handleServerError(res, err, 'Erreur récupération boutique');
  }
};

// 🌐 GET - Produits publics d'une boutique (public)
exports.getProduitsParBoutique = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'ID de boutique invalide.' });
  try {
    const produits = await Product.find({ boutique: id }).lean();
    res.json({ produits });
  } catch (err) {
    handleServerError(res, err, 'Erreur récupération produits boutique');
  }
};

// 🔐 POST - Créer une boutique (privée)
exports.createBoutique = async (req, res) => {
  try {
    let {
      name,
      category,
      description,
      address,
      location,
      activerParticipation = false,
      participationPourcent = 50,
      contributionLivraisonPourcent = 20,
    } = req.body;

    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({ error: 'Format de localisation invalide.' });
      }
    }

    if (!location || location.type !== 'Point' || !Array.isArray(location.coordinates)) {
      return res.status(400).json({ error: 'Coordonnées géographiques invalides.' });
    }

    const userId = req.dbUser._id;

    // Créer la boutique sans image de couverture
    const boutique = new Boutique({
      owner: userId,
      name,
      category,
      description,
      address,
      location,
      activerParticipation,
      participationPourcent,
      contributionLivraisonPourcent,
    });

    await boutique.save();

    // Si l'image est déjà uploadée via un middleware (ex: Cloudinary), utiliser req.imageData
    if (req.imageData) {
      boutique.coverImageUrl = req.imageData.secure_url;
      boutique.coverImagePublicId = req.imageData.public_id;
      await boutique.save();
      return res.status(201).json({ boutique });
    }

    // Sinon, gérer l'upload après la création si une image est présente dans req.file
    if (req.file?.buffer) {
      const streamifier = require('streamifier');
      const folderPath = `riveltime/${req.dbUser.auth0Id}/boutiques/${boutique._id}`;
      const uploadOptions = {
        folder: folderPath,
        public_id: 'cover',
        resource_type: 'image',
        format: 'webp',
        transformation: [{ quality: 'auto:eco' }],
      };

      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, async (err, result) => {
        if (err) {
          console.error('❌ Erreur upload cover boutique :', err);
          return res.status(500).json({ error: 'Erreur upload image couverture.' });
        }

        boutique.coverImageUrl = result.secure_url;
        boutique.coverImagePublicId = result.public_id;
        await boutique.save();

        return res.status(201).json({ boutique });
      });

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      res.status(201).json({ boutique });
    }
  } catch (err) {
    handleServerError(res, err, 'Erreur création boutique');
  }
};

// 🔐 PUT - Modifier une boutique (privée)
exports.updateBoutique = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'ID de boutique invalide.' });
  try {
    const boutique = await Boutique.findById(id);
    if (!boutique || !isOwner(req.dbUser, boutique)) {
      return res.status(403).json({ error: 'Boutique introuvable ou accès interdit.' });
    }

    let {
      name,
      category,
      description,
      address,
      location,
      activerParticipation = false,
      participationPourcent = 50,
      contributionLivraisonPourcent = 20,
    } = req.body;
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({ error: 'Format de localisation invalide.' });
      }
    }

    if (!location || location.type !== 'Point' || !Array.isArray(location.coordinates)) {
      return res.status(400).json({ error: 'Coordonnées géographiques invalides.' });
    }

    if (req.imageData) {
      if (boutique.coverImagePublicId) {
        await cloudinary.uploader.destroy(boutique.coverImagePublicId);
      }
      boutique.coverImageUrl = req.imageData.secure_url;
      boutique.coverImagePublicId = req.imageData.public_id;
    }

    boutique.name = name;
    boutique.category = category;
    boutique.description = description;
    boutique.address = address;
    boutique.location = location;

    boutique.activerParticipation = activerParticipation;
    boutique.participationPourcent = participationPourcent;
    boutique.contributionLivraisonPourcent = contributionLivraisonPourcent;

    await boutique.save();
    res.status(200).json({ boutique });
  } catch (err) {
    handleServerError(res, err, 'Erreur modification boutique');
  }
};

// 🔐 DELETE - Supprimer une boutique (privée)
exports.deleteBoutiqueById = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'ID de boutique invalide.' });
  try {
    const boutique = await Boutique.findById(id);
    if (!boutique || !isOwner(req.dbUser, boutique)) {
      return res.status(403).json({ error: 'Boutique introuvable ou non autorisée.' });
    }

    // Supprimer les produits liés à la boutique
    const produits = await Product.find({ boutique: id });

    for (const produit of produits) {
      // Correction: Suppression via produit.imagePublicId pour cohérence
      if (produit.imagePublicId) {
        await cloudinary.uploader.destroy(produit.imagePublicId);
      }
    }

    await Product.deleteMany({ boutique: id });

    // Supprimer l'image de couverture de la boutique
    if (boutique.coverImagePublicId) {
      await cloudinary.uploader.destroy(boutique.coverImagePublicId);
    }

    // Supprimer tout le dossier Cloudinary associé à la boutique
    try {
      const folderPath = `riveltime/${req.dbUser.auth0Id}/boutiques/${id}`;
      await cloudinary.api.delete_resources_by_prefix(folderPath);
      await cloudinary.api.delete_folder(folderPath);
    } catch (cloudErr) {
      console.error("❌ Erreur suppression dossier Cloudinary :", cloudErr);
    }

    await boutique.deleteOne();

    res.status(200).json({ message: 'Boutique et ses produits supprimés avec succès.' });
  } catch (err) {
    handleServerError(res, err, 'Erreur suppression boutique');
  }
};
