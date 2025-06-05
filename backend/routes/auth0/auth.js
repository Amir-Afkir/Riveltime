const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

router.delete('/delete', async (req, res) => {
  try {
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;

    if (!userId) {
      return res.status(400).json({ error: 'Impossible d\'extraire l\'ID utilisateur' });
    }

    const { data: tokenResponse } = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const accessToken = tokenResponse.access_token;

    await axios.delete(`https://${AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('❌ Erreur lors de la suppression :', error.response?.data || error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;