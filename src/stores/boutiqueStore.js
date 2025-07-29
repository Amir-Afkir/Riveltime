// src/stores/boutiqueStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import useUserStore from './userStore';

const API_URL = import.meta.env.VITE_API_URL;

function createFormData(data) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      formData.append(
        key,
        ['location', 'horaires'].includes(key) ? JSON.stringify(value) : value
      );
    }
  }
  return formData;
}

const useBoutiqueStore = create(
  devtools((set, get) => ({
    boutiques: [],
    selectedBoutique: null,
    loading: false,
    error: null,
    abortController: null,

    // ✅ Utilitaire
    _getToken() {
      return useUserStore.getState().token;
    },

    _getHeaders() {
      const token = get()._getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    // ✅ UI state
    setLoading: (value) => set({ loading: value }),
    setError: (error) => set({ error }),
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
      set({ loading: true, error: null, abortController: controller });

      try {
        const res = await axios.get(`${API_URL}/boutiques/mine`, {
          headers: get()._getHeaders(),
          signal: controller.signal,
        });
        set({ boutiques: res.data });
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("❌ fetchMyBoutiques:", err);
          set({ error: "Erreur lors du chargement de vos boutiques." });
        }
      } finally {
        set({ loading: false, abortController: null });
      }
    },

    // ✅ GET - Toutes les boutiques
    fetchAllBoutiques: async () => {
      get().abortPending();
      const controller = new AbortController();
      set({ loading: true, error: null, abortController: controller });

      try {
        const res = await axios.get(`${API_URL}/boutiques`, {
          headers: get()._getHeaders(),
          signal: controller.signal,
        });
        set({ boutiques: res.data });
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("❌ fetchAllBoutiques:", err);
          set({ error: "Erreur lors du chargement des boutiques." });
        }
      } finally {
        set({ loading: false, abortController: null });
      }
    },

    // ✅ POST
    createBoutique: async (data) => {
      const formData = createFormData(data);
      const res = await axios.post(`${API_URL}/boutiques`, formData, {
        headers: {
          ...get()._getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      set((state) => ({
        boutiques: [...state.boutiques, res.data.boutique],
      }));
      return res.data.boutique;
    },

    // ✅ PUT
    updateBoutique: async (id, data) => {
      const formData = createFormData(data);
      const res = await axios.put(`${API_URL}/boutiques/${id}`, formData, {
        headers: {
          ...get()._getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      set((state) => ({
        boutiques: state.boutiques.map((b) =>
          b._id === id ? res.data.boutique : b
        ),
      }));
      return res.data.boutique;
    },

    // ✅ DELETE
    deleteBoutique: async (id) => {
      await axios.delete(`${API_URL}/boutiques/${id}`, {
        headers: get()._getHeaders(),
      });
      set((state) => ({
        boutiques: state.boutiques.filter((b) => b._id !== id),
      }));
    },

    // ✅ Save auto
    saveBoutique: async (data) => {
      return data._id
        ? await get().updateBoutique(data._id, data)
        : await get().createBoutique(data);
    },
  }))
);

export default useBoutiqueStore;