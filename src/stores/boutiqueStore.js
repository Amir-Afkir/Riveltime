import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient, withLoadingAndError, createFormData } from '../utils/api'; // Import des utilitaires centralisés

const useBoutiqueStore = create(
  devtools((set, get) => ({
    boutiques: [],
    selectedBoutique: null,
    loading: false,
    error: null,
    abortController: null,

    // ✅ UI state
    setLoading: (value) => set({ loading: value }), // Utilisé par withLoadingAndError
    setError: (error) => set({ error }), // Utilisé par withLoadingAndError
    setSelectedBoutique: (b) => set({ selectedBoutique: b }),
    clearSelectedBoutique: () => set({ selectedBoutique: null }),

    // ✅ Cancel previous request
    abortPending: () => {
      const controller = get().abortController;
      if (controller) controller.abort();
    },

    // ✅ GET - Mes boutiques
    fetchMyBoutiques: async () => {
      get().abortPending();
      const controller = new AbortController();
      set({ abortController: controller }); // Stocker le nouveau contrôleur

      await withLoadingAndError(set, async () => {
        const res = await apiClient.get('/boutiques/mine', {
          signal: controller.signal,
        });
        set({ boutiques: res.data });
      }).finally(() => {
        set({ abortController: null }); // Nettoyer après la requête
      });
    },

    // ✅ GET - Toutes les boutiques (accès public ou admin)
    fetchAllBoutiques: async () => {
      get().abortPending();
      const controller = new AbortController();
      set({ abortController: controller });

      await withLoadingAndError(set, async () => {
        const res = await apiClient.get('/boutiques', {
          signal: controller.signal,
        });
        set({ boutiques: res.data });
      }).finally(() => {
        set({ abortController: null });
      });
    },

    // ✅ POST
    createBoutique: async (data) => {
      await withLoadingAndError(set, async () => {
        const formData = createFormData(data);
        const res = await apiClient.post('/boutiques', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        set((state) => ({
          boutiques: [...state.boutiques, res.data.boutique],
        }));
      });
      // Retourne la donnée si succès ou lance une erreur si échec
      // Le composant appelant devra gérer le résultat de withLoadingAndError
    },

    // ✅ PUT
    updateBoutique: async (id, data) => {
      await withLoadingAndError(set, async () => {
        const formData = createFormData(data);
        const res = await apiClient.put(`/boutiques/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        set((state) => ({
          boutiques: state.boutiques.map((b) =>
            b._id === id ? res.data.boutique : b
          ),
        }));
      });
    },

    // ✅ DELETE
    deleteBoutique: async (id) => {
      await withLoadingAndError(set, async () => {
        await apiClient.delete(`/boutiques/${id}`);
        set((state) => ({
          boutiques: state.boutiques.filter((b) => b._id !== id),
        }));
      });
    },

    // ✅ Save auto (create or update)
    saveBoutique: async (data) => {
      if (data._id) {
        return await get().updateBoutique(data._id, data);
      } else {
        return await get().createBoutique(data);
      }
    },
  }))
);

export default useBoutiqueStore;