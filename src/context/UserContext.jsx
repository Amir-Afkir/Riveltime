// ✅ src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";


const UserContext = createContext();

export function UserProvider({ children }) {
  const { getAccessTokenSilently, user: auth0User, isLoading: auth0Loading, isAuthenticated, logout, loginWithRedirect } = useAuth0();

  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoadingUser(true);

      let accessToken = null;
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        console.error("❌ Auth0 Token Error:", err);
        if (!silent) setUserData(null);
        setLoadingUser(false);
        return;
      }

      if (!accessToken) {
        if (!silent) setUserData(null);
        setLoadingUser(false);
        return; // ⛔ stop ici si pas de token
      }

      setToken(accessToken);
      localStorage.setItem("accessToken", accessToken);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error("Échec récupération utilisateur");

      const data = await response.json();
      setUserData(data.user || data);
    } catch (error) {
      console.error("❌ Erreur fetchUser:", error);
      if (!silent) setUserData(null);
    } finally {
      if (!silent) setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (!auth0Loading && isAuthenticated) {
      console.log("✅ Auth0 prêt, on fetch l'utilisateur");
      fetchUser();
    }
  }, [auth0Loading, isAuthenticated]);

  // Fonction pour supprimer le compte utilisateur
  const deleteAccount = async () => {
    const confirm = window.confirm("⚠️ Cette action est irréversible. Supprimer votre compte ?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/account/delete/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur serveur");

      localStorage.removeItem("accessToken");
      setUserData(null);
      logout({ returnTo: import.meta.env.VITE_BASE_URL });
    } catch (err) {
      console.error("❌ Erreur lors de la suppression :", err);
      alert("La suppression du compte a échoué.");
    }
  };

  return (
    <UserContext.Provider
      value={{
        token,
        setToken,
        userData,
        setUserData,
        refreshUser: fetchUser,
        loadingUser,
        isAuthenticated,
        auth0User,
        logout,
        loginWithRedirect,
        deleteAccount, // 👈 ajouté ici
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}