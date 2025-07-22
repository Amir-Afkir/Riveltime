// backend/controllers/accountController.js
import axios from 'axios';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import Boutique from '../models/Boutique.js';
import Product from '../models/Product.js';

//Supprime le compte utilisateur (Auth0 + MongoDB + Cloudinary)
export const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const dbUser = req.dbUser;

    if (!userId || !dbUser) {
      console.warn("❌ Requête invalide : utilisateur manquant");
      return res.status(400).json({ error: 'Requête invalide' });
    }

    if (dbUser.auth0Id !== userId) {
      console.warn("❌ Tentative de suppression non autorisée !");
      return res.status(403).json({ error: "Action non autorisée" });
    }

    const folderPath = `riveltime/${userId}`;

    // 1. Supprimer l'utilisateur sur Auth0
    const { data } = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    await axios.delete(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    console.log(`✅ Utilisateur Auth0 supprimé : ${userId}`);

    // 2. Supprimer les fichiers Cloudinary
    try {
      await cloudinary.api.delete_resources_by_prefix(folderPath);
      await cloudinary.api.delete_folder(folderPath);
      console.log(`📁 Dossier Cloudinary supprimé : ${folderPath}`);
    } catch (cloudErr) {
      console.warn(`⚠️ Erreur Cloudinary : ${cloudErr.message}`);
    }

    // 🔥 Supprimer les boutiques et produits associés

    const boutiques = await Boutique.find({ owner: dbUser._id });

    for (const boutique of boutiques) {
      // Supprimer les produits de la boutique
      const produits = await Product.find({ boutique: boutique._id });
      for (const produit of produits) {
        if (produit.imagePublicId) {
          await cloudinary.uploader.destroy(produit.imagePublicId);
        }
      }
      await Product.deleteMany({ boutique: boutique._id });

      // Supprimer l'image de couverture de la boutique
      if (boutique.coverImagePublicId) {
        await cloudinary.uploader.destroy(boutique.coverImagePublicId);
      }

      // Supprimer le dossier Cloudinary de la boutique
      const boutiqueFolder = `riveltime/${userId}/boutiques/${boutique._id}`;
      try {
        await cloudinary.api.delete_resources_by_prefix(boutiqueFolder);
        await cloudinary.api.delete_folder(boutiqueFolder);
      } catch (err) {
        console.warn(`⚠️ Erreur suppression dossier Cloudinary boutique : ${err.message}`);
      }

      await boutique.deleteOne();
    }

    console.log(`🧹 Boutiques et produits liés à l'utilisateur supprimés`);

    // 3. Supprimer dans MongoDB
    const result = await User.findOneAndDelete({ auth0Id: userId });

    if (result) {
      console.log(`🧨 Utilisateur supprimé de MongoDB : ${result.email}`);
    } else {
      console.warn(`⚠️ Utilisateur introuvable dans MongoDB : ${userId}`);
    }

    res.status(200).json({ message: '✅ Compte supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression :', error?.response?.data || error.message);
    res.status(500).json({ error: 'Erreur serveur pendant la suppression du compte' });
  }
};

//Change le mot de passe du compte utilisateur
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });

  try {
    await axios.post(`https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      connection: 'Username-Password-Authentication', // à adapter si différent
    });

    res.status(200).json({ message: '📧 Email de réinitialisation envoyé' });
  } catch (err) {
    console.error('❌ Erreur envoi reset password :', err?.response?.data || err.message);
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
  }
};