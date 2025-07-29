import { create } from "zustand";
import * as orderActions from "../stores/orderActions";

const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  // 🔍 Filtres dynamiques pour les livreurs
  filtreActif: "autour", // Par défaut : autour de moi
  coordsAutour: null,
  rayonAutour: 2000,

  // Setters
  setFiltreActif: (filtre) => set({ filtreActif: filtre }),
  setCoordsAutour: (coords) => set({ coordsAutour: coords }),
  setRayonAutour: (rayon) => set({ rayonAutour: rayon }),
  setOrders: (orders) => set({ orders }),

  // Méthodes de récupération
  fetchBoutiqueOrders: async (token) => {
    await orderActions.fetchBoutiqueOrders(token, set);
  },

  fetchClientOrders: async (token) => {
    await orderActions.fetchClientOrders(token, set);
  },

  fetchOrdersLivreur: async (token) => {
    await orderActions.fetchOrdersLivreur(token, set, get);
  },

  fetchOrdersAssignedLivreur: async (token) => {
    await orderActions.fetchOrdersAssignedLivreur(token, set);
  },

  // Méthodes de mise à jour
  markAsPreparing: async (orderId, token) => {
    await orderActions.markAsPreparing(orderId, token, set, get);
  },

  markAsDelivered: async (orderId, code, token) => {
    await orderActions.markAsDelivered(orderId, code, token, set, get);
  },

  cancelOrder: async (orderId, token) => {
    await orderActions.cancelOrder(orderId, token, set, get);
  },
}));

export default useOrderStore;