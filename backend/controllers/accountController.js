// backend/controllers/authController.js
const axios = require('axios');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const folderPath = `riveltime/${userId}`;

    if (!userId) return res.status(400).json({ error: 'ID utilisateur introuvable' });

    const { data } = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    await axios.delete(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });

    try {
      await cloudinary.api.delete_resources_by_prefix(folderPath);
      await cloudinary.api.delete_folder(folderPath);
      console.log(`📁 Dossier Cloudinary supprimé : ${folderPath}`);
    } catch (cloudErr) {
      console.warn(`⚠️ Erreur lors de la suppression du dossier Cloudinary (${folderPath}) :`, cloudErr.message);
    }

    await User.findOneAndDelete({ auth0Id: userId });

    res.status(200).json({ message: '✅ Compte supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression :', error?.response?.data || error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.requestPasswordReset = async (req, res) => {
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