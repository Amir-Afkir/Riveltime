import express from 'express';
import { Router } from 'express';
const router = Router();

router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Requête vide" });

  try {
    const fetch = (await import('node-fetch')).default; // solution dynamique

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=fr&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RiveltimeApp/1.0 (contact@riveltime.io)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Nominatim response error:", response.status, text);
      return res.status(500).json({ error: `Erreur Nominatim ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Erreur lors de la requête à Nominatim :", err);
    res.status(500).json({ error: "Erreur lors de la recherche d'adresse" });
  }
}); 

export default router;