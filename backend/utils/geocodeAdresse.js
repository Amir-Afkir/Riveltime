// utils/geocodeAdresse.js 

/**
 * Géocode une adresse texte en coordonnées latitude/longitude
 * @param {string} adresse - L'adresse à géocoder (au moins 3 caractères)
 * @returns {Promise<{ lat: number, lon: number, label?: string }>} - Coordonnées GPS ou erreur
 * @throws {Error} - Si l'adresse est invalide ou non trouvée
 */
export async function geocodeAdresse(adresse) {
  if (!adresse || adresse.length < 3) {
    throw new Error("Adresse trop courte");
  }

  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'RiveltimeApp/1.0 (contact@riveltime.io)',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erreur API Adresse :", response.status, errorText);
    throw new Error(`Erreur API Adresse (${response.status})`);
  }

  const data = await response.json();

  if (!data.features?.length) {
    throw new Error("Adresse non trouvée");
  }

  const coords = data.features[0].geometry.coordinates; // [lon, lat]
  return {
    lat: coords[1],
    lon: coords[0],
    label: data.features[0].properties.label
  };
}