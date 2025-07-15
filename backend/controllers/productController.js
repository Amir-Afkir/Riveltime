const mongoose = require('mongoose');
const Product = require('../models/Product');
const Boutique = require('../models/Boutique');
const cloudinary = require('../config/cloudinary');

// 🚀 Créer un produit
exports.createProduct = async (req, res) => {
  try {
    const { name, price, collectionName, description, boutiqueId } = req.body;

    if (!name || !price || !boutiqueId) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants.' });
    }

    if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
      return res.status(400).json({ success: false, error: 'ID de boutique invalide.' });
    }

    const boutique = await Boutique.findById(boutiqueId);
    if (!boutique) {
      return res.status(404).json({ success: false, error: 'Boutique introuvable.' });
    }

    if (!boutique.owner.equals(req.dbUser._id)) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé à cette boutique.' });
    }

    if (!req.imageData?.secure_url || !req.imageData?.public_id) {
      return res.status(400).json({ success: false, error: 'Image produit requise.' });
    }

    const result = req.imageData;

    // À placer dans createProduct.js
    const LOGISTICS_PRESETS = {
      petit_colis: { poids_kg: 0.3, volume_m3: 0.0015 },
      sac_ou_vetement: { poids_kg: 1.2, volume_m3: 0.006 },
      carton_moyen: { poids_kg: 3, volume_m3: 0.012 },
      fragile: { poids_kg: 4.5, volume_m3: 0.025 },
      meuble: { poids_kg: 25, volume_m3: 0.25 },
      gros_objet: { poids_kg: 50, volume_m3: 0.5 }
    };

    const logisticsCategory = req.body.logisticsCategory || 'petit_colis';
    const { poids_kg, volume_m3 } = LOGISTICS_PRESETS[logisticsCategory] || LOGISTICS_PRESETS.petit_colis;

    const produit = new Product({
      name,
      price,
      collectionName,
      description,
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
      boutique: boutique._id,
      logisticsCategory,
      poids_kg,
      volume_m3,
    });

    await produit.save();
    return res.status(201).json({ success: true, produit });
  } catch (err) {
    console.error('❌ Erreur createProduct :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
};

// 🛒 Obtenir tous les produits des boutiques du vendeur
exports.getMyProducts = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ owner: req.dbUser._id });
    const boutiqueIds = boutiques.map(b => b._id);
    const produits = await Product.find({ boutique: { $in: boutiqueIds } });
    res.json({ success: true, produits });
  } catch (err) {
    console.error('❌ Erreur getMyProducts :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
};

// 🗑️ Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const produit = await Product.findById(req.params.id).populate('boutique');
    if (!produit || !produit.boutique.owner.equals(req.dbUser._id)) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé.' });
    }

    if (produit.imagePublicId) {
      await cloudinary.uploader.destroy(produit.imagePublicId);
    }

    await produit.deleteOne();
    res.json({ success: true, message: 'Produit supprimé.' });
  } catch (err) {
    console.error('❌ Erreur deleteProduct :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
};

// ✏️ Modifier un produit
exports.updateProduct = async (req, res) => {
  try {
    const produit = await Product.findById(req.params.id).populate('boutique');
    if (!produit || !produit.boutique || !produit.boutique.owner.equals(req.dbUser._id)) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé.' });
    }

    const { name, price, collectionName, description } = req.body;

    // À placer dans createProduct.js
    const LOGISTICS_PRESETS = {
      petit_colis: { poids_kg: 0.3, volume_m3: 0.0015 },
      sac_ou_vetement: { poids_kg: 1.2, volume_m3: 0.006 },
      carton_moyen: { poids_kg: 3, volume_m3: 0.012 },
      fragile: { poids_kg: 4.5, volume_m3: 0.025 },
      meuble: { poids_kg: 25, volume_m3: 0.25 },
      gros_objet: { poids_kg: 50, volume_m3: 0.5 }
    };

    const logisticsCategory = req.body.logisticsCategory;
    if (logisticsCategory && LOGISTICS_PRESETS[logisticsCategory]) {
      const { poids_kg, volume_m3 } = LOGISTICS_PRESETS[logisticsCategory];
      produit.logisticsCategory = logisticsCategory;
      produit.poids_kg = poids_kg;
      produit.volume_m3 = volume_m3;
    }

    if (req.imageData?.secure_url && req.imageData?.public_id) {
      if (produit.imagePublicId) {
        await cloudinary.uploader.destroy(produit.imagePublicId);
      }
      const result = req.imageData;
      produit.imageUrl = result.secure_url;
      produit.imagePublicId = result.public_id;
    }

    if (name) produit.name = name;
    if (price) produit.price = price;
    if (collectionName) produit.collectionName = collectionName;
    if (description) produit.description = description;

    await produit.save();
    res.json({ success: true, produit });
  } catch (err) {
    console.error('❌ Erreur updateProduct :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
};

// 🌐 Produits publics d’une boutique
exports.getProduitsParBoutique = async (req, res) => {
  try {
    const boutiqueId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
      return res.status(400).json({ success: false, error: 'ID de boutique invalide.' });
    }

    const produits = await Product.find({ boutique: boutiqueId });
    res.json({ success: true, produits });
  } catch (err) {
    console.error('❌ Erreur getProduitsParBoutique :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
};