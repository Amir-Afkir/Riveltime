import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  apiClient,
  withLoadingAndError,
  createFormData,
  createFormDataSansImage,
  handleAxiosError
} from '../utils/api';

const useBoutiqueStore = create(
  devtools((set, get) => ({
    boutiques: [],
    boutiquesClient: [],
    boutiquesAutour: [],
    loadingAutour: false,
    errorAutour: null,
    selectedBoutique: null,
    loading: false,
    error: null,
    abortController: null,
    boutiqueActive: null,
    produitsBoutique: [],
    estimation: null,
    boutiqueCache: {},
    produitsCache: {},

    setLoading: (value) => set({ loading: value }),
    setError: (err) => set({ error: err }),
    setSelectedBoutique: (b) => set({ selectedBoutique: b }),
    clearSelectedBoutique: () => set({ selectedBoutique: null }),

    abortPending: () => {
      const controller = get().abortController;
      if (controller) controller.abort();
    },

    fetchBoutiquesAutour: async (lat, lon, rayon = 20000) => {
      set({ loadingAutour: true, errorAutour: null });
      try {
        const res = await apiClient.get(`/boutiques/autour?lat=${lat}&lon=${lon}&max=${rayon}`);
        set({ boutiquesAutour: res.data });
      } catch (err) {
        set({ errorAutour: "Impossible de charger les boutiques proches." });
        console.error("Erreur boutiquesAutour", err);
      } finally {
        set({ loadingAutour: false });
      }
    },

    fetchMyBoutiques: async () => {
      get().abortPending();
      const controller = new AbortController();
      set({ abortController: controller });

      try {
        set({ loading: true, error: null });
        const res = await apiClient.get('/boutiques/mine', { signal: controller.signal });
        set({ boutiques: res.data });
      } catch (err) {
        if (err.name !== 'CanceledError') handleAxiosError(err, set, "Impossible de charger les boutiques.");
      } finally {
        set({ loading: false, abortController: null });
      }
    },

    fetchAllBoutiques: async () => {
      get().abortPending();
      const controller = new AbortController();
      set({ abortController: controller });

      await withLoadingAndError(set, async () => {
        const res = await apiClient.get('/boutiques', { signal: controller.signal });
        set({ boutiques: res.data });
      }).finally(() => {
        set({ abortController: null });
      });
    },

    fetchBoutiquesClient: async () => {
      const cached = localStorage.getItem("cachedBoutiques");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) set({ boutiquesClient: parsed });
        } catch (e) {
          console.warn("❌ Erreur cache boutiquesClient:", e);
        }
      }

      await withLoadingAndError(set, async () => {
        const res = await apiClient.get('/client/accueil/boutiques');
        set({ boutiquesClient: res.data });
        localStorage.setItem("cachedBoutiques", JSON.stringify(res.data));
      });
    },

    fetchBoutiquePublic: async (id) => {
      const cache = get().boutiqueCache[id];
      if (cache) return set({ boutiqueActive: cache });

      await withLoadingAndError(set, async () => {
        const res = await apiClient.get(`/boutiques/${id}`);
        set((state) => ({
          boutiqueActive: res.data.boutique,
          boutiqueCache: { ...state.boutiqueCache, [id]: res.data.boutique },
        }));
      });
    },

    fetchProduitsPublic: async (id) => {
      const cache = get().produitsCache[id];
      if (cache) return set({ produitsBoutique: cache });

      await withLoadingAndError(set, async () => {
        const res = await apiClient.get(`/boutiques/${id}/produits`);
        set((state) => ({
          produitsBoutique: res.data.produits,
          produitsCache: { ...state.produitsCache, [id]: res.data.produits },
        }));
      });
    },

    createBoutique: async (data) => {
      let created = null;
      await withLoadingAndError(set, async () => {
        const formData = createFormDataSansImage(data);
        const res = await apiClient.post('/boutiques', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        created = res.data.boutique;
        set((state) => ({ boutiques: [...state.boutiques, created] }));
      });

      if (data.coverImage instanceof File && created?._id) {
        await withLoadingAndError(set, async () => {
          const formData = new FormData();
          formData.append("coverImage", data.coverImage);
          const res = await apiClient.put(`/boutiques/${created._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          created = res.data.boutique;
          set((state) => ({
            boutiques: state.boutiques.map((b) =>
              b._id === created._id ? created : b
            ),
          }));
        });
      }

      return created;
    },

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

    deleteBoutique: async (id) => {
      try {
        await apiClient.delete(`/boutiques/${id}`);
        set((state) => ({
          boutiques: state.boutiques.filter((b) => b._id !== id),
          selectedBoutique: state.selectedBoutique?._id === id ? null : state.selectedBoutique,
        }));
        window?.dispatchEvent(new CustomEvent("show-notification", {
          detail: { message: "Boutique supprimée.", type: "success" },
        }));
      } catch (err) {
        handleAxiosError(err, set, "Impossible de supprimer la boutique.");
      }
    },

    saveBoutique: async (form) => {
      const { fetchMyBoutiques } = get();
      const formData = createFormData(form);
      if (form._id) {
        await apiClient.put(`/boutiques/${form._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await apiClient.post("/boutiques", formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      await fetchMyBoutiques();
    },

    fetchEstimationSimple: async (payload) => {
      await withLoadingAndError(set, async () => {
        const res = await apiClient.post("/orders/estimation-simple", payload);
        set({ estimation: res.data });
      });
    },

    clearEstimation: () => set({ estimation: null }),

    resetState: () => {
      set({
        boutiques: [],
        boutiquesClient: [],
        boutiquesAutour: [],
        selectedBoutique: null,
        boutiqueActive: null,
        produitsBoutique: [],
        estimation: null,
        boutiqueCache: {},
        produitsCache: {},
        error: null,
        loading: false,
      });
    },
  }))
);

export default useBoutiqueStore;
