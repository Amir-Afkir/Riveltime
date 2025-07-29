// src/stores/produitStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import useUserStore from './userStore.js';

const API_URL = import.meta.env.VITE_API_URL;

const useProduitStore = create(devtools((set, get) => ({
  produits: [],
  loading: false,
  error: null,

  setLoading: (bool) => set({ loading: bool }),
  setError: (err) => set({ error: err }),

  handleAxiosError: (err, fallback = "Erreur inconnue") => {
    console.error("❌ Axios:", err);
    const msg = err?.response?.data?.error || fallback;
    set({ error: msg });
    return msg;
  },

  fetchMyProduits: async () => {
    const { token, userData, loadingUser } = useUserStore.getState();
    if (loadingUser || !userData || !token) return;

    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${API_URL}/produits/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        set({ produits: res.data.produits });
      } else {
        set({ error: res.data.error || "Erreur lors du chargement" });
      }
    } catch (err) {
      get().handleAxiosError(err, "Erreur lors du chargement");
    } finally {
      set({ loading: false });
    }
  },

  fetchProduitsByBoutique: async (boutiqueId) => {
    if (!boutiqueId) return;
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/produits/boutique/${boutiqueId}`);
      if (res.data.success) {
        const produits = res.data.produits.map((prod) => ({
          ...prod,
          boutique: {
            activerParticipation: res.data.boutique?.activerParticipation || false,
            participationPourcent: res.data.boutique?.participationPourcent || 50,
            contributionLivraisonPourcent: res.data.boutique?.contributionLivraisonPourcent || 20,
          },
        }));
        set({ produits });
      } else {
        set({ error: res.data.error || 'Erreur chargement produits' });
      }
    } catch (err) {
      get().handleAxiosError(err, 'Erreur chargement produits');
    } finally {
      set({ loading: false });
    }
  },

  produitsPublics: async (boutiqueId) => {
    if (!boutiqueId) return;
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/produits/boutique/${boutiqueId}`);
      if (res.data.success) {
        const produits = res.data.produits.map((prod) => ({
          ...prod,
          boutique: res.data.boutique || {},
        }));
        set({ produits });
      } else {
        set({ error: res.data.error || "Erreur lors du chargement des produits publics" });
      }
    } catch (err) {
      get().handleAxiosError(err, "Erreur lors du chargement des produits publics");
    } finally {
      set({ loading: false });
    }
  },

  createProduit: async (formData) => {
    const token = useUserStore.getState().token;
    try {
      const res = await axios.post(`${API_URL}/produits`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        set((state) => ({ produits: [...state.produits, res.data.produit] }));
        return res.data.produit;
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      get().handleAxiosError(err, "Erreur lors de la création");
      throw err;
    }
  },

  updateProduit: async (id, formData) => {
    const token = useUserStore.getState().token;
    try {
      const res = await axios.put(`${API_URL}/produits/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        set((state) => ({
          produits: state.produits.map((p) =>
            p._id === id ? res.data.produit : p
          ),
        }));
        return res.data.produit;
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      get().handleAxiosError(err, "Erreur lors de la modification");
      throw err;
    }
  },

  deleteProduit: async (id) => {
    const token = useUserStore.getState().token;
    try {
      const res = await axios.delete(`${API_URL}/produits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        set((state) => ({
          produits: state.produits.filter((p) => p._id !== id),
        }));
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      get().handleAxiosError(err, "Erreur lors de la suppression");
      throw err;
    }
  },
})));

export default useProduitStore;