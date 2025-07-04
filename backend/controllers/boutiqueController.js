// backend/controllers/boutiqueController.js
const Boutique = require('../models/Boutique');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const mongoose = require('mongoose');

// 📁 Upload image de couverture boutique
async function uploadCoverImage(userId, fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `riveltime/users/${userId}/boutiques` },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}

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
    const boutiques = await Boutique.find().lean();
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
    const boutique = await Boutique.findById(id).lean();
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
    const { name, category, description, address, location } = req.body;
    const userId = req.dbUser._id;

    let coverImageUrl = null;
    let coverImagePublicId = null;

    if (req.file?.buffer) {
      const result = await uploadCoverImage(userId, req.file.buffer);
      coverImageUrl = result.secure_url;
      coverImagePublicId = result.public_id;
    }

    const boutique = new Boutique({
      owner: userId,
      name,
      category,
      description,
      address,
      location,
      coverImageUrl,
      coverImagePublicId,
    });

    await boutique.save();
    res.status(201).json({ boutique });
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

    const { name, category, description, address, location } = req.body;

    if (req.file?.buffer) {
      if (boutique.coverImagePublicId) {
        await cloudinary.uploader.destroy(boutique.coverImagePublicId);
      }
      const result = await uploadCoverImage(req.dbUser._id, req.file.buffer);
      boutique.coverImageUrl = result.secure_url;
      boutique.coverImagePublicId = result.public_id;
    }

    boutique.name = name;
    boutique.category = category;
    boutique.description = description;
    boutique.address = address;
    boutique.location = location;

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
      if (produit.image?.public_id) {
        await cloudinary.uploader.destroy(produit.image.public_id);
      }
    }

    await Product.deleteMany({ boutique: id });

    // Supprimer l'image de couverture de la boutique
    if (boutique.coverImagePublicId) {
      await cloudinary.uploader.destroy(boutique.coverImagePublicId);
    }

    await boutique.deleteOne();

    res.status(200).json({ message: 'Boutique et ses produits supprimés avec succès.' });
  } catch (err) {
    handleServerError(res, err, 'Erreur suppression boutique');
  }
};
