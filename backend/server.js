// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔗 Connexion Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// 🔒 Auth0 middleware pour sécuriser les routes
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256'
});

// 🧪 Logger des requêtes
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.path}`);
  next();
});

// 🔥 Route publique pour suppression compte utilisateur connecté
app.delete('/api/auth/delete/me', jwtCheck, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;
    if (!userId) return res.status(400).json({ error: 'ID utilisateur introuvable' });

    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    });

    const accessToken = response.data.access_token;

    await axios.delete(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    res.status(200).json({ message: '✅ Compte supprimé avec succès' });

  } catch (error) {
    console.error('❌ Erreur suppression :', error?.response?.data || error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Exemple route protégée
app.get('/authorized', jwtCheck, (req, res) => {
  res.send('✅ Ressource sécurisée accessible');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur http://localhost:${PORT}`);
});