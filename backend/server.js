// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { jwtCheck, injectUser, createUserIfNotExists } = require('./middleware/auth');
const User = require('./models/User');

const notificationRoutes = require('./routes/notificationRoutes');
const productRoutes = require('./routes/productRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const addressRoutes = require('./routes/addressRoutes.js');
const accountRoutes = require('./routes/accountRoutes.js'); // ✅ Ajouté

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

// 🌍 Routes publiques
app.use('/api', require('./routes/testRoutes'));
app.use('/api/address', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/account', accountRoutes); // ✅ Route déplacée ici pour exposer password-reset publiquement

// 🚫 Ignore les requêtes vers favicon.ico pour éviter les erreurs 401 inutiles
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 🔐 Middleware Auth0 commun
app.use(jwtCheck, injectUser, createUserIfNotExists);

// 📦 Routes API sécurisées
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Route de test sécurisée
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend démarré sur http://0.0.0.0:${PORT}`);
});