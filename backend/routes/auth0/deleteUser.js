// /server/routes/auth0/deleteUser.js
import express from 'express';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ENV variables
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const MGMT_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const MGMT_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const MGMT_AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`;

// Get machine-to-machine token
async function getManagementToken() {
  const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: MGMT_CLIENT_ID,
      client_secret: MGMT_CLIENT_SECRET,
      audience: MGMT_AUDIENCE
    })
  });
  const data = await res.json();
  return data.access_token;
}

// Delete user endpoint
router.delete('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.sub) {
      return res.status(400).json({ error: 'ID utilisateur introuvable dans le token' });
    }
    const userId = decoded.sub;

    const managementToken = await getManagementToken();
    if (!managementToken) {
      return res.status(500).json({ error: 'Impossible de récupérer le token de gestion Auth0' });
    }

    const deleteRes = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${managementToken}`
      }
    });

    if (deleteRes.status === 204) {
      return res.status(200).json({ message: 'Compte supprimé avec succès' });
    } else {
      const err = await deleteRes.json();
      return res.status(deleteRes.status).json(err);
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
