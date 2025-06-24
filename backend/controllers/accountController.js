// backend/controllers/authController.js
const axios = require('axios');
const User = require('../models/User');

exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user?.sub;
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

    await User.findOneAndDelete({ auth0Id: userId });

    res.status(200).json({ message: '✅ Compte supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression :', error?.response?.data || error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};