// src/pages/common/Profil.jsx
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../../components/layout/Header";
import BottomNav from "../../components/layout/BottomNav";
import UserProfileSections from "../../components/logic/UserProfileSections";

export default function ProfilCommun() {
  const [user, setUser] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUser();
  }, [getAccessTokenSilently]);

  if (!user) return <p>Chargement...</p>;

  // Optionnel : personnalisation couleur selon rôle
  const color = {
    client: "blue",
    vendeur: "green",
    livreur: "orange",
  }[user.role] || "gray";

  return (
    <div className={`min-h-screen bg-${color}-50 pb-28`}>
      <Header title="Mon profil" showBack={false} color={color} />
      <div className="max-w-md mx-auto p-4 space-y-6 text-gray-700">
        <UserProfileSections user={user} />
      </div>
      <BottomNav />
    </div>
  );
}