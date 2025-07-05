// ✅ src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";


const UserContext = createContext();

export function UserProvider({ children }) {
  const { getAccessTokenSilently, user: auth0User, isLoading: auth0Loading, isAuthenticated, logout, loginWithRedirect } = useAuth0();

  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoadingUser(true);

      const accessToken = await getAccessTokenSilently().catch((err) => {
        console.error("❌ Auth0 Token Error:", err);
        return null;
      });

      if (!accessToken) {
        if (!silent) setUserData(null);
        return; // ⛔ stop ici si pas de token
      }

      setToken(accessToken);
      sessionStorage.setItem("accessToken", accessToken);

      try {
        const decoded = jwtDecode(accessToken);
        setDecodedToken(decoded);
        sessionStorage.setItem("decodedToken", JSON.stringify(decoded));
      } catch (err) {
        console.warn("❌ Impossible de décoder l'access token :", err);
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error("Échec récupération utilisateur");

      const raw = await response.text();
      const data = JSON.parse(raw);
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
      fetchUser();
    }
  }, [auth0Loading, isAuthenticated]);

  // Fonction pour supprimer le compte utilisateur
  const deleteAccount = async () => {
    const confirm = window.confirm("⚠️ Cette action est irréversible. Supprimer votre compte ?");
    if (!confirm) return;

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/account/delete/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur serveur");

      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("decodedToken");
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
        decodedToken,
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