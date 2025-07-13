// src/stores/userStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useUserStore = create(devtools((set, get) => {
  // 📦 Utilitaires internes
  function saveAccessToken(token) {
    localStorage.setItem("accessToken", token);
  }

  function saveUserData(user) {
    localStorage.setItem("userData", JSON.stringify(user));
  }

  function clearStorage() {
    localStorage.clear();
  }

  function getCachedUser() {
    const raw = localStorage.getItem("userData");
    return raw ? JSON.parse(raw) : null;
  }

  function resolveTokenFn(inputFn) {
    const fn = typeof inputFn === 'function' ? inputFn : get().getTokenSilently;
    if (typeof fn !== 'function') throw new Error("getTokenSilently non défini ou invalide");
    return fn;
  }

  return {
    token: null,
    userData: null,
    loadingUser: true,
    auth0User: null,
    getTokenSilently: null,

    // 🔄 Restaure depuis le cache local (appelé dans App.jsx ou ailleurs)
    restoreUserFromCache: () => {
      const token = localStorage.getItem("accessToken");
      const raw = localStorage.getItem("userData");
      const userData = raw ? JSON.parse(raw) : null;

      if (token && userData) {
        set({
          token,
          userData,
          loadingUser: false,
        });
      }
    },

    // 🔐 Initialise depuis Auth0
    initAuth0Session: function initAuth0Session({ auth0User, getTokenSilently }) {
      const cached = getCachedUser();

      if (cached?.auth0Id === auth0User?.sub) {
        set({
          userData: cached,
          token: localStorage.getItem("accessToken"),
          auth0User,
          getTokenSilently,
          loadingUser: false,
        });
      } else {
        localStorage.removeItem("userData");
        set({ auth0User, getTokenSilently });
        get().fetchUser({ getTokenSilently });
      }
    },

    // 🔄 Met à jour l'utilisateur (appel API sécurisé)
    fetchUser: async function fetchUser({ getTokenSilently, silent = false } = {}) {
      try {
        const tokenFn = resolveTokenFn(getTokenSilently);
        if (!silent) set({ loadingUser: true });

        const accessToken = await tokenFn();
        if (!accessToken) throw new Error("Pas de token");

        saveAccessToken(accessToken);
        set({ token: accessToken });

        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Échec récupération utilisateur");

        const data = await res.json();
        const finalUser = { ...(data.user || data), auth0Id: get().auth0User?.sub };

        saveUserData(finalUser);
        set({ userData: finalUser });
      } catch (err) {
        console.error("❌ Erreur fetchUser Zustand:", err);
        set({ userData: null });
      } finally {
        if (!silent) set({ loadingUser: false });
      }
    },

    // 🔑 Fournit la fonction Auth0 en mémoire
    getTokenSilentlyFn: function getTokenSilentlyFn() {
      return get().getTokenSilently;
    },

    // 🚪 Déconnexion sécurisée
    logoutSafe: function logoutSafe(logoutFn) {
      clearStorage();
      set({ token: null, userData: null, loadingUser: true });
      logoutFn({
        returnTo: import.meta.env.VITE_BASE_URL,
        federated: true,
      });
    },
  };
}));

export default useUserStore;