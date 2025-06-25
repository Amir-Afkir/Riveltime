// ✅ src/pages/common/Profil.jsx
import { useUser } from "../../context/UserContext";
import UserProfileSections from "../../components/logic/UserProfileSections";

export default function ProfilCommun() {
  const { userData, loadingUser, refreshUser } = useUser();

  if (loadingUser) return <p>Chargement...</p>;
  if (!userData) return <p>Erreur : utilisateur introuvable</p>;

  return (
    <UserProfileSections user={userData} setUser={refreshUser} />
  );
}