/**
 * Middleware de vérification de rôle utilisateur.
 * Requiert que req.dbUser ait été injecté au préalable.
 * @param {string[]} allowedRoles - Liste des rôles autorisés.
 * @returns {Function} Middleware Express
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.dbUser;

    if (!user) {
      console.warn("❌ Accès refusé : utilisateur non authentifié ou dbUser manquant");
      return res.status(401).json({ error: "Authentification requise" });
    }

    if (!allowedRoles.includes(user.role)) {
      console.warn(`❌ Accès interdit : rôle '${user.role}' non autorisé`);
      return res.status(403).json({ error: "Accès interdit pour ce rôle" });
    }

    next();
  };
}