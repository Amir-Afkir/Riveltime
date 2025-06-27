const fs = require('fs');
const path = require('path');

const userDefaults = JSON.parse(fs.readFileSync(path.join(__dirname, '../../shared/userDefaults.json'), 'utf-8'));
const { clientDefaults, vendeurDefaults, livreurDefaults } = userDefaults;
const { auth } = require('express-oauth2-jwt-bearer');
const User = require('../models/User');

// 1️⃣ Vérifie le token JWT Auth0
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256',
});

// 2️⃣ Injecte le payload dans req.user
const injectUser = (req, res, next) => {
  req.user = req.auth?.payload || {};
  console.log('🔐 Payload JWT reçu :', req.user); // ✅ Ajouté pour debug
  next();
};

// 3️⃣ Crée automatiquement un utilisateur Mongo si absent
const createUserIfNotExists = async (req, res, next) => {
  console.log("🔐 createUserIfNotExists → req.user:", req.user);
  try {
    const { sub: auth0Id, email, name, picture } = req.user;
    if (!auth0Id) {
      return res.status(400).json({ error: 'Token invalide : sub manquant' });
    }

    const safeEmail = email || `${auth0Id}@no-email.local`;
    const role = req.user['https://riveltime/api/role'] || 'client';

    let user = await User.findOne({ auth0Id });
    if (!user) {
      const userData = {
        auth0Id,
        email: safeEmail,
        fullname: name || 'Utilisateur',
        avatarUrl: picture || '',
        role,
        notifications: true,
        kbis: "",
        raisonSociale: "",
      };

      if (role === 'client') userData.infosClient = clientDefaults;
      if (role === 'vendeur') userData.infosVendeur = vendeurDefaults;
      if (role === 'livreur') userData.infosLivreur = livreurDefaults;

      user = await User.create(userData);
      console.log('🆕 Utilisateur créé automatiquement :', safeEmail);
    }

    req.dbUser = user;
    next();
  } catch (err) {
    console.error('❌ Erreur middleware createUserIfNotExists :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { jwtCheck, injectUser, createUserIfNotExists };