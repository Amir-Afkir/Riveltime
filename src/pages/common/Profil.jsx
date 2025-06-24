// src/pages/common/Profil.jsx
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import UserProfileSections from "../../components/logic/UserProfileSections";

export default function ProfilCommun() {
  const [user, setUser] = useState(null);
  const { getAccessTokenSilently, user: auth0User } = useAuth0();

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

    if (!user && auth0User) {
      fetchUser();
    }
  }, [getAccessTokenSilently, auth0User, user]);

  if (!user) return <p>Chargement...</p>;

  return <UserProfileSections user={user} setUser={setUser} />;
}