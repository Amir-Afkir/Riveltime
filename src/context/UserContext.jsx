// ✅ src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";


const UserContext = createContext();

export function UserProvider({ children }) {
  const { getAccessTokenSilently, user: auth0User, isLoading: auth0Loading, isAuthenticated, logout } = useAuth0();

  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async () => {
    try {
      setLoadingUser(true);

      const accessToken = await getAccessTokenSilently();
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
      setUserData(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (!auth0Loading && isAuthenticated) {
      fetchUser();
    }
  }, [auth0Loading, isAuthenticated]);

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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}