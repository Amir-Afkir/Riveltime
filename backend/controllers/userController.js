// backend/controllers/userController.js

exports.getMyProfile = async (req, res) => {
  try {
    const user = req.dbUser || req.user;

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Réponse filtrée selon le rôle
    if (user.role === 'client') {
      return res.json({
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
      });
    }

    if (user.role === 'vendeur') {
      return res.json({
        role: 'vendeur',
        fullname: user.fullname,
        phone: user.phone,
        raisonSociale: user.raisonSociale,
        kbis: user.kbis,
        notifications: user.notifications,
        infosVendeur: user.infosVendeur,
      });
    }

    if (user.role === 'livreur') {
      return res.json({
        role: 'livreur',
        fullname: user.fullname,
        phone: user.phone,
        raisonSociale: user.raisonSociale,
        kbis: user.kbis,
        notifications: user.notifications,
        infosLivreur: user.infosLivreur,
      });
    }

    // Cas inattendu (aucun des rôles)
    return res.status(400).json({ error: 'Rôle utilisateur inconnu' });

  } catch (err) {
    console.error('❌ Erreur lors de la récupération du profil :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Données invalides' });
    }

    const role = user.role;
    const { fullname, phone, notifications, infosClient, infosVendeur, infosLivreur, raisonSociale, kbis } = req.body;

    if (fullname) user.fullname = fullname;
    if (phone) user.phone = phone;
    if (typeof notifications === 'boolean') user.notifications = notifications;
    if (raisonSociale) user.raisonSociale = raisonSociale;
    if (kbis) user.kbis = kbis;

    const vendeurDefaults = {
      categorie: "",
      adresseComplete: "",
      latitude: null,
      longitude: null,
      telephone: "",
      moyensPaiement: [],
    };

    const clientDefaults = {
      adresseComplete: "",
      latitude: null,
      longitude: null,
    };

    const livreurDefaults = {
      siret: "", zone: "", typeDeTransport: "",
    };

    if (role === 'client') {
      user.infosClient = { ...clientDefaults, ...user.infosClient, ...infosClient };
      user.infosVendeur = null;
      user.infosLivreur = null;
    } else if (role === 'vendeur') {
      user.infosVendeur = { ...vendeurDefaults, ...user.infosVendeur, ...infosVendeur };
      user.infosClient = null;
      user.infosLivreur = null;
    } else if (role === 'livreur') {
      user.infosLivreur = { ...livreurDefaults, ...user.infosLivreur, ...infosLivreur };
      user.infosClient = null;
      user.infosVendeur = null;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour du profil :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};