require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware auth
const { jwtCheck, injectUser, createUserIfNotExists } = require('./middleware/auth');

// Création du dossier uploads s’il n’existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware globaux
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// ✅ Logger simple
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.path}`);
  next();
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ API Riveltime en ligne');
});


// ====================================
// 🌐 ROUTES PUBLIQUES (AVANT jwtCheck)
// ====================================
app.use('/', require('./routes/testRoutes'));
app.use('/account', require('./routes/accountRoutes'));
app.use('/address', require('./routes/addressRoutes'));
app.use('/client/accueil', require('./routes/vendorRoutes'));

app.use('/boutiques', require('./routes/boutiqueRoutes'));

// ✅ ROUTE PRODUITS PUBLIQUE (produits d’une boutique)
app.use('/produits', require('./routes/publicProductRoutes')); // uniquement get /produits/boutique/:id


// =====================================================
// 🔐 MIDDLEWARE JWT (appliqué après les routes publiques)
// =====================================================
app.use(jwtCheck, injectUser, createUserIfNotExists);


// ====================================
// 🔐 ROUTES PRIVÉES (PROTÉGÉES PAR JWT)
// ====================================
app.use('/users', require('./routes/userRoutes'));
app.use('/produits', require('./routes/productRoutes')); // create/update/delete/mine
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/orders', require('./routes/orderRoutes')); 

// ====================================
// 🧪 Route test sécurisée
// ====================================
app.get('/authorized', (req, res) => {
  res.send('✅ Ressource sécurisée accessible');
});

// ====================================
// 🧹 Fallback & erreurs
// ====================================
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.use((req, res) => {
  console.warn(`❓ Route non trouvée : ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route introuvable' });
});


// ====================================
// 🚀 Lancement serveur
// ====================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend démarré sur http://0.0.0.0:${PORT}`);
});