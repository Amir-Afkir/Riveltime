// src/components/logic/AccessGuard.jsx
import useUserStore from "../../stores/userStore";
import { Navigate } from "react-router-dom";

/**
 * Composant de garde d'accès basé sur le rôle utilisateur.
 * @param {string[]} allowedRoles - Les rôles autorisés (ex: ["client"])
 * @param {JSX.Element} children - Le contenu à afficher si l'accès est autorisé
 */
export default function AccessGuard({ allowedRoles, children }) {
  const { userData, loadingUser } = useUserStore();

  if (loadingUser) return <p>Chargement...</p>;

  // Attendre que userData soit défini
  if (!userData) return <p>Préparation de votre espace...</p>;

  // Rediriger uniquement si l'utilisateur est chargé mais non autorisé
  if (!allowedRoles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}