const mongoose = require('mongoose');
const streamifier = require('streamifier');
const Product = require('../models/Product');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    console.log('🔐 Utilisateur connecté (req.user) :', req.user);
    console.log('📥 Champs reçus :', { name, price, category, description });
    console.log('🧾 Headers :', req.headers);
    console.log('🔍 req.body :', req.body);
    console.log('🖼️ req.file :', req.file);

    // 🛡️ Vérification des champs requis
    if (!name || !price) {
      return res.status(400).json({ error: 'Le nom et le prix sont requis.' });
    }

    // 🔐 Vérification de l'utilisateur (boutiqueId)
    const boutiqueId = req.body.boutiqueId;
    if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
      return res.status(400).json({ error: 'boutiqueId invalide.' });
    }
    const boutiqueObjectId = new mongoose.Types.ObjectId(boutiqueId);

    const Boutique = require('../models/Boutique');
    const exists = await Boutique.exists({ _id: boutiqueObjectId });
    if (!exists) {
      return res.status(404).json({ error: 'Boutique introuvable.' });
    }

    console.log('👤 Utilisateur Auth0 :', req.user);
    if (!boutiqueId) {
      return res.status(400).json({ error: 'boutiqueId est requis.' });
    }

    // 🖼️ Vérification et construction de l'URL de l’image
    let imageUrl = null;
    let imagePublicId = null;
    if (req.file && req.file.buffer) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `riveltime/${boutiqueId}/vitrine` },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      const result = await streamUpload();
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }
    if (!imageUrl) {
      return res.status(400).json({ error: 'Aucune image fournie ou échec de l’upload.' });
    }

    // 🛠️ Création du produit
    const product = new Product({
      name,
      price,
      category,
      description,
      imageUrl,
      imagePublicId,
      boutique: boutiqueObjectId,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Erreur lors de la création du produit :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.', message: err.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const userId = req.dbUser?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    const Boutique = require('../models/Boutique');
    const boutiques = await Boutique.find({ owner: userId });

    if (!boutiques || !boutiques.filter(Boolean).length) {
      return res.status(404).json({ error: 'Aucune boutique trouvée pour cet utilisateur.' });
    }

    const boutiqueIds = boutiques.filter(Boolean).map(b => b._id);
    const products = await Product.find({ boutique: { $in: boutiqueIds } });

    res.json(products);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des produits :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const boutiqueId = req.body.boutiqueId;
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
      return res.status(400).json({ error: 'boutiqueId invalide.' });
    }
    const boutiqueObjectId = new mongoose.Types.ObjectId(boutiqueId);

    if (!boutiqueId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    const product = await Product.findOne({ _id: productId, boutique: boutiqueObjectId });

    if (!product) {
      console.log("🚫 Produit introuvable ou non autorisé :", productId);
      return res.status(404).json({ error: 'Produit non trouvé ou non autorisé.' });
    }

    if (product.imagePublicId) {
      const result = await cloudinary.uploader.destroy(product.imagePublicId);
      console.log("🗑️ Résultat suppression Cloudinary :", result);
    }

    await Product.deleteOne({ _id: productId });

    res.status(200).json({ message: 'Produit supprimé avec succès.' });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression du produit :', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const boutiqueId = req.body.boutiqueId;
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
      return res.status(400).json({ error: 'boutiqueId invalide.' });
    }
    const boutiqueObjectId = new mongoose.Types.ObjectId(boutiqueId);

    if (!boutiqueId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    const existingProduct = await Product.findOne({ _id: productId, boutique: boutiqueObjectId });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Produit non trouvé ou non autorisé.' });
    }

    const { name, price, category, description } = req.body;
    if (req.file && req.file.buffer) {
      if (existingProduct.imagePublicId) {
        const destroyResult = await cloudinary.uploader.destroy(existingProduct.imagePublicId);
        console.log("🗑️ Résultat suppression ancienne image :", destroyResult);
      }
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `riveltime/${boutiqueId}/vitrine` },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      const result = await streamUpload();
      existingProduct.imageUrl = result.secure_url;
      existingProduct.imagePublicId = result.public_id;
    }

    if (name) existingProduct.name = name;
    if (price) existingProduct.price = price;
    if (category) existingProduct.category = category;
    if (description) existingProduct.description = description;

    await existingProduct.save();

    res.status(200).json(existingProduct);
  } catch (err) {
    console.error('❌ Erreur lors de la modification du produit :', err);
    res.status(500).json({ error: 'Erreur lors de la modification du produit.' });
  }
};