// src/App.jsx
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useUserStore from "./stores/userStore";
import AppRoutes from './routes/AppRoutes.jsx';

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
        useUserStore.setState({
          token,
          userData: parsedUser,
          loadingUser: false,
        });
      }
    }
  }, [isAuthenticated, auth0User]);

  // Affiche un avertissement sur iOS PWA concernant le clavier virtuel
  useEffect(() => {
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;

    if (isiOS && isInStandaloneMode) {
      alert("⚠️ Le clavier virtuel peut ne pas fonctionner dans l'app installée sur iPhone. Utilisez Safari pour une meilleure expérience.");
    }
  }, []);

  const TestInput = () => (
    <div style={{ padding: "16px", backgroundColor: "#fff", zIndex: 9999 }}>
      <label htmlFor="ios-test-input" style={{ display: "block", marginBottom: "8px" }}>
        Test Clavier iOS :
      </label>
      <input
        id="ios-test-input"
        type="text"
        placeholder="Tape ici…"
        style={{
          padding: "12px",
          fontSize: "16px",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
          display: "block",
          border: "1px solid #ccc",
          borderRadius: "6px",
          color: "#000",
          backgroundColor: "#fff",
        }}
        onFocus={() => console.log("focus")}
        onChange={(e) => console.log("value:", e.target.value)}
      />
    </div>
  );

  return (
    <>
      <TestInput />
      <AppRoutes />
    </>
  );
}