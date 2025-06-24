// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const { jwtCheck, injectUser, createUserIfNotExists } = require('./middleware/auth');
const User = require('./models/User');

const notificationRoutes = require('./routes/notificationRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 📁 Créer le dossier uploads si nécessaire
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 🌐 Middlewares globaux
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// 🔗 Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// 🔥 Health check
app.get('/', (req, res) => {
  res.send('✅ API Riveltime en ligne');
});

// 🧪 Logger de requêtes
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.path}`);
  next();
});

// 🌍 Route publique
app.use('/api/address', addressRoutes);

// 🔐 Middleware Auth0 commun
app.use(jwtCheck, injectUser, createUserIfNotExists);

// 📦 Routes API sécurisées
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// 🌍 Route publique
app.use('/api/products', productRoutes);

// ❌ Suppression d'un compte utilisateur
app.delete('/api/auth/delete/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;
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
});

// ✅ Route sécurisée de test
app.get('/authorized', (req, res) => {
  res.send('✅ Ressource sécurisée accessible');
});

// 🌐 Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// 🚀 Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur http://localhost:${PORT}`);
});