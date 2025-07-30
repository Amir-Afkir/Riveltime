import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient, withLoadingAndError, transformUserDataFromStorage } from '../utils/api';

const useUserStore = create(devtools((set, get) => {
  // 📦 Utilitaires internes pour le stockage local
  const saveAccessToken = (token) => {
    localStorage.setItem("accessToken", token);
  };

  const saveUserData = (user) => {
    localStorage.setItem("userData", JSON.stringify(user));
  };

  const clearStorage = () => {
    localStorage.clear();
    // Enlève aussi les données du store en plus de localStorage
    set({ token: null, userData: null, loadingUser: true, auth0User: null, getTokenSilently: null });
  };

  const getCachedUser = () => {
    const raw = localStorage.getItem("userData");
    return transformUserDataFromStorage(raw ? JSON.parse(raw) : null);
  };

  return {
    token: null,
    userData: null,
    loadingUser: true, // Indique le chargement initial de l'utilisateur
    auth0User: null,
    getTokenSilently: null, // Fonction Auth0 pour récupérer le token

    // 🔄 Restaure depuis le cache local
    restoreUserFromCache: () => {
      const token = localStorage.getItem("accessToken");
      const userData = getCachedUser();

      console.log("🗂️ Restauration depuis le cache local...", { token, userData });

      if (token && userData && userData._id) {
        set({
          token,
          userData,
          loadingUser: false,
        });
      } else {
        set({ loadingUser: false }); // Pas de données en cache, marquer comme non chargé
      }
    },

    // 🔐 Initialise depuis Auth0
    initAuth0Session: ({ auth0User, getTokenSilently }) => {
      const cached = getCachedUser();

      // Comparer l'ID Auth0 pour s'assurer que le cache appartient à l'utilisateur actuel
      if (cached?.auth0Id === auth0User?.sub) {
        console.log("🔄 Session restaurée depuis le cache local");
        set({
          userData: cached,
          token: localStorage.getItem("accessToken"),
          auth0User,
          getTokenSilently,
          loadingUser: false,
        });
      } else {
        console.log("📡 Aucun cache valide ou utilisateur Auth0 différent, récupération distante...");
        localStorage.removeItem("userData"); // Nettoyer le cache utilisateur obsolète
        set({ auth0User, getTokenSilently, loadingUser: true }); // Mettre à jour Auth0User et marquer comme chargeant
        get().fetchUser(); // Lancer la récupération de l'utilisateur
      }
    },

    // 🔄 Met à jour l'utilisateur (appel API sécurisé)
    fetchUser: async ({ silent = false } = {}) => {
      if (!get().getTokenSilently) {
        console.warn("🔒 getTokenSilently non disponible. Impossible de récupérer l'utilisateur.");
        if (!silent) set({ loadingUser: false, userData: null });
        return;
      }

      await withLoadingAndError(set, async () => {
        if (!silent) set({ loadingUser: true }); // Assurer le loading si non silencieux

        const accessToken = await get().getTokenSilently();
        if (!accessToken) throw new Error("Pas de token disponible");

        saveAccessToken(accessToken);
        set({ token: accessToken });

        console.log("🌐 Récupération de l'utilisateur via:", `${import.meta.env.VITE_API_URL}/users/me`);

        const res = await apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` }, // Le token est déjà ajouté par l'intercepteur mais on peut forcer ici
        });

        const finalUser = { ...(res.data.user || res.data), auth0Id: get().auth0User?.sub };
        console.log("👤 Données utilisateur reçues et transformées:", finalUser);

        saveUserData(finalUser);
        set({ userData: finalUser });
      }).finally(() => {
        if (!silent) set({ loadingUser: false });
      });
    },

    // 🚫 Suppression du compte utilisateur
    deleteAccount: async () => {
      const { token, userData } = get();
      if (!token || !userData) {
        console.warn("❌ Impossible de supprimer le compte : utilisateur ou token manquant");
        alert("Impossible de supprimer le compte: session non valide."); // Utiliser un système de notification plus tard
        return;
      }

      await withLoadingAndError(set, async () => {
        const res = await apiClient.delete('/account/delete/me', {
          // Le token est automatiquement ajouté par l'intercepteur
        });

        if (res.status === 200 || res.status === 204) {
          console.log("✅ Compte supprimé avec succès");
          clearStorage();
          // La redirection est gérée par le composant appelant
        } else {
          throw new Error(res.data.error || "Échec de la suppression du compte.");
        }
      });
    },

    // 🚪 Déconnexion sécurisée
    logoutSafe: (logoutFn) => {
      clearStorage();
      logoutFn({
        returnTo: import.meta.env.VITE_BASE_URL,
        federated: true,
      });
    },
  };
}));

export default useUserStore;