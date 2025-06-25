// ✅ src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { getAccessTokenSilently, user: auth0User, isLoading: auth0Loading } = useAuth0();

  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      console.log("🔐 Tentative de récupération du token...");
      const token = await getAccessTokenSilently();
      console.log("✅ Token récupéré");
      console.log("📡 Envoi de la requête à /api/users/me");
      const response = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Échec récupération utilisateur");
      const data = await response.json();
      console.log("📥 Données utilisateur reçues :", data);
      setUserData(data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement du contexte utilisateur :", error);
      setUserData(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    console.log("🔄 Auth0 loading:", auth0Loading, "| Auth0 user:", auth0User);
    if (!auth0Loading && auth0User) {
      fetchUser();
    }
  }, [auth0Loading, auth0User]);

  console.log("📦 Contexte utilisateur fourni :", { userData, loadingUser });
  return (
    <UserContext.Provider value={{ userData, setUserData, refreshUser: fetchUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}