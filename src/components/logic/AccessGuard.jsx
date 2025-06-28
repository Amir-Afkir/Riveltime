// src/components/logic/AccessGuard.jsx
import { useUser } from "../../context/UserContext";
import { Navigate } from "react-router-dom";

/**
 * Composant de garde d'accès basé sur le rôle utilisateur.
 * @param {string[]} allowedRoles - Les rôles autorisés (ex: ["client"])
 * @param {JSX.Element} children - Le contenu à afficher si l'accès est autorisé
 */
export default function AccessGuard({ allowedRoles, children }) {
  const { userData, loadingUser } = useUser();

  if (loadingUser) return <p>Chargement...</p>;

  if (!userData || !allowedRoles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}