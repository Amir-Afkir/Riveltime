import axios from 'axios';
import useUserStore from '../stores/userStore';

const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Ajout automatique du token d’auth
apiClient.interceptors.request.use(
  config => {
    const token = useUserStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Gestion d’erreur centralisée avec fallback.
 */
export const handleAxiosError = (err, set, fallbackMessage = "Une erreur est survenue") => {
  console.error("❌ Erreur API:", err);
  const message = err?.response?.data?.error || fallbackMessage;
  set({ error: message });
  return message;
};

/**
 * Exécute une fonction asynchrone en gérant le loading et les erreurs.
 */
export const withLoadingAndError = async (set, asyncFn) => {
  set({ loading: true, error: null });
  try {
    await asyncFn();
  } catch (err) {
    handleAxiosError(err, set);
    throw err;
  } finally {
    set({ loading: false });
  }
};

/**
 * Convertit un objet JS en FormData (avec sérialisation JSON si besoin).
 */
export function createFormData(data, options = { exclude: [] }) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && value.trim() === '') &&
      !options.exclude.includes(key)
    ) {
      const isJSON = ['location', 'horaires'].includes(key);

      // ✅ Force sérialisation JSON uniquement sur certains champs
      if (isJSON) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  }

  // ✅ Ajout explicite du champ `boutique` même si sa valeur est "0" ou "false"
  if (data.boutique && !formData.has("boutiqueId")) {
    formData.append("boutiqueId", data.boutique);
  }

  return formData;
}

/**
 * Variante excluant les fichiers (ex: coverImage).
 */
export const createFormDataSansImage = (data) =>
  createFormData(data, { exclude: ['coverImage'] });

/**
 * Nettoie les données utilisateur récupérées du localStorage.
 */
export function transformUserDataFromStorage(userData) {
  if (!userData) return null;
  if (typeof userData._id === 'object' && userData._id.$oid) userData._id = userData._id.$oid;
  if (!userData._id && userData.id) userData._id = userData.id;
  return userData;
}