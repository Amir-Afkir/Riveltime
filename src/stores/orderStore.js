import { create } from "zustand";
import * as orderActions from "../stores/orderActions";
import { calculerTourneeOptimisee } from "../utils/calculateOptimizedTour"; // Assurez-vous que ce chemin est correct

const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  orderedSteps: [],
  map: null, // Si c'est une référence d'objet (ex: instance de Mapbox), soyez conscient des re-renders.
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

  // Recalcule la tournée optimisée basée sur les commandes actuelles
  recalculerOrderedSteps: () => {
    const orders = get().orders;
    // Vérifiez que calculerTourneeOptimisee peut gérer des tableaux vides ou nuls
    const steps = calculerTourneeOptimisee(orders);
    set({ orderedSteps: steps });
  },

  // Méthodes de récupération (appellent orderActions et mettent à jour l'état)
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
    get().recalculerOrderedSteps(); // Recalculer après avoir récupéré les commandes
  },

  // Méthodes de mise à jour (appellent orderActions et déclenchent le recalcul de la tournée)
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
    // Optionnel: si l'annulation retire l'ordre de la liste, recalculer
    get().recalculerOrderedSteps();
  },
}));

export default useOrderStore;