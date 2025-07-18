// backend/utils/responseHelpers.js

/**
 * Répond avec une erreur serveur standardisée
 * @param {Response} res - objet response Express
 * @param {string} message - message d'erreur à afficher
 * @param {Error} [err] - optionnel, l'erreur d'origine
 */
exports.serverError = (res, message = 'Erreur serveur', err = null) => {
  if (err) console.error('❌', message, err);
  res.status(500).json({ error: message });
};