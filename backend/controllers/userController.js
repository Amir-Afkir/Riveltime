const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
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
        notifications: user.notifications,
        infosLivreur: {
          typeDeTransport: user.infosLivreur?.typeDeTransport || "",
        },
      };
    default:
      return null;
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    console.log("🔐 req.user:", req.user);
    console.log("🧬 req.dbUser:", req.dbUser);
    if (!dbUser) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const formatted = formatUserProfile(dbUser);
    if (!formatted) return res.status(400).json({ error: 'Rôle utilisateur inconnu' });

    return res.json({ ...formatted, avatarUrl: dbUser.avatarUrl });
  } catch (err) {
    console.error('❌ Erreur lors de la récupération du profil :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    console.log("🔄 Données reçues:", req.body);

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
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Numéro de téléphone invalide" });
    }
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
      if (!infosLivreur || typeof infosLivreur.typeDeTransport !== 'string' || infosLivreur.typeDeTransport.trim() === '') {
        return res.status(400).json({ error: "Type de transport manquant ou invalide" });
      }

      dbUser.infosLivreur = {
        ...livreurDefaults,
        ...dbUser.infosLivreur,
        typeDeTransport: infosLivreur.typeDeTransport.trim(),
      };
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


exports.uploadAvatar = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

    const folder = `riveltime/${dbUser.auth0Id}/profil`;

    // Supprimer l’ancien avatar
    if (dbUser.avatarUrl) {
      const parts = dbUser.avatarUrl.split('/');
      const publicId = parts[parts.length - 1].split('.')[0];
      await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    }

    // Upload du nouvel avatar
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, public_id: "avatar", overwrite: true },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();
    dbUser.avatarUrl = result.secure_url;
    await dbUser.save();

    res.json({ message: '✅ Avatar mis à jour', avatarUrl: dbUser.avatarUrl });
  } catch (err) {
    console.error('❌ Upload avatar :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    if (!dbUser.avatarUrl) return res.status(400).json({ error: 'Aucun avatar à supprimer' });

    const folder = `riveltime/${dbUser.auth0Id}/profil`;
    const parts = dbUser.avatarUrl.split('/');
    const publicId = parts[parts.length - 1].split('.')[0];

    await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    dbUser.avatarUrl = undefined;
    await dbUser.save();

    res.json({ message: '✅ Avatar supprimé' });
  } catch (err) {
    console.error('❌ Suppression avatar :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};