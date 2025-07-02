// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { jwtCheck, injectUser, createUserIfNotExists } = require('./middleware/auth');

const notificationRoutes = require('./routes/notificationRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const accountRoutes = require('./routes/accountRoutes');
const testRoutes = require('./routes/testRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const boutiqueRoutes = require('./routes/boutiqueRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Création dossier uploads si besoin
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// Health check
app.get('/', (req, res) => {
  res.send('✅ API Riveltime en ligne');
});

// Logger
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.path}`);
  next();
});

// Routes publiques (avant jwtCheck), toutes sous /api
app.use('/api', testRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/boutiques', boutiqueRoutes);
app.use('/api/products', productRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/client/accueil', vendorRoutes);

// Middleware commun pour authentification (après routes publiques)
app.use(jwtCheck, injectUser, createUserIfNotExists);

// Routes sécurisées (protégées par JWT)
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Gestion favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Route test sécurisée
app.get('/api/authorized', (req, res) => {
  res.send('✅ Ressource sécurisée accessible');
});

// Gestion erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend démarré sur http://0.0.0.0:${PORT}`);
});