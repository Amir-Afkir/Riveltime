import { create } from "zustand";
import * as orderActions from "../stores/orderActions";
import { calculerTourneeOptimisee } from "../utils/calculateOptimizedTour";

const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  orderedSteps: [],
  map: null,
  setMap: (ref) => set({ map: ref }),

  // 🔍 Filtres dynamiques pour les livreurs
  filtreActif: "autour", // Par défaut : autour de moi
  coordsAutour: null,
  rayonAutour: 2000,

  // Setters
  setFiltreActif: (filtre) => set({ filtreActif: filtre }),
  setCoordsAutour: (coords) => set({ coordsAutour: coords }),
  setRayonAutour: (rayon) => set({ rayonAutour: rayon }),
  setOrders: (orders) => set({ orders }),
  setOrderedSteps: (steps) => set({ orderedSteps: steps }),
  recalculerOrderedSteps: () => {
    const orders = get().orders;
    const steps = calculerTourneeOptimisee(orders);
    set({ orderedSteps: steps });
  },

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
    get().recalculerOrderedSteps();
  },

  // Méthodes de mise à jour
  markAsPreparing: async (orderId, token) => {
    await orderActions.markAsPreparing(orderId, token, set, get);
    get().recalculerOrderedSteps();
  },

  markOrderOnTheWay: async (orderId, token) => {
    await orderActions.markOrderOnTheWay(orderId, token, set, get);
    get().recalculerOrderedSteps();
  },

  markAsDelivered: async (orderId, code, token) => {
    await orderActions.markAsDelivered(orderId, code, token, set, get);
    get().recalculerOrderedSteps();
  },

  cancelOrder: async (orderId, token) => {
    await orderActions.cancelOrder(orderId, token, set, get);
  },
}));

export default useOrderStore;