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
      const token = await getAccessTokenSilently();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Échec récupération utilisateur");

      const raw = await response.text();
      const data = JSON.parse(raw);
      setUserData(data.user || data);
    } catch (error) {
      setUserData(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (!auth0Loading && auth0User) {
      fetchUser();
    }
  }, [auth0Loading, auth0User]);

  return (
    <UserContext.Provider value={{ userData, setUserData, refreshUser: fetchUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}