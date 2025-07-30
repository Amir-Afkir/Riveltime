// src/App.jsx
import { useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { useAuth0 } from "@auth0/auth0-react";
import useUserStore from "./stores/userStore";
import AppRoutes from './routes/AppRoutes.jsx';
import UpdateBanner from './components/ui/UpdateBanner';

export default function App() {
  const {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently: getTokenSilently, // ✅ Renommé pour être utilisé directement
    user: auth0User,
  } = useAuth0();

  /**
   * 🔁 Synchronise Auth0 avec Zustand OU restaure depuis le cache local
   */
  useEffect(() => {
    const store = useUserStore.getState();

    if (isAuthenticated && auth0User) {
      // 🔐 Auth0 est prêt → sync avec Zustand
      store.initAuth0Session({
        auth0User,
        getTokenSilently,
      });
    } else {
      // 💾 Auth0 pas encore prêt → restaure localStorage
      const token = localStorage.getItem("accessToken");
      const rawUser = localStorage.getItem("userData");
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;

      if (token && parsedUser) {
        // 🛠 Patch de sécurité si _id est absent mais id présent
        if (!parsedUser._id && parsedUser.id) {
          parsedUser._id = parsedUser.id;
        }

        useUserStore.setState({
          token,
          userData: parsedUser,
          loadingUser: false,
        });
      }
    }
  }, [isAuthenticated, auth0User]);

  return (
    <>
      <UpdateBanner />
      <AppRoutes />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}