import fs from 'fs';
import path from 'path';
import { auth } from 'express-oauth2-jwt-bearer';
import User from '../models/User.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Defaults selon le rôle (clients, vendeurs, livreurs)
const userDefaults = JSON.parse(fs.readFileSync(path.join(__dirname, '../../shared/userDefaults.json'), 'utf-8'));
const { clientDefaults, vendeurDefaults, livreurDefaults } = userDefaults;

/**
 * 1️⃣ Vérifie et décode le token JWT Auth0
 */
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256',
});

/**
 * 2️⃣ Injecte le payload décodé dans req.user
 */
const injectUser = (req, res, next) => {
  req.user = req.auth?.payload || {};
  if (!req.auth) {
    console.warn("❌ Aucun payload reçu dans req.auth !");
  } else {
    console.log('🔐 Payload JWT injecté :', req.user);
  }
  next();
};

/**
 * 3️⃣ Si utilisateur absent en BDD, le créer automatiquement
 * Et injecte le document MongoDB dans req.dbUser
 */

const createUserIfNotExists = async (req, res, next) => {
  try {
    const { sub: auth0Id, email, name, picture } = req.user;
    if (!auth0Id) return res.status(400).json({ error: 'Token invalide : sub manquant' });

    const safeEmail = email || `${auth0Id}@no-email.local`;
    const role = req.user['https://api.riveltime.app/role'] || 'client';

    let user = await User.findOne({ auth0Id });
    if (!user) {
      const userData = {
        auth0Id,
        email: safeEmail,
        fullname: name || 'Utilisateur',
        avatarUrl: picture || '',
        role,
        notifications: true,
      };

      if (role === 'client') userData.infosClient = clientDefaults;
      if (role === 'vendeur') userData.infosVendeur = vendeurDefaults;
      if (role === 'livreur') userData.infosLivreur = livreurDefaults;

      user = await User.create(userData);
      console.log('🆕 Utilisateur MongoDB créé automatiquement :', safeEmail);
    }

    req.dbUser = user;
    next();
  } catch (err) {
    console.error('❌ Erreur dans createUserIfNotExists :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export { jwtCheck, injectUser, createUserIfNotExists };