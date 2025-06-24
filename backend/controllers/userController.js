// backend/controllers/userController.js

const fs = require('fs');
const path = require('path');

const defaultsPath = path.join(__dirname, '../../shared/userDefaults.json');
const { clientDefaults, vendeurDefaults, livreurDefaults } = JSON.parse(fs.readFileSync(defaultsPath, 'utf-8'));

const formatUserProfile = (user) => {
  switch (user.role) {
    case 'client':
      return {
        role: 'client',
        fullname: user.fullname,
        phone: user.phone,
        notifications: user.notifications,
        infosClient: {
          adresseComplete: user.infosClient?.adresseComplete || "",
          latitude: user.infosClient?.latitude || null,
          longitude: user.infosClient?.longitude || null,
          telephone: user.infosClient?.telephone || "",
        }
      };
    case 'vendeur':
      return {
        role: 'vendeur',
        fullname: user.fullname,
        phone: user.phone,
        raisonSociale: user.raisonSociale,
        kbis: user.kbis,
        notifications: user.notifications,
        infosVendeur: user.infosVendeur,
      };
    case 'livreur':
      return {
        role: 'livreur',
        fullname: user.fullname,
        phone: user.phone,
        raisonSociale: user.raisonSociale,
        kbis: user.kbis,
        notifications: user.notifications,
        infosLivreur: user.infosLivreur,
      };
    default:
      return null;
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    if (!dbUser) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const formatted = formatUserProfile(dbUser);
    if (!formatted) return res.status(400).json({ error: 'Rôle utilisateur inconnu' });

    return res.json(formatted);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération du profil :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    if (!dbUser) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Données invalides' });
    }

    const role = dbUser.role;
    const { fullname, phone, notifications, infosClient, infosVendeur, infosLivreur, raisonSociale, kbis } = req.body;

    if (fullname) dbUser.fullname = fullname;
    if (phone) dbUser.phone = phone;
    if (typeof notifications === 'boolean') dbUser.notifications = notifications;
    if (raisonSociale) dbUser.raisonSociale = raisonSociale;
    if (kbis) dbUser.kbis = kbis;

    if (role === 'client') {
      dbUser.infosClient = { ...clientDefaults, ...dbUser.infosClient, ...infosClient };
      dbUser.infosVendeur = null;
      dbUser.infosLivreur = null;
    } else if (role === 'vendeur') {
      dbUser.infosVendeur = { ...vendeurDefaults, ...dbUser.infosVendeur, ...infosVendeur };
      dbUser.infosClient = null;
      dbUser.infosLivreur = null;
    } else if (role === 'livreur') {
      dbUser.infosLivreur = { ...livreurDefaults, ...dbUser.infosLivreur, ...infosLivreur };
      dbUser.infosClient = null;
      dbUser.infosVendeur = null;
    }

    await dbUser.save();
    res.json(dbUser);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour du profil :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};