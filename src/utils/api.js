import axios from 'axios';
import useUserStore from '../stores/userStore'; // Import direct pour récupérer le token

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Configure et retourne une instance Axios préconfigurée.
 * Ajoute un intercepteur pour inclure le token d'authentification.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json', // Type de contenu par défaut, peut être écrasé
  },
});

// Intercepteur pour ajouter le token d'authentification à toutes les requêtes
apiClient.interceptors.request.use(config => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

/**
 * Gère les erreurs Axios de manière centralisée.
 * @param {Error} err - L'objet erreur Axios.
 * @param {function} set - La fonction `set` du store Zustand.
 * @param {string} fallbackMessage - Message d'erreur par défaut.
 * @returns {string} Le message d'erreur affiché.
 */
export const handleAxiosError = (err, set, fallbackMessage = "Une erreur est survenue") => {
  console.error("❌ Erreur API:", err);
  const errorMessage = err?.response?.data?.error || fallbackMessage;
  set({ error: errorMessage });
  return errorMessage;
};

/**
 * Utilitaire pour encapsuler les appels API avec gestion du loading et de l'erreur.
 * @param {function} set - La fonction `set` du store Zustand.
 * @param {function} asyncFn - La fonction asynchrone à exécuter.
 */
export const withLoadingAndError = async (set, asyncFn) => {
  set({ loading: true, error: null });
  try {
    await asyncFn();
  } catch (err) {
    handleAxiosError(err, set);
    throw err; // Rejeter l'erreur pour que l'appelant puisse la gérer si besoin
  } finally {
    set({ loading: false });
  }
};

/**
 * Crée un objet FormData à partir d'un objet JavaScript.
 * Gère la sérialisation de champs spécifiques en JSON.
 * @param {Object} data - Les données à transformer en FormData.
 * @returns {FormData} L'objet FormData.
 */
export function createFormData(data) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (['location', 'horaires'].includes(key)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  }
  return formData;
}

/**
 * Transforme les données utilisateur brutes du local storage.
 * @param {Object} userData - Les données utilisateur à transformer.
 * @returns {Object} Les données utilisateur transformées.
 */
export function transformUserDataFromStorage(userData) {
  if (!userData) return null;

  if (typeof userData._id === 'object' && userData._id.$oid) {
    userData._id = userData._id.$oid; // Cas export MongoDB avec $oid
  } else if (!userData._id && userData.id) {
    userData._id = userData.id; // Compatibilité si seulement `id`
  }
  return userData;
}