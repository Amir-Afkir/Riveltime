import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient, withLoadingAndError, handleAxiosError } from '../utils/api'; // Import des utilitaires centralisés
import useUserStore from './userStore.js'; // Toujours nécessaire pour le token avant l'appel à withLoadingAndError
import { createFormData } from '../utils/api';

const useProduitStore = create(devtools((set, get) => ({
  produits: [],
  loading: false,
  error: null,

  setLoading: (bool) => set({ loading: bool }),
  setError: (err) => set({ error: err }),
  handleAxiosError: (err, fallback = "Erreur inconnue") => handleAxiosError(err, set, fallback), // Utilise l'utilitaire

  fetchMyProduits: async () => {
    // Vérifier les dépendances nécessaires avant de lancer la requête
    const { userData, loadingUser } = useUserStore.getState();
    if (loadingUser || !userData) {
      console.warn("Tentative de fetchMyProduits sans utilisateur ou pendant le chargement de l'utilisateur.");
      // Optionnel: set({ loading: false }); si on veut s'assurer que l'état de chargement est propre.
      return;
    }

    await withLoadingAndError(set, async () => {
      const res = await apiClient.get('/produits/mine'); // Token géré par intercepteur
      if (res.data.success) {
        set({ produits: res.data.produits });
      } else {
        throw new Error(res.data.error || "Erreur lors du chargement de vos produits.");
      }
    });
  },

  // Fusion de fetchProduitsByBoutique et produitsPublics pour éviter la duplication
  fetchProduitsByBoutique: async (boutiqueId, { publicView = false } = {}) => {
    if (!boutiqueId) {
      console.warn("fetchProduitsByBoutique appelé sans boutiqueId.");
      return;
    }

    await withLoadingAndError(set, async () => {
      const res = await apiClient.get(`/produits/boutique/${boutiqueId}`);

      if (res.data.success) {
        let produits = res.data.produits;
        if (publicView) {
          // Logique spécifique pour la vue publique si nécessaire
          produits = produits.map((prod) => ({
            ...prod,
            boutique: res.data.boutique || {},
          }));
        } else {
          // Logique d'enrichissement pour les propriétaires de boutique
          produits = produits.map((prod) => ({
            ...prod,
            boutique: {
              activerParticipation: res.data.boutique?.activerParticipation || false,
              participationPourcent: res.data.boutique?.participationPourcent || 50,
              contributionLivraisonPourcent: res.data.boutique?.contributionLivraisonPourcent || 20,
            },
          }));
        }
        set({ produits });
      } else {
        throw new Error(res.data.error || 'Erreur lors du chargement des produits.');
      }
    });
  },

    createProduit: async (data) => {
    const formData = createFormData(data); // ✅ Sérialise proprement tout, y compris JSON 
    console.log("[🧪 FormData envoyé]", [...formData.entries()]);
    await withLoadingAndError(set, async () => {
        const res = await apiClient.post('/produits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
        set((state) => ({ produits: [...state.produits, res.data.produit] }));
        } else {
        throw new Error(res.data.error || "Erreur lors de la création.");
        }
    });
    },

  updateProduit: async (id, formData) => {
    await withLoadingAndError(set, async () => {
      const res = await apiClient.put(`/produits/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        set((state) => ({
          produits: state.produits.map((p) =>
            p._id === id ? res.data.produit : p
          ),
        }));
      } else {
        throw new Error(res.data.error || "Erreur lors de la modification.");
      }
    });
  },

  deleteProduit: async (id) => {
    await withLoadingAndError(set, async () => {
      const res = await apiClient.delete(`/produits/${id}`);
      if (res.data.success) {
        set((state) => ({
          produits: state.produits.filter((p) => p._id !== id),
        }));
      } else {
        throw new Error(res.data.error || "Erreur lors de la suppression.");
      }
    });
  },
})));

export default useProduitStore;