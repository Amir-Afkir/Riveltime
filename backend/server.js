import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import stripeWebhook from './routes/stripeWebhook.js';
import { jwtCheck, injectUser, createUserIfNotExists } from './middleware/auth.js';
import testRoutes from './routes/testRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import boutiqueRoutes from './routes/boutiqueRoutes.js';
import publicProductRoutes from './routes/publicProductRoutes.js';
import stripeRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 👉 À mettre avant jwtCheck : route Stripe Webhook non protégée
app.use('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Middleware auth
// const { jwtCheck, injectUser, createUserIfNotExists } = require('./middleware/auth');

// Middleware globaux
app.use(cors());
app.use(express.json());

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
app.use('/', testRoutes);
app.use('/account', accountRoutes);
app.use('/address', addressRoutes);
app.use('/client/accueil', vendorRoutes);

app.use('/boutiques', boutiqueRoutes);

// ✅ ROUTE PRODUITS PUBLIQUE (produits d’une boutique)
app.use('/produits', publicProductRoutes); // uniquement get /produits/boutique/:id

// =====================================================
// 🔐 MIDDLEWARE JWT (appliqué après les routes publiques)
// =====================================================

// 🔐 Middleware global JWT (appliqué à toutes les autres routes)
app.use(jwtCheck, injectUser, createUserIfNotExists);

app.use('/stripe', stripeRoutes);



// ====================================
// 🔐 ROUTES PRIVÉES (PROTÉGÉES PAR JWT)
// ====================================
app.use('/users', userRoutes);
app.use('/produits', productRoutes); // create/update/delete/mine
app.use('/notifications', notificationRoutes);
app.use('/orders', orderRoutes); 
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